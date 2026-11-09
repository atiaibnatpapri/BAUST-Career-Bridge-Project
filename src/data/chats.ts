/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Conversation, ChatMessage } from '../types';

export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    participantId: 'alm-1',
    participantName: 'Kazi Farhan Kabir',
    participantAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    participantRole: 'alumni',
    participantTitle: 'Senior Software Engineer at Brain Station 23',
    lastMessage: 'Sure Tanvir! I have downloaded your CV. Let us connect this Friday at 7 PM.',
    lastMessageTime: '10:45 AM',
    unreadCount: 1,
    isOnline: true,
  },
  {
    id: 'conv-2',
    participantId: 'alm-2',
    participantName: 'Dr. Nusrat Jahan',
    participantAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    participantRole: 'alumni',
    participantTitle: 'Postdoc at TUM Germany',
    lastMessage: 'Make sure you read the faculty publication list before sending your preliminary email.',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: 'conv-3',
    participantId: 'alm-5',
    participantName: 'Sabrina Rahman',
    participantAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    participantRole: 'alumni',
    participantTitle: 'Lead Android Engineer at Samsung R&D',
    lastMessage: 'Please prepare LeetCode medium questions on Trees and Graphs.',
    lastMessageTime: 'Oct 23',
    unreadCount: 0,
    isOnline: true,
  },
  {
    id: 'conv-4',
    participantId: 'alm-4',
    participantName: 'Mohammad Rashedul Islam, BCS',
    participantAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    participantRole: 'alumni',
    participantTitle: 'ASP, Bangladesh Police (38th BCS)',
    lastMessage: 'Start with 9th-10th grade general science and Bangladesh affairs basic textbooks.',
    lastMessageTime: 'Oct 20',
    unreadCount: 0,
    isOnline: false,
  }
];

export const mockMessages: Record<string, ChatMessage[]> = {
  'conv-1': [
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'std-1',
      senderName: 'Md. Tanvir Ahmed',
      senderAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      text: 'Assalamu Alaikum Farhan Bhaiya! Hope you are doing well.',
      timestamp: '10:15 AM',
    },
    {
      id: 'msg-2',
      conversationId: 'conv-1',
      senderId: 'alm-1',
      senderName: 'Kazi Farhan Kabir',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      text: 'Walaikum Assalam Tanvir! Good to connect with a fellow BAUST CSE junior. How can I help you?',
      timestamp: '10:20 AM',
    },
    {
      id: 'msg-3',
      conversationId: 'conv-1',
      senderId: 'std-1',
      senderName: 'Md. Tanvir Ahmed',
      senderAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      text: 'I have attached my updated resume for full-stack software engineer roles. I would love your constructive feedback before the upcoming BAUST Career Expo!',
      timestamp: '10:25 AM',
      attachment: {
        name: 'Tanvir_Ahmed_Resume_2026.pdf',
        size: '1.4 MB',
        type: 'pdf',
        url: '#',
      },
    },
    {
      id: 'msg-4',
      conversationId: 'conv-1',
      senderId: 'alm-1',
      senderName: 'Kazi Farhan Kabir',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      text: 'Sure Tanvir! I have downloaded your CV. Let us connect this Friday at 7 PM.',
      timestamp: '10:45 AM',
    },
  ],
  'conv-2': [
    {
      id: 'msg-201',
      conversationId: 'conv-2',
      senderId: 'std-1',
      senderName: 'Md. Tanvir Ahmed',
      senderAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      text: 'Apu, what are the primary criteria German universities look for in DAAD applicants?',
      timestamp: 'Yesterday 04:10 PM',
    },
    {
      id: 'msg-202',
      conversationId: 'conv-2',
      senderId: 'alm-2',
      senderName: 'Dr. Nusrat Jahan',
      senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      text: 'Make sure you read the faculty publication list before sending your preliminary email.',
      timestamp: 'Yesterday 06:18 PM',
    },
  ]
};
