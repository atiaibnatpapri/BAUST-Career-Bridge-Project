/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import {
  Send,
  Paperclip,
  FileText,
  Search,
  CheckCheck,
  Phone,
  Video,
  Download,
  ArrowLeft,
  PhoneCall,
  ExternalLink,
  X,
  Plus,
  MessageSquare,
} from 'lucide-react';

export const ChatPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get('user');
  const targetConvParam = searchParams.get('conv');

  const {
    conversations,
    messages,
    sendMessage,
    openOrCreateConversation,
    watchConversationMessages,
    allUsers,
    currentUser,
    addToast,
    language,
  } = useApp();

  const [activeConvId, setActiveConvId] = useState<string>(targetConvParam || conversations[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    size: string;
    type: 'pdf';
    url: string;
  } | null>(null);
  const [showMobileList, setShowMobileList] = useState(!(targetConvParam || targetUserId));
  const [callModalMode, setCallModalMode] = useState<'voice' | 'video' | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Select ?conv= when provided
  useEffect(() => {
    if (!targetConvParam) return;
    if (conversations.some((c) => c.id === targetConvParam)) {
      setActiveConvId(targetConvParam);
      setShowMobileList(false);
    }
  }, [targetConvParam, conversations]);

  // Open or create conversation when ?user= is provided
  useEffect(() => {
    if (!targetUserId) return;
    let active = true;
    void openOrCreateConversation(targetUserId).then((convId) => {
      if (active && convId) {
        setActiveConvId(convId);
        setShowMobileList(false);
      }
    });
    return () => {
      active = false;
    };
  }, [targetUserId, openOrCreateConversation]);

  // Keep activeConvId synchronized with live Firestore conversations
  useEffect(() => {
    if (conversations.length === 0) {
      if (activeConvId) setActiveConvId('');
      return;
    }
    if (!activeConvId || !conversations.some((c) => c.id === activeConvId)) {
      setActiveConvId(conversations[0].id);
    }
  }, [conversations, activeConvId]);

  const filteredConversations = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        (c.participantName || '').toLowerCase().includes(q) ||
        (c.participantTitle || '').toLowerCase().includes(q) ||
        (c.lastMessage || '').toLowerCase().includes(q)
    );
  }, [conversations, searchTerm]);

  const activeConversation =
    conversations.find((c) => c.id === activeConvId) || conversations[0] || null;

  // Subscribe to live Firestore messages for the selected conversation
  useEffect(() => {
    watchConversationMessages(activeConversation?.id || null);
  }, [activeConversation?.id, watchConversationMessages]);

  const currentMessages = activeConversation
    ? messages[activeConversation.id] || []
    : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length]);

  const chatCandidates = useMemo(() => {
    const q = userSearchTerm.trim().toLowerCase();
    return (allUsers ?? []).filter((u) => {
      if (!u || !u.id || u.id === currentUser.id) return false;
      if (u.verificationStatus !== 'approved' || u.suspended) return false;
      if (!q) return true;
      return (
        (u.name || '').toLowerCase().includes(q) ||
        (u.department || '').toLowerCase().includes(q) ||
        (u.role || '').toLowerCase().includes(q) ||
        (u.company || '').toLowerCase().includes(q)
      );
    });
  }, [allUsers, currentUser.id, userSearchTerm]);

  const handleStartChatWithUser = async (uid: string) => {
    const convId = await openOrCreateConversation(uid);
    if (convId) {
      setActiveConvId(convId);
      setShowMobileList(false);
      setIsNewChatOpen(false);
      setUserSearchTerm('');
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversation || isSending) return;
    if (!inputText.trim() && !attachedFile) return;

    const targetConvId = activeConversation.id;
    const textToSend = inputText;
    const fileToSend = attachedFile || undefined;
    setInputText('');
    setAttachedFile(null);
    setIsSending(true);
    try {
      await sendMessage(targetConvId, textToSend, fileToSend);
    } finally {
      setIsSending(false);
    }
  };

  const handleAttachCV = () => {
    const safeName = (currentUser?.name || 'BAUST_User').replace(/\s+/g, '_');
    setAttachedFile({
      name: `${safeName}_CV.pdf`,
      size: '1.8 MB',
      type: 'pdf',
      url: '#',
    });
  };

  const handleDownloadAttachment = (fileName: string) => {
    const content = `BAUST Career Bridge — Shared Attachment\nDocument: ${fileName}\nDownloaded: ${new Date().toLocaleString()}\n`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    addToast('info', 'Downloading Attachment', fileName);
  };

  const newChatModal = (
    <Modal
      isOpen={isNewChatOpen}
      onClose={() => setIsNewChatOpen(false)}
      title={language === 'bn' ? 'নতুন বার্তা পাঠান' : 'Start New Conversation'}
      maxWidth="md"
    >
      <div className="space-y-3">
        <input
          type="text"
          value={userSearchTerm}
          onChange={(e) => setUserSearchTerm(e.target.value)}
          placeholder={language === 'bn' ? 'নাম, বিভাগ বা প্রতিষ্ঠান খুঁজুন...' : 'Search verified users by name, department, role...'}
          className="w-full bg-slate-100 border-0 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F2A4A]"
        />
        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
          {chatCandidates.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-500">
              {language === 'bn' ? 'কোনো অনুমোদিত ব্যবহারকারী পাওয়া যায়নি।' : 'No approved members found.'}
            </p>
          ) : (
            chatCandidates.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => void handleStartChatWithUser(u.id)}
                className="w-full p-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 rounded-xl text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar src={u.avatar} name={u.name} size="sm" isVerified={Boolean(u.isVerified)} />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{u.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {(u.role || 'member').toUpperCase()} · {u.department || 'BAUST'}
                      {u.company ? ` · ${u.company}` : ''}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#0F2A4A] shrink-0">
                  {language === 'bn' ? 'চ্যাট' : 'Message'}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </Modal>
  );

  if (!activeConversation) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center space-y-4 max-w-2xl mx-auto shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-[#0F2A4A]/5 text-[#0F2A4A] flex items-center justify-center mx-auto">
          <MessageSquare className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-[#0F2A4A]">
            {language === 'bn' ? 'সরাসরি বার্তা (লাইভ চ্যাট)' : 'Direct Messages'}
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {language === 'bn'
              ? 'কোনো কথোপকথন এখনও শুরু হয়নি। যাচাইকৃত বাউস্ট শিক্ষার্থী, অ্যালামনাই বা প্রশাসনের সাথে রিয়েল-টাইম চ্যাট শুরু করুন।'
              : 'You have no active conversations yet. Start a real-time 1-on-1 conversation with any verified BAUST student, alumni mentor, or staff member.'}
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => setIsNewChatOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          {language === 'bn' ? 'নতুন কথোপকথন শুরু করুন' : 'Start New Conversation'}
        </Button>

        {newChatModal}
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] w-full flex bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Left Pane: Conversation List */}
      <div
        className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-slate-50/50 ${
          !showMobileList ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Header Search */}
        <div className="p-4 border-b border-slate-200 bg-white space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#0F2A4A]">
                {language === 'bn' ? 'সরাসরি বার্তা' : 'Direct Messages'}
              </h2>
              <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Live
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsNewChatOpen(true)}
              className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#0F2A4A] text-white hover:bg-[#193d69] transition-colors cursor-pointer"
              title={language === 'bn' ? 'নতুন বার্তা' : 'New Message'}
            >
              <Plus className="w-3.5 h-3.5" />
              {language === 'bn' ? 'নতুন' : 'New'}
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-slate-100 border-0 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F2A4A]"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No conversations matching &quot;{searchTerm}&quot;.
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = conv.id === activeConversation.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    setActiveConvId(conv.id);
                    setShowMobileList(false);
                  }}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-white border-l-4 border-l-[#0F2A4A] shadow-xs'
                      : 'hover:bg-slate-100/60'
                  }`}
                >
                  <Avatar
                    src={conv.participantAvatar}
                    name={conv.participantName}
                    size="md"
                    isOnline={conv.isOnline}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {conv.participantName}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {conv.lastMessageTime}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#0F2A4A] truncate font-medium">
                      {conv.participantTitle}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {conv.lastMessage}
                    </p>
                  </div>

                  {conv.unreadCount > 0 && (
                    <span className="w-5 h-5 bg-[#0F2A4A] text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane: Active Chat Room */}
      <div
        className={`flex-1 flex flex-col bg-slate-50/30 ${
          showMobileList ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Active Chat Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowMobileList(true)}
              className="md:hidden p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <Avatar
              src={activeConversation.participantAvatar}
              name={activeConversation.participantName}
              size="md"
              isOnline={activeConversation.isOnline}
            />

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  {activeConversation.participantName}
                </h3>
                <span
                  className={`w-2 h-2 rounded-full ${
                    activeConversation.isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                />
              </div>
              <p className="text-[11px] text-slate-500 truncate max-w-xs sm:max-w-md">
                {activeConversation.participantTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 text-slate-500">
            <button
              type="button"
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Start Voice Call"
              onClick={() => setCallModalMode('voice')}
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Start Video Meeting"
              onClick={() => setCallModalMode('video')}
            >
              <Video className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Thread History */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          <div className="text-center my-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-200/60 px-2.5 py-1 rounded-full">
              BAUST Verified Messaging Session
            </span>
          </div>

          {currentMessages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <Avatar src={msg.senderAvatar} name={msg.senderName} size="sm" />
                )}

                <div
                  className={`max-w-[85%] sm:max-w-md p-3.5 rounded-2xl shadow-2xs space-y-2 ${
                    isMe
                      ? 'bg-[#0F2A4A] text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                  }`}
                >
                  <p className="text-xs leading-relaxed whitespace-pre-line">{msg.text}</p>

                  {msg.attachment && (
                    <div
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 ${
                        isMe
                          ? 'bg-white/10 border-white/20 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-5 h-5 text-[#C9A227] shrink-0" />
                        <div className="truncate">
                          <p className="text-xs font-bold truncate">
                            {msg.attachment.name}
                          </p>
                          <p className="text-[10px] opacity-70">{msg.attachment.size}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDownloadAttachment(msg.attachment!.name)}
                        className="p-1.5 hover:bg-black/10 rounded-lg transition-colors cursor-pointer"
                        title="Download File"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div
                    className={`flex items-center gap-1 text-[10px] ${
                      isMe ? 'text-white/60 justify-end' : 'text-slate-400'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {isMe && <CheckCheck className="w-3 h-3 text-emerald-400" />}
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          {attachedFile && (
            <div className="mb-2 p-2 bg-slate-100 rounded-xl flex items-center justify-between text-xs text-slate-700 border border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0F2A4A]" />
                <span className="font-bold">{attachedFile.name}</span>
                <span className="text-[10px] text-slate-400">({attachedFile.size})</span>
              </div>
              <button
                type="button"
                onClick={() => setAttachedFile(null)}
                className="text-rose-500 hover:text-rose-700 p-1 rounded cursor-pointer"
                aria-label="Remove attachment"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <form onSubmit={handleSend} className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAttachCV}
              className="p-2.5 text-slate-500 hover:text-[#0F2A4A] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Attach CV or Document"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${activeConversation.participantName}...`}
              className="flex-1 bg-slate-100 border-0 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F2A4A]"
            />

            <Button type="submit" variant="primary" size="sm" leftIcon={<Send className="w-3.5 h-3.5" />}>
              <span className="hidden sm:inline">Send</span>
            </Button>
          </form>
        </div>
      </div>

      {/* Voice / Video Call Modal (replaces browser alert/window.open) */}
      <Modal
        isOpen={Boolean(callModalMode)}
        onClose={() => setCallModalMode(null)}
        title={callModalMode === 'video' ? 'Start Video Meeting' : 'Voice Call Ready'}
        maxWidth="sm"
      >
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0F2A4A]/5 border border-slate-200 flex items-center justify-center mx-auto">
            {callModalMode === 'video' ? (
              <Video className="w-7 h-7 text-[#2E5E3E]" />
            ) : (
              <PhoneCall className="w-7 h-7 text-[#0F2A4A]" />
            )}
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">
              {activeConversation.participantName}
            </h4>
            <p className="text-xs text-slate-500">
              {callModalMode === 'video'
                ? 'Open a Google Meet room to start your mentoring video session.'
                : 'Peer voice room is ready. You can also switch to Google Meet anytime.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setCallModalMode(null)}>
              Close
            </Button>
            {callModalMode === 'video' ? (
              <a
                href="https://meet.google.com/new"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setCallModalMode(null)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2E5E3E] hover:bg-[#1E3F2A] text-white text-xs font-bold transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Launch Google Meet
              </a>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => {
                  addToast('info', 'Voice Call Connected', `Connected with ${activeConversation.participantName}`);
                  setCallModalMode(null);
                }}
              >
                Connect Audio
              </Button>
            )}
          </div>
        </div>
      </Modal>
      {newChatModal}
    </div>
  );
};
