/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { 
  Send, 
  Paperclip, 
  FileText, 
  Search, 
  MoreVertical, 
  CheckCheck, 
  Phone, 
  Video,
  Download,
  Smile,
  ArrowLeft
} from 'lucide-react';

export const ChatPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get('user');

  const { conversations, messages, sendMessage, currentUser, alumniList } = useApp();

  const [activeConvId, setActiveConvId] = useState<string>(conversations[0]?.id || 'conv-1');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string; type: 'pdf'; url: string } | null>(null);
  const [showMobileList, setShowMobileList] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // If targetUserId is passed, ensure or switch conversation
  useEffect(() => {
    if (targetUserId) {
      const existing = conversations.find((c) => c.participantId === targetUserId);
      if (existing) {
        setActiveConvId(existing.id);
        setShowMobileList(false);
      }
    }
  }, [targetUserId, conversations]);

  const activeConversation = conversations.find((c) => c.id === activeConvId) || conversations[0];
  const currentMessages = messages[activeConvId] || [];

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !attachedFile) return;

    sendMessage(activeConvId, inputText, attachedFile || undefined);
    setInputText('');
    setAttachedFile(null);

    // Simulate mock reply with typing indicator after 1.5s
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        sendMessage(
          activeConvId,
          `Thanks for reaching out! I reviewed your notes and will provide detailed feedback soon.`
        );
      }, 2000);
    }, 1000);
  };

  const handleFakeCVAttach = () => {
    setAttachedFile({
      name: 'Tanvir_Ahmed_CSE_CV.pdf',
      size: '1.8 MB',
      type: 'pdf',
      url: '#',
    });
  };

  return (
    <div className="h-[calc(100vh-8rem)] w-full flex bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      
      {/* Left Pane: Conversation List */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-slate-50/50 ${
        !showMobileList ? 'hidden md:flex' : 'flex'
      }`}>
        
        {/* Header Search */}
        <div className="p-4 border-b border-slate-200 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#0F2A4A]">Direct Messages</h2>
            <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              Live
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full bg-slate-100 border-0 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F2A4A]"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {conversations.map((conv) => {
            const isActive = conv.id === activeConvId;
            return (
              <div
                key={conv.id}
                onClick={() => {
                  setActiveConvId(conv.id);
                  setShowMobileList(false);
                }}
                className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                  isActive ? 'bg-white border-l-4 border-l-[#0F2A4A] shadow-xs' : 'hover:bg-slate-100/60'
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
          })}
        </div>
      </div>

      {/* Right Pane: Active Chat Room */}
      <div className={`flex-1 flex flex-col bg-slate-50/30 ${
        showMobileList ? 'hidden md:flex' : 'flex'
      }`}>
        
        {/* Active Chat Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
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
                <span className={`w-2 h-2 rounded-full ${
                  activeConversation.isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                }`} />
              </div>
              <p className="text-[11px] text-slate-500 truncate max-w-xs sm:max-w-md">
                {activeConversation.participantTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 text-slate-500">
            <button
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Start Voice Call"
              onClick={() => alert('Starting secure peer voice call...')}
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Start Video Meeting"
              onClick={() => window.open('https://meet.google.com/new', '_blank')}
            >
              <Video className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Thread History */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          <div className="text-center my-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-200/60 px-2.5 py-1 rounded-full">
              End-to-End Encrypted BAUST Session
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

                  {/* Attachment Box (e.g. CV) */}
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
                          <p className="text-xs font-bold truncate">{msg.attachment.name}</p>
                          <p className="text-[10px] opacity-75">{msg.attachment.size}</p>
                        </div>
                      </div>
                      <a
                        href={msg.attachment.url}
                        download
                        className="p-1 rounded-lg hover:bg-black/10 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  )}

                  <div className={`flex items-center justify-end gap-1 text-[10px] ${
                    isMe ? 'text-slate-300' : 'text-slate-400'
                  }`}>
                    <span>{msg.timestamp}</span>
                    {isMe && <CheckCheck className="w-3.5 h-3.5 text-emerald-300" />}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-500 italic bg-white p-2.5 rounded-xl border border-slate-200 w-fit">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-[11px]">{activeConversation.participantName} is typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Attachment preview badge if selected */}
        {attachedFile && (
          <div className="px-4 py-2 bg-emerald-50 border-t border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-700" />
              <span>Attached: <strong>{attachedFile.name}</strong> ({attachedFile.size})</span>
            </div>
            <button
              onClick={() => setAttachedFile(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold"
            >
              Remove
            </button>
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2">
          <button
            type="button"
            onClick={handleFakeCVAttach}
            className="p-2 text-slate-500 hover:text-[#0F2A4A] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Attach Resume / Document (PDF)"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message or discussion topic..."
            className="flex-1 bg-slate-100 border-0 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F2A4A]"
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!inputText.trim() && !attachedFile}
            className="px-4 py-2.5"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>

      </div>

    </div>
  );
};
