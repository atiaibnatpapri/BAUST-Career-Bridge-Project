/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Department } from '../../types';
import { 
  GraduationCap, 
  Briefcase, 
  CheckCircle2, 
  UploadCloud, 
  FileCheck, 
  ArrowRight, 
  ArrowLeft, 
  Clock, 
  ShieldCheck,
  Lock,
  AlertCircle
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { addToast } = useApp();
  const { register: firebaseRegister } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(1);
  const [role, setRole] = useState<'student' | 'alumni'>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [baustId, setBaustId] = useState('');
  const [department, setDepartment] = useState<Department>('CSE');
  const [batch, setBatch] = useState('19th Batch');
  const [passingYear, setPassingYear] = useState('2024');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('baust_student_id_card.png');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const departments: { value: Department; label: string }[] = [
    { value: 'CSE', label: 'Computer Science & Engineering (CSE)' },
    { value: 'EEE', label: 'Electrical & Electronic Engineering (EEE)' },
    { value: 'CE', label: 'Civil Engineering (CE)' },
    { value: 'ME', label: 'Mechanical Engineering (ME)' },
    { value: 'IPE', label: 'Industrial & Production Engineering (IPE)' },
    { value: 'Textile', label: 'Textile Engineering' },
    { value: 'BBA', label: 'Bachelor of Business Administration (BBA)' },
    { value: 'English', label: 'Department of English' },
  ];

  const handleNext = () => {
    setErrorMessage(null);
    if (step === 1 && !role) {
      addToast('warning', 'Role Required', 'Please select whether you are a Student or Alumni.');
      return;
    }
    if (step === 2) {
      if (!name.trim() || !email.trim() || !baustId.trim() || !password) {
        setErrorMessage('Please fill in your name, email, BAUST ID, and create a password.');
        addToast('warning', 'Missing Fields', 'All fields are required to register.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please re-enter.');
        return;
      }
    }
    setStep(step + 1);
  };

  const handlePrev = () => {
    setErrorMessage(null);
    setStep(step - 1);
  };

  const handleFakeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
      setUploadedFileName(e.target.files[0].name);
    }
  };

  const handleSubmitRegistration = async () => {
    setErrorMessage(null);
    setIsLoading(true);

    const res = await firebaseRegister({
      email,
      password,
      name,
      role,
      baustId,
      department,
      batch,
      passingYear,
    });

    setIsLoading(false);

    if (res.success) {
      // Progress to Step 4 (Success screen)
      setStep(4);
      addToast('success', 'Application Submitted', 'Your verification request has been queued for registrar review.');
    } else {
      setErrorMessage(res.error || 'Registration failed.');
      addToast('error', 'Registration Failed', res.error || 'Could not register');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#0F2A4A] border border-[#C9A227] flex items-center justify-center mx-auto shadow-md">
            <GraduationCap className="w-7 h-7 text-[#C9A227]" />
          </div>
          <h1 className="text-2xl font-black text-[#0F2A4A] tracking-tight">
            Register for BAUST Career Bridge
          </h1>
          <p className="text-xs text-slate-500">
            Join the verified university network for students & graduates
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="flex items-center justify-between relative max-w-sm mx-auto px-4">
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 -z-10" />
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= s
                  ? 'bg-[#0F2A4A] text-[#C9A227] ring-4 ring-white shadow-xs'
                  : 'bg-slate-200 text-slate-500 ring-4 ring-white'
              }`}
            >
              {s < step ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : s}
            </div>
          ))}
        </div>

        {/* Card Body */}
        <Card className="p-6 sm:p-8 border-slate-200 shadow-md">
          
          {/* STEP 1: Role Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-[#0F2A4A]">Step 1: Choose Your Account Type</h3>
                <p className="text-xs text-slate-500">Select how you want to participate in the BAUST network</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setRole('student')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center space-y-2.5 ${
                    role === 'student'
                      ? 'border-[#0F2A4A] bg-[#0F2A4A]/5 ring-1 ring-[#0F2A4A]'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
                    <GraduationCap className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Current Student</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Enrolled at BAUST Saidpur. Looking for alumni mentorship, CV reviews, and job preparation.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setRole('alumni')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center space-y-2.5 ${
                    role === 'alumni'
                      ? 'border-[#0F2A4A] bg-[#0F2A4A]/5 ring-1 ring-[#0F2A4A]'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="p-3 rounded-xl bg-sky-50 text-sky-700">
                    <Briefcase className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">BAUST Alumni</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Graduated from BAUST. Guide juniors, network with fellow alumni, and request official transcripts/certificates.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleNext}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue to Academic Details
              </Button>
            </div>
          )}

          {/* STEP 2: Academic Details */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-[#0F2A4A]">Step 2: University Information</h3>
                <p className="text-xs text-slate-500">Provide official BAUST registration information</p>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-4">
                <Input
                  label="Full Name (as per BAUST record)"
                  type="text"
                  required
                  placeholder="e.g. Md. Ashraful Islam"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <Input
                  label="University Email or Primary Email"
                  type="email"
                  required
                  placeholder="e.g. ashraf.1902041@baust.edu.bd"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Account Password (min. 6 characters)"
                    type="password"
                    required
                    placeholder="Create a secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    leftIcon={<Lock className="w-4 h-4" />}
                  />

                  <Input
                    label="Confirm Password"
                    type="password"
                    required
                    placeholder="Re-type password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    leftIcon={<Lock className="w-4 h-4" />}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="BAUST Student ID"
                    type="text"
                    required
                    placeholder="e.g. 1902041"
                    value={baustId}
                    onChange={(e) => setBaustId(e.target.value)}
                  />

                  <Select
                    label="Department"
                    options={departments}
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as Department)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Batch"
                    type="text"
                    placeholder="e.g. 18th Batch"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                  />

                  <Input
                    label={role === 'student' ? 'Expected Graduation Year' : 'Passing Year'}
                    type="text"
                    placeholder="e.g. 2025"
                    value={passingYear}
                    onChange={(e) => setPassingYear(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <Button variant="outline" onClick={handlePrev} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back
                </Button>
                <Button variant="primary" onClick={handleNext} rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Continue to Document Upload
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Document Upload for Verification */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-[#0F2A4A]">Step 3: Verification Document</h3>
                <p className="text-xs text-slate-500">
                  To prevent fake profiles, please upload your BAUST Student ID card, Library card, or Degree Certificate
                </p>
              </div>

              <div className="border-2 border-dashed border-slate-300 hover:border-[#0F2A4A] rounded-2xl p-6 sm:p-8 text-center transition-colors bg-slate-50/50">
                <div className="w-12 h-12 rounded-full bg-[#0F2A4A]/10 text-[#0F2A4A] flex items-center justify-center mx-auto mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">
                  Click or drag your ID card or document here
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Supports JPG, PNG or PDF (Max size 10MB)
                </p>

                <input
                  type="file"
                  id="document-upload"
                  onChange={handleFakeFileUpload}
                  className="hidden"
                  accept="image/*,.pdf"
                />

                <label
                  htmlFor="document-upload"
                  className="mt-4 inline-block px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-xl shadow-xs hover:bg-slate-50 cursor-pointer"
                >
                  Browse Document
                </label>
              </div>

              {uploadedFileName && (
                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">{uploadedFileName}</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                    Ready to verify
                  </span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-2">
                <Button variant="outline" onClick={handlePrev} disabled={isLoading} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleSubmitRegistration} 
                  isLoading={isLoading} 
                  rightIcon={<ShieldCheck className="w-4 h-4" />}
                >
                  Create Account & Submit Verification
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Success Screen */}
          {step === 4 && (
            <div className="text-center py-6 space-y-5 animate-in fade-in duration-200">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border-2 border-amber-200">
                <Clock className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/70 px-3 py-1 rounded-full">
                  Status: Pending Admin Verification
                </span>
                <h3 className="text-xl font-extrabold text-[#0F2A4A] pt-2">
                  Your Profile is Under Review
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{name || 'applicant'}</strong>! The BAUST Registrar and Student Affairs Office will cross-verify your ID <span className="font-mono text-slate-800 font-bold">({baustId || '1902041'})</span> with the university database within 24–48 hours.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-600 space-y-1.5 max-w-md mx-auto">
                <p className="font-semibold text-slate-900">What happens next?</p>
                <p>• You will receive an email confirmation once verified.</p>
                <p>• Verified badge will be stamped on your public profile.</p>
                <p>• Full access to 1-on-1 mentorship bookings and document desk will be unlocked.</p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/login">
                  <Button variant="primary">
                    Go to Sign In
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline">
                    Back to Homepage
                  </Button>
                </Link>
              </div>
            </div>
          )}

        </Card>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500">
          Already verified?{' '}
          <Link to="/login" className="font-bold text-[#0F2A4A] hover:underline">
            Sign In here
          </Link>
        </p>

      </div>
    </div>
  );
};
