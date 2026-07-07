/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { LedgerStat } from "../../components/ui/LedgerStat";
import { StampBadge } from "../../components/ui/StampBadge";
import { ChevronRight, FileText, Gift, Landmark, ListTodo, PlusCircle } from "lucide-react";
export const CitizenDashboard = () => {
  const { user, setActiveTab } = useAuth();
  const [myComplaints, setMyComplaints] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [complaintsData, schemesData] = await Promise.all([
          api.complaints.getMine(),
          api.schemes.getAll()
        ]);
        setMyComplaints(complaintsData);
        setSchemes(schemesData.slice(0, 2));
      } catch (e) {
        console.error("Error loading citizen dashboard data:", e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);
  const totalMyComplaints = myComplaints.length;
  const resolvedMyComplaints = myComplaints.filter((c) => c.status === "RESOLVED").length;
  const pendingMyComplaints = myComplaints.filter((c) => c.status !== "RESOLVED").length;
  return <div className="max-w-[96%] mx-auto px-4 py-4 md:py-6">
      
      {
    /* SECTION 1: HEADER & GREETINGS */
  }
      <div className="bg-paper border border-ink-navy/15 rounded-lg p-4 md:p-6 mb-4 relative overflow-hidden shadow-sm">
        {
    /* Absolute seal stamp decoration */
  }
        <div className="absolute -right-6 -bottom-6 w-32 h-32 text-ink-navy/5 pointer-events-none">
          <Landmark className="w-full h-full" />
        </div>

        <div>
          <span className="font-mono text-xs text-marigold tracking-widest uppercase block mb-1">
            CONSTITUENCY PRIMARY RESIDENT INDEX
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-ink-navy">
            Welcome, {user?.name}
          </h1>
          <p className="text-sm text-ink-text/75 mt-1 max-w-2xl leading-relaxed">
            You are registered as a primary resident of <span className="font-bold text-ink-navy">{user?.ward}</span>. This workspace serves as your direct digital pipeline to track, upvote, and lodge localized priority concerns.
          </p>
        </div>
      </div>

      {
    /* SECTION 2: PERSONAL STATISTICS */
  }
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-ink-navy/20 rounded-lg overflow-hidden shadow mb-6 bg-[#EDEBE2]">
        <LedgerStat
    label="My Registered Grievances"
    value={totalMyComplaints}
    subtext="INDEXED LEDGER ENTRIES"
    indexCode="MYG // 01"
  />
        <LedgerStat
    label="My Resolved Grievances"
    value={resolvedMyComplaints}
    subtext="RESOLVED &amp; ADDRESSED"
    indexCode="MYR // 02"
  />
        <LedgerStat
    label="Pending Immediate Action"
    value={pendingMyComplaints}
    subtext="UNDER SYSTEM SCRUTINY"
    indexCode="MYP // 03"
  />
        <LedgerStat
    label="My Local Ward Code"
    value={user?.ward ? user.ward.split(" ")[1] || "07" : "07"}
    subtext={user?.ward || "WARD 7"}
    indexCode="WRD // 04"
  />
      </div>

      {
    /* SECTION 3: QUICK BENTO TILES */
  }
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        
        {
    /* Left 2 Column: Action Guide + Recent Tracker */
  }
        <div className="lg:col-span-2 space-y-4">
          
          {
    /* Action Guide Banner */
  }
          <div className="bg-ink-navy text-paper p-4 rounded-lg shadow border border-ink-navy/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="max-w-md">
              <span className="font-mono text-[10px] text-marigold tracking-widest block font-bold mb-1">
                LODGING MODULE
              </span>
              <h3 className="font-serif text-xl font-bold mb-2">
                Have an active ward infrastructure concern?
              </h3>
              <p className="text-xs text-paper/85 leading-relaxed">
                Damaged roads, open drains, power shortages, or sanitation issues can be registered instantly. Our Gemini AI engine will parse details and escalate to ward engineers.
              </p>
            </div>
            <button
    onClick={() => setActiveTab("citizen-submit")}
    className="bg-marigold hover:bg-amber-600 text-ink-navy font-bold text-xs font-mono tracking-wider px-5 py-3 rounded uppercase shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 shadow"
  >
              <PlusCircle className="w-4 h-4" />
              <span>FILE REGISTER ENTRY</span>
            </button>
          </div>

          {
    /* Recent Complaint List */
  }
          <div className="bg-paper border border-ink-navy/15 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center border-b border-ink-navy/10 pb-4 mb-4">
              <h3 className="font-serif text-lg font-bold text-ink-navy uppercase tracking-tight flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-marigold" />
                <span>My Active Registry Items</span>
              </h3>
              <button
    onClick={() => setActiveTab("citizen-complaints")}
    className="text-xs font-mono text-ink-navy hover:text-marigold font-bold cursor-pointer"
  >
                VIEW FULL TRACKER
              </button>
            </div>

            {loading ? <div className="py-12 text-center text-xs font-mono text-ink-navy/40">
                Polling register indices...
              </div> : myComplaints.length > 0 ? <div className="space-y-4">
                {myComplaints.slice(0, 3).map((c) => <div
    key={c.id}
    onClick={() => setActiveTab("citizen-complaints")}
    className="bg-white/40 border border-ink-navy/10 rounded p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-marigold transition-colors cursor-pointer"
  >
                    <div className="max-w-xl">
                      <div className="flex items-center gap-2 text-xs font-mono text-ink-navy/60 mb-1">
                        <span className="font-bold text-ink-navy">{c.entryNumber}</span>
                        <span>•</span>
                        <span>{c.category}</span>
                        <span>•</span>
                        <span>{new Date(c.date).toLocaleDateString()}</span>
                      </div>
                      <h4 className="font-serif text-base font-bold text-ink-navy truncate">
                        {c.title}
                      </h4>
                      <p className="text-xs text-ink-text/75 line-clamp-1 mt-1">
                        {c.description}
                      </p>
                    </div>
                    
                    <div className="shrink-0 flex items-center gap-3">
                      {
    /* Signature Rotated Stamp Badge */
  }
                      <StampBadge status={c.status} />
                      <ChevronRight className="w-5 h-5 text-ink-navy/40" />
                    </div>
                  </div>)}
              </div> : <div className="py-12 text-center border-2 border-dashed border-ink-navy/10 rounded bg-[#EDEBE2]/20">
                <FileText className="w-8 h-8 text-ink-navy/30 mx-auto mb-2" />
                <p className="text-xs font-mono text-ink-navy/60 uppercase">
                  No active grievances lodged on your register leaf.
                </p>
                <button
    onClick={() => setActiveTab("citizen-submit")}
    className="text-xs font-mono text-marigold hover:text-amber-600 font-bold mt-2 cursor-pointer"
  >
                  FILE YOUR FIRST COMPLAINT NOW
                </button>
              </div>}
          </div>

        </div>

        {
    /* Right 1 Column: Featured Schemes Widget */
  }
        <div className="bg-paper border border-ink-navy/15 rounded-lg p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="border-b border-ink-navy/10 pb-3 mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5 text-marigold" />
              <h3 className="font-serif text-lg font-bold text-ink-navy uppercase tracking-tight">
                Active Welfare Programs
              </h3>
            </div>

            <p className="text-xs text-ink-text/75 leading-relaxed mb-6 font-sans">
              Explore ongoing constituency-level welfare programs financed under localized MP development allocations and state social commissions.
            </p>

            {loading ? <div className="py-8 text-center text-xs font-mono text-ink-navy/40">
                Polling social registers...
              </div> : <div className="space-y-5">
                {schemes.map((s) => <div key={s.id} className="border-b border-ink-navy/5 pb-4 last:border-b-0">
                    <h4 className="font-serif text-sm font-bold text-ink-navy hover:text-marigold transition-colors">
                      {s.title}
                    </h4>
                    <p className="text-xs text-ink-text/70 line-clamp-2 mt-1 leading-normal">
                      {s.description}
                    </p>
                    <div className="flex justify-between items-center mt-2 text-[10px] font-mono text-ink-navy/55">
                      <span>BUDGET: {s.budgetAllocated || "N/A"}</span>
                      <button
    onClick={() => setActiveTab("citizen-schemes")}
    className="text-marigold hover:underline font-bold"
  >
                        DETAILS
                      </button>
                    </div>
                  </div>)}
              </div>}
          </div>

          <button
    onClick={() => setActiveTab("citizen-schemes")}
    className="w-full border-t border-ink-navy/10 pt-4 mt-6 text-center font-mono text-xs font-bold text-ink-navy hover:text-marigold flex items-center justify-center gap-1 cursor-pointer"
  >
            <span>VIEW ALL ACTIVE SCHEMES</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>;
};
