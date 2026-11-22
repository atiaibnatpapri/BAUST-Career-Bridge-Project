/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { createEventItem, subscribeEvents, toggleEventRsvp } from '../../services/firestorePortal';
import { EventItem } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Loader } from '../../components/ui/Loader';
import { Calendar, MapPin, Plus, Users, CheckCircle2, AlertCircle } from 'lucide-react';

export const AlumniEventsPage: React.FC = () => {
  const { firebaseUser, userProfile } = useAuth();
  const { addToast } = useApp();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventItem['category']>('Networking');
  const [date, setDate] = useState('2026-12-20');
  const [time, setTime] = useState('04:00 PM');
  const [venue, setVenue] = useState('BAUST Auditorium / Zoom');
  const [mode, setMode] = useState<EventItem['mode']>('Hybrid');
  const [maxSeats, setMaxSeats] = useState('120');
  const [description, setDescription] = useState('');

  useEffect(() => {
    setLoading(true);
    return subscribeEvents(
      (items) => {
        setEvents(items);
        setLoading(false);
      },
      (err) => {
        setErrorMsg(err.message);
        setLoading(false);
      }
    );
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !userProfile) return;
    setSaving(true);
    try {
      await createEventItem({
        title: title.trim(),
        category,
        date,
        time,
        venue: venue.trim(),
        mode,
        description: description.trim(),
        organizerId: firebaseUser.uid,
        organizerName: userProfile.name,
        organizerRole: userProfile.role,
        maxSeats: parseInt(maxSeats, 10) || 100,
        isDemo: Boolean(userProfile.isDemo),
      });
      addToast('success', 'Event Created', `${title} is now open for RSVPs.`);
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
    } catch (err: any) {
      addToast('error', 'Failed to Create Event', err?.message || 'Permission denied.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader label="Loading campus & alumni events..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-emerald-100">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
            Alumni Community Events
          </span>
          <h1 className="text-2xl font-black text-[#0F2A4A] tracking-tight mt-1">
            Events, Reunions & Workshops
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Host technical workshops, career panels, or RSVP to upcoming BAUST alumni gatherings
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Host New Event
        </Button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {events.length === 0 ? (
        <Card className="p-12 text-center space-y-2 border-dashed border-slate-300">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No events scheduled yet</p>
          <p className="text-xs text-slate-500">Host a reunion, seminar, or career workshop for BAUST.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {events.map((ev) => {
            const isGoing = Boolean(firebaseUser && ev.attendeeIds.includes(firebaseUser.uid));
            return (
              <Card key={ev.id} className="p-5 border-slate-200 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Badge variant="army" size="sm">
                      {ev.category}
                    </Badge>
                    <span className="text-[11px] font-semibold text-slate-500">{ev.mode}</span>
                  </div>
                  <h3 className="text-base font-bold text-[#0F2A4A]">{ev.title}</h3>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-700" /> {ev.date} · {ev.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700" /> {ev.venue}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{ev.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {ev.attendeeIds.length} / {ev.maxSeats} attending
                  </span>
                  {firebaseUser && (
                    <Button
                      variant={isGoing ? 'outline' : 'secondary'}
                      size="sm"
                      onClick={() => void toggleEventRsvp(ev.id, firebaseUser.uid, isGoing)}
                      leftIcon={isGoing ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : undefined}
                    >
                      {isGoing ? 'Going (Cancel)' : 'RSVP Now'}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Host Alumni Event or Seminar"
        description="Open to approved BAUST community members"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <Input
            label="Event Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. BAUST CSE Alumni Networking Night"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              options={[
                { value: 'Networking', label: 'Networking' },
                { value: 'Workshop', label: 'Technical Workshop' },
                { value: 'Career Fair', label: 'Career Fair' },
                { value: 'Reunion', label: 'Alumni Reunion' },
                { value: 'Seminar', label: 'Seminar' },
              ]}
            />
            <Select
              label="Mode"
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
              options={[
                { value: 'Hybrid', label: 'Hybrid' },
                { value: 'On-Campus', label: 'On-Campus (Saidpur)' },
                { value: 'Online', label: 'Online' },
              ]}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input label="Date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
            <Input label="Time" required value={time} onChange={(e) => setTime(e.target.value)} />
            <Input label="Max Seats" type="number" value={maxSeats} onChange={(e) => setMaxSeats(e.target.value)} />
          </div>
          <Input label="Venue / Link" required value={venue} onChange={(e) => setVenue(e.target.value)} />
          <Textarea
            label="Agenda & Description"
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" isLoading={saving}>
              Publish Event
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
