import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ShieldAlert, 
  DollarSign, 
  LifeBuoy, 
  Megaphone, 
  CheckCircle, 
  Ban, 
  AlertTriangle, 
  UserCheck, 
  X, 
  Clock, 
  Search, 
  Plus, 
  TrendingUp,
  CreditCard,
  Phone,
  RefreshCw,
  Eye
} from 'lucide-react';
import { 
  INITIAL_REPORTS, 
  INITIAL_REFUNDS, 
  INITIAL_SUPPORT_TICKETS, 
  INITIAL_SPONSORED_ADS 
} from '../data/adminData';

export default function AdminConsole({ onClose }) {
  const [activeTab, setActiveTab] = useState('reports'); // reports | refunds | support | ads | verification
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [refunds, setRefunds] = useState(INITIAL_REFUNDS);
  const [supportTickets, setSupportTickets] = useState(INITIAL_SUPPORT_TICKETS);
  const [ads, setAds] = useState(INITIAL_SPONSORED_ADS);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionNotice, setActionNotice] = useState(null);

  // Trigger feedback banner
  const notify = (msg) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  // Report actions
  const handleResolveReport = (reportId, action) => {
    setReports(prev => prev.map(r => {
      if (r.id === reportId) {
        return { ...r, status: `Resolved (${action})` };
      }
      return r;
    }));
    notify(`Action executed: ${action} for report ${reportId}`);
  };

  // Refund actions
  const handleProcessRefund = (refundId, status) => {
    setRefunds(prev => prev.map(rf => {
      if (rf.id === refundId) {
        return { ...rf, status };
      }
      return rf;
    }));
    notify(`Refund ${refundId} marked as ${status}`);
  };

  // Ad toggle
  const toggleAdActive = (adId) => {
    setAds(prev => prev.map(ad => {
      if (ad.id === adId) {
        return { ...ad, active: !ad.active };
      }
      return ad;
    }));
    notify('Ad campaign status updated');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#090b10] text-slate-100 flex flex-col overflow-hidden animate-in fade-in">
      
      {/* Top Admin Bar */}
      <header className="px-6 py-3.5 border-b border-white/10 bg-[#10131c] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to App</span>
          </button>
          
          <div className="h-4 w-[1px] bg-white/10" />

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-red-600 text-white flex items-center justify-center font-black text-xs">
              ⚡
            </div>
            <div>
              <h1 className="font-extrabold text-sm text-white tracking-wide">BTS COMMAND CENTER</h1>
              <p className="text-[10px] text-emerald-400 font-semibold uppercase -mt-0.5">Admin & Trust Ops</p>
            </div>
          </div>
        </div>

        {/* Global Stats Counter */}
        <div className="hidden md:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-xl border border-white/5">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span className="text-slate-400">Open Reports:</span>
            <strong className="text-red-400">{reports.filter(r => r.status.includes('Pending')).length}</strong>
          </div>
          <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-xl border border-white/5">
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Pending Refunds:</span>
            <strong className="text-amber-400">{refunds.filter(rf => rf.status.includes('Pending')).length}</strong>
          </div>
          <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-xl border border-white/5">
            <Megaphone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Active Ads:</span>
            <strong className="text-emerald-400">{ads.filter(a => a.active).length}</strong>
          </div>
        </div>
      </header>

      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="bg-emerald-600 text-black px-4 py-2 text-xs font-black text-center shadow-lg animate-in slide-in-from-top">
          ✓ {actionNotice}
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="px-6 py-2.5 border-b border-white/10 bg-[#0d0f17] flex items-center gap-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'reports' 
              ? 'bg-red-500 text-white shadow-md shadow-red-500/20' 
              : 'bg-white/5 text-slate-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Reports & Catfish Desk</span>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-black/30">
            {reports.filter(r => r.status.includes('Pending')).length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('refunds')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'refunds' 
              ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20' 
              : 'bg-white/5 text-slate-400 hover:text-white'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>MoMo & Card Refunds</span>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-black/30 text-white">
            {refunds.filter(rf => rf.status.includes('Pending')).length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'support' 
              ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' 
              : 'bg-white/5 text-slate-400 hover:text-white'
          }`}
        >
          <LifeBuoy className="w-3.5 h-3.5" />
          <span>Support Inquiries</span>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-black/30">
            {supportTickets.filter(t => t.status === 'Open').length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ads')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'ads' 
              ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-black' 
              : 'bg-white/5 text-slate-400 hover:text-white'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5" />
          <span>Sponsored Entertainment Ads</span>
        </button>
      </div>

      {/* Main Tab Views */}
      <div className="flex-1 overflow-y-auto p-6 max-w-6xl w-full mx-auto">
        
        {/* TAB 1: REPORTS & CATFISH MODERATION */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-white">Safety Reports & Catfish Investigation Queue</h2>
                <p className="text-xs text-slate-400">Review flagged users, review reported evidence, and enforce moderation</p>
              </div>
            </div>

            <div className="grid gap-3">
              {reports.map(rep => (
                <div key={rep.id} className="p-4 rounded-2xl bg-[#131622] border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        rep.severity === 'Critical' ? 'bg-red-500 text-white' :
                        rep.severity === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' :
                        'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                      }`}>
                        {rep.severity}
                      </span>
                      <h3 className="text-sm font-bold text-white">
                        Reported User: <span className="text-amber-400 font-extrabold">{rep.reportedUser}</span>
                      </h3>
                      <span className="text-xs text-slate-400">({rep.reportedUserId})</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{rep.timestamp}</span>
                      <span className="px-2 py-0.5 rounded-lg bg-black/40 border border-white/10 font-bold text-slate-300">
                        {rep.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/30 border border-white/5 mb-3 text-xs space-y-1">
                    <div className="text-slate-400">
                      <strong className="text-slate-200">Violation Reason:</strong> {rep.reason}
                    </div>
                    <div className="text-slate-400">
                      <strong className="text-slate-200">Evidence / Complainant Note:</strong> "{rep.evidence}"
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Filed by: {rep.reportedBy}
                    </div>
                  </div>

                  {/* Moderation Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5">
                    <button 
                      onClick={() => handleResolveReport(rep.id, 'Permanent Ban')}
                      className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500 border border-red-500/40 hover:text-white text-xs font-bold text-red-300 transition-all flex items-center gap-1.5"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Ban Account</span>
                    </button>

                    <button 
                      onClick={() => handleResolveReport(rep.id, '7-Day Suspension')}
                      className="px-3 py-1.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-xs font-bold text-orange-300 transition-all flex items-center gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Suspend 7 Days</span>
                    </button>

                    <button 
                      onClick={() => handleResolveReport(rep.id, 'Formal Warning')}
                      className="px-3 py-1.5 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/40 text-xs font-bold text-yellow-300 transition-all"
                    >
                      Issue Warning
                    </button>

                    <button 
                      onClick={() => handleResolveReport(rep.id, 'Dismissed / False Report')}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-400 hover:text-white transition-all ml-auto"
                    >
                      Dismiss Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: REFUNDS & FINANCIAL DESK */}
        {activeTab === 'refunds' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-black text-white">Refund Approvals & Payment Operations</h2>
              <p className="text-xs text-slate-400">Process return of funds across MTN MoMo, Telecel Cash, and Stripe</p>
            </div>

            <div className="grid gap-3">
              {refunds.map(rf => (
                <div key={rf.id} className="p-4 rounded-2xl bg-[#131622] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white">{rf.user}</span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-bold">
                        {rf.amount}
                      </span>
                      <span className="text-[11px] text-slate-400">({rf.channel})</span>
                    </div>

                    <p className="text-xs text-slate-300">
                      Product: <strong>{rf.product}</strong> • Destination: <code>{rf.phoneOrCard}</code>
                    </p>
                    <p className="text-xs text-slate-400 italic">
                      Reason: "{rf.reason}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {rf.status.includes('Approved') ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
                        ✓ Approved & Settled
                      </span>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleProcessRefund(rf.id, 'Approved & Processed')}
                          className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-extrabold text-xs hover:bg-emerald-400 transition-all flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approve Refund</span>
                        </button>

                        <button 
                          onClick={() => handleProcessRefund(rf.id, 'Rejected')}
                          className="px-3 py-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-xs font-bold text-slate-400 hover:text-red-400 border border-white/10 transition-all"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOMER SUPPORT INBOX */}
        {activeTab === 'support' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-black text-white">Support & User Help Desk</h2>
              <p className="text-xs text-slate-400">Respond to technical tickets, verification issues, and user requests</p>
            </div>

            <div className="grid gap-3">
              {supportTickets.map(tkt => (
                <div key={tkt.id} className="p-4 rounded-2xl bg-[#131622] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-blue-400">{tkt.id}</span>
                      <h3 className="text-sm font-bold text-white">{tkt.subject}</h3>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      tkt.status === 'Open' ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {tkt.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">
                    User: <strong>{tkt.user}</strong> • Category: {tkt.category}
                  </p>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-400">
                    "{tkt.lastMessage}"
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button 
                      onClick={() => notify(`Quick reply sent to ${tkt.user}`)}
                      className="px-3 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs"
                    >
                      Reply to User
                    </button>
                    <button 
                      onClick={() => {
                        setSupportTickets(prev => prev.map(t => t.id === tkt.id ? { ...t, status: 'Resolved' } : t));
                        notify(`Ticket ${tkt.id} closed`);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold"
                    >
                      Mark as Resolved
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SPONSORED ENTERTAINMENT ADS */}
        {activeTab === 'ads' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-white">Entertainment Program Sponsorships & In-Feed Ads</h2>
                <p className="text-xs text-slate-400">Promote festivals, concerts, date spots, and VIP nightlife passes</p>
              </div>

              <button 
                onClick={() => notify('New Ad Campaign Creator opened')}
                className="px-3.5 py-2 rounded-xl bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-400/20 hover:bg-emerald-300"
              >
                <Plus className="w-4 h-4" />
                <span>New Campaign</span>
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {ads.map(ad => (
                <div key={ad.id} className="rounded-2xl bg-[#131622] border border-white/10 overflow-hidden flex flex-col">
                  <div className="relative h-44 w-full bg-slate-900">
                    <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-amber-400/40 text-[10px] font-black text-amber-300 uppercase">
                      {ad.badge}
                    </div>
                    <div className="absolute top-3 right-3">
                      <button 
                        onClick={() => toggleAdActive(ad.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                          ad.active 
                            ? 'bg-emerald-500 text-black' 
                            : 'bg-slate-800 text-slate-400 border border-white/10'
                        }`}
                      >
                        {ad.active ? '● LIVE IN APP' : 'PAUSED'}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                        {ad.sponsorName} • {ad.category}
                      </div>
                      <h3 className="text-base font-extrabold text-white">{ad.title}</h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{ad.description}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/30 text-xs text-amber-300 font-semibold">
                      🎁 {ad.perk}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
                      <span>{ad.dates}</span>
                      <span>📍 {ad.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
