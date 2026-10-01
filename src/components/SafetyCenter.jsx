import React, { useState } from 'react';
import { 
  X, Shield, ChevronRight, FileText, 
  Lock, Trash2, AlertTriangle, Mail,
  ExternalLink, CheckCircle2, Globe
} from 'lucide-react';

export default function SafetyCenter({ isOpen, onClose }) {
  const [activeSection, setActiveSection] = useState('main');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDeleteAccount = () => {
    if (deleteConfirmText.toLowerCase() === 'delete my account') {
      setDeleteSuccess(true);
    }
  };

  const sections = [
    {
      id: 'community',
      icon: <Shield className="w-5 h-5 text-emerald-400" />,
      title: 'Community Guidelines',
      description: 'Our rules for a safe and respectful community'
    },
    {
      id: 'privacy',
      icon: <Lock className="w-5 h-5 text-blue-400" />,
      title: 'Privacy Policy',
      description: 'How we collect, use, and protect your data'
    },
    {
      id: 'terms',
      icon: <FileText className="w-5 h-5 text-amber-400" />,
      title: 'Terms of Service',
      description: 'Legal terms governing your use of BTS'
    },
    {
      id: 'child_safety',
      icon: <AlertTriangle className="w-5 h-5 text-red-400" />,
      title: 'Child Safety Standards',
      description: 'Our commitment to protecting minors'
    },
    {
      id: 'delete_account',
      icon: <Trash2 className="w-5 h-5 text-red-400" />,
      title: 'Delete My Account',
      description: 'Permanently remove your account and data'
    },
    {
      id: 'contact',
      icon: <Mail className="w-5 h-5 text-slate-400" />,
      title: 'Contact Safety Team',
      description: 'Reach our dedicated safety point of contact'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#131620] rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-sm text-white">Safety & Legal Center</h3>
          </div>
          <button 
            onClick={() => { setActiveSection('main'); onClose(); }}
            className="p-1.5 rounded-full bg-white/5 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">

          {/* Main Menu */}
          {activeSection === 'main' && (
            <div className="space-y-2">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className="w-full p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-left flex items-center gap-3 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                    {section.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white">{section.title}</h4>
                    <p className="text-[10px] text-slate-400">{section.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
                </button>
              ))}
            </div>
          )}

          {/* Community Guidelines */}
          {activeSection === 'community' && (
            <div className="space-y-4">
              <button onClick={() => setActiveSection('main')} className="text-xs text-amber-400 font-bold">← Back</button>
              <h4 className="text-base font-black text-white">Community Guidelines</h4>
              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <h5 className="font-bold text-white mb-1">1. Be Authentic</h5>
                  <p>Use real photos that accurately represent you. Catfishing, impersonation, and misleading profiles are not tolerated and will result in permanent removal.</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <h5 className="font-bold text-white mb-1">2. Respect Everyone</h5>
                  <p>Treat others with dignity regardless of ethnicity, tribe, religion, gender, or orientation. Hate speech, harassment, and discrimination lead to immediate account termination.</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <h5 className="font-bold text-white mb-1">3. No Minors</h5>
                  <p>Behind The Scenes is exclusively for users 18 years and older. Any account found to belong to a minor will be immediately suspended and reported.</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <h5 className="font-bold text-white mb-1">4. No Solicitation or Scams</h5>
                  <p>Do not use BTS for commercial solicitation, financial scams, romance fraud, or pyramid schemes. Reported accounts are investigated and banned.</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <h5 className="font-bold text-white mb-1">5. Consent is Non-Negotiable</h5>
                  <p>Respect boundaries in all interactions. Unsolicited explicit content is prohibited. Persistent unwanted contact after being asked to stop is grounds for removal.</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <h5 className="font-bold text-white mb-1">6. Report Concerns</h5>
                  <p>Use the in-app Report button on any profile or in any chat to flag violations. All reports are reviewed within 24 hours by our safety team.</p>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Policy */}
          {activeSection === 'privacy' && (
            <div className="space-y-4">
              <button onClick={() => setActiveSection('main')} className="text-xs text-amber-400 font-bold">← Back</button>
              <h4 className="text-base font-black text-white">Privacy Policy</h4>
              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <h5 className="font-bold text-white mb-1">Data We Collect</h5>
                  <p>Profile information (name, age, photos, hometown, tribe/ethnicity, languages), location data (current city), usage data (swipes, matches, messages), and device information for security.</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <h5 className="font-bold text-white mb-1">How We Use Your Data</h5>
                  <p>To provide matching services, improve recommendations, enforce community guidelines, verify identity, process payments, and communicate service updates. We do not sell your personal data to third parties.</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <h5 className="font-bold text-white mb-1">Data Retention</h5>
                  <p>Your data is retained while your account is active. Upon account deletion, all personal data is permanently erased within 30 days, except where retention is required by law.</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <h5 className="font-bold text-white mb-1">Your Rights</h5>
                  <p>You may request access to, correction of, or deletion of your personal data at any time through the app settings or by contacting privacy@behindthescenes.app.</p>
                </div>
              </div>
            </div>
          )}

          {/* Terms of Service */}
          {activeSection === 'terms' && (
            <div className="space-y-4">
              <button onClick={() => setActiveSection('main')} className="text-xs text-amber-400 font-bold">← Back</button>
              <h4 className="text-base font-black text-white">Terms of Service</h4>
              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <h5 className="font-bold text-white mb-1">Eligibility</h5>
                  <p>You must be at least 18 years old to create an account and use Behind The Scenes. By using the service, you represent and warrant that you meet this age requirement.</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <h5 className="font-bold text-white mb-1">Account Responsibility</h5>
                  <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorized use.</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <h5 className="font-bold text-white mb-1">Subscriptions & Payments</h5>
                  <p>Premium features are available via subscription. Payments are processed through the respective app store (Apple/Google) or Paystack for MoMo transactions. Refund policies follow the platform's standard terms.</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <h5 className="font-bold text-white mb-1">Termination</h5>
                  <p>We reserve the right to suspend or terminate accounts that violate our Community Guidelines without prior notice. You may delete your account at any time from the Safety Center.</p>
                </div>
              </div>
            </div>
          )}

          {/* Child Safety Standards */}
          {activeSection === 'child_safety' && (
            <div className="space-y-4">
              <button onClick={() => setActiveSection('main')} className="text-xs text-amber-400 font-bold">← Back</button>
              <h4 className="text-base font-black text-white">Child Safety Standards</h4>
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 font-semibold mb-2">
                Behind The Scenes has zero tolerance for any content involving minors.
              </div>
              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <h5 className="font-bold text-white mb-1">Age Verification</h5>
                  <p>All users must verify they are 18+ during registration. We utilize the "Restrict Declared Minors" setting on Google Play and age-gating on Apple to prevent underage access.</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <h5 className="font-bold text-white mb-1">Reporting Underage Users</h5>
                  <p>If you encounter a user who appears to be under 18, report them immediately using the in-app Report function. Select "User appears to be underage" as the reason. We investigate all such reports within 4 hours.</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <h5 className="font-bold text-white mb-1">Designated Safety Contact</h5>
                  <p>Our designated child safety point of contact can be reached at:</p>
                  <p className="text-amber-400 font-bold mt-1">childsafety@behindthescenes.app</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <h5 className="font-bold text-white mb-1">Content Moderation</h5>
                  <p>All uploaded photos and media are screened using automated detection systems and human review to identify and remove any content involving minors.</p>
                </div>
              </div>
            </div>
          )}

          {/* Delete Account */}
          {activeSection === 'delete_account' && (
            <div className="space-y-4">
              <button onClick={() => setActiveSection('main')} className="text-xs text-amber-400 font-bold">← Back</button>
              <h4 className="text-base font-black text-white">Delete My Account</h4>
              
              {deleteSuccess ? (
                <div className="text-center py-8 space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h5 className="text-sm font-bold text-white">Account Deletion Scheduled</h5>
                  <p className="text-xs text-slate-400">
                    Your account and all associated data will be permanently deleted within 30 days. 
                    You will receive a confirmation email.
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 leading-relaxed">
                    <strong>Warning:</strong> This action is permanent. All your profile data, matches, messages, photos, 
                    and BTS moments will be permanently deleted and cannot be recovered.
                  </div>

                  <div className="space-y-3 text-xs text-slate-300">
                    <p>What will be deleted:</p>
                    <ul className="list-disc list-inside space-y-1 pl-2">
                      <li>Your profile and all photos</li>
                      <li>All matches and conversations</li>
                      <li>Behind The Scenes moments</li>
                      <li>Voice notes and media</li>
                      <li>Payment history (receipts retained per legal requirement)</li>
                    </ul>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Type "delete my account" to confirm
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="delete my account"
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-400"
                    />
                  </div>

                  <button 
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText.toLowerCase() !== 'delete my account'}
                    className="w-full py-3 rounded-xl bg-red-600 disabled:opacity-30 text-white font-extrabold text-xs flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    Permanently Delete Account
                  </button>
                </>
              )}
            </div>
          )}

          {/* Contact Safety Team */}
          {activeSection === 'contact' && (
            <div className="space-y-4">
              <button onClick={() => setActiveSection('main')} className="text-xs text-amber-400 font-bold">← Back</button>
              <h4 className="text-base font-black text-white">Contact Our Safety Team</h4>
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <h5 className="text-xs font-bold text-white">General Safety Concerns</h5>
                  <p className="text-amber-400 text-xs font-semibold">safety@behindthescenes.app</p>
                  <p className="text-[10px] text-slate-400">Response time: Within 24 hours</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <h5 className="text-xs font-bold text-white">Child Safety (Designated Contact)</h5>
                  <p className="text-red-400 text-xs font-semibold">childsafety@behindthescenes.app</p>
                  <p className="text-[10px] text-slate-400">Response time: Within 4 hours</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <h5 className="text-xs font-bold text-white">Privacy & Data Requests</h5>
                  <p className="text-blue-400 text-xs font-semibold">privacy@behindthescenes.app</p>
                  <p className="text-[10px] text-slate-400">Response time: Within 48 hours</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <h5 className="text-xs font-bold text-white">Law Enforcement</h5>
                  <p className="text-slate-300 text-xs font-semibold">legal@behindthescenes.app</p>
                  <p className="text-[10px] text-slate-400">For official law enforcement requests only</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
