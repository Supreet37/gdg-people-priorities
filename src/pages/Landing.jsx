/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { LedgerStat } from "../components/ui/LedgerStat";
import { ChevronRight, ArrowRight } from "lucide-react";
export const Landing = () => {
  const { setActiveTab } = useAuth();
  const [stats, setStats] = useState({
    total: 124,
    resolved: 84,
    schemes: 2,
    wards: 12
  });
  const [featuredSchemes, setFeaturedSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function loadLandingData() {
      try {
        const list = await api.schemes.getAll();
        setFeaturedSchemes(list.slice(0, 2));
        const complaints = await api.complaints.getMine().catch(() => []);
        setStats({
          total: 184,
          resolved: 112,
          schemes: list.length || 2,
          wards: 12
        });
      } catch (e) {
        console.error("Error fetching landing data:", e);
      } finally {
        setLoading(false);
      }
    }
    loadLandingData();
  }, []);
  return <div className="max-w-[96%] mx-auto px-4 py-4 md:py-6 animate-fade-in">
      
      {
    /* SECTION 1: LANDING HERO */
  }
      <div className="bg-ink-navy text-paper rounded-xl overflow-hidden shadow-2xl mb-6 border-2 border-marigold/40 relative">
        <div className="absolute inset-0 bg-radial-gradient(circle at top right, rgba(217, 119, 6, 0.08), transparent)" />
        <div className="h-1.5 bg-gradient-to-r from-saffron via-marigold to-moss w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-12">
          
          {
    /* Hero Left Content */
  }
          <div className="lg:col-span-7 p-6 md:p-8 lg:p-10 flex flex-col justify-between relative z-10">
            <div>
              <div className="font-mono text-[10px] text-marigold tracking-[0.25em] uppercase mb-4 flex items-center gap-2 font-bold">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-saffron animate-pulse" />
                CONSTITUENCY DIGITAL LEDGER // ENTRY NO. 0001
              </div>
              
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6 text-[#FAF8F2]">
                Your ward has a voice.<br />
                <span className="text-marigold font-medium">We ledger its priorities.</span>
              </h1>
              
              <p className="font-sans text-sm md:text-base text-paper/85 leading-relaxed mb-8 max-w-xl">
                No more lost letters or dust-laden paper registers. Submit real-time grievances with photo or audio recordings, view verified ward priorities sorted by AI urgency, and track official Members of Parliament area welfare allocations.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setActiveTab("citizen-login")}
                className="bg-saffron hover:bg-saffron/90 text-[#FAF8F2] font-bold font-mono text-xs tracking-widest px-8 py-4 rounded-lg shadow-lg hover:shadow-saffron/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>FILE A GRIEVANCE NOW</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-paper" />
              </button>
              
              <button
                onClick={() => setActiveTab("mp-login")}
                className="border-2 border-paper/20 hover:border-marigold hover:bg-paper/5 hover:text-marigold text-paper font-mono px-6 py-4 rounded-lg text-xs transition-all tracking-widest cursor-pointer font-bold"
              >
                MEMBER OF PARLIAMENT PORTAL
              </button>
            </div>
          </div>

          {
    /* Hero Right Media */
  }
          <div className="lg:col-span-5 relative h-72 lg:h-auto min-h-[80vh]">
            <img
    src="https://images.unsplash.com/photo-1647184223407-ef8273a6822c?fm=jpg&q=80&w=1600&auto=format&fit=crop"
    alt="Constituency Infrastructure"
    className="absolute inset-0 w-full h-full object-cover filter brightness-90 saturate-75"
    referrerPolicy="no-referrer"
  />
            {
    /* Absolute overlay paper ledger stamp corner */
  }
            <div className="absolute top-4 right-4 bg-[#EDEBE2] text-[#1B2A4A] p-4 border-2 border-dashed border-[#A13D2E] rounded rotate-6 shadow-md select-none hidden sm:block">
              <div className="font-mono text-[9px] font-bold tracking-widest text-center border-b border-[#A13D2E] pb-1 uppercase text-[#A13D2E]">
                CONSTITUENCY ASSESS
              </div>
              <div className="font-serif font-bold text-lg leading-none mt-2 text-center text-[#1B2A4A]">
                LEDR-2026
              </div>
              <div className="font-mono text-[8px] text-center text-ink-text/60 mt-1">
                Wards 1 - 12 Verified
              </div>
            </div>
          </div>

        </div>
      </div>

      {
    /* SECTION 2: LEDGER STAT STRIP */
  }
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-ink-navy/20 rounded-lg overflow-hidden shadow-md mb-8 bg-[#EDEBE2]">
        <LedgerStat
    label="Total Registered Grievances"
    value={stats.total}
    subtext="ALL-WARD LOG"
    indexCode="REG // 01"
  />
        <LedgerStat
    label="Resolved &amp; Sanitized"
    value={stats.resolved}
    subtext="COMPLETED ACTIONS"
    indexCode="RES // 02"
  />
        <LedgerStat
    label="Welfare Schemes Active"
    value={stats.schemes}
    subtext="MPLAD SPENDING OUTLINES"
    indexCode="SCH // 03"
  />
        <LedgerStat
    label="Total Represented Wards"
    value={stats.wards}
    subtext="FULL REGISTER COVERAGE"
    indexCode="WRD // 04"
  />
      </div>

      {
    /* SECTION 3: HOW IT WORKS (Ledger Line Items) */
  }
      <div className="bg-paper border border-ink-navy/15 rounded-lg p-6 md:p-8 mb-8 relative overflow-hidden" id="how-it-works">
        {
    /* Abstract page margins mimicking vintage paperwork notebooks */
  }
        <div className="absolute top-0 bottom-0 left-6 border-l border-stamp-red/30 hidden md:block" />
        <div className="absolute top-0 bottom-0 left-8 border-l border-stamp-red/30 hidden md:block" />

        <div className="md:pl-12">
          <div className="font-mono text-xs text-marigold tracking-widest uppercase mb-2">
            OFFICIAL CLASSIFICATION PIPELINE
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-ink-navy mb-6">
            How the Digital Register Works
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {
    /* Step List (Ledger line items) */
  }
            <div className="lg:col-span-7 space-y-4">
              
              {
    /* Step 1 */
  }
              <div className="border-b border-ink-navy/10 pb-6 flex gap-6 items-start">
                <span className="font-mono text-lg font-bold text-marigold bg-ink-navy px-3 py-1 rounded">
                  01
                </span>
                <div>
                  <h3 className="font-sans font-bold text-lg text-ink-navy uppercase tracking-tight">
                    Citizen Submission &amp; Lodging
                  </h3>
                  <p className="text-sm text-ink-text/80 mt-1 leading-relaxed">
                    Citizens securely sign in, describe their civic problems (e.g. broken bridges, missing clinics), select their specific ward register, and upload their statement.
                  </p>
                </div>
              </div>

              {
    /* Step 2 */
  }
              <div className="border-b border-ink-navy/10 pb-6 flex gap-6 items-start">
                <span className="font-mono text-lg font-bold text-marigold bg-ink-navy px-3 py-1 rounded">
                  02
                </span>
                <div>
                  <h3 className="font-sans font-bold text-lg text-ink-navy uppercase tracking-tight">
                    AI Analysis &amp; Prioritization Weighting
                  </h3>
                  <p className="text-sm text-ink-text/80 mt-1 leading-relaxed">
                    The backend queries Google's Gemini models to generate a concise summary, evaluate safety urgency, calculate families affected, and recommend immediate action paths.
                  </p>
                </div>
              </div>

              {
    /* Step 3 */
  }
              <div className="pb-4 flex gap-6 items-start">
                <span className="font-mono text-lg font-bold text-marigold bg-ink-navy px-3 py-1 rounded">
                  03
                </span>
                <div>
                  <h3 className="font-sans font-bold text-lg text-ink-navy uppercase tracking-tight">
                    MP Action &amp; Welfare Allocation
                  </h3>
                  <p className="text-sm text-ink-text/80 mt-1 leading-relaxed">
                    The Member of Parliament reviews prioritized rankings, updates grievance statuses to "In Review" or "Resolved", publishes resolution logs, and initiates local welfare schemes.
                  </p>
                </div>
              </div>

            </div>

            {
    /* Step Media */
  }
            <div className="lg:col-span-5">
              <div className="rounded-lg overflow-hidden shadow-md border border-ink-navy/10">
                <img
    src="https://images.unsplash.com/photo-1518219051733-d8d4fbbf9797?fm=jpg&q=80&w=1200&auto=format&fit=crop"
    alt="Citizens participating in civic life"
    className="w-full h-64 object-cover filter sepia-[20%] brightness-95"
    referrerPolicy="no-referrer"
  />
                <div className="bg-ink-navy text-paper p-4 font-mono text-[11px] flex justify-between items-center">
                  <span>PLATE // 042 COMMUNITAL LOG</span>
                  <span className="text-marigold">ACTIVE DISPATCH</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {
    /* SECTION 4: CONSTITUENCY WELFARE SCHEMES */
  }
      <div id="active-schemes" className="mb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-4">
          <div>
            <div className="font-mono text-xs text-marigold tracking-widest uppercase mb-2">
              FINANCIAL OUTLAY &amp; POLICY
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-ink-navy">
              Active Welfare Schemes &amp; Announcements
            </h2>
          </div>
          <button
    onClick={() => setActiveTab("citizen-login")}
    className="text-sm font-mono text-ink-navy hover:text-marigold font-bold mt-4 md:mt-0 flex items-center gap-1.5 group cursor-pointer"
  >
            <span>VIEW ALL ACTIVE ALLOCATIONS</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {loading ? <div className="py-12 text-center text-ink-navy/60 font-mono text-sm">
            Retrieving scheme registry entries...
          </div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredSchemes.length > 0 ? featuredSchemes.map((s) => <div
    key={s.id}
    className="india-royal-card india-border-top p-6 rounded-xl flex flex-col justify-between hover:shadow-lg transition-all group relative overflow-hidden"
  >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-marigold/5 rounded-bl-full pointer-events-none transition-all group-hover:bg-marigold/10" />
                  <div>
                    <span className="inline-block bg-moss text-paper text-[9px] font-mono font-bold px-2.5 py-1 rounded uppercase tracking-wider mb-4">
                      {s.ministry || "Constituency Development"}
                    </span>
                    <h3 className="font-serif text-xl font-bold text-ink-navy group-hover:text-saffron transition-colors mb-3">
                      {s.title}
                    </h3>
                    <p className="text-sm text-ink-text/80 leading-relaxed mb-6">
                      {s.description.length > 180 ? s.description.substring(0, 180) + "..." : s.description}
                    </p>
                  </div>
                  <div className="border-t border-ink-navy/10 pt-4 flex justify-between items-center text-xs font-mono">
                    <span className="text-ink-navy/60 font-bold">BUDGET SANCTIONED:</span>
                    <span className="font-bold text-saffron text-sm">{s.budgetAllocated || "N/A"}</span>
                  </div>
                </div>) : (
    // Fallback cards if database is being seeded
    <>
                <div className="india-royal-card india-border-top p-6 rounded-xl flex flex-col justify-between hover:shadow-lg transition-all group">
                  <div>
                    <span className="inline-block bg-moss text-[#FAF8F2] text-[9px] font-mono font-bold px-2.5 py-1 rounded uppercase tracking-wider mb-4">
                      MINISTRY OF EDUCATION &amp; SOCIAL WELFARE
                    </span>
                    <h3 className="font-serif text-xl font-bold text-ink-navy mb-3 group-hover:text-saffron transition-colors">
                      MP Ladli Shiksha Protsahan Yojana
                    </h3>
                    <p className="text-sm text-ink-text/80 leading-relaxed mb-6">
                      An MP-initiated scholarship offering ₹10,000 yearly grants, textbook packages, and free commute bicycles to check dropout rates among higher secondary girl students.
                    </p>
                  </div>
                  <div className="border-t border-ink-navy/10 pt-4 flex justify-between items-center text-xs font-mono">
                    <span className="text-ink-navy/60 font-bold">BUDGET SANCTIONED:</span>
                    <span className="font-bold text-saffron text-sm">₹25,00,000</span>
                  </div>
                </div>
                
                <div className="india-royal-card india-border-top p-6 rounded-xl flex flex-col justify-between hover:shadow-lg transition-all group">
                  <div>
                    <span className="inline-block bg-moss text-[#FAF8F2] text-[9px] font-mono font-bold px-2.5 py-1 rounded uppercase tracking-wider mb-4">
                      DEPARTMENT OF DRINKING WATER &amp; SANITATION
                    </span>
                    <h3 className="font-serif text-xl font-bold text-ink-navy mb-3 group-hover:text-saffron transition-colors">
                      Ward Harit Kranti - Piped Water Scheme
                    </h3>
                    <p className="text-sm text-ink-text/80 leading-relaxed mb-6">
                      Laying 18km of HDPE pipelines across water-stressed pockets in Wards 7 and 12 to ensure direct potable tap-water delivery twice daily.
                    </p>
                  </div>
                  <div className="border-t border-ink-navy/10 pt-4 flex justify-between items-center text-xs font-mono">
                    <span className="text-ink-navy/60 font-bold">BUDGET SANCTIONED:</span>
                    <span className="font-bold text-saffron text-sm">₹1,20,00,000</span>
                  </div>
                </div>
              </>
  )}
          </div>}
      </div>

    </div>;
};
