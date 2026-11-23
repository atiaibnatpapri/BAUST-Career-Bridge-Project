/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { cleanPayload } from '../../services/firestoreUtils';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Announcement } from '../../types';
import { URL_PATTERN } from '../../constants/baustDataModel';
import {
  Megaphone,
  Plus,
  Trash2,
  Pin,
  ExternalLink,
  Pencil,
  AlertCircle,
  Power,
} from 'lucide-react';

function getLocalTodayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const AnnouncementsPage: React.FC = () => {
  const {
    announcements,
    addAnnouncement,
    updateAnnouncement,
    toggleAnnouncementActive,
    deleteAnnouncement,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Announcement['category']>('Notice');
  const [targetAudience, setTargetAudience] = useState<Announcement['targetAudience']>('All');
  const [priority, setPriority] = useState<'Normal' | 'Important'>('Normal');
  const [expiresAt, setExpiresAt] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('Registrar & Alumni Relations Office');
  const [pinned, setPinned] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);

  const [fieldErrors, setFieldErrors] = useState<{
    title?: string;
    content?: string;
    targetAudience?: string;
    expiresAt?: string;
    linkText?: string;
    linkUrl?: string;
  }>({});

  const resetForm = () => {
    setEditingItem(null);
    setTitle('');
    setCategory('Notice');
    setTargetAudience('All');
    setPriority('Normal');
    setExpiresAt('');
    setContent('');
    setAuthor('Registrar & Alumni Relations Office');
    setPinned(false);
    setLinkText('');
    setLinkUrl('');
    setServerError(null);
    setFieldErrors({});
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (item: Announcement) => {
    setEditingItem(item);
    setTitle(item.title || '');
    setCategory(item.category || 'Notice');
    setTargetAudience(item.targetAudience || 'All');
    setPriority(item.priority || (item.pinned ? 'Important' : 'Normal'));
    setExpiresAt(item.expiresAt || '');
    setContent(item.content || '');
    setAuthor(item.author || 'Registrar & Alumni Relations Office');
    setPinned(Boolean(item.pinned || item.priority === 'Important'));
    setLinkText(item.linkText || '');
    setLinkUrl(item.linkUrl || '');
    setServerError(null);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const validateForm = (): boolean => {
    const errs: {
      title?: string;
      content?: string;
      targetAudience?: string;
      expiresAt?: string;
      linkText?: string;
      linkUrl?: string;
    } = {};

    const cleanTitle = title.trim();
    const cleanContent = content.trim();
    const cleanExpiresAt = expiresAt.trim();
    const cleanLinkText = linkText.trim();
    const cleanUrl = linkUrl.trim();
    const localTodayIso = getLocalTodayIso();

    if (cleanTitle.length < 3 || cleanTitle.length > 120) {
      errs.title = 'Headline must be between 3 and 120 characters.';
    }
    if (cleanContent.length < 1 || cleanContent.length > 2000) {
      errs.content = 'Notice body must be between 1 and 2000 characters.';
    }
    if (!['All', 'Students', 'Alumni'].includes(targetAudience)) {
      errs.targetAudience = 'Select a valid target audience.';
    }
    if (cleanExpiresAt && cleanExpiresAt < localTodayIso) {
      errs.expiresAt = 'Expiration date cannot be in the past.';
    }
    if (cleanUrl && !cleanUrl.startsWith('/') && !URL_PATTERN.test(cleanUrl)) {
      errs.linkUrl = 'Enter an internal path (e.g. /student/jobs) or full https:// URL.';
    }
    if (cleanLinkText && !cleanUrl) {
      errs.linkUrl = 'Provide a Destination URL when Call to Action text is entered.';
    }
    if (cleanUrl && !cleanLinkText) {
      errs.linkText = 'Provide Call to Action button text for the Destination URL.';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setServerError(null);
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const isImportant = priority === 'Important' || pinned;
      const cleanExpires = expiresAt.trim();
      const cleanText = linkText.trim();
      const cleanUrl = linkUrl.trim();

      const payload = cleanPayload({
        title: title.trim(),
        category,
        targetAudience,
        priority,
        expiresAt: cleanExpires,
        content: content.trim(),
        author: author.trim() || 'Registrar & Alumni Relations Office',
        pinned: isImportant,
        linkText: cleanText,
        linkUrl: cleanUrl,
      });

      if (editingItem) {
        const ok = await updateAnnouncement(editingItem.id, payload, (msg) => setServerError(msg));
        if (ok) {
          setIsModalOpen(false);
          resetForm();
        }
      } else {
        const createdId = await addAnnouncement(
          {
            ...payload,
            active: true,
          },
          (msg) => setServerError(msg)
        );
        if (createdId) {
          setIsModalOpen(false);
          resetForm();
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (item: Announcement) => {
    setTogglingId(item.id);
    try {
      await toggleAnnouncementActive(item.id, item.active === false);
    } finally {
      setTogglingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const ok = await deleteAnnouncement(deleteTarget.id);
      if (ok) setDeleteTarget(null);
    } finally {
      setSubmitting(false);
    }
  };

  const todayIso = getLocalTodayIso();

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
          onClick={openCreateModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Publish New Notice
        </Button>
      </div>

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <Card className="p-10 text-center space-y-2 border-dashed">
          <Megaphone className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No announcements published yet</p>
          <p className="text-xs text-slate-500">Create a university notice to notify students and alumni live.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((item) => {
            const isActive = item.active !== false;
            const isExpired = Boolean(item.expiresAt && item.expiresAt < todayIso);
            const isImportant = item.priority === 'Important' || item.pinned;

            return (
              <Card
                key={item.id}
                className={`p-5 sm:p-6 border-slate-200 space-y-4 relative overflow-hidden ${
                  !isActive ? 'opacity-70 bg-slate-50/70' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {isImportant && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
                        <Pin className="w-3 h-3 fill-amber-500 text-amber-600" /> Important / Pinned
                      </span>
                    )}
                    <Badge
                      variant={
                        item.category === 'Career Fair'
                          ? 'gold'
                          : item.category === 'Event'
                          ? 'army'
                          : 'navy'
                      }
                    >
                      {item.category}
                    </Badge>
                    <Badge variant={isActive && !isExpired ? 'approved' : 'neutral'} size="sm">
                      {!isActive ? 'Inactive' : isExpired ? 'Expired' : 'Active'}
                    </Badge>
                    <span className="text-[11px] text-slate-400">
                      Target: <strong>{item.targetAudience}</strong>
                    </span>
                    {item.expiresAt && (
                      <span className="text-[11px] text-slate-400">
                        · Expires: <strong>{item.expiresAt}</strong>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono text-slate-400">{item.date}</span>
                    <button
                      type="button"
                      disabled={togglingId === item.id}
                      onClick={() => void handleToggleActive(item)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-bold transition-colors cursor-pointer ${
                        isActive
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                      }`}
                      title={isActive ? 'Deactivate Notice' : 'Activate Notice'}
                    >
                      <Power className="w-3.5 h-3.5" />
                      {isActive ? 'On' : 'Off'}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="text-slate-500 hover:text-[#0F2A4A] p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Edit Notice"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(item)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
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
                  <span className="text-slate-500 font-medium">
                    Issued by: <strong>{item.author}</strong>
                  </span>

                  {item.linkText && item.linkUrl && (
                    item.linkUrl.startsWith('/') ? (
                      <Link
                        to={item.linkUrl}
                        className="font-bold text-[#0F2A4A] hover:underline inline-flex items-center gap-1"
                      >
                        {item.linkText} <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <a
                        href={item.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-[#0F2A4A] hover:underline inline-flex items-center gap-1"
                      >
                        {item.linkText} <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          if (submitting) return;
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingItem ? 'Edit University Notice / Event' : 'Publish University Notice / Event'}
        description="Visible immediately to students, alumni, or university staff when active"
      >
        <form onSubmit={handleSaveAnnouncement} noValidate className="space-y-4">
          {serverError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {Object.keys(fieldErrors).length > 0 && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Please review the highlighted fields before publishing.</span>
            </div>
          )}

          <Input
            label="Notice Headline / Title"
            placeholder="e.g. BAUST Annual Career & Tech Expo 2026"
            required
            value={title}
            error={fieldErrors.title}
            onChange={(e) => {
              setTitle(e.target.value);
              setFieldErrors((prev) => ({ ...prev, title: undefined }));
              setServerError(null);
            }}
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
              error={fieldErrors.targetAudience}
              onChange={(e) => {
                setTargetAudience(e.target.value as any);
                setFieldErrors((prev) => ({ ...prev, targetAudience: undefined }));
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Priority Level"
              options={[
                { value: 'Normal', label: 'Normal Notice' },
                { value: 'Important', label: 'Important / High Priority' },
              ]}
              value={priority}
              onChange={(e) => {
                const next = e.target.value as 'Normal' | 'Important';
                setPriority(next);
                if (next === 'Important') setPinned(true);
              }}
            />

            <Input
              label="Expiration Date (Optional)"
              type="date"
              min={todayIso}
              value={expiresAt}
              error={fieldErrors.expiresAt}
              onChange={(e) => {
                setExpiresAt(e.target.value);
                setFieldErrors((prev) => ({ ...prev, expiresAt: undefined }));
              }}
            />
          </div>

          <Textarea
            label={`Notice Body & Details (${content.trim().length}/2000)`}
            rows={5}
            placeholder="Write the full notification text, venue information, dates, instructions..."
            required
            value={content}
            error={fieldErrors.content}
            onChange={(e) => {
              setContent(e.target.value);
              setFieldErrors((prev) => ({ ...prev, content: undefined }));
              setServerError(null);
            }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Call to Action Button Text (Optional)"
              placeholder="e.g. Register for CV Drop"
              value={linkText}
              error={fieldErrors.linkText}
              onChange={(e) => {
                setLinkText(e.target.value);
                setFieldErrors((prev) => ({ ...prev, linkText: undefined, linkUrl: undefined }));
              }}
            />
            <Input
              label="Destination URL (Optional)"
              placeholder="e.g. /student/directory or https://..."
              value={linkUrl}
              error={fieldErrors.linkUrl}
              onChange={(e) => {
                setLinkUrl(e.target.value);
                setFieldErrors((prev) => ({ ...prev, linkUrl: undefined, linkText: undefined }));
              }}
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
            <Button
              variant="outline"
              type="button"
              disabled={submitting}
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={submitting} disabled={submitting}>
              {editingItem ? 'Save Changes' : 'Publish Announcement'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRM MODAL */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Announcement"
        maxWidth="sm"
      >
        {deleteTarget && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Delete announcement <strong>&quot;{deleteTarget.title}&quot;</strong>? This removes it from all
              dashboards and notice boards immediately.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={submitting}
                onClick={() => void handleConfirmDelete()}
              >
                Delete Permanently
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
