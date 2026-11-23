/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, TextArea } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { AppointmentSlotEntity } from '../../constants/baustDataModel';
import {
  bookAppointmentSlotTransaction,
  cancelAppointmentBooking,
  completeAppointmentSlot,
  deleteAppointmentSlot,
  publishAppointmentSlot,
  subscribeAppointmentSlots,
  updateAppointmentSlot,
} from '../../services/careerBridgeService';
import {
  CalendarClock,
  Plus,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Clock,
  Pencil,
  Trash2,
  AlertCircle,
  Filter,
} from 'lucide-react';

function todayIsoDate(): string {
  return new Date().toISOString().split('T')[0];
}

function formatTime24To12(hhmm: string): string {
  const [hStr, mStr] = (hhmm || '').split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return hhmm;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
}

function parseTime12To24(label: string): string {
  const match = (label || '').trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return '';
  let h = Number(match[1]);
  const m = Number(match[2]);
  const p = match[3].toUpperCase();
  if (p === 'PM' && h < 12) h += 12;
  if (p === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function toMinutes(hhmm: string): number {
  const [h, m] = (hhmm || '').split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return -1;
  return h * 60 + m;
}

function extractSlotStartEnd(slot: AppointmentSlotEntity): { start: string; end: string } {
  if (slot.startTime && slot.endTime) {
    return { start: slot.startTime, end: slot.endTime };
  }
  const parts = (slot.timeSlot || '').split('-').map((s) => s.trim());
  if (parts.length === 2) {
    const start = parseTime12To24(parts[0]);
    const end = parseTime12To24(parts[1]);
    if (start && end) return { start, end };
  }
  return { start: '', end: '' };
}

export const AppointmentsPage: React.FC = () => {
  const { addToast, language } = useApp();
  const { firebaseUser, userProfile } = useAuth();
  const isBn = language === 'bn';
  const isAlumni = userProfile?.role === 'alumni';

  const [slots, setSlots] = useState<AppointmentSlotEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AppointmentSlotEntity | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AppointmentSlotEntity | null>(null);
  const [bookTarget, setBookTarget] = useState<AppointmentSlotEntity | null>(null);
  const [bookingNote, setBookingNote] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Student filters
  const [alumniFilter, setAlumniFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Slot create/edit form fields
  const [date, setDate] = useState<string>(() => todayIsoDate());
  const [startTime, setStartTime] = useState<string>('20:00');
  const [endTime, setEndTime] = useState<string>('20:30');
  const [mode, setMode] = useState<'Google Meet' | 'On-Campus' | 'Phone'>('Google Meet');
  const [topic, setTopic] = useState('1-on-1 Career & CV Guidance');
  const [meetingLink, setMeetingLink] = useState('');

  useEffect(() => {
    setLoading(true);
    return subscribeAppointmentSlots(
      {},
      (items) => {
        setSlots(items);
        setLoading(false);
      },
      () => setLoading(false)
    );
  }, []);

  const openCreateModal = () => {
    setEditingSlot(null);
    setDate(todayIsoDate());
    setStartTime('20:00');
    setEndTime('20:30');
    setMode('Google Meet');
    setTopic('1-on-1 Career & CV Guidance');
    setMeetingLink('');
    setFormError(null);
    setSlotModalOpen(true);
  };

  const openEditModal = (slot: AppointmentSlotEntity) => {
    const times = extractSlotStartEnd(slot);
    setEditingSlot(slot);
    setDate(slot.date || todayIsoDate());
    setStartTime(times.start || '20:00');
    setEndTime(times.end || '20:30');
    setMode(slot.mode);
    setTopic(slot.topic || '1-on-1 Career & CV Guidance');
    setMeetingLink(slot.meetingLink || '');
    setFormError(null);
    setSlotModalOpen(true);
  };

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !userProfile) return;
    setFormError(null);

    const today = todayIsoDate();
    if (!date || date < today) {
      setFormError(isBn ? 'অতীতের তারিখ নির্বাচন করা যাবে না।' : 'Slot date cannot be in the past.');
      return;
    }

    const startMin = toMinutes(startTime);
    const endMin = toMinutes(endTime);
    if (startMin < 0 || endMin < 0 || endMin <= startMin) {
      setFormError(
        isBn ? 'শেষের সময় শুরুর সময়ের পরে হতে হবে।' : 'End time must be strictly after start time.'
      );
      return;
    }

    if (!topic.trim()) {
      setFormError(isBn ? 'অনুগ্রহ করে সেশনের বিষয় লিখুন।' : 'Please enter a session topic.');
      return;
    }

    // Overlap check against other non-cancelled slots on the same date for this alumnus
    const myDateSlots = slots.filter(
      (s) =>
        s.alumniId === firebaseUser.uid &&
        s.date === date &&
        s.status !== 'cancelled' &&
        (!editingSlot || s.id !== editingSlot.id)
    );
    const hasOverlap = myDateSlots.some((existing) => {
      const ext = extractSlotStartEnd(existing);
      const exStart = toMinutes(ext.start);
      const exEnd = toMinutes(ext.end);
      if (exStart < 0 || exEnd < 0) return false;
      return startMin < exEnd && endMin > exStart;
    });
    if (hasOverlap) {
      setFormError(
        isBn
          ? 'এই তারিখে আপনার অন্য একটি স্লটের সাথে সময় মিলে যাচ্ছে।'
          : 'This time window overlaps with another active slot on the same date.'
      );
      return;
    }

    const formattedRange = `${formatTime24To12(startTime)} - ${formatTime24To12(endTime)}`;
    const busyKey = editingSlot ? editingSlot.id : 'create';
    setBusyId(busyKey);

    try {
      if (editingSlot) {
        await updateAppointmentSlot(editingSlot.id, {
          date,
          startTime,
          endTime,
          timeSlot: formattedRange,
          mode,
          meetingLink: meetingLink.trim(),
          topic: topic.trim(),
        });
        addToast('success', isBn ? 'স্লট হালনাগাদ হয়েছে' : 'Slot Updated', `${date} · ${formattedRange}`);
      } else {
        await publishAppointmentSlot({
          alumniId: firebaseUser.uid,
          alumniName: userProfile.name,
          alumniCompany: userProfile.company || 'BAUST Alumni',
          alumniAvatar: userProfile.photoURL || userProfile.avatar,
          date,
          startTime,
          endTime,
          timeSlot: formattedRange,
          mode,
          meetingLink: meetingLink.trim(),
          topic: topic.trim(),
          isDemo: Boolean(userProfile.isDemo),
        });
        addToast('success', isBn ? 'স্লট প্রকাশিত হয়েছে' : 'Slot Published', `${date} · ${formattedRange}`);
      }
      setSlotModalOpen(false);
      setEditingSlot(null);
      setMeetingLink('');
    } catch (err: any) {
      setFormError(err?.message || 'Unable to save slot.');
      addToast('error', isBn ? 'ত্রুটি' : 'Error', err?.message || 'Unable to save slot.');
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    try {
      await deleteAppointmentSlot(deleteTarget.id);
      addToast('info', isBn ? 'স্লট মুছে ফেলা হয়েছে' : 'Slot Deleted', `${deleteTarget.date} · ${deleteTarget.timeSlot}`);
      setDeleteTarget(null);
    } catch (err: any) {
      addToast('error', isBn ? 'ত্রুটি' : 'Delete Failed', err?.message || 'Could not delete slot.');
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirmBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !userProfile || !bookTarget) return;
    setBusyId(bookTarget.id);
    try {
      await bookAppointmentSlotTransaction({
        slotId: bookTarget.id,
        studentId: firebaseUser.uid,
        studentName: userProfile.name,
        studentEmail: userProfile.email,
        note: bookingNote,
      });
      addToast(
        'success',
        isBn ? 'অ্যাপয়েন্টমেন্ট নিশ্চিত হয়েছে' : 'Appointment Confirmed',
        `${bookTarget.alumniName} (${bookTarget.date})`
      );
      setBookTarget(null);
      setBookingNote('');
    } catch (err: any) {
      addToast('warning', isBn ? 'বুকিং সম্পন্ন হয়নি' : 'Booking Unavailable', err?.message || 'Slot unavailable.');
    } finally {
      setBusyId(null);
    }
  };

  const handleCancel = async (slot: AppointmentSlotEntity) => {
    if (!firebaseUser) return;
    setBusyId(slot.id);
    try {
      await cancelAppointmentBooking(slot, firebaseUser.uid, slot.alumniId === firebaseUser.uid);
      addToast('info', isBn ? 'বাতিল হয়েছে' : 'Booking Cancelled', `${slot.date} · ${slot.timeSlot}`);
    } catch (err: any) {
      addToast('error', isBn ? 'ত্রুটি' : 'Error', err?.message || 'Could not cancel slot.');
    } finally {
      setBusyId(null);
    }
  };

  const handleComplete = async (slot: AppointmentSlotEntity) => {
    setBusyId(slot.id);
    try {
      await completeAppointmentSlot(slot);
      addToast('success', isBn ? 'সেশন সম্পন্ন হয়েছে' : 'Session Completed', `${slot.bookedByStudentName || 'Mentee'} notified.`);
    } catch (err: any) {
      addToast('error', isBn ? 'ত্রুটি' : 'Error', err?.message || 'Could not mark session complete.');
    } finally {
      setBusyId(null);
    }
  };

  const alumniFilterOptions = useMemo(() => {
    const map = new Map<string, string>();
    slots.forEach((s) => {
      if (s.alumniId && (s.status === 'available' || s.bookedByStudentId === firebaseUser?.uid)) {
        map.set(s.alumniId, s.alumniName || 'BAUST Alumni');
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [slots, firebaseUser?.uid]);

  const visibleSlots = useMemo(() => {
    if (isAlumni) {
      return slots.filter((s) => s.alumniId === firebaseUser?.uid);
    }
    return slots.filter((s) => {
      const baseVisible = s.status === 'available' || s.bookedByStudentId === firebaseUser?.uid;
      if (!baseVisible) return false;
      if (alumniFilter !== 'All' && s.alumniId !== alumniFilter) return false;
      if (dateFilter && s.date !== dateFilter) return false;
      return true;
    });
  }, [slots, isAlumni, firebaseUser?.uid, alumniFilter, dateFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
            <CalendarClock className="w-3.5 h-3.5" />
            {isBn ? '১-অন-১ স্লট বুকিং' : 'FR-14 · Atomic Slot Booking'}
          </span>
          <h1 className="text-2xl font-black text-[#0F2A4A] tracking-tight mt-1">
            {isAlumni
              ? isBn
                ? 'আমার মেন্টরশিপ সময়সূচি স্লট'
                : 'My Mentorship Time Slots'
              : isBn
              ? 'অ্যালামনাই অ্যাপয়েন্টমেন্ট স্লট বুকিং'
              : 'Book 1-on-1 Alumni Appointments'}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {isBn
              ? 'ডাবল-বুকিং প্রতিরোধে ফায়ারস্টোর লেনদেনের মাধ্যমে তাৎক্ষণিক স্লট বুকিং।'
              : 'Transaction-backed atomic slot reservation preventing double-bookings.'}
          </p>
        </div>

        {isAlumni && (
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
            {isBn ? 'নতুন স্লট যুক্ত করুন' : 'Publish Time Slot'}
          </Button>
        )}
      </div>

      {/* Student Filters */}
      {!isAlumni && (
        <Card className="p-4 border-slate-200">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 shrink-0">
              <Filter className="w-4 h-4 text-[#0F2A4A]" />
              <span>{isBn ? 'ফিল্টার:' : 'Filter Slots:'}</span>
            </div>
            <select
              value={alumniFilter}
              onChange={(e) => setAlumniFilter(e.target.value)}
              className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold bg-white text-slate-800"
            >
              <option value="All">{isBn ? 'সব অ্যালামনাই' : 'All Alumni Mentors'}</option>
              {alumniFilterOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold bg-white text-slate-800"
              aria-label="Filter by date"
            />
            {(alumniFilter !== 'All' || dateFilter) && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setAlumniFilter('All');
                  setDateFilter('');
                }}
              >
                {isBn ? 'রিসেট' : 'Reset'}
              </Button>
            )}
          </div>
        </Card>
      )}

      {loading ? (
        <Card className="p-8 text-center text-xs text-slate-500">
          {isBn ? 'স্লট লোড হচ্ছে...' : 'Loading appointment slots...'}
        </Card>
      ) : visibleSlots.length === 0 ? (
        <Card className="p-10 text-center space-y-2 border-dashed">
          <Clock className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">
            {isBn ? 'কোনো উপলব্ধ স্লট পাওয়া যায়নি' : 'No appointment slots available right now'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleSlots.map((slot) => {
            const isMineStudent = Boolean(firebaseUser && slot.bookedByStudentId === firebaseUser.uid);
            const isMineAlumni = Boolean(firebaseUser && slot.alumniId === firebaseUser.uid);
            const canEditOrDelete = isMineAlumni && (slot.status === 'available' || slot.status === 'cancelled');

            return (
              <Card key={slot.id} className="p-5 flex flex-col justify-between gap-4 border-slate-200">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        slot.status === 'available'
                          ? 'bg-emerald-100 text-emerald-700'
                          : slot.status === 'booked'
                          ? 'bg-blue-100 text-blue-700'
                          : slot.status === 'completed'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {slot.status}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">{slot.mode}</span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-900">{slot.topic || 'Mentorship Slot'}</h3>
                    <p className="text-xs text-slate-600">
                      {slot.alumniName} {slot.alumniCompany ? `· ${slot.alumniCompany}` : ''}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                    <p className="font-bold text-slate-800">{slot.date}</p>
                    <p className="text-slate-600">{slot.timeSlot}</p>
                  </div>

                  {slot.status === 'booked' && (isMineAlumni || isMineStudent) && (
                    <div className="text-xs text-slate-600 space-y-1">
                      <p>
                        <strong>{isBn ? 'শিক্ষার্থী:' : 'Booked by:'}</strong> {slot.bookedByStudentName}
                      </p>
                      {slot.bookingNote && (
                        <p className="text-[11px] italic text-slate-500">"{slot.bookingNote}"</p>
                      )}
                      {slot.meetingLink && (
                        <a
                          href={slot.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-700 font-bold hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          {isBn ? 'মিটিং লিংক' : 'Join Link'}
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                  {!isAlumni && slot.status === 'available' && (
                    <Button
                      size="sm"
                      variant="primary"
                      className="w-full"
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      onClick={() => setBookTarget(slot)}
                    >
                      {isBn ? 'স্লট বুক করুন' : 'Book Slot'}
                    </Button>
                  )}

                  {!isAlumni && isMineStudent && slot.status === 'booked' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      isLoading={busyId === slot.id}
                      leftIcon={<XCircle className="w-3.5 h-3.5" />}
                      onClick={() => void handleCancel(slot)}
                    >
                      {isBn ? 'বুকিং বাতিল করুন' : 'Release Booking'}
                    </Button>
                  )}

                  {isMineAlumni && slot.status === 'booked' && (
                    <>
                      <Button
                        size="sm"
                        variant="primary"
                        className="flex-1"
                        isLoading={busyId === slot.id}
                        onClick={() => void handleComplete(slot)}
                      >
                        {isBn ? 'সম্পন্ন' : 'Complete'}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        isLoading={busyId === slot.id}
                        onClick={() => void handleCancel(slot)}
                      >
                        {isBn ? 'বাতিল' : 'Cancel'}
                      </Button>
                    </>
                  )}

                  {canEditOrDelete && (
                    <>
                      {slot.status === 'available' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          leftIcon={<Pencil className="w-3.5 h-3.5" />}
                          onClick={() => openEditModal(slot)}
                        >
                          {isBn ? 'সম্পাদনা' : 'Edit'}
                        </Button>
                      )}
                      {slot.status === 'available' && (
                        <Button
                          size="sm"
                          variant="outline"
                          isLoading={busyId === slot.id}
                          onClick={() => void handleCancel(slot)}
                        >
                          {isBn ? 'বন্ধ করুন' : 'Close'}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="danger"
                        leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                        onClick={() => setDeleteTarget(slot)}
                      >
                        {isBn ? 'মুছুন' : 'Delete'}
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Alumni Create / Edit Slot Modal */}
      <Modal
        isOpen={slotModalOpen}
        onClose={() => {
          setSlotModalOpen(false);
          setEditingSlot(null);
          setFormError(null);
        }}
        title={
          editingSlot
            ? isBn
              ? 'স্লট সম্পাদনা করুন'
              : 'Edit Appointment Slot'
            : isBn
            ? 'নতুন অ্যাপয়েন্টমেন্ট স্লট যোগ করুন'
            : 'Publish Available Time Slot'
        }
      >
        <form onSubmit={handleSaveSlot} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label={isBn ? 'সেশনের বিষয়' : 'Topic / Focus'}
            required
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label={isBn ? 'তারিখ' : 'Date'}
              type="date"
              min={todayIsoDate()}
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Input
              label={isBn ? 'শুরুর সময়' : 'Start Time'}
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <Input
              label={isBn ? 'শেষের সময়' : 'End Time'}
              type="time"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>

          <p className="text-[11px] text-slate-500">
            {isBn ? 'সময়সীমা:' : 'Preview:'}{' '}
            <strong>
              {date} · {formatTime24To12(startTime)} - {formatTime24To12(endTime)}
            </strong>
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {isBn ? 'মাধ্যম' : 'Session Mode'}
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white"
            >
              <option value="Google Meet">Google Meet</option>
              <option value="On-Campus">On-Campus</option>
              <option value="Phone">Phone Call</option>
            </select>
          </div>
          <Input
            label={isBn ? 'মিটিং লিংক (ঐচ্ছিক)' : 'Meeting Link (Optional)'}
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            placeholder="Auto-generated if left blank"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSlotModalOpen(false);
                setEditingSlot(null);
              }}
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={busyId === (editingSlot ? editingSlot.id : 'create')}
            >
              {editingSlot
                ? isBn
                  ? 'সংরক্ষণ করুন'
                  : 'Save Changes'
                : isBn
                ? 'প্রকাশ করুন'
                : 'Publish Slot'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Slot Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={isBn ? 'স্লট মুছে ফেলুন' : 'Delete Appointment Slot'}
        maxWidth="sm"
      >
        {deleteTarget && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              {isBn
                ? `আপনি কি নিশ্চিতভাবে "${deleteTarget.date} (${deleteTarget.timeSlot})" স্লটটি স্থায়ীভাবে মুছে ফেলতে চান?`
                : `Permanently delete the slot on ${deleteTarget.date} (${deleteTarget.timeSlot})? This cannot be undone.`}
            </p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
                {isBn ? 'বাতিল' : 'Keep Slot'}
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                isLoading={busyId === deleteTarget.id}
                onClick={() => void handleConfirmDelete()}
              >
                {isBn ? 'হ্যাঁ, মুছুন' : 'Delete Slot'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Student Confirm Booking Modal */}
      <Modal
        isOpen={Boolean(bookTarget)}
        onClose={() => setBookTarget(null)}
        title={isBn ? 'অ্যাপয়েন্টমেন্ট নিশ্চিত করুন' : 'Confirm 1-on-1 Appointment'}
      >
        {bookTarget && (
          <form onSubmit={handleConfirmBook} className="space-y-4">
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
              <p className="font-bold">{bookTarget.topic}</p>
              <p>
                {bookTarget.alumniName} · {bookTarget.date} ({bookTarget.timeSlot})
              </p>
            </div>
            <TextArea
              label={isBn ? 'মেন্টরের জন্য নোট' : 'Agenda Note for Mentor'}
              required
              rows={3}
              placeholder="Share what you would like to discuss..."
              value={bookingNote}
              onChange={(e) => setBookingNote(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setBookTarget(null)}>
                {isBn ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button type="submit" variant="primary" isLoading={busyId === bookTarget.id}>
                {isBn ? 'বুকিং নিশ্চিত করুন' : 'Confirm Booking'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
