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
import { KnowledgeSessionEntity } from '../../constants/baustDataModel';
import {
  createKnowledgeSession,
  subscribeKnowledgeSessions,
  toggleKnowledgeSessionRegistration,
  updateKnowledgeSessionStatus,
} from '../../services/careerBridgeService';
import {
  Video,
  Calendar,
  Clock,
  Users,
  MapPin,
  Plus,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react';

export const KnowledgeSessionsPage: React.FC = () => {
  const { addToast, language } = useApp();
  const { firebaseUser, userProfile } = useAuth();
  const isBn = language === 'bn';

  const [sessions, setSessions] = useState<KnowledgeSessionEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTopic, setFilterTopic] = useState('All');
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('Technical Interview Prep');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('2026-12-20');
  const [time, setTime] = useState('08:00 PM');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [mode, setMode] = useState<'Online' | 'On-Campus' | 'Hybrid'>('Online');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/');
  const [venue, setVenue] = useState('BAUST Auditorium');
  const [maxSeats, setMaxSeats] = useState('80');

  const canHost =
    userProfile?.role === 'alumni' ||
    userProfile?.role === 'admin' ||
    userProfile?.role === 'superAdmin';

  useEffect(() => {
    setLoading(true);
    return subscribeKnowledgeSessions(
      (items) => {
        setSessions(items);
        setLoading(false);
      },
      () => setLoading(false)
    );
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !userProfile || !title.trim() || !description.trim()) {
      addToast('warning', isBn ? 'তথ্য অসম্পূর্ণ' : 'Incomplete Details', isBn ? 'শিরোনাম ও বিবরণ দিন।' : 'Title and description are required.');
      return;
    }

    setSubmitting(true);
    try {
      await createKnowledgeSession({
        title: title.trim(),
        topic: topic.trim(),
        description: description.trim(),
        hostId: firebaseUser.uid,
        hostName: userProfile.name,
        hostCompany: userProfile.company || 'BAUST Network',
        hostAvatar: userProfile.avatar,
        department: userProfile.department || 'All',
        date,
        time,
        durationMinutes: parseInt(durationMinutes, 10) || 60,
        mode,
        meetingLink: mode === 'On-Campus' ? '' : meetingLink.trim(),
        venue: mode === 'Online' ? 'Online Webinar' : venue.trim(),
        maxSeats: Math.max(5, parseInt(maxSeats, 10) || 80),
        isDemo: Boolean(userProfile.isDemo),
      });
      addToast('success', isBn ? 'সেশন প্রকাশিত হয়েছে' : 'Session Published', title.trim());
      setCreateOpen(false);
      setTitle('');
      setDescription('');
    } catch (err: any) {
      addToast('error', isBn ? 'তৈরি ব্যর্থ' : 'Failed', err?.message || 'Could not publish session.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleRegister = async (session: KnowledgeSessionEntity) => {
    if (!firebaseUser || !userProfile) return;
    setBusyId(session.id);
    try {
      const res = await toggleKnowledgeSessionRegistration(session, firebaseUser.uid, userProfile.name);
      addToast(
        res.registered ? 'success' : 'info',
        res.registered
          ? isBn
            ? 'সেশনে নিবন্ধন সম্পন্ন'
            : 'Registered for Session'
          : isBn
          ? 'নিবন্ধন বাতিল হয়েছে'
          : 'Registration Cancelled',
        session.title
      );
    } catch (err: any) {
      addToast('warning', isBn ? 'সতর্কতা' : 'Notice', err?.message || 'Unable to update registration.');
    } finally {
      setBusyId(null);
    }
  };

  const topics = ['All', ...Array.from(new Set(sessions.map((s) => s.topic)))];
  const filtered =
    filterTopic === 'All' ? sessions : sessions.filter((s) => s.topic === filterTopic);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200">
            <Sparkles className="w-3.5 h-3.5" />
            {isBn ? 'জ্ঞান বিনিময় ও ওয়েবিনার' : 'FR-13 · Knowledge-Sharing Webinars'}
          </span>
          <h1 className="text-2xl font-black text-[#0F2A4A] tracking-tight mt-1">
            {isBn ? 'জ্ঞান বিনিময় সেশন ও ওয়েবিনার' : 'Knowledge-Sharing Sessions'}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {isBn
              ? 'অ্যালামনাই পরিচালিত লাইভ কর্মশালা, ইন্টারভিউ ক্লিনিক এবং উচ্চশিক্ষা সেমিনারে যুক্ত হোন।'
              : 'Join live alumni-led industry talks, interview clinics, and higher-study seminars.'}
          </p>
        </div>

        {canHost && (
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setCreateOpen(true)}>
            {isBn ? 'নতুন সেশন হোস্ট করুন' : 'Host Knowledge Session'}
          </Button>
        )}
      </div>

      {/* Topic Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {topics.map((tp) => (
          <button
            key={tp}
            type="button"
            onClick={() => setFilterTopic(tp)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              filterTopic === tp
                ? 'bg-[#0F2A4A] text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tp}
          </button>
        ))}
      </div>

      {loading ? (
        <Card className="p-8 text-center text-xs text-slate-500">
          {isBn ? 'সেশন লোড হচ্ছে...' : 'Loading knowledge sessions...'}
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center space-y-2 border-dashed">
          <Video className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">
            {isBn ? 'কোনো নির্ধারিত সেশন পাওয়া যায়নি' : 'No knowledge sessions scheduled yet'}
          </p>
          <p className="text-xs text-slate-500">
            {canHost
              ? isBn
                ? 'উপরের বাটনে ক্লিক করে প্রথম সেশন হোস্ট করুন।'
                : 'Click Host Knowledge Session above to publish a webinar.'
              : isBn
              ? 'শীঘ্রই অ্যালামনাই ওয়েবিনার এখানে প্রকাশিত হবে।'
              : 'Upcoming webinars hosted by verified alumni will appear here.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((s) => {
            const isRegistered = Boolean(firebaseUser && s.registeredIds.includes(firebaseUser.uid));
            const isHost = Boolean(firebaseUser && s.hostId === firebaseUser.uid);
            const seatsFull = s.registeredIds.length >= s.maxSeats;
            const isCancelled = s.status === 'Cancelled';

            return (
              <Card key={s.id} className="p-5 flex flex-col justify-between gap-4 border-slate-200/90">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {s.topic}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isCancelled
                          ? 'bg-rose-100 text-rose-700'
                          : s.status === 'Completed'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-base font-black text-slate-900 leading-snug">{s.title}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isBn ? 'হোস্ট:' : 'Hosted by'} <strong className="text-slate-700">{s.hostName}</strong>
                      {s.hostCompany ? ` · ${s.hostCompany}` : ''}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{s.description}</p>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{s.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {s.time} ({s.durationMinutes}m)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{s.mode === 'Online' ? 'Online Webinar' : s.venue || s.mode}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {s.registeredIds.length} / {s.maxSeats} {isBn ? 'নিবন্ধিত' : 'seats'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  {s.meetingLink && (isRegistered || isHost) && !isCancelled && (
                    <a
                      href={s.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {isBn ? 'মিটিং লিংকে যোগ দিন' : 'Join Session'}
                    </a>
                  )}

                  {!isHost && !isCancelled && s.status !== 'Completed' && (
                    <Button
                      size="sm"
                      variant={isRegistered ? 'outline' : 'primary'}
                      isLoading={busyId === s.id}
                      disabled={!isRegistered && seatsFull}
                      leftIcon={
                        isRegistered ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />
                      }
                      onClick={() => void handleToggleRegister(s)}
                    >
                      {isRegistered
                        ? isBn
                          ? 'নিবন্ধন বাতিল'
                          : 'Cancel RSVP'
                        : seatsFull
                        ? isBn
                          ? 'আসন পূর্ণ'
                          : 'Full'
                        : isBn
                        ? 'আসন সংরক্ষণ করুন'
                        : 'Register Seat'}
                    </Button>
                  )}

                  {isHost && !isCancelled && (
                    <div className="flex items-center gap-2 ml-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void updateKnowledgeSessionStatus(s.id, 'Completed')}
                      >
                        {isBn ? 'সম্পন্ন চিহ্নিত করুন' : 'Mark Completed'}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => void updateKnowledgeSessionStatus(s.id, 'Cancelled')}
                      >
                        {isBn ? 'বাতিল' : 'Cancel'}
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title={isBn ? 'নতুন জ্ঞান বিনিময় সেশন হোস্ট করুন' : 'Host Knowledge-Sharing Session'}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label={isBn ? 'সেশনের শিরোনাম' : 'Session Title'}
            required
            placeholder="e.g. System Design Basics & Internship Roadmap"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label={isBn ? 'বিষয়' : 'Topic'}
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {isBn ? 'মোড' : 'Mode'}
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                <option value="Online">Online (Webinar)</option>
                <option value="On-Campus">On-Campus (BAUST)</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <TextArea
            label={isBn ? 'বিবরণ ও এজেন্ডা' : 'Description & Agenda'}
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input
              label={isBn ? 'তারিখ' : 'Date'}
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Input
              label={isBn ? 'সময়' : 'Time'}
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
            <Input
              label={isBn ? 'স্থায়িত্ব (মি.)' : 'Minutes'}
              type="number"
              min={15}
              max={240}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
            />
            <Input
              label={isBn ? 'সর্বোচ্চ আসন' : 'Max Seats'}
              type="number"
              min={5}
              max={500}
              value={maxSeats}
              onChange={(e) => setMaxSeats(e.target.value)}
            />
          </div>

          {mode !== 'On-Campus' && (
            <Input
              label={isBn ? 'মিটিং লিংক' : 'Meeting Link (Google Meet / Zoom)'}
              type="url"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
            />
          )}

          {mode !== 'Online' && (
            <Input
              label={isBn ? 'ভেন্যু' : 'Campus Venue'}
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
            />
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              {isBn ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              {isBn ? 'প্রকাশ করুন' : 'Publish Session'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
