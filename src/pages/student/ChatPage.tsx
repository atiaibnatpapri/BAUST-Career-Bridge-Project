/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { buildChatLink } from '../../constants/baustDataModel';
import { tsToMillis } from '../../services/firestorePortal';
import { grantUserFileAccess, resolveFilePreviewUrl } from '../../services/fileUploadService';
import { ChatMessage } from '../../types';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Loader } from '../../components/ui/Loader';
import { FilePreviewModal } from '../../components/ui/FilePreviewModal';
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
  WifiOff,
  Clock,
  RotateCcw,
  AlertTriangle,
  Eye,
  ChevronUp,
} from 'lucide-react';

function getDayKey(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function formatDayDivider(ms: number, isBn: boolean): string {
  const d = new Date(ms);
  const now = new Date();
  const todayKey = getDayKey(now.getTime());
  const yest = new Date(now);
  yest.setDate(now.getDate() - 1);
  const yesterdayKey = getDayKey(yest.getTime());
  const targetKey = getDayKey(ms);

  if (targetKey === todayKey) return isBn ? 'আজ' : 'Today';
  if (targetKey === yesterdayKey) return isBn ? 'গতকাল' : 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export const ChatPage: React.FC = () => {
  const { conversationId: routeConvId } = useParams<{ conversationId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const targetUserId = searchParams.get('user');
  const targetConvParam = searchParams.get('conv');
  const requestedConvId = routeConvId || targetConvParam || '';

  const {
    conversations,
    conversationsLoading,
    isReconnecting,
    messages,
    hasMoreMessages,
    loadingEarlierMessages,
    loadEarlierMessages,
    markThreadRead,
    sendMessage,
    openOrCreateConversation,
    watchConversationMessages,
    allUsers,
    currentUser,
    addToast,
    language,
  } = useApp();
  const { userProfile } = useAuth();
  const isBn = language === 'bn';

  const [activeConvId, setActiveConvId] = useState<string>(requestedConvId || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [optimisticMsgs, setOptimisticMsgs] = useState<Record<string, ChatMessage[]>>({});
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    size: string;
    type: 'pdf';
    url: string;
  } | null>(null);
  const [showMobileList, setShowMobileList] = useState(!(requestedConvId || targetUserId));
  const [callModalMode, setCallModalMode] = useState<'voice' | 'video' | null>(null);
  const [previewAttachment, setPreviewAttachment] = useState<{
    name: string;
    url: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const handledTargetUserRef = useRef<string | null>(null);

  // Sync URL param changes -> activeConvId
  useEffect(() => {
    if (requestedConvId) {
      setActiveConvId(requestedConvId);
      setShowMobileList(false);
    }
  }, [requestedConvId]);

  // Open or create conversation when ?user= is provided
  useEffect(() => {
    if (!targetUserId || handledTargetUserRef.current === targetUserId) return;
    handledTargetUserRef.current = targetUserId;
    let active = true;
    void openOrCreateConversation(targetUserId).then((convId) => {
      if (active && convId) {
        setActiveConvId(convId);
        setShowMobileList(false);
        navigate(buildChatLink(userProfile?.role, convId), { replace: true });
      }
    });
    return () => {
      active = false;
    };
  }, [targetUserId, openOrCreateConversation, navigate, userProfile?.role]);

  // Keep activeConvId synchronized with live Firestore conversations when no explicit invalid route param
  useEffect(() => {
    if (conversationsLoading) return;
    if (requestedConvId) return;
    if (conversations.length === 0) {
      if (activeConvId) setActiveConvId('');
      return;
    }
    if (!activeConvId || !conversations.some((c) => c.id === activeConvId)) {
      setActiveConvId(conversations[0].id);
    }
  }, [conversations, conversationsLoading, activeConvId, requestedConvId]);

  const routeNotFound = Boolean(
    requestedConvId &&
      !conversationsLoading &&
      !conversations.some((c) => c.id === requestedConvId)
  );

  const activeConversation = useMemo(() => {
    if (routeNotFound) return null;
    if (activeConvId) {
      const exact = conversations.find((c) => c.id === activeConvId);
      if (exact) return exact;
    }
    if (!requestedConvId) return conversations[0] || null;
    return null;
  }, [conversations, activeConvId, requestedConvId, routeNotFound]);

  // Subscribe to live Firestore messages for active conversation & clean up on unmount
  useEffect(() => {
    watchConversationMessages(activeConversation?.id || null);
  }, [activeConversation?.id, watchConversationMessages]);

  useEffect(() => {
    return () => {
      watchConversationMessages(null);
    };
  }, [watchConversationMessages]);

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

  const currentMessages = useMemo(() => {
    if (!activeConversation) return [];
    const live = messages[activeConversation.id] || [];
    const pendingOrFailed = optimisticMsgs[activeConversation.id] || [];
    return [...live, ...pendingOrFailed];
  }, [activeConversation, messages, optimisticMsgs]);

  // Auto-resize textarea cleanly (1–4 rows)
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 108)}px`;
  }, [inputText]);

  // Scroll to bottom on new messages in active conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.id, currentMessages.length]);

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

  const handleSelectConversation = (convId: string) => {
    setActiveConvId(convId);
    setShowMobileList(false);
    markThreadRead(convId);
    navigate(buildChatLink(userProfile?.role, convId));
  };

  const handleStartChatWithUser = async (uid: string) => {
    const convId = await openOrCreateConversation(uid);
    if (convId) {
      setActiveConvId(convId);
      setShowMobileList(false);
      setIsNewChatOpen(false);
      setUserSearchTerm('');
      navigate(buildChatLink(userProfile?.role, convId));
    }
  };

  const dispatchMessage = async (
    targetConvId: string,
    textToSend: string,
    fileToSend?: ChatMessage['attachment'],
    existingTempId?: string
  ) => {
    const tempId = existingTempId || `opt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const pendingItem: ChatMessage = {
      id: tempId,
      conversationId: targetConvId,
      senderId: currentUser.id,
      senderName: userProfile?.name || currentUser.name,
      senderAvatar: userProfile?.photoURL || userProfile?.avatar || currentUser.avatar,
      text: textToSend.trim(),
      timestamp: nowTime,
      createdAt: { seconds: Math.floor(Date.now() / 1000) },
      type: 'text',
      optimistic: true,
      failed: false,
      ...(fileToSend ? { attachment: fileToSend } : {}),
    };

    setOptimisticMsgs((prev) => {
      const list = prev[targetConvId] || [];
      const filtered = list.filter((m) => m.id !== tempId);
      return { ...prev, [targetConvId]: [...filtered, pendingItem] };
    });

    setIsSending(true);
    try {
      // Grant read access on stored PDF CV doc to recipient if sharing saved CV
      if (fileToSend?.url?.startsWith('firestore://userFiles/') && activeConversation?.participantId) {
        const docId = fileToSend.url.replace('firestore://userFiles/', '').trim();
        void grantUserFileAccess(docId, activeConversation.participantId);
      }

      await sendMessage(targetConvId, textToSend, fileToSend);
      setOptimisticMsgs((prev) => ({
        ...prev,
        [targetConvId]: (prev[targetConvId] || []).filter((m) => m.id !== tempId),
      }));
    } catch {
      setOptimisticMsgs((prev) => ({
        ...prev,
        [targetConvId]: (prev[targetConvId] || []).map((m) =>
          m.id === tempId ? { ...m, optimistic: false, failed: true } : m
        ),
      }));
    } finally {
      setIsSending(false);
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeConversation || isSending) return;
    if (!inputText.trim() && !attachedFile) return;
    if (inputText.length > 2000) {
      addToast('warning', 'Message Too Long', 'Messages cannot exceed 2000 characters.');
      return;
    }

    const targetConvId = activeConversation.id;
    const textToSend = inputText;
    const fileToSend = attachedFile || undefined;
    setInputText('');
    setAttachedFile(null);

    await dispatchMessage(targetConvId, textToSend, fileToSend);
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleAttachCV = () => {
    const savedUrl = userProfile?.cvUrl || '';
    const savedDocId = userProfile?.cvFileDocId || '';
    const savedName =
      userProfile?.cvName ||
      userProfile?.cvFileName ||
      `${(userProfile?.name || currentUser?.name || 'BAUST_User').replace(/\s+/g, '_')}_CV.pdf`;

    if (!savedUrl && !savedDocId) {
      addToast(
        'info',
        isBn ? 'সংরক্ষিত সিভি নেই' : 'No Saved CV Found',
        isBn
          ? 'প্রথমে আপনার প্রোফাইল থেকে একটি PDF সিভি আপলোড করুন।'
          : 'Upload a PDF CV in your Profile first to attach it here.'
      );
      return;
    }

    setAttachedFile({
      name: savedName,
      size: 'PDF CV',
      type: 'pdf',
      url: savedDocId ? `firestore://userFiles/${savedDocId}` : savedUrl,
    });
  };

  const handleDownloadAttachment = async (att: NonNullable<ChatMessage['attachment']>) => {
    try {
      if (att.url && att.url !== '#') {
        const resolved = await resolveFilePreviewUrl({
          url: att.url,
          fileName: att.name,
        });
        const a = document.createElement('a');
        a.href = resolved.downloadUrl;
        a.download = resolved.fileName || att.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        if (resolved.revokeAfterUse) {
          setTimeout(() => URL.revokeObjectURL(resolved.downloadUrl), 4000);
        }
        addToast('info', 'Downloading Attachment', att.name);
        return;
      }

      const content = `BAUST Career Bridge — Shared Attachment\nDocument: ${att.name}\nDownloaded: ${new Date().toLocaleString()}\n`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = att.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      addToast('error', 'Download Failed', err?.message || 'Unable to download attachment.');
    }
  };

  const newChatModal = (
    <Modal
      isOpen={isNewChatOpen}
      onClose={() => setIsNewChatOpen(false)}
      title={isBn ? 'নতুন বার্তা পাঠান' : 'Start New Conversation'}
      maxWidth="md"
    >
      <div className="space-y-3">
        <input
          type="text"
          value={userSearchTerm}
          onChange={(e) => setUserSearchTerm(e.target.value)}
          placeholder={
            isBn ? 'নাম, বিভাগ বা প্রতিষ্ঠান খুঁজুন...' : 'Search verified users by name, department, role...'
          }
          className="w-full bg-slate-100 border-0 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F2A4A]"
        />
        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
          {chatCandidates.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-500">
              {isBn ? 'কোনো অনুমোদিত ব্যবহারকারী পাওয়া যায়নি।' : 'No approved members found.'}
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
                  <Avatar
                    src={u.photoURL || u.avatar}
                    name={u.name}
                    size="sm"
                    isVerified={Boolean(u.isVerified)}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{u.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {(u.role || 'member').toUpperCase()} · {u.department || 'BAUST'}
                      {u.company ? ` · ${u.company}` : ''}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#0F2A4A] shrink-0">
                  {isBn ? 'চ্যাট' : 'Message'}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </Modal>
  );

  if (conversationsLoading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center bg-white rounded-2xl border border-slate-200 m-4">
        <Loader label={isBn ? 'বার্তা লোড হচ্ছে...' : 'Loading conversations...'} />
      </div>
    );
  }

  if (routeNotFound) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">
              {isBn ? 'কথোপকথন পাওয়া যায়নি' : 'Conversation not found'}
            </h2>
            <p className="text-xs text-slate-500">
              {isBn
                ? 'এই চ্যাট থ্রেডটি বিদ্যমান নেই অথবা আপনার অনুমতি নেই।'
                : 'This conversation link does not exist or you do not have access to it.'}
            </p>
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => navigate(buildChatLink(userProfile?.role), { replace: true })}
          >
            {isBn ? 'সব বার্তায় ফিরে যান' : 'Back to Messages'}
          </Button>
        </div>
      </div>
    );
  }

  if (!activeConversation) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center space-y-4 max-w-2xl mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#0F2A4A]/5 text-[#0F2A4A] flex items-center justify-center mx-auto">
            <MessageSquare className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#0F2A4A]">
              {isBn ? 'সরাসরি বার্তা (লাইভ চ্যাট)' : 'Direct Messages'}
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {isBn
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
            {isBn ? 'নতুন কথোপকথন শুরু করুন' : 'Start New Conversation'}
          </Button>

          {newChatModal}
        </div>
      </div>
    );
  }

  const activeConvHasMore = Boolean(hasMoreMessages[activeConversation.id]);
  const activeConvLoadingMore = Boolean(loadingEarlierMessages[activeConversation.id]);

  return (
    <div className="h-[calc(100vh-4rem)] w-full flex flex-col bg-white overflow-hidden">
      {isReconnecting && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 flex items-center justify-center gap-2 text-xs font-semibold text-amber-800">
          <WifiOff className="w-3.5 h-3.5" />
          <span>{isBn ? 'পুনরায় সংযোগ করা হচ্ছে...' : 'Reconnecting to live messaging...'}</span>
        </div>
      )}

      <div className="flex-1 flex min-h-0">
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
                  {isBn ? 'সরাসরি বার্তা' : 'Direct Messages'}
                </h2>
                <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Live
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsNewChatOpen(true)}
                className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#0F2A4A] text-white hover:bg-[#193d69] transition-colors cursor-pointer"
                title={isBn ? 'নতুন বার্তা' : 'New Message'}
              >
                <Plus className="w-3.5 h-3.5" />
                {isBn ? 'নতুন' : 'New'}
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isBn ? 'কথোপকথন খুঁজুন...' : 'Search conversations...'}
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
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`w-full text-left p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
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
                      <div className="flex items-center justify-between gap-2">
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
                        {conv.lastMessage || (isBn ? 'কথোপকথন শুরু করুন' : 'Start chatting...')}
                      </p>
                    </div>

                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 bg-[#0F2A4A] text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Active Chat Room */}
        <div
          className={`flex-1 flex flex-col min-w-0 bg-slate-50/30 ${
            showMobileList ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Active Chat Header */}
          <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-white flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setShowMobileList(true)}
                className="md:hidden p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
                aria-label="Back to conversations"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <Avatar
                src={activeConversation.participantAvatar}
                name={activeConversation.participantName}
                size="md"
                isOnline={activeConversation.isOnline}
              />

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {activeConversation.participantName}
                  </h3>
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      activeConversation.isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  />
                </div>
                <p className="text-[11px] text-slate-500 truncate max-w-xs sm:max-w-md">
                  {activeConversation.participantTitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 text-slate-500 shrink-0">
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
            <div className="text-center my-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-200/60 px-2.5 py-1 rounded-full">
                BAUST Verified Messaging Session
              </span>
            </div>

            {activeConvHasMore && (
              <div className="flex justify-center">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  isLoading={activeConvLoadingMore}
                  leftIcon={<ChevronUp className="w-3.5 h-3.5" />}
                  onClick={() => void loadEarlierMessages(activeConversation.id)}
                >
                  {isBn ? 'আগের বার্তা দেখুন' : 'Load earlier messages'}
                </Button>
              </div>
            )}

            {currentMessages.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                {isBn
                  ? `${activeConversation.participantName}-এর সাথে আপনার প্রথম বার্তা পাঠান।`
                  : `Send a message to start your conversation with ${activeConversation.participantName}.`}
              </div>
            ) : (
              currentMessages.map((msg, idx) => {
                const isMe = msg.senderId === currentUser.id;
                const msgMs = tsToMillis(msg.createdAt) || Date.now();
                const prevMs =
                  idx > 0 ? tsToMillis(currentMessages[idx - 1].createdAt) || Date.now() : 0;
                const showDateDivider =
                  idx === 0 || getDayKey(msgMs) !== getDayKey(prevMs);

                const isSeenByOther =
                  isMe &&
                  Boolean(activeConversation.participantId) &&
                  (msg.readBy || []).includes(activeConversation.participantId);

                return (
                  <React.Fragment key={msg.id}>
                    {showDateDivider && (
                      <div className="flex items-center justify-center my-2">
                        <span className="px-3 py-0.5 rounded-full bg-slate-200/70 text-[10px] font-bold text-slate-600">
                          {formatDayDivider(msgMs, isBn)}
                        </span>
                      </div>
                    )}

                    <div
                      className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMe && (
                        <Avatar
                          src={activeConversation.participantAvatar || msg.senderAvatar}
                          name={activeConversation.participantName || msg.senderName}
                          size="sm"
                        />
                      )}

                      <div
                        className={`max-w-[85%] sm:max-w-md p-3.5 rounded-2xl shadow-2xs space-y-2 ${
                          msg.failed
                            ? 'bg-rose-50 text-rose-900 border border-rose-300 rounded-br-xs'
                            : isMe
                            ? 'bg-[#0F2A4A] text-white rounded-br-xs'
                            : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                        }`}
                      >
                        {msg.text && (
                          <p className="text-xs leading-relaxed whitespace-pre-wrap break-words">
                            {msg.text}
                          </p>
                        )}

                        {msg.attachment && (
                          <div
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 ${
                              isMe && !msg.failed
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
                            <div className="flex items-center gap-1 shrink-0">
                              {msg.attachment.url && msg.attachment.url !== '#' && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewAttachment({
                                      name: msg.attachment!.name,
                                      url: msg.attachment!.url,
                                    })
                                  }
                                  className="p-1.5 hover:bg-black/10 rounded-lg transition-colors cursor-pointer"
                                  title="Preview File"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => void handleDownloadAttachment(msg.attachment!)}
                                className="p-1.5 hover:bg-black/10 rounded-lg transition-colors cursor-pointer"
                                title="Download File"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}

                        <div
                          className={`flex items-center gap-1.5 text-[10px] ${
                            msg.failed
                              ? 'text-rose-700 justify-end'
                              : isMe
                              ? 'text-white/70 justify-end'
                              : 'text-slate-400'
                          }`}
                        >
                          <span>{msg.timestamp}</span>
                          {msg.optimistic && <Clock className="w-3 h-3 animate-pulse" />}
                          {msg.failed && (
                            <button
                              type="button"
                              onClick={() =>
                                void dispatchMessage(
                                  activeConversation.id,
                                  msg.text,
                                  msg.attachment,
                                  msg.id
                                )
                              }
                              className="inline-flex items-center gap-1 font-bold text-rose-700 hover:underline cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                              {isBn ? 'ব্যর্থ — পুনরায় চেষ্টা করুন' : 'Failed — Retry'}
                            </button>
                          )}
                          {isMe && !msg.optimistic && !msg.failed && (
                            <CheckCheck
                              className={`w-3.5 h-3.5 ${
                                isSeenByOther ? 'text-emerald-400' : 'text-white/60'
                              }`}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Bar */}
          <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
            {attachedFile && (
              <div className="mb-2 p-2 bg-slate-100 rounded-xl flex items-center justify-between text-xs text-slate-700 border border-slate-200">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-[#0F2A4A] shrink-0" />
                  <span className="font-bold truncate">{attachedFile.name}</span>
                  <span className="text-[10px] text-slate-400 shrink-0">({attachedFile.size})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedFile(null)}
                  className="text-rose-500 hover:text-rose-700 p-1 rounded cursor-pointer shrink-0"
                  aria-label="Remove attachment"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={handleSend} className="flex items-end gap-2">
              <button
                type="button"
                onClick={handleAttachCV}
                className="p-2.5 text-slate-500 hover:text-[#0F2A4A] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
                title={isBn ? 'সংরক্ষিত সিভি সংযুক্ত করুন' : 'Attach Saved PDF CV'}
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <div className="flex-1 flex flex-col">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  maxLength={2000}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleTextareaKeyDown}
                  placeholder={
                    isBn
                      ? `${activeConversation.participantName}-কে বার্তা লিখুন...`
                      : `Message ${activeConversation.participantName}... (Enter to send, Shift+Enter for new line)`
                  }
                  className="w-full resize-none bg-slate-100 border-0 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F2A4A] leading-relaxed max-h-28 overflow-y-auto"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSending || (!inputText.trim() && !attachedFile)}
                isLoading={isSending}
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                <span className="hidden sm:inline">{isBn ? 'পাঠান' : 'Send'}</span>
              </Button>
            </form>

            <div className="flex items-center justify-between px-12 pt-1 text-[10px] text-slate-400">
              <span>{isBn ? 'পাঠাতে Enter, নতুন লাইনে Shift+Enter' : 'Enter to send · Shift+Enter for new line'}</span>
              <span className={inputText.length >= 1900 ? 'text-amber-600 font-bold' : ''}>
                {inputText.length}/2000
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Voice / Video Call Modal */}
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

      <FilePreviewModal
        isOpen={Boolean(previewAttachment)}
        onClose={() => setPreviewAttachment(null)}
        fileName={previewAttachment?.name || 'Attachment.pdf'}
        url={previewAttachment?.url}
      />

      {newChatModal}
    </div>
  );
};
