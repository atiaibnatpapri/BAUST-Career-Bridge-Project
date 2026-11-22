/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
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
  publishAppointmentSlot,
  subscribeAppointmentSlots,
} from '../../services/careerBridgeService';
import { CalendarClock, Plus, CheckCircle2, XCircle, ExternalLink, Clock } from 'lucide-react';

export const AppointmentsPage: React.FC = () => {
  const { addToast, language } = useApp();
  const { firebaseUser, userProfile } = useAuth();
  const isBn = language === 'bn';
  const isAlumni = userProfile?.role === 'alumni';

  const [slots, setSlots] = useState<AppointmentSlotEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [bookTarget, setBookTarget] = useState<AppointmentSlotEntity | null>(null);
  const [bookingNote, setBookingNote] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const [date, setDate] = useState('2026-12-22');
  const [timeSlot, setTimeSlot] = useState('08:00 PM - 08:30 PM');
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

  const handlePublishSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !userProfile) return;
    setBusyId('create');
    try {
      await publishAppointmentSlot({
        alumniId: firebaseUser.uid,
        alumniName: userProfile.name,
        alumniCompany: userProfile.company || 'BAUST Alumni',
        alumniAvatar: userProfile.avatar,
        date,
        timeSlot,
        mode,
        meetingLink: meetingLink.trim(),
        topic: topic.trim(),
        isDemo: Boolean(userProfile.isDemo),
      });
      addToast('success', isBn ? 'স্লট প্রকাশিত হয়েছে' : 'Slot Published', `${date} · ${timeSlot}`);
      setCreateOpen(false);
      setMeetingLink('');
    } catch (err: any) {
      addToast('error', isBn ? 'ত্রুটি' : 'Error', err?.message || 'Unable to publish slot.');
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

  const visibleSlots = isAlumni
    ? slots.filter((s) => s.alumniId === firebaseUser?.uid)
    : slots.filter(
        (s) => s.status === 'available' || s.bookedByStudentId === firebaseUser?.uid
      );

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
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setCreateOpen(true)}>
            {isBn ? 'নতুন স্লট যুক্ত করুন' : 'Publish Time Slot'}
          </Button>
        )}
      </div>

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

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
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
                        onClick={() => void completeAppointmentSlot(slot)}
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

                  {isMineAlumni && slot.status === 'available' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      isLoading={busyId === slot.id}
                      onClick={() => void handleCancel(slot)}
                    >
                      {isBn ? 'স্লট বন্ধ করুন' : 'Close Slot'}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Alumni Create Slot Modal */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title={isBn ? 'নতুন অ্যাপয়েন্টমেন্ট স্লট যোগ করুন' : 'Publish Available Time Slot'}
      >
        <form onSubmit={handlePublishSlot} className="space-y-4">
          <Input
            label={isBn ? 'সেশনের বিষয়' : 'Topic / Focus'}
            required
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label={isBn ? 'তারিখ' : 'Date'}
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Input
              label={isBn ? 'সময় স্লট' : 'Time Window'}
              required
              placeholder="08:00 PM - 08:30 PM"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
            />
          </div>
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
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              {isBn ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button type="submit" variant="primary" isLoading={busyId === 'create'}>
              {isBn ? 'প্রকাশ করুন' : 'Publish Slot'}
            </Button>
          </div>
        </form>
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
