import React, { useState } from 'react';
import { X, Flag, Ban, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';

const REPORT_REASONS = [
  { id: 'fake_profile', label: 'Fake profile / Catfish', icon: '🎭' },
  { id: 'inappropriate_photos', label: 'Inappropriate or explicit photos', icon: '📸' },
  { id: 'harassment', label: 'Harassment or abusive messages', icon: '💬' },
  { id: 'scam', label: 'Scam or fraud attempt', icon: '🚨' },
  { id: 'underage', label: 'User appears to be underage', icon: '⚠️' },
  { id: 'hate_speech', label: 'Hate speech or discrimination', icon: '🚫' },
  { id: 'spam', label: 'Spam or promotional content', icon: '📩' },
  { id: 'impersonation', label: 'Impersonating someone else', icon: '👤' },
  { id: 'other', label: 'Other concern', icon: '📝' }
];

export default function ReportBlockModal({ 
  isOpen, 
  onClose, 
  targetUser, 
  onBlock, 
  onReport 
}) {
  const [mode, setMode] = useState('menu'); // 'menu' | 'report' | 'block_confirm' | 'submitted'
  const [selectedReason, setSelectedReason] = useState('');
  const [details, setDetails] = useState('');

  if (!isOpen || !targetUser) return null;

  const handleSubmitReport = () => {
    if (!selectedReason) return;
    onReport(targetUser, selectedReason, details);
    setMode('submitted');
  };

  const handleBlock = () => {
    onBlock(targetUser);
    setMode('submitted');
  };

  const handleClose = () => {
    setMode('menu');
    setSelectedReason('');
    setDetails('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#131620] rounded-t-3xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <h3 className="font-extrabold text-sm text-white">
              {mode === 'submitted' ? 'Action Completed' : `Safety Options — ${targetUser}`}
            </h3>
          </div>
          <button 
            onClick={handleClose}
            className="p-1.5 rounded-full bg-white/5 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">

          {/* Success / Submitted State */}
          {mode === 'submitted' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <h4 className="text-base font-bold text-white">Thank You</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                Your report has been submitted. Our safety team reviews every report within 24 hours. 
                We take the safety of the Behind The Scenes community seriously.
              </p>
              <p className="text-[10px] text-slate-500">
                Reference ID: BTS-{Date.now().toString(36).toUpperCase()}
              </p>
              <button 
                onClick={handleClose}
                className="px-6 py-2.5 rounded-xl bg-amber-400 text-black font-extrabold text-xs mt-2"
              >
                Done
              </button>
            </div>
          )}

          {/* Main Menu */}
          {mode === 'menu' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 mb-4">
                Your safety matters. All reports are confidential and reviewed by our team.
              </p>

              <button 
                onClick={() => setMode('report')}
                className="w-full p-4 rounded-2xl bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-left flex items-center gap-3 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center flex-shrink-0 group-hover:bg-red-500/20">
                  <Flag className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Report {targetUser}</h4>
                  <p className="text-[11px] text-slate-400">
                    Flag inappropriate behavior, fake profiles, or safety concerns
                  </p>
                </div>
              </button>

              <button 
                onClick={() => setMode('block_confirm')}
                className="w-full p-4 rounded-2xl bg-white/5 hover:bg-orange-500/10 border border-white/10 hover:border-orange-500/30 text-left flex items-center gap-3 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500/20">
                  <Ban className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Block {targetUser}</h4>
                  <p className="text-[11px] text-slate-400">
                    They will not be able to see you or contact you
                  </p>
                </div>
              </button>
            </div>
          )}

          {/* Report Form */}
          {mode === 'report' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  What is the issue?
                </h4>
                <div className="space-y-2">
                  {REPORT_REASONS.map(reason => (
                    <button
                      key={reason.id}
                      onClick={() => setSelectedReason(reason.id)}
                      className={`w-full p-3 rounded-xl text-xs font-semibold text-left flex items-center gap-2.5 transition-all border ${
                        selectedReason === reason.id 
                          ? 'bg-red-500/15 border-red-500/40 text-white' 
                          : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <span className="text-sm">{reason.icon}</span>
                      <span>{reason.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Additional details (optional)
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={3}
                  placeholder="Describe what happened..."
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-400 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setMode('menu')}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 text-xs font-bold text-slate-300 hover:text-white"
                >
                  Back
                </button>
                <button 
                  onClick={handleSubmitReport}
                  disabled={!selectedReason}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 disabled:opacity-40 text-white font-extrabold text-xs flex items-center justify-center gap-1.5"
                >
                  <Flag className="w-3.5 h-3.5" />
                  Submit Report
                </button>
              </div>
            </div>
          )}

          {/* Block Confirmation */}
          {mode === 'block_confirm' && (
            <div className="text-center py-4 space-y-5">
              <div className="w-14 h-14 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mx-auto">
                <Ban className="w-7 h-7 text-orange-400" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Block {targetUser}?</h4>
                <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
                  They will no longer be able to see your profile, message you, or appear in your feed. 
                  This action can be undone from your settings.
                </p>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setMode('menu')}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleBlock}
                  className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5"
                >
                  <Ban className="w-3.5 h-3.5" />
                  Block User
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
