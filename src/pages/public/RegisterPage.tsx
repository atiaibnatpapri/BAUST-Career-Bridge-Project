/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { CampusHeroBackdrop } from '../../components/ui/CampusHeroBackdrop';
import { Department } from '../../types';
import {
  BAUST_DEPARTMENTS,
  BAUST_ID_PATTERN,
  BAUST_ID_EXAMPLE,
  ADMIN_STAFF_ID_PATTERN,
  NAME_PATTERN,
  EMAIL_PATTERN,
  STRONG_PASSWORD_PATTERN,
  GRAD_YEAR_MIN,
  GRAD_YEAR_MAX,
  isValidBdPhone,
  isValidLinkedinUrl,
  isValidHttpUrl,
} from '../../constants/baustDataModel';
import {
  GraduationCap,
  Briefcase,
  ShieldCheck,
  UploadCloud,
  FileCheck,
  Clock,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  Building2,
  Phone,
  Check,
  Home,
  ArrowRight,
  ArrowLeft,
  Link2,
} from 'lucide-react';

type PublicRegisterRole = 'student' | 'alumni' | 'admin';

interface RegisterPageProps {
  defaultRole?: PublicRegisterRole;
}

interface FieldErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  baustId?: string;
  batch?: string;
  passingYear?: string;
  company?: string;
  designation?: string;
  office?: string;
  linkedin?: string;
  verificationProofUrl?: string;
  alumniProof?: string;
  termsAccepted?: string;
}

const FIELD_INPUT_IDS: Partial<Record<keyof FieldErrors, string>> = {
  name: 'reg-name',
  email: 'reg-email',
  phone: 'reg-phone',
  password: 'reg-password',
  confirmPassword: 'reg-confirm-password',
  baustId: 'reg-baust-id',
  batch: 'reg-batch',
  passingYear: 'reg-passing-year',
  company: 'reg-alumni-company',
  designation: 'reg-alumni-designation',
  office: 'reg-admin-office',
  linkedin: 'reg-alumni-linkedin',
  verificationProofUrl: 'reg-proof-url',
  alumniProof: 'reg-alumni-linkedin',
  termsAccepted: 'reg-terms-checkbox',
};

const ROLE_CARDS: {
  id: PublicRegisterRole;
  titleEn: string;
  titleBn: string;
  subtitleEn: string;
  subtitleBn: string;
  badge: string;
  borderClass: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'student',
    titleEn: 'I am a Student',
    titleBn: 'আমি একজন শিক্ষার্থী',
    subtitleEn: 'Current BAUST undergraduate seeking internships, jobs, CV builder, and alumni mentorship.',
    subtitleBn: 'ইন্টার্নশিপ, চাকরি, সিভি বিল্ডার এবং অ্যালামনাই মেন্টরশিপের জন্য বর্তমান বাউস্ট শিক্ষার্থী।',
    badge: 'Blue Portal',
    borderClass: 'border-blue-200 hover:border-blue-600 hover:bg-blue-50/50',
    icon: <GraduationCap className="w-6 h-6 text-blue-600" />,
  },
  {
    id: 'alumni',
    titleEn: 'I am an Alumni',
    titleBn: 'আমি একজন অ্যালামনাই',
    subtitleEn: 'BAUST graduate sharing job referrals, mentoring students, attending reunions & requesting transcripts.',
    subtitleBn: 'চাকরি রেফারেল, মেন্টরশিপ, পুনর্মিলনী ও অফিসিয়াল ট্রান্সক্রিপ্টের জন্য প্রাক্তন শিক্ষার্থী।',
    badge: 'Green Portal',
    borderClass: 'border-emerald-200 hover:border-emerald-700 hover:bg-emerald-50/50',
    icon: <Briefcase className="w-6 h-6 text-emerald-700" />,
  },
  {
    id: 'admin',
    titleEn: 'I am an Admin',
    titleBn: 'আমি একজন অ্যাডমিন',
    subtitleEn: 'BAUST Registrar, Exam Controller, or Placement Office staff managing document requests & notices.',
    subtitleBn: 'রেজিস্ট্রার, পরীক্ষা নিয়ন্ত্রক বা প্লেসমেন্ট অফিসের অনুমোদিত কর্মকর্তা।',
    badge: 'Orange Portal',
    borderClass: 'border-orange-200 hover:border-orange-600 hover:bg-orange-50/50',
    icon: <ShieldCheck className="w-6 h-6 text-orange-600" />,
  },
];

