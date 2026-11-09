/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MentorshipSession } from '../../types/mentorship';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  PhoneOff, 
  Share2, 
  MessageSquare, 
  FileText, 
  CheckSquare, 
  Plus, 
  Maximize2,
  Clock,
  Sparkles
} from 'lucide-react';

import { useMentorshipStore } from '../../hooks/useMentorshipStore';

export interface MockCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: MentorshipSession;
  onEndCall?: () => void;
  onUpdateNotes?: (notes: string) => void;
  onAddActionItem?: (text: string) => void;
  onToggleActionItem?: (id: string) => void;
}

export const MockCallModal: React.FC<MockCallModalProps> = ({
  isOpen,
  onClose,
  session,
  onEndCall,
  onUpdateNotes,
  onAddActionItem,
  onToggleActionItem,
}) => {
  const store = useMentorshipStore();
  if (!isOpen) return null;

  const handleEndCallAction = onEndCall || onClose;
  const handleUpdateNotesAction =
    onUpdateNotes || ((notes: string) => store.updateSessionNotes(session.id, notes));
  const handleAddActionAction =
    onAddActionItem || ((text: string) => store.addActionItem(session.id, text));
  const handleToggleActionAction =
    onToggleActionItem || ((id: string) => store.toggleActionItem(session.id, id));

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [seconds, setSeconds] = useState(420); // starts at 07:00
  const [activeTab, setActiveTab] = useState<'notes' | 'actions'>('notes');
  const [notesText, setNotesText] = useState(session.sharedNotes || '');
  const [newActionText, setNewActionText] = useState('');

  // Running call timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSaveNotes = () => {
    handleUpdateNotesAction(notesText);
  };

  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionText.trim()) return;
    handleAddActionAction(newActionText.trim());
    setNewActionText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-6xl h-[92vh] bg-[#0A1C32] rounded-3xl border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden text-white">
        
        {/* Call Header */}
        <div className="px-6 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">
                BAUST Live Mentoring Session: {session.topic}
              </h3>
              <p className="text-[11px] text-slate-400">
                {session.studentName} · {session.mentorName} ({session.mentorCompany})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-lg text-xs font-mono font-bold text-emerald-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(seconds)}</span>
            </div>
          </div>
        </div>

        {/* Call Viewport Split */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Main Video Arena (Left 70%) */}
          <div className="flex-1 p-4 flex flex-col justify-between relative bg-radial from-slate-900 to-[#0A1C32]">
            
            {/* Screen sharing banner if active */}
            {isScreenSharing && (
              <div className="mb-2 p-2 rounded-xl bg-sky-950/80 border border-sky-700/60 text-xs text-sky-200 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-sky-400" />
                  <span>You are sharing your screen (Resume Presentation)</span>
                </span>
                <button
                  onClick={() => setIsScreenSharing(false)}
                  className="text-xs text-sky-400 hover:underline font-bold"
                >
                  Stop Sharing
                </button>
              </div>
            )}

            {/* Video Tiles Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              
              {/* Mentor Tile */}
              <div className="w-full h-full min-h-[220px] rounded-2xl bg-slate-800/80 border border-slate-700 relative overflow-hidden flex flex-col items-center justify-center p-4 shadow-inner">
                <Avatar
                  src={session.mentorAvatar}
                  name={session.mentorName}
                  size="xl"
                  isVerified
                />
                <div className="mt-3 text-center">
                  <p className="text-sm font-bold text-white">{session.mentorName}</p>
                  <p className="text-xs text-slate-400">{session.mentorDesignation} at {session.mentorCompany}</p>
                </div>

                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Speaking
                </div>
                <div className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-slate-900/80 text-white">
                  <Mic className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Student Tile */}
              <div className="w-full h-full min-h-[220px] rounded-2xl bg-slate-800/80 border border-slate-700 relative overflow-hidden flex flex-col items-center justify-center p-4 shadow-inner">
                {isVideoOn ? (
                  <>
                    <Avatar
                      src={session.studentAvatar}
                      name={session.studentName}
                      size="xl"
                    />
                    <div className="mt-3 text-center">
                      <p className="text-sm font-bold text-white">{session.studentName} (You)</p>
                      <p className="text-xs text-slate-400">{session.studentDept} · {session.studentBatch}</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-2">
                    <VideoOff className="w-10 h-10 text-slate-500 mx-auto" />
                    <p className="text-xs text-slate-400">Camera is off</p>
                  </div>
                )}

                <div className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-slate-900/80 text-white">
                  {isMuted ? <MicOff className="w-3.5 h-3.5 text-rose-400" /> : <Mic className="w-3.5 h-3.5 text-white" />}
                </div>
              </div>

            </div>

            {/* In-Call Controls Bottom Bar */}
            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3.5 rounded-2xl transition-all cursor-pointer ${
                  isMuted ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
                title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-3.5 rounded-2xl transition-all cursor-pointer ${
                  !isVideoOn ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
                title={isVideoOn ? 'Turn camera off' : 'Turn camera on'}
              >
                {isVideoOn ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className={`p-3.5 rounded-2xl transition-all cursor-pointer ${
                  isScreenSharing ? 'bg-sky-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
                title="Share Screen"
              >
                <Share2 className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  handleEndCallAction();
                  onClose();
                }}
                className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-2 cursor-pointer transition-all shadow-lg"
              >
                <PhoneOff className="w-5 h-5" />
                <span>End & Mark Complete</span>
              </button>
            </div>

          </div>

          {/* Right Side Panel: Live Shared Notes & Action Items (Right 30%) */}
          <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900 flex flex-col">
            
            {/* Panel Tabs */}
            <div className="flex border-b border-slate-800">
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex-1 py-3 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'notes'
                    ? 'text-[#C9A227] border-b-2 border-[#C9A227] bg-slate-800/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" /> Live Shared Notes
              </button>

              <button
                onClick={() => setActiveTab('actions')}
                className={`flex-1 py-3 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'actions'
                    ? 'text-[#C9A227] border-b-2 border-[#C9A227] bg-slate-800/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckSquare className="w-4 h-4" /> Action Items ({session.actionItems?.length || 0})
              </button>
            </div>

            {/* TAB: Live Notes */}
            {activeTab === 'notes' && (
              <div className="flex-1 p-4 flex flex-col justify-between space-y-3">
                <div className="flex-1 flex flex-col">
                  <p className="text-[11px] text-slate-400 mb-2">
                    Both student and mentor can write and reference notes here:
                  </p>
                  <textarea
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    placeholder="Type live session notes, key book recommendations, interview question bullet points..."
                    className="flex-1 w-full bg-slate-800/90 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#C9A227] resize-none"
                  />
                </div>
                <Button
                  variant="accent"
                  size="sm"
                  onClick={handleSaveNotes}
                  className="w-full text-xs"
                >
                  Save Notes to Session Record
                </Button>
              </div>
            )}

            {/* TAB: Action Items */}
            {activeTab === 'actions' && (
              <div className="flex-1 p-4 flex flex-col justify-between space-y-4">
                <div className="flex-1 overflow-y-auto space-y-2">
                  <p className="text-[11px] text-slate-400 mb-1">
                    Tasks assigned during this call:
                  </p>

                  {(session.actionItems || []).length === 0 ? (
                    <p className="text-xs text-slate-500 italic text-center py-6">
                      No action items created yet. Add one below!
                    </p>
                  ) : (
                    session.actionItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleToggleActionAction(item.id)}
                        className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-colors ${
                          item.completed
                            ? 'bg-emerald-950/40 border-emerald-800 text-slate-400 line-through'
                            : 'bg-slate-800/60 border-slate-700 text-slate-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => {}}
                          className="mt-0.5 rounded text-[#2E5E3E]"
                        />
                        <span className="text-xs leading-snug flex-1">{item.text}</span>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddAction} className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <input
                    type="text"
                    value={newActionText}
                    onChange={(e) => setNewActionText(e.target.value)}
                    placeholder="Add task / milestone..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
                  />
                  <Button type="submit" variant="accent" size="sm" className="px-3">
                    <Plus className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
