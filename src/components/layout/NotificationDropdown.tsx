/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatLocalizedNumber } from '../../data/translations';
import { Bell, CheckCheck, Clock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotificationDropdown: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead, t, language } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1 sm:p-2 text-slate-600 hover:text-[#0F2A4A] hover:bg-slate-100 rounded-lg sm:rounded-xl transition-colors cursor-pointer shrink-0"
        aria-label={t.notifications.title}
      >
        <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white text-xs font-bold rounded-full flex items-center justify-center tabular-nums leading-none">
            {unreadCount > 9 ? '9+' : formatLocalizedNumber(unreadCount, language)}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
          <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2 min-w-0">
              <h4 className="text-sm font-bold text-[#0F2A4A] truncate">{t.notifications.title}</h4>
              {unreadCount > 0 && (
                <span className="text-xs font-semibold bg-[#0F2A4A]/10 text-[#0F2A4A] px-2 py-0.5 rounded-full shrink-0 tabular-nums">
                  {t.notifications.newCount.replace('{count}', formatLocalizedNumber(unreadCount, language))}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsRead}
                className="text-xs font-medium text-[#2E5E3E] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                {t.notifications.markAllRead}
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-slate-500">
                {t.notifications.empty}
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationRead(notif.id)}
                  className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col gap-1 ${
                    !notif.read ? 'bg-sky-50/40' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 leading-snug">{notif.title}</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      {notif.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed break-words">{notif.message}</p>
                  {notif.link && (
                    <Link
                      to={notif.link}
                      onClick={() => setIsOpen(false)}
                      className="text-xs font-semibold text-[#0F2A4A] hover:underline inline-flex items-center gap-1 mt-1"
                    >
                      {t.notifications.viewDetails} <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