export const RegisterPage: React.FC<RegisterPageProps> = ({ defaultRole }) => {
  const { addToast, t, language } = useApp();
  const { register: firebaseRegister } = useAuth();
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<1 | 2>(defaultRole ? 2 : 1);
  const [role, setRole] = useState<PublicRegisterRole>(defaultRole || 'student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [baustId, setBaustId] = useState('');
  const [department, setDepartment] = useState<Department>('CSE');
  const [batch, setBatch] = useState('');
  const [passingYear, setPassingYear] = useState('2025');
  const [company, setCompany] = useState('');
  const [designation, setDesignation] = useState('');
  const [office, setOffice] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [verificationProofUrl, setVerificationProofUrl] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);

  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [duplicateEmailError, setDuplicateEmailError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    if (defaultRole) {
      setRole(defaultRole);
      setStep(2);
    }
  }, [defaultRole]);

  const departments = BAUST_DEPARTMENTS.map((d) => ({
    value: d.code,
    label: language === 'bn' ? d.nameBn : d.nameEn,
  }));

  const pwRules = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  };

  const getPasswordStrength = (pw: string): { label: string; color: string; score: number } => {
    if (!pw) return { label: '', color: 'bg-slate-200', score: 0 };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { label: 'Weak', color: 'bg-rose-500', score: 1 };
    if (score === 2) return { label: 'Fair', color: 'bg-amber-500', score: 2 };
    if (score === 3 || score === 4) return { label: 'Good', color: 'bg-blue-500', score: 3 };
    return { label: 'Strong', color: 'bg-emerald-500', score: 4 };
  };

  const handleSelectRoleCard = (chosen: PublicRegisterRole) => {
    setRole(chosen);
    setFieldErrors({});
    setServerError(null);
    setTouched({});
    setHasAttemptedSubmit(false);
    setStep(2);
  };

  const computeErrors = (): FieldErrors => {
    const errs: FieldErrors = {};

    const cleanName = name.trim();
    if (!cleanName || !NAME_PATTERN.test(cleanName)) {
      errs.name = 'Full name is required (2–80 characters).';
    }

    const cleanEmail = email.trim();
    if (!cleanEmail || !EMAIL_PATTERN.test(cleanEmail)) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!phone.trim() || !isValidBdPhone(phone.trim())) {
      errs.phone = 'Enter a valid phone number (e.g. +8801711000000 or 01711000000).';
    }

    if (!password || !STRONG_PASSWORD_PATTERN.test(password)) {
      errs.password = 'Password must be 8+ characters with at least 1 uppercase, 1 lowercase, and 1 number.';
    }

    if (!confirmPassword || password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    const cleanId = baustId.trim();
    if (role === 'admin') {
      if (cleanId && !ADMIN_STAFF_ID_PATTERN.test(cleanId)) {
        errs.baustId = 'Staff ID must be 3–24 letters, digits, hyphens, or underscores.';
      }
    } else {
      if (!cleanId || !BAUST_ID_PATTERN.test(cleanId)) {
        errs.baustId = `BAUST ID is required (4–24 characters, e.g. 1902041 or ${BAUST_ID_EXAMPLE}).`;
      }
    }

    if (role === 'student' || role === 'alumni') {
      if (!batch.trim()) {
        errs.batch = 'Batch is required (e.g. 19th Batch).';
      }

      if (passingYear.trim()) {
        const yearNum = parseInt(passingYear.trim(), 10);
        if (
          !/^\d{4}$/.test(passingYear.trim()) ||
          Number.isNaN(yearNum) ||
          yearNum < GRAD_YEAR_MIN ||
          yearNum > GRAD_YEAR_MAX
        ) {
          errs.passingYear = `Year must be between ${GRAD_YEAR_MIN} and ${GRAD_YEAR_MAX}.`;
        }
      }
    }

    if (role === 'alumni') {
      if (!company.trim()) {
        errs.company = 'Current company or organization is required for Alumni.';
      }
      if (!designation.trim()) {
        errs.designation = 'Current designation is required for Alumni.';
      }
      if (linkedin.trim() && !isValidLinkedinUrl(linkedin.trim())) {
        errs.linkedin = 'Enter a valid LinkedIn profile URL (e.g. https://www.linkedin.com/in/...).';
      }
      if (verificationProofUrl.trim() && !isValidHttpUrl(verificationProofUrl.trim())) {
        errs.verificationProofUrl = 'Verification proof URL must start with http:// or https://.';
      }
    }

    if (role === 'admin') {
      if (!designation.trim()) {
        errs.designation = 'Administrative designation is required.';
      }
      if (!office.trim()) {
        errs.office = 'Office / Department name is required.';
      }
    }

    if (!termsAccepted) {
      errs.termsAccepted = 'You must agree to the BAUST Career Bridge Terms & Privacy Policy.';
    }

    return errs;
  };

  const handleBlur = (field: keyof FieldErrors) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errs = computeErrors();
    setFieldErrors((prev) => ({ ...prev, [field]: errs[field] }));
  };

  const focusFirstError = (errs: FieldErrors) => {
    const keys = Object.keys(errs) as (keyof FieldErrors)[];
    if (keys.length === 0) return;

    errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const firstKey = keys[0];
    const targetId =
      firstKey === 'designation' && role === 'admin'
        ? 'reg-admin-designation'
        : FIELD_INPUT_IDS[firstKey];
    if (targetId) {
      window.setTimeout(() => {
        document.getElementById(targetId)?.focus();
      }, 150);
    }
  };

  const validateAll = (): boolean => {
    const errs = computeErrors();
    setFieldErrors(errs);
    setHasAttemptedSubmit(true);
    setTouched({
      name: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
      baustId: true,
      batch: true,
      passingYear: true,
      company: true,
      designation: true,
      office: true,
      linkedin: true,
      verificationProofUrl: true,
      alumniProof: true,
      termsAccepted: true,
    });
    if (Object.keys(errs).length > 0) {
      focusFirstError(errs);
      return false;
    }
    return true;
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFileName(e.target.files[0].name);
      setFieldErrors((prev) => ({ ...prev, alumniProof: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setDuplicateEmailError(false);

    if (!validateAll()) {
      addToast('warning', 'Check Form Fields', 'Please fix the highlighted validation errors.');
      return;
    }

    setIsLoading(true);
    const res = await firebaseRegister({
      email: email.trim(),
      password,
      name: name.trim(),
      phone: phone.trim(),
      role,
      baustId: baustId.trim(),
      department,
      batch: role === 'admin' ? office.trim() || 'Administration' : batch.trim(),
      passingYear: role === 'admin' ? undefined : passingYear.trim(),
      company: company.trim(),
      designation: designation.trim(),
      office: office.trim(),
      linkedin: linkedin.trim(),
      verificationProofUrl: verificationProofUrl.trim(),
      documentFileName:
        uploadedFileName ||
        (role === 'admin'
          ? 'baust_staff_authorization.pdf'
          : role === 'alumni'
          ? 'baust_degree_certificate.pdf'
          : 'baust_student_id.png'),
    });
    setIsLoading(false);

    if (res.success) {
      setSubmittedSuccess(true);
      addToast(
        'success',
        'Registration Submitted',
        'You can sign in after the Super Admin approves your account.'
      );
    } else {
      setDuplicateEmailError(res.code === 'auth/email-already-in-use');
      setServerError(res.error || 'Registration failed.');
      addToast('error', 'Registration Failed', res.error || 'Could not complete registration');
    }
  };

  const pwStrength = getPasswordStrength(password);

  const credentialsComplete = Boolean(
    NAME_PATTERN.test(name.trim()) &&
      EMAIL_PATTERN.test(email.trim()) &&
      isValidBdPhone(phone.trim()) &&
      STRONG_PASSWORD_PATTERN.test(password) &&
      password === confirmPassword
  );

  const activeErrorEntries = Object.entries(fieldErrors).filter(([, msg]) => Boolean(msg));

  if (submittedSuccess) {
    return (
      <div className="relative min-h-screen flex items-center justify-center pt-24 pb-12 px-4 overflow-hidden">
        <CampusHeroBackdrop />
        <Card className="relative z-10 w-full max-w-lg p-8 text-center space-y-6 border-white/20 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border-2 border-amber-200">
            <Clock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
              {t.status.pending}
            </span>
            <h1 className="text-2xl font-bold text-[#0F2A4A]">
              {t.auth.pendingSuccessTitle}
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
              Your <strong>{role.toUpperCase()}</strong> registration for <strong>{name}</strong> ({email}) has been queued for the BAUST Super Admin. For security, you have been signed out until your account is reviewed.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-600 space-y-1.5">
            <p className="font-bold text-slate-900">Next steps</p>
            <p>• The Super Admin verifies Student, Alumni, and Admin applications in the Verification Queue.</p>
            <p>• Once approved, sign in using your Email or 16-digit BAUST ID on the Login page.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/">
              <Button variant="primary" leftIcon={<Home className="w-4 h-4" />}>
                {t.notFound.backHome}
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline">{t.nav.login}</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center pt-24 pb-12 px-4 overflow-hidden">
      <CampusHeroBackdrop />

      <div className="relative z-10 w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#0F2A4A]/90 border border-[#5EEAD4]/50 flex items-center justify-center mx-auto shadow-lg">
            <GraduationCap className="w-7 h-7 text-[#5EEAD4]" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {t.auth.registerTitle}
          </h1>
          <p className="text-xs text-slate-200">
            {t.auth.registerSubtitle}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-200">
            <span>Step {step} of 2</span>
            <span>{step === 1 ? t.auth.whoAreYou : `${role.toUpperCase()}`}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <div
              className={`px-3 py-2.5 rounded-xl border flex items-center gap-2 ${
                step === 2 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-white border-white/40 text-[#0F2A4A]'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-[#0F2A4A] text-white flex items-center justify-center text-xs shrink-0">
                {step === 2 ? <Check className="w-3 h-3" /> : '1'}
              </span>
              <span className="truncate">1. {t.auth.whoAreYou}</span>
            </div>
            <div
              className={`px-3 py-2.5 rounded-xl border flex items-center gap-2 ${
                step === 2 && credentialsComplete
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : step === 2
                  ? 'bg-white border-white/40 text-[#0F2A4A]'
                  : 'bg-white/15 border-white/20 text-slate-200'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  step === 2 ? 'bg-[#0F2A4A] text-white' : 'bg-white/25 text-white'
                }`}
              >
                2
              </span>
              <span className="truncate">2. Details &amp; Security</span>
            </div>
          </div>
        </div>

        {step === 1 ? (
          <Card className="p-6 sm:p-8 border-white/20 shadow-2xl space-y-6">
            <div className="space-y-1 text-center">
              <h2 className="text-xl font-bold text-[#0F2A4A]">{t.auth.whoAreYou}</h2>
              <p className="text-xs text-slate-500">
                {t.auth.whoAreYouSub}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {ROLE_CARDS.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleSelectRoleCard(card.id)}
                  className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-4 bg-white ${card.borderClass}`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        {card.icon}
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {card.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      {language === 'bn' ? card.titleBn : card.titleEn}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {language === 'bn' ? card.subtitleBn : card.subtitleEn}
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0F2A4A]">
                    {t.auth.continueAs} {language === 'bn' ? card.titleBn : card.titleEn}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              ))}
            </div>
          </Card>
        ) : (
          <Card className="p-5 sm:p-8 border-white/20 shadow-2xl">
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {/* Active Role Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2.5">
                  {ROLE_CARDS.find((c) => c.id === role)?.icon}
                  <div>
                    <p className="text-xs font-bold text-[#0F2A4A] uppercase tracking-wider">
                      Registering as {role}
                    </p>
                    <p className="text-xs text-slate-500">
                      {ROLE_CARDS.find((c) => c.id === role)?.badge} · Requires Super Admin approval
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {t.auth.changeRole}
                </button>
              </div>

              {/* Error Summary Banner (#53) + Server Error */}
              <div ref={errorSummaryRef} aria-live="polite" className="space-y-2 empty:hidden">
                {hasAttemptedSubmit && activeErrorEntries.length > 0 && (
                  <div
                    role="alert"
                    className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1.5"
                  >
                    <div className="flex items-center gap-2 font-bold text-rose-900">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{t.auth.errorSummaryHeading}</span>
                    </div>
                    <ul className="list-disc pl-6 space-y-0.5 text-xs">
                      {activeErrorEntries.map(([key, message]) => (
                        <li key={key}>{message}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {serverError && (
                  <div
                    role="alert"
                    className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1.5"
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{serverError}</span>
                    </div>
                    {duplicateEmailError && (
                      <div className="pl-6">
                        <Link
                          to="/login"
                          className="inline-flex items-center gap-1 font-bold text-[#0F2A4A] underline"
                        >
                          Already registered? {t.auth.signInHere}
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Common Account Details */}
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Account Credentials
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="reg-name"
                    label="Full Name"
                    type="text"
                    autoComplete="name"
                    required
                    placeholder="e.g. Md. Ashraful Islam"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => handleBlur('name')}
                    error={touched.name ? fieldErrors.name : undefined}
                  />

                  <Input
                    id="reg-email"
                    label="Email Address"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="e.g. name@baust.edu.bd"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => handleBlur('email')}
                    error={touched.email ? fieldErrors.email : undefined}
                  />
                </div>

                <Input
                  id="reg-phone"
                  label="Bangladesh Phone Number"
                  type="tel"
                  autoComplete="tel"
                  required
                  placeholder="e.g. +880 1711-000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  leftIcon={<Phone className="w-4 h-4" />}
                  error={touched.phone ? fieldErrors.phone : undefined}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="relative">
                      <Input
                        id="reg-password"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        placeholder="8+ chars (Upper, lower, digit)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => handleBlur('password')}
                        leftIcon={<Lock className="w-4 h-4" />}
                        error={touched.password ? fieldErrors.password : undefined}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {password && (
                      <div className="space-y-1.5 pt-0.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${pwStrength.color}`}
                              style={{ width: `${(pwStrength.score / 4) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-500">{pwStrength.label}</span>
                        </div>
                        <ul className="grid grid-cols-2 gap-1 text-xs text-slate-500">
                          <li className={pwRules.minLength ? 'text-emerald-700 font-semibold' : ''}>
                            ✓ 8+ characters
                          </li>
                          <li className={pwRules.hasUpper ? 'text-emerald-700 font-semibold' : ''}>
                            ✓ Uppercase
                          </li>
                          <li className={pwRules.hasLower ? 'text-emerald-700 font-semibold' : ''}>
                            ✓ Lowercase
                          </li>
                          <li className={pwRules.hasNumber ? 'text-emerald-700 font-semibold' : ''}>
                            ✓ Number
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

                  <Input
                    id="reg-confirm-password"
                    label="Confirm Password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                    leftIcon={<Lock className="w-4 h-4" />}
                    error={touched.confirmPassword ? fieldErrors.confirmPassword : undefined}
                  />
                </div>
              </div>

              {/* Role-Specific Fields */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  {role === 'admin'
                    ? 'Office & Staff Verification Details'
                    : role === 'alumni'
                    ? 'Graduation, Career & Verification Proof'
                    : 'Student Academic Details'}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="reg-baust-id"
                    label={role === 'admin' ? 'Employee / Staff ID (Optional)' : 'BAUST ID'}
                    type="text"
                    required={role !== 'admin'}
                    placeholder={role === 'admin' ? 'e.g. EMP-204 (Optional)' : `e.g. ${BAUST_ID_EXAMPLE}`}
                    value={baustId}
                    onChange={(e) => setBaustId(e.target.value)}
                    onBlur={() => handleBlur('baustId')}
                    error={touched.baustId ? fieldErrors.baustId : undefined}
                  />

                  <Select
                    id="reg-department"
                    label={role === 'admin' ? 'Wing / Department' : 'Department'}
                    options={departments}
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as Department)}
                  />
                </div>

                {(role === 'student' || role === 'alumni') && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      id="reg-batch"
                      label={role === 'alumni' ? 'Graduation Batch' : 'Batch'}
                      type="text"
                      required
                      placeholder={role === 'alumni' ? 'e.g. 4th Batch' : 'e.g. 19th Batch'}
                      value={batch}
                      onChange={(e) => setBatch(e.target.value)}
                      onBlur={() => handleBlur('batch')}
                      error={touched.batch ? fieldErrors.batch : undefined}
                    />

                    <Input
                      id="reg-passing-year"
                      label={role === 'student' ? 'Expected Graduation Year (Optional)' : 'Passing Year (Optional)'}
                      type="text"
                      placeholder="e.g. 2025"
                      value={passingYear}
                      onChange={(e) => setPassingYear(e.target.value)}
                      onBlur={() => handleBlur('passingYear')}
                      error={touched.passingYear ? fieldErrors.passingYear : undefined}
                    />
                  </div>
                )}

                {role === 'alumni' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        id="reg-alumni-company"
                        label="Current Company / Organization"
                        type="text"
                        required
                        placeholder="e.g. Brain Station 23"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        onBlur={() => handleBlur('company')}
                        leftIcon={<Building2 className="w-4 h-4" />}
                        error={touched.company ? fieldErrors.company : undefined}
                      />
                      <Input
                        id="reg-alumni-designation"
                        label="Current Position / Designation"
                        type="text"
                        required
                        placeholder="e.g. Senior Software Engineer"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        onBlur={() => handleBlur('designation')}
                        error={touched.designation ? fieldErrors.designation : undefined}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        id="reg-alumni-linkedin"
                        label="LinkedIn Profile URL (Optional)"
                        type="url"
                        placeholder="https://www.linkedin.com/in/username"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        onBlur={() => handleBlur('linkedin')}
                        leftIcon={<Link2 className="w-4 h-4" />}
                        error={touched.linkedin ? fieldErrors.linkedin : undefined}
                      />
                      <Input
                        id="reg-proof-url"
                        label="Degree / Proof Document URL (Optional)"
                        type="url"
                        placeholder="https://drive.google.com/..."
                        value={verificationProofUrl}
                        onChange={(e) => setVerificationProofUrl(e.target.value)}
                        onBlur={() => handleBlur('verificationProofUrl')}
                        leftIcon={<Link2 className="w-4 h-4" />}
                        error={touched.verificationProofUrl ? fieldErrors.verificationProofUrl : undefined}
                      />
                    </div>
                  </>
                )}

                {role === 'admin' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      id="reg-admin-office"
                      label="Office / Department Name"
                      type="text"
                      required
                      placeholder="e.g. Exam Controller Office"
                      value={office}
                      onChange={(e) => setOffice(e.target.value)}
                      onBlur={() => handleBlur('office')}
                      leftIcon={<Building2 className="w-4 h-4" />}
                      error={touched.office ? fieldErrors.office : undefined}
                    />
                    <Input
                      id="reg-admin-designation"
                      label="Designation"
                      type="text"
                      required
                      placeholder="e.g. Assistant Registrar"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      onBlur={() => handleBlur('designation')}
                      error={touched.designation ? fieldErrors.designation : undefined}
                    />
                  </div>
                )}

                {/* Verification Proof */}
                <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#0F2A4A]/10 text-[#0F2A4A] flex items-center justify-center shrink-0">
                      {uploadedFileName ? (
                        <FileCheck className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <UploadCloud className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {uploadedFileName ||
                          (role === 'admin'
                            ? 'Upload Staff Appointment / ID Card (Optional)'
                            : role === 'alumni'
                            ? 'Upload Degree Certificate / Alumni Proof'
                            : 'Upload BAUST Student ID Card (Optional)')}
                      </p>
                      <p className="text-xs text-slate-500">PNG, JPG, or PDF for Super Admin verification audit</p>
                    </div>
                  </div>
                  <input
                    type="file"
                    id="register-doc-upload"
                    onChange={handleFilePick}
                    className="hidden"
                    accept="image/*,.pdf"
                  />
                  <label
                    htmlFor="register-doc-upload"
                    className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer text-center shrink-0"
                  >
                    Choose File
                  </label>
                </div>
              </div>

              {/* Required Terms & Privacy Checkbox */}
              <div className="space-y-1">
                <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer select-none">
                  <input
                    id="reg-terms-checkbox"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setTermsAccepted(checked);
                      setTouched((prev) => ({ ...prev, termsAccepted: true }));
                      setFieldErrors((prev) => ({
                        ...prev,
                        termsAccepted: checked
                          ? undefined
                          : 'You must agree to the BAUST Career Bridge Terms & Privacy Policy.',
                      }));
                    }}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#0F2A4A] focus:ring-[#14B8A6]"
                  />
                  <span>
                    I confirm that my BAUST affiliation details are accurate and agree to the{' '}
                    <span className="font-semibold text-[#0F2A4A]">BAUST Career Bridge Terms of Service</span>{' '}
                    and{' '}
                    <span className="font-semibold text-[#0F2A4A]">Academic Privacy Policy</span>.
                  </span>
                </label>
                {touched.termsAccepted && fieldErrors.termsAccepted && (
                  <p role="alert" className="text-xs text-rose-600 font-medium pl-6">
                    {fieldErrors.termsAccepted}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
                disabled={isLoading}
                rightIcon={<ShieldCheck className="w-4 h-4" />}
              >
                {t.auth.submitRegistration}
              </Button>
            </form>
          </Card>
        )}

        <p className="text-center text-xs text-slate-200">
          {t.auth.alreadyRegistered}{' '}
          <Link to="/login" className="font-bold text-[#5EEAD4] hover:underline">
            {t.auth.signInHere}
          </Link>
        </p>
      </div>
    </div>
  );
};

