/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  Megaphone,
  Search,
  Pin,
  ArrowLeft,
  Calendar,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';

export const NoticesPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { announcements, language } = useApp();
  const { userProfile } = useAuth();
  const isBn = language === 'bn';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const role = userProfile?.role;
  const basePath =
    role === 'alumni' ? '/alumni/notices' : role === 'student' ? '/student/notices' : '/notices';

  const todayIso = new Date().toISOString().split('T')[0];

  const activeNotices = useMemo(() => {
    return (announcements || []).filter((item) => {
      if (!item) return false;
      if (item.active === false) return false;
      if (item.expiresAt && item.expiresAt < todayIso) return false;

      if (role === 'student') {
        return item.targetAudience === 'All' || item.targetAudience === 'Students';
      }
      if (role === 'alumni') {
        return item.targetAudience === 'All' || item.targetAudience === 'Alumni';
      }
      return true;
    });
  }, [announcements, role, todayIso]);

  const selectedNotice = id
    ? announcements.find((n) => n.id === id) || null
    : null;

  const filteredNotices = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return activeNotices.filter((item) => {
      const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesQuery =
        !q ||
        (item.title || '').toLowerCase().includes(q) ||
        (item.content || '').toLowerCase().includes(q) ||
        (item.author || '').toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [activeNotices, searchTerm, selectedCategory]);

  if (id) {
    const isHiddenForViewer =
      !selectedNotice ||
      selectedNotice.active === false ||
      Boolean(selectedNotice.expiresAt && selectedNotice.expiresAt < todayIso);

    if (isHiddenForViewer) {
      return (
        <Card className="p-8 max-w-2xl mx-auto text-center space-y-3 border-slate-200">
          <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">
            {isBn ? 'নোটিশটি পাওয়া যায়নি' : 'Notice Not Found or Expired'}
          </h2>
          <p className="text-xs text-slate-500">
            {isBn
              ? 'এই ঘোষণাটি আর সক্রিয় নেই বা সরানো হয়েছে।'
              : 'This university announcement is no longer active or may have expired.'}
          </p>
          <Link to={basePath}>
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              {isBn ? 'সকল নোটিশে ফিরুন' : 'Back to All Notices'}
            </Button>
          </Link>
        </Card>
      );
    }

    const isImportant = selectedNotice.priority === 'Important' || selectedNotice.pinned;

    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <Link
          to={basePath}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0F2A4A]"
        >
          <ArrowLeft className="w-4 h-4" />
          {isBn ? 'সকল নোটিশ দেখুন' : 'Back to Notice Board'}
        </Link>

        <Card className="p-6 sm:p-8 border-slate-200 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={selectedNotice.category === 'Career Fair' ? 'gold' : 'army'}>
                {selectedNotice.category}
              </Badge>
              {isImportant && (
                <Badge variant="pending">
                  <Pin className="w-3 h-3 mr-1 inline" /> Important
                </Badge>
              )}
              <Badge variant="neutral">Audience: {selectedNotice.targetAudience}</Badge>
            </div>
            <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {selectedNotice.date}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-[#0F2A4A] leading-snug">
            {selectedNotice.title}
          </h1>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {selectedNotice.content}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              Issued by: <strong className="text-slate-800">{selectedNotice.author}</strong>
            </span>

            {selectedNotice.linkText && selectedNotice.linkUrl && (
              selectedNotice.linkUrl.startsWith('/') ? (
                <Link to={selectedNotice.linkUrl}>
                  <Button variant="primary" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                    {selectedNotice.linkText}
                  </Button>
                </Link>
              ) : (
                <a href={selectedNotice.linkUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="primary" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                    {selectedNotice.linkText}
                  </Button>
                </a>
              )
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200">
            <Megaphone className="w-3.5 h-3.5" />
            {isBn ? 'বাউস্ট নোটিশ বোর্ড' : 'Official Notice Board'}
          </span>
          <h1 className="text-2xl font-black text-[#0F2A4A] tracking-tight mt-1">
            {isBn ? 'বিশ্ববিদ্যালয় ক্যারিয়ার নোটিশ ও বিজ্ঞপ্তি' : 'University Career Notices & Circulars'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isBn
              ? 'সক্রিয় এবং প্রাসঙ্গিক ঘোষণা, ক্যারিয়ার ফেয়ার এবং ওয়েবিনার আপডেট।'
              : 'Live active circulars, career fairs, and seminar announcements from BAUST.'}
          </p>
        </div>
      </div>

      <Card className="p-4 border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder={isBn ? 'নোটিশ খুঁজুন...' : 'Search notices by headline or details...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex flex-wrap gap-1.5 items-center">
            {['All', 'Notice', 'Career Fair', 'Event', 'Webinar'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#0F2A4A] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {filteredNotices.length === 0 ? (
        <Card className="p-10 text-center space-y-2 border-dashed">
          <Megaphone className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">
            {isBn ? 'কোনো সক্রিয় নোটিশ পাওয়া যায়নি' : 'No active notices found'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotices.map((item) => {
            const isImportant = item.priority === 'Important' || item.pinned;
            return (
              <Link key={item.id} to={`${basePath}/${item.id}`} className="block">
                <Card hoverable className="p-5 border-slate-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {isImportant && (
                        <Badge variant="pending" size="sm">
                          <Pin className="w-3 h-3 mr-1 inline" /> Important
                        </Badge>
                      )}
                      <Badge
                        variant={
                          item.category === 'Career Fair'
                            ? 'gold'
                            : item.category === 'Event'
                            ? 'army'
                            : 'navy'
                        }
                        size="sm"
                      >
                        {item.category}
                      </Badge>
                      <span className="text-[11px] text-slate-400">
                        Audience: <strong>{item.targetAudience}</strong>
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{item.date}</span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-600 mt-1.5 line-clamp-3 leading-relaxed">
                      {item.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-500">Issued by: {item.author}</span>
                    <span className="font-bold text-[#0F2A4A] inline-flex items-center gap-1">
                      {isBn ? 'বিস্তারিত পড়ুন' : 'Read full notice'}
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
