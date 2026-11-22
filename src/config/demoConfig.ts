/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserRole, Department } from '../types';

/**
 * Global toggle for One-Click Demo Accounts across Login, Header Switcher & Firestore rules.
 * Keep synchronized with `demoFlagDefault()` in `firestore.rules`.
 */
export const ENABLE_DEMO_LOGIN = true;

export const DEMO_PASSWORD = 'BaustDemo@2026';

export interface DemoAccountSpec {
  role: UserRole;
  label: string;
  email: string;
  name: string;
  baustId: string;
  department: Department;
  batch: string;
  passingYear: number;
  designation: string;
  company: string;
  office?: string;
  accentClass: string;
  badgeText: string;
  avatar: string;
}

export const DEMO_ACCOUNTS: DemoAccountSpec[] = [
  {
    role: 'student',
    label: 'Demo Student',
    email: 'demo.student@baustdemo.com',
    name: 'Demo Student',
    baustId: '1902041',
    department: 'CSE',
    batch: '19th Batch',
    passingYear: 2026,
    designation: 'Undergraduate Student',
    company: 'BAUST Saidpur',
    accentClass: 'border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100',
    badgeText: 'Student · Blue Portal',
    avatar:
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  },
  {
    role: 'alumni',
    label: 'Demo Alumni',
    email: 'demo.alumni@baustdemo.com',
    name: 'Demo Alumni',
    baustId: '1501012',
    department: 'CSE',
    batch: '4th Batch',
    passingYear: 2019,
    designation: 'Senior Software Engineer',
    company: 'Brain Station 23',
    accentClass: 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100',
    badgeText: 'Alumni · Green Portal',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    role: 'admin',
    label: 'Demo Admin',
    email: 'demo.admin@baustdemo.com',
    name: 'Demo Admin',
    baustId: 'ADM-101',
    department: 'CSE',
    batch: 'Registrar & Exam Office',
    passingYear: 2015,
    designation: 'Deputy Registrar',
    company: 'BAUST Administration',
    office: 'Office of the Registrar & Controller of Examinations',
    accentClass: 'border-orange-300 bg-orange-50 text-orange-800 hover:bg-orange-100',
    badgeText: 'Admin · Orange Portal',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    role: 'superAdmin',
    label: 'Demo Super Admin',
    email: 'demo.superadmin@baustdemo.com',
    name: 'Demo Super Admin',
    baustId: 'SADM-001',
    department: 'CSE',
    batch: 'University Governance',
    passingYear: 2014,
    designation: 'Chief Verification Authority (Demo)',
    company: 'BAUST Saidpur Directorate',
    office: 'Vice Chancellor & Central Verification Directorate',
    accentClass: 'border-purple-300 bg-purple-50 text-purple-800 hover:bg-purple-100',
    badgeText: 'Super Admin · Purple Portal',
    avatar:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
  },
];

export function getDemoAccountByRole(role: UserRole): DemoAccountSpec | undefined {
  return DEMO_ACCOUNTS.find((acct) => acct.role === role);
}

export function getDemoAccountByEmail(email?: string | null): DemoAccountSpec | undefined {
  if (!email) return undefined;
  const clean = email.trim().toLowerCase();
  return DEMO_ACCOUNTS.find((acct) => acct.email.toLowerCase() === clean);
}

export function isDemoAccountEmail(email?: string | null): boolean {
  return Boolean(getDemoAccountByEmail(email));
}
