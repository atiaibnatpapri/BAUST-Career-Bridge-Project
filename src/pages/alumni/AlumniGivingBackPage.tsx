/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { createContribution, subscribeContributions } from '../../services/firestorePortal';
import { ContributionItem } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Loader } from '../../components/ui/Loader';
import { HeartHandshake, AlertCircle, Sparkles } from 'lucide-react';

export const AlumniGivingBackPage: React.FC = () => {
  const { firebaseUser, userProfile } = useAuth();
  const { addToast } = useApp();

  const [contributions, setContributions] = useState<ContributionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [category, setCategory] = useState<ContributionItem['category']>('Scholarship Fund');
  const [pledgeTitle, setPledgeTitle] = useState('');
  const [amountBdt, setAmountBdt] = useState('10000');
  const [note, setNote] = useState('');

  useEffect(() => {
    setLoading(true);
    return subscribeContributions(
      (items) => {
        setContributions(items);
        setLoading(false);
      },
      (err) => {
        setErrorMsg(err.message);
        setLoading(false);
      }
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !userProfile) return;
    setSubmitting(true);
    try {
      await createContribution({
        alumniId: firebaseUser.uid,
        alumniName: userProfile.name,
        department: userProfile.department || 'CSE',
        batch: userProfile.batch || 'Alumni',
        category,
        amountBdt: parseInt(amountBdt, 10) || 0,
        pledgeTitle: pledgeTitle.trim(),
        note: note.trim(),
        isDemo: Boolean(userProfile.isDemo),
      });
      addToast('success', 'Contribution Recorded', 'Thank you for supporting BAUST students!');
      setPledgeTitle('');
      setNote('');
    } catch (err: any) {
      addToast('error', 'Failed to Record Pledge', err?.message || 'Permission denied.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader label="Loading alumni giving back ledger..." />;
  }

  const totalBdt = contributions.reduce((sum, c) => sum + (c.amountBdt || 0), 0);

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-emerald-100">
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
          Alumni Endowment & Mentorship Impact
        </span>
        <h1 className="text-2xl font-black text-[#0F2A4A] tracking-tight mt-1">
          Giving Back to BAUST
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Sponsor student scholarships, lab equipment, career fairs, or dedicate mentorship hours
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 border-slate-200 space-y-4">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold text-[#0F2A4A]">Make a Contribution Pledge</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Contribution Focus"
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              options={[
                { value: 'Scholarship Fund', label: 'Student Scholarship Fund' },
                { value: 'Lab Equipment', label: 'Department Lab Equipment' },
                { value: 'Career Fair Sponsorship', label: 'Career Fair Sponsorship' },
                { value: 'Student Mentorship Hours', label: 'Dedicated Mentorship Cohort' },
              ]}
            />
            <Input
              label="Initiative / Pledge Title"
              required
              value={pledgeTitle}
              onChange={(e) => setPledgeTitle(e.target.value)}
              placeholder="e.g. BAUST CSE Thesis Microgrant"
            />
            <Input
              label="Pledged Amount (BDT)"
              type="number"
              min="0"
              required
              value={amountBdt}
              onChange={(e) => setAmountBdt(e.target.value)}
            />
            <Textarea
              label="Message or Allocation Note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Specify preferred department or student criteria..."
            />
            <Button type="submit" variant="secondary" className="w-full" isLoading={submitting}>
              Record Pledge
            </Button>
          </form>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5 bg-emerald-50/70 border-emerald-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Total Community Pledges
              </p>
              <p className="text-2xl font-black text-emerald-900 mt-0.5 tabular-nums">
                BDT {totalBdt.toLocaleString()}
              </p>
            </div>
            <Sparkles className="w-7 h-7 text-emerald-700" />
          </Card>

          <Card className="p-6 border-slate-200 space-y-4">
            <h2 className="text-base font-bold text-[#0F2A4A]">
              Recent Alumni Contributions ({contributions.length})
            </h2>

            {contributions.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl">
                No contributions recorded yet. Be the first alumnus to pledge support!
              </div>
            ) : (
              <div className="space-y-3">
                {contributions.map((c) => (
                  <div key={c.id} className="p-4 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{c.pledgeTitle}</h3>
                      <Badge variant="army" size="sm">
                        BDT {(c.amountBdt || 0).toLocaleString()}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600">{c.note || c.category}</p>
                    <p className="text-[11px] text-slate-400">
                      By <strong className="text-slate-600">{c.alumniName}</strong> ({c.department}{' '}
                      {c.batch}) · {c.createdAtLabel || 'Recently'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
