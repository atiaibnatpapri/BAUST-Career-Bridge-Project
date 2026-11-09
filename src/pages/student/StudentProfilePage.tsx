/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Input, Textarea } from '../../components/ui/Input';
import { StudentProfile } from '../../types';
import { 
  User, 
  UploadCloud, 
  FileCheck, 
  CheckCircle2, 
  Lock, 
  Eye, 
  EyeOff, 
  GraduationCap, 
  Award,
  Download,
  Trash2,
  Save
} from 'lucide-react';

export const StudentProfilePage: React.FC = () => {
  const { currentUser, updateStudentProfile, addToast } = useApp();

  const student = currentUser.role === 'student' ? (currentUser as StudentProfile) : null;

  const [name, setName] = useState(student?.name || 'Md. Tanvir Ahmed');
  const [email, setEmail] = useState(student?.email || 'tanvir.1802045@baust.edu.bd');
  const [phone, setPhone] = useState(student?.phone || '+880 1798-123456');
  const [semester, setSemester] = useState(student?.currentSemester || 'Level-4, Term-I');
  const [cgpa, setCgpa] = useState(String(student?.cgpa || 3.84));
  const [careerGoal, setCareerGoal] = useState(student?.careerGoal || '');
  const [bio, setBio] = useState(student?.bio || '');
  const [skills, setSkills] = useState(student?.interests || ['Full-Stack Web', 'Distributed Systems', 'Cloud Computing']);
  const [newSkill, setNewSkill] = useState('');

  // Keep form inputs updated if currentUser loads from Firestore
  React.useEffect(() => {
    if (student) {
      if (student.name) setName(student.name);
      if (student.email) setEmail(student.email);
      if (student.phone) setPhone(student.phone);
      if (student.currentSemester) setSemester(student.currentSemester);
      if (student.cgpa !== undefined) setCgpa(String(student.cgpa));
      if (student.careerGoal) setCareerGoal(student.careerGoal);
      if (student.bio) setBio(student.bio);
      if (student.interests) setSkills(student.interests);
      if (student.cvFileName) setCvFileName(student.cvFileName);
    }
  }, [student?.name, student?.email, student?.phone, student?.currentSemester, student?.cgpa, student?.careerGoal, student?.bio]);
  
  // CV Upload State
  const [cvFileName, setCvFileName] = useState(student?.cvFileName || 'Tanvir_Ahmed_CSE_Resume.pdf');
  
  // Privacy Settings
  const [allowAlumniMessages, setAllowAlumniMessages] = useState(true);
  const [showCgpaPublicly, setShowCgpaPublicly] = useState(false);
  const [notifyOnMentorship, setNotifyOnMentorship] = useState(true);

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      e.preventDefault();
      if (!skills.includes(newSkill.trim())) {
        setSkills([...skills, newSkill.trim()]);
      }
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudentProfile({
      name,
      email,
      phone,
      currentSemester: semester,
      cgpa: parseFloat(cgpa) || 3.84,
      careerGoal,
      bio,
      interests: skills,
      cvFileName,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0F2A4A] tracking-tight">
            My Student Profile & Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your public resume, career aspirations, and mentorship privacy controls
          </p>
        </div>

        <Button variant="primary" onClick={handleSave} leftIcon={<Save className="w-4 h-4" />}>
          Save All Changes
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Profile Card */}
        <Card className="p-6 border-slate-200 space-y-6">
          <div className="flex items-center gap-4">
            <Avatar src={currentUser.avatar} name={name} size="xl" isVerified />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{name}</h3>
                <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                  Verified Student
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Department of {student?.department || 'CSE'} · {student?.batch || '18th Batch'} · ID: {student?.studentId || '1802045'}
              </p>
              <button
                type="button"
                onClick={() => addToast('info', 'Photo update', 'Click to browse new university profile picture.')}
                className="text-xs font-bold text-[#0F2A4A] hover:underline"
              >
                Change Avatar Photo
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Current Semester"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
              />
              <Input
                label="Current CGPA"
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
              />
            </div>
          </div>

          <Textarea
            label="Professional Bio"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Introduce your key academic achievements, programming club roles, or projects..."
          />

          <Textarea
            label="Primary Career Goal"
            rows={2}
            value={careerGoal}
            onChange={(e) => setCareerGoal(e.target.value)}
            placeholder="e.g. Aspiring full-stack software engineer targeting fintech firms..."
          />
        </Card>

        {/* Skills & Interest Tags */}
        <Card className="p-6 border-slate-200 space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#0F2A4A]">Interests & Skills</h3>
            <p className="text-xs text-slate-500">
              Add technical skills, tools, or research interests to get matched with the best mentors.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-slate-400 hover:text-rose-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="max-w-xs">
            <Input
              placeholder="Type skill & press Enter..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={handleAddSkill}
            />
          </div>
        </Card>

        {/* CV / Resume Upload */}
        <Card className="p-6 border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0F2A4A]">Curriculum Vitae (CV) Upload</h3>
              <p className="text-xs text-slate-500">
                Alumni mentors will review this file during CV Audit sessions
              </p>
            </div>
            {cvFileName && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Active Resume
              </span>
            )}
          </div>

          {cvFileName ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{cvFileName}</p>
                  <p className="text-[11px] text-slate-400">PDF Document · Updated 3 days ago</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addToast('info', 'Downloading CV', cvFileName)}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                >
                  Download
                </Button>
                <button
                  type="button"
                  onClick={() => setCvFileName('')}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Remove CV"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center space-y-2">
              <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No active CV uploaded</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCvFileName('Tanvir_Ahmed_Resume_2026.pdf')}
              >
                Upload New PDF Resume
              </Button>
            </div>
          )}
        </Card>

        {/* Privacy & Notification Settings */}
        <Card className="p-6 border-slate-200 space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#0F2A4A]">Privacy & Communication Controls</h3>
            <p className="text-xs text-slate-500">Configure who can reach you and what data is visible</p>
          </div>

          <div className="space-y-3 divide-y divide-slate-100 text-xs">
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="font-bold text-slate-900">Direct Messages from Alumni</p>
                <p className="text-slate-500 text-[11px]">Allow verified alumni to message you directly</p>
              </div>
              <input
                type="checkbox"
                checked={allowAlumniMessages}
                onChange={(e) => setAllowAlumniMessages(e.target.checked)}
                className="w-4 h-4 rounded text-[#0F2A4A]"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="font-bold text-slate-900">Display CGPA on Public Profile</p>
                <p className="text-slate-500 text-[11px]">Show your academic score on your student badge</p>
              </div>
              <input
                type="checkbox"
                checked={showCgpaPublicly}
                onChange={(e) => setShowCgpaPublicly(e.target.checked)}
                className="w-4 h-4 rounded text-[#0F2A4A]"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="font-bold text-slate-900">Email & In-App Notifications</p>
                <p className="text-slate-500 text-[11px]">Notify me when a mentor accepts my session</p>
              </div>
              <input
                type="checkbox"
                checked={notifyOnMentorship}
                onChange={(e) => setNotifyOnMentorship(e.target.checked)}
                className="w-4 h-4 rounded text-[#0F2A4A]"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="primary" type="submit" size="lg" leftIcon={<Save className="w-4 h-4" />}>
            Save All Settings
          </Button>
        </div>

      </form>

    </div>
  );
};
