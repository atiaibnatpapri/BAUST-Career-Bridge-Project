import React, { useState } from 'react';
import { X, Bell, Pin, AlertTriangle, Calendar, Paperclip, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { NoticeItem } from '../../types/admindesk';

interface NoticeCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (notice: Omit<NoticeItem, 'id' | 'publishedAt' | 'readCount'> & { id?: string }) => void;
  editingNotice?: NoticeItem | null;
}

const CATEGORIES: NoticeItem['category'][] = [
  'Academic',
  'Alumni Event',
  'Convocation',
  'Job/Recruitment',
  'Policy',
  'Urgent'
];

export const NoticeCreateModal: React.FC<NoticeCreateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingNotice
}) => {
  const [title, setTitle] = useState(editingNotice?.title || '');
  const [titleBn, setTitleBn] = useState(editingNotice?.titleBn || '');
  const [category, setCategory] = useState<NoticeItem['category']>(editingNotice?.category || 'Academic');
  const [audience, setAudience] = useState<NoticeItem['audience']>(editingNotice?.audience || 'All');
  const [isPinned, setIsPinned] = useState(editingNotice?.isPinned || false);
  const [isUrgent, setIsUrgent] = useState(editingNotice?.isUrgent || false);
  const [content, setContent] = useState(editingNotice?.content || '');
  const [eventDate, setEventDate] = useState(editingNotice?.eventDate || '');
  const [eventLocation, setEventLocation] = useState(editingNotice?.eventLocation || '');
  const [attachmentName, setAttachmentName] = useState('');
  const [attachments, setAttachments] = useState<{ name: string; url: string; size: string }[]>(
    editingNotice?.attachments || []
  );

  if (!isOpen) return null;

  const handleAddAttachment = () => {
    if (!attachmentName.trim()) return;
    setAttachments(prev => [
      ...prev,
      {
        name: attachmentName.trim(),
        url: '#',
        size: '1.2 MB'
      }
    ]);
    setAttachmentName('');
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onSave({
      ...(editingNotice ? { id: editingNotice.id } : {}),
      title: title.trim(),
      titleBn: titleBn.trim() || undefined,
      category,
      audience,
      isPinned,
      isUrgent,
      content: content.trim(),
      status: 'Published',
      eventDate: eventDate.trim() || undefined,
      eventLocation: eventLocation.trim() || undefined,
      attachments: attachments.length > 0 ? attachments : undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 bg-[#0F2A4A] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-white/10 rounded-xl">
              <Bell className="w-5 h-5 text-[#C9A227]" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white">
                {editingNotice ? 'Edit Notice & Circular' : 'Publish University Notice'}
              </h2>
              <p className="text-xs text-white/70">
                Official circular dispatched to students, alumni, and notice boards
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Notice Title (English) *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. 4th Convocation Registration Deadline & Gown Collection"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F2A4A] outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Notice Title (বাংলা)
              </label>
              <input
                type="text"
                value={titleBn}
                onChange={e => setTitleBn(e.target.value)}
                placeholder="যেমন: ৪র্থ সমাবর্তন নিবন্ধন সময়সীমা"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F2A4A] outline-hidden font-['Noto_Sans_Bengali']"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F2A4A] outline-hidden bg-white"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Target Audience
              </label>
              <select
                value={audience}
                onChange={e => setAudience(e.target.value as any)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F2A4A] outline-hidden bg-white"
              >
                <option value="All">Everyone (Students & Alumni)</option>
                <option value="Alumni">Alumni Only</option>
                <option value="Students">Current Students Only</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 p-3 bg-gray-50 rounded-xl border border-gray-200">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={e => setIsPinned(e.target.checked)}
                className="w-4 h-4 text-[#0F2A4A] rounded border-gray-300 focus:ring-[#0F2A4A]"
              />
              <Pin className="w-4 h-4 text-[#C9A227]" />
              <span>Pin to top of Notice Board</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={e => setIsUrgent(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
              />
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>Mark as Urgent Alert</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                Event Date (Optional)
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={e => setEventDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F2A4A] outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Event Location / Venue (Optional)
              </label>
              <input
                type="text"
                value={eventLocation}
                onChange={e => setEventLocation(e.target.value)}
                placeholder="e.g. BAUST Auditorium"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F2A4A] outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Notice Content & Detailed Instructions *
            </label>
            <textarea
              required
              rows={5}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Enter full circular text, instructions, fee details, deadlines, and official signatures..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F2A4A] outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 text-gray-500" />
              Attachments (Official Forms, Circular PDF)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={attachmentName}
                onChange={e => setAttachmentName(e.target.value)}
                placeholder="e.g. Convocation_Schedule_2026.pdf"
                className="grow px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F2A4A] outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddAttachment}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold rounded-xl flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            {attachments.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                  >
                    <span className="font-medium text-gray-800 truncate">{att.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(idx)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold text-white bg-[#0F2A4A] hover:bg-[#1a3d66] rounded-xl flex items-center gap-2 shadow-sm transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              {editingNotice ? 'Update Notice' : 'Publish Notice & Notify'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
