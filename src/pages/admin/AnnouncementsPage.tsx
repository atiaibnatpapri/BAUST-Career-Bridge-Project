/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Announcement } from '../../types';
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  Calendar, 
  Pin, 
  ExternalLink, 
  Users, 
  GraduationCap, 
  Briefcase
} from 'lucide-react';

export const AnnouncementsPage: React.FC = () => {
  const { announcements, addAnnouncement, deleteAnnouncement } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Announcement['category']>('Notice');
  const [targetAudience, setTargetAudience] = useState<Announcement['targetAudience']>('All');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('Registrar & Alumni Relations Office');
  const [pinned, setPinned] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    addAnnouncement({
      title,
      category,
      targetAudience,
      content,
      author,
      pinned,
      linkText: linkText || undefined,
      linkUrl: linkUrl || undefined,
    });

    setIsModalOpen(false);
    setTitle('');
    setContent('');
    setLinkText('');
    setLinkUrl('');
    setPinned(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0F2A4A] tracking-tight">
            Campus Notices & Career Events
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Broadcast official university circulars, recruitment career fairs, and webinar links to students & alumni
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Publish New Notice
        </Button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((item) => (
          <Card key={item.id} className="p-5 sm:p-6 border-slate-200 space-y-4 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {item.pinned && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
                    <Pin className="w-3 h-3 fill-amber-500 text-amber-600" /> Pinned Notice
                  </span>
                )}
                <Badge variant={item.category === 'Career Fair' ? 'gold' : item.category === 'Event' ? 'army' : 'navy'}>
                  {item.category}
                </Badge>
                <span className="text-[11px] text-slate-400">Target: <strong>{item.targetAudience}</strong></span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="font-mono">{item.date}</span>
                <button
                  onClick={() => deleteAnnouncement(item.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                  title="Delete Notice"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-2 whitespace-pre-line">
                {item.content}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-500 font-medium">Issued by: <strong>{item.author}</strong></span>

              {item.linkText && (
                <a
                  href={item.linkUrl || '#'}
                  className="font-bold text-[#0F2A4A] hover:underline inline-flex items-center gap-1"
                >
                  {item.linkText} <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* CREATE MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publish University Notice / Event"
        description="Visible immediately to students, alumni, or university staff"
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <Input
            label="Notice Headline / Title"
            placeholder="e.g. BAUST Annual Career & Tech Expo 2026"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Notice Category"
              options={[
                { value: 'Notice', label: 'Official Circular / Notice' },
                { value: 'Career Fair', label: 'Campus Career Fair' },
                { value: 'Event', label: 'Alumni Reunion / Seminar' },
                { value: 'Webinar', label: 'Virtual Career Webinar' },
              ]}
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
            />

            <Select
              label="Target Audience"
              options={[
                { value: 'All', label: 'All Community (Students & Alumni)' },
                { value: 'Students', label: 'Current Students Only' },
                { value: 'Alumni', label: 'Graduated Alumni Only' },
              ]}
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value as any)}
            />
          </div>

          <Textarea
            label="Notice Body & Details"
            rows={5}
            placeholder="Write the full notification text, venue information, dates, instructions..."
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Call to Action Button Text (Optional)"
              placeholder="e.g. Register for CV Drop"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
            />
            <Input
              label="Destination URL"
              placeholder="e.g. /student/directory or https://..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="pinned"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="rounded text-[#0F2A4A]"
            />
            <label htmlFor="pinned" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Pin this notice to top of public homepage and dashboards
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Publish Announcement
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
