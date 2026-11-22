/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';

export interface StudentCvPdfInput {
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
  batch?: string;
  studentId?: string;
  currentSemester?: string;
  cgpa?: number | string;
  bio?: string;
  careerGoal?: string;
  skills?: string[];
  cvFileName?: string;
  verificationStatus?: string;
}

export function generateStudentCvPdf(profile: StudentCvPdfInput): string {
  const safeName = (profile.name || 'BAUST Student').trim();
  const safeEmail = (profile.email || 'student@baust.edu.bd').trim();
  const safePhone = (profile.phone || 'Not provided').trim();
  const safeDept = (profile.department || 'CSE').trim();
  const safeBatch = (profile.batch || 'BAUST Batch').trim();
  const safeStudentId = (profile.studentId || 'BAUST ID Pending').trim();
  const safeSemester = (profile.currentSemester || 'Undergraduate').trim();
  const safeCgpa =
    profile.cgpa !== undefined && profile.cgpa !== null && String(profile.cgpa).trim() !== ''
      ? String(profile.cgpa)
      : 'N/A';
  const safeBio = (
    profile.bio ||
    'Undergraduate student at Bangladesh Army University of Science & Technology (BAUST), Saidpur.'
  ).trim();
  const safeGoal = (
    profile.careerGoal ||
    'Seeking opportunities in engineering, software development, and research.'
  ).trim();
  const safeSkills =
    Array.isArray(profile.skills) && profile.skills.length > 0
      ? profile.skills
      : ['Problem Solving', 'Teamwork', 'Communication'];

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  // Header Banner (BAUST Navy)
  doc.setFillColor(15, 42, 74); // #0F2A4A
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Gold Accent Strip
  doc.setFillColor(201, 162, 39); // #C9A227
  doc.rect(0, 42, pageWidth, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(safeName, margin, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(226, 232, 240);
  doc.text(
    `Department of ${safeDept}  |  ${safeBatch}  |  ID: ${safeStudentId}`,
    margin,
    26
  );

  doc.setFontSize(9.5);
  doc.text(`Email: ${safeEmail}   |   Phone: ${safePhone}`, margin, 34);

  y = 54;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - 18) {
      doc.addPage();
      y = 20;
    }
  };

  const addSectionHeading = (title: string) => {
    ensureSpace(14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(15, 42, 74);
    doc.text(title.toUpperCase(), margin, y);
    y += 2;
    doc.setDrawColor(201, 162, 39);
    doc.setLineWidth(0.6);
    doc.line(margin, y, margin + contentWidth, y);
    y += 6;
  };

  // Career Objective
  addSectionHeading('Career Objective');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  const goalLines = doc.splitTextToSize(safeGoal, contentWidth);
  ensureSpace(goalLines.length * 5 + 4);
  doc.text(goalLines, margin, y);
  y += goalLines.length * 5 + 6;

  // Academic Information
  addSectionHeading('Academic Background');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Bangladesh Army University of Science & Technology (BAUST), Saidpur', margin, y);
  y += 5.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`Program: B.Sc. in ${safeDept} (${safeBatch})`, margin, y);
  y += 5;
  doc.text(`Student ID: ${safeStudentId}   |   Current Level: ${safeSemester}   |   CGPA: ${safeCgpa} / 4.00`, margin, y);
  y += 9;

  // Profile Summary / Bio
  addSectionHeading('Profile Summary');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  const bioLines = doc.splitTextToSize(safeBio, contentWidth);
  ensureSpace(bioLines.length * 5 + 4);
  doc.text(bioLines, margin, y);
  y += bioLines.length * 5 + 6;

  // Skills & Technical Interests
  addSectionHeading('Technical Skills & Interests');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  const skillsText = safeSkills.map((s) => `• ${s}`).join('    ');
  const skillLines = doc.splitTextToSize(skillsText, contentWidth);
  ensureSpace(skillLines.length * 5 + 6);
  doc.text(skillLines, margin, y);
  y += skillLines.length * 5 + 8;

  // Verification Footer
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  const statusLabel =
    profile.verificationStatus === 'approved'
      ? 'Registrar Verified BAUST Profile'
      : 'BAUST Career Bridge Student Profile';
  doc.text(
    `${statusLabel}  •  Generated via BAUST Career Bridge on ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })}`,
    margin,
    pageHeight - 10
  );

  // Download as Blob via temporary anchor
  const rawName = (profile.cvFileName || `${safeName.replace(/[^a-zA-Z0-9]+/g, '_')}_CV`).replace(
    /\.pdf$/i,
    ''
  );
  const fileName = `${rawName || 'BAUST_Student_CV'}.pdf`;

  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1500);

  return fileName;
}
