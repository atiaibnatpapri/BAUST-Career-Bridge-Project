/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input, Select } from '../../components/ui/Input';
import { MentorshipTopic } from '../../types';
import { 
  Sliders, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Save, 
  HelpCircle,
  Video
} from 'lucide-react';

export const MentorSettingsPage: React.FC = () => {
  const { currentUser, alumniList, updateAlumniMentorSettings } = useApp();

  const currentAlumni = alumniList[0];

  const [mentoringAvailable, setMentoringAvailable] = useState<boolean>(
    currentAlumni.mentoringAvailable
  );
  const [slots, setSlots] = useState<string[]>(currentAlumni.availableSlots);
  const [newSlotDay, setNewSlotDay] = useState('Friday');
  const [newSlotTime, setNewSlotTime] = useState('8:00 PM');
  
  const [selectedTopics, setSelectedTopics] = useState<MentorshipTopic[]>(
    currentAlumni.mentorshipTopics
  );

  const [meetingPlatform, setMeetingPlatform] = useState('Google Meet');
  const [maxMenteesPerMonth, setMaxMenteesPerMonth] = useState('4');

  const allTopics: MentorshipTopic[] = [
    'CV Review',
    'Interview Prep',
    'Higher Studies',
    'Career Guidance',
    'Government / BCS',
    'Research & Publication',
  ];

  const handleToggleTopic = (topic: MentorshipTopic) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleAddSlot = () => {
    const slotString = `${newSlotDay} ${newSlotTime}`;
    if (!slots.includes(slotString)) {
      setSlots([...slots, slotString]);
    }
  };

  const handleRemoveSlot = (slotString: string) => {
    setSlots(slots.filter((s) => s !== slotString));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAlumniMentorSettings(mentoringAvailable, slots, selectedTopics);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0F2A4A] tracking-tight">
            Alumni Mentorship Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Set your weekly session availability, preferred coaching topics, and meeting links
          </p>
        </div>

        <Button variant="primary" onClick={handleSave} leftIcon={<Save className="w-4 h-4" />}>
          Save Settings
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* On / Off Toggle Card */}
        <Card className="p-6 border-slate-200">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Open for Student Mentorship
                </h3>
                <Badge variant={mentoringAvailable ? 'approved' : 'rejected'}>
                  {mentoringAvailable ? 'Active' : 'Paused'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                When active, current BAUST students can send 1-on-1 virtual booking inquiries.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={mentoringAvailable}
                onChange={(e) => setMentoringAvailable(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2E5E3E]" />
            </label>
          </div>
        </Card>

        {/* Weekly Availability Slots */}
        <Card className="p-6 border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0F2A4A]">Available Weekly Time Slots</h3>
              <p className="text-xs text-slate-500">
                Students will be able to pick from these specific slots when requesting a session.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-400 font-mono">
              {slots.length} active slots
            </span>
          </div>

          {/* Existing Slots */}
          <div className="space-y-2">
            {slots.map((slot) => (
              <div
                key={slot}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-[#0F2A4A]" />
                  <span className="text-xs font-bold text-slate-800">{slot} (BST)</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveSlot(slot)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Slot Control */}
          <div className="p-3.5 bg-slate-100/70 rounded-xl space-y-3 pt-4 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800">Add a New Regular Slot</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={newSlotDay}
                onChange={(e) => setNewSlotDay(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
              >
                <option value="Friday">Every Friday</option>
                <option value="Saturday">Every Saturday</option>
                <option value="Sunday">Every Sunday</option>
                <option value="Tuesday">Every Tuesday</option>
                <option value="Wednesday">Every Wednesday</option>
                <option value="Thursday">Every Thursday</option>
              </select>

              <Input
                type="text"
                placeholder="e.g. 7:30 PM"
                value={newSlotTime}
                onChange={(e) => setNewSlotTime(e.target.value)}
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSlot}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add Slot
              </Button>
            </div>
          </div>
        </Card>

        {/* Mentorship Focus Topics */}
        <Card className="p-6 border-slate-200 space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#0F2A4A]">Mentorship Guidance Topics</h3>
            <p className="text-xs text-slate-500">
              Select the areas you feel most passionate and comfortable advising students on:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allTopics.map((topic) => {
              const isChecked = selectedTopics.includes(topic);
              return (
                <div
                  key={topic}
                  onClick={() => handleToggleTopic(topic)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isChecked
                      ? 'border-[#0F2A4A] bg-[#0F2A4A]/5 font-bold text-[#0F2A4A]'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs">{topic}</span>
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border ${
                      isChecked ? 'bg-[#0F2A4A] border-[#0F2A4A] text-white' : 'border-slate-300'
                    }`}
                  >
                    {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Capacity & Platform Settings */}
        <Card className="p-6 border-slate-200 space-y-4">
          <h3 className="text-base font-bold text-[#0F2A4A]">Meeting Preferences</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Default Video Platform"
              options={[
                { value: 'Google Meet', label: 'Google Meet (Recommended)' },
                { value: 'Zoom', label: 'Zoom Video' },
                { value: 'Microsoft Teams', label: 'Microsoft Teams' },
              ]}
              value={meetingPlatform}
              onChange={(e) => setMeetingPlatform(e.target.value)}
            />

            <Select
              label="Maximum Sessions per Month"
              options={[
                { value: '2', label: '2 sessions / month (Casual)' },
                { value: '4', label: '4 sessions / month (Standard)' },
                { value: '8', label: '8 sessions / month (High Impact)' },
              ]}
              value={maxMenteesPerMonth}
              onChange={(e) => setMaxMenteesPerMonth(e.target.value)}
            />
          </div>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="primary" type="submit" size="lg" leftIcon={<Save className="w-4 h-4" />}>
            Save All Preferences
          </Button>
        </div>

      </form>

    </div>
  );
};
