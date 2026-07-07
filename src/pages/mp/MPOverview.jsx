/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { LedgerStat } from "../../components/ui/LedgerStat";
import { StampBadge } from "../../components/ui/StampBadge";
import { Landmark, ShieldAlert, BarChart3, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
export const MPOverview = () => {
  const { user, setActiveTab } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [priorityQueue, setPriorityQueue] = useState([]);
  async function loadOverview() {
    setLoading(true);
    try {
      const [statsData, complaints] = await Promise.all([
        api.mp.getDashboardStats(),
        api.mp.getAllComplaints()
      ]);
      setStats(statsData);
      const activeComplaints = complaints.filter((c) => c.status !== "RESOLVED");
      const sorted = activeComplaints.sort((a, b) => {
        const scoreA = (a.aiAnalysis?.urgencyScore || 5) * Math.log((a.aiAnalysis?.estimatedImpact || 50) + 1) * (1 + (a.upvotes || 1) / 10);
        const scoreB = (b.aiAnalysis?.urgencyScore || 5) * Math.log((b.aiAnalysis?.estimatedImpact || 50) + 1) * (1 + (b.upvotes || 1) / 10);
        return scoreB - scoreA;
      });
      setPriorityQueue(sorted.slice(0, 4));
    } catch (e) {
      console.error("Error loading MP overview:", e);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadOverview();
  }, []);
  return <div className="max-w-[96%] mx-auto px-4 py-4 md:py-6 animate-fade-in">
      
      {
    /* SECTION 1: HEADER BANNER */
  }
      <div className="bg-ink-navy text-paper rounded-xl p-4 md:p-6 mb-4 relative overflow-hidden border-2 border-marigold/40 shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-saffron via-marigold to-moss" />
        <div className="absolute right-6 -bottom-10 w-44 h-44 text-marigold/5 pointer-events-none">
          <Landmark className="w-full h-full" />
        </div>

        <div className="relative z-10">
          <span className="font-mono text-[10px] text-marigold tracking-[0.25em] uppercase block mb-2 font-bold">
            OFFICIAL LEGISLATIVE COMMAND
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#FAF8F2]">
            MP Command Console — {user?.name}
          </h1>
          <p className="text-sm text-paper/85 mt-2.5 max-w-3xl leading-relaxed">
            Direct coordination portal for constituency-level priority weighting. Review real-time citizen-filed grievances, modify register entries, and publish welfare allocations financed under localized development parameters.
          </p>
        </div>
      </div>

      {
    /* SECTION 2: STATS BLOCKS */
  }
      {loading ? <div className="py-12 text-center text-sm font-mono text-ink-navy/60">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-marigold mb-3" />
          <span>Polling constituency database servers...</span>
        </div> : stats ? <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-2 border-marigold/30 rounded-xl overflow-hidden shadow-lg mb-6 bg-[#F1EDE2]">
            <LedgerStat
              label="Active Priority Cases"
              value={stats.total}
              subtext="ALL-TIME FILED LEDGER"
              indexCode="ALL // 01"
            />
            <LedgerStat
              label="Pending Official Scrutiny"
              value={stats.pending}
              subtext="AWAITING INITIATION"
              indexCode="PND // 02"
            />
            <LedgerStat
              label="Active Field Inspections"
              value={stats.review}
              subtext="STATUS: IN REVIEW"
              indexCode="REV // 03"
            />
            <LedgerStat
              label="Sanctioned &amp; Resolved"
              value={stats.resolved}
              subtext="COMPLETED REGISTER FILES"
              indexCode="RES // 04"
            />
          </div>

          {
    /* SECTION 3: BENTO DETAILS */
  }
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {
    /* Left 2-Column: AI Prioritized Queue */
  }
            <div className="lg:col-span-2 space-y-4">
              
              <div className="india-royal-card rounded-xl p-4 shadow-md">
                <div className="flex justify-between items-center border-b border-ink-navy/10 pb-4 mb-4">
                  <h3 className="font-serif text-lg font-bold text-ink-navy uppercase tracking-tight flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-stamp-red" />
                    <span>Immediate AI Escrapes (Urgency Queue)</span>
                  </h3>
                  <button
    onClick={() => setActiveTab("mp-submissions")}
    className="text-xs font-mono text-ink-navy hover:text-marigold font-bold flex items-center gap-1 cursor-pointer"
  >
                    <span>FULL LEDGER</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-ink-text/75 leading-relaxed mb-6 font-sans">
                  These cases represent the highest weighted grievances in the constituency based on safety urgency, citizen upvote backing, and family impact scores.
                </p>

                {priorityQueue.length > 0 ? <div className="space-y-5">
                    {priorityQueue.map((c) => <div
    key={c.id}
    onClick={() => setActiveTab("mp-submissions")}
    className="bg-white/50 border border-ink-navy/10 rounded-lg p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-marigold transition-colors cursor-pointer relative overflow-hidden"
  >
                        <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-stamp-red" />
                        <div className="max-w-xl pl-2">
                          <div className="flex items-center gap-2 text-[10px] font-mono text-ink-navy/60 mb-1">
                            <span className="font-bold text-ink-navy">{c.entryNumber}</span>
                            <span>•</span>
                            <span className="font-bold uppercase text-marigold">{c.category}</span>
                            <span>•</span>
                            <span>{c.ward}</span>
                          </div>
                          
                          <h4 className="font-serif text-base font-bold text-ink-navy">
                            {c.title}
                          </h4>
                          
                          <p className="text-xs text-ink-text/75 line-clamp-2 mt-1 leading-normal">
                            {c.description}
                          </p>
                          
                          {
    /* AI priorities tag */
  }
                          <div className="flex flex-wrap gap-2 mt-3 text-[10px] font-mono">
                            <span className="bg-stamp-red/5 text-stamp-red border border-stamp-red/20 px-2 py-0.5 rounded font-bold">
                              URGENCY: {c.aiAnalysis?.urgencyScore || 5}/10
                            </span>
                            <span className="bg-ink-navy/5 text-ink-navy border border-ink-navy/10 px-2 py-0.5 rounded font-bold">
                              IMPACT: ~{c.aiAnalysis?.estimatedImpact || 50} FAMILIES
                            </span>
                            <span className="bg-marigold/10 text-amber-800 border border-marigold/20 px-2 py-0.5 rounded font-bold">
                              UPVOTES: {c.upvotes} SUPPORTED
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center self-end md:self-center gap-2">
                          <StampBadge status={c.status} />
                        </div>
                      </div>)}
                  </div> : <div className="py-12 text-center border-2 border-dashed border-ink-navy/10 rounded">
                    <CheckCircle2 className="w-8 h-8 text-moss mx-auto mb-2" />
                    <p className="text-xs font-mono text-ink-navy/60 uppercase font-bold">
                      All constituency grievances resolved. Ledger clear.
                    </p>
                  </div>}
              </div>

            </div>

            {
    /* Right 1-Column: Pure Custom CSS Category Stats Chart */
  }
            <div className="india-royal-card rounded-xl p-6 shadow-md flex flex-col justify-between">
              <div>
                <div className="border-b border-ink-navy/10 pb-3 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-saffron" />
                  <h3 className="font-serif text-lg font-bold text-ink-navy uppercase tracking-tight">
                    Category Distributions
                  </h3>
                </div>

                <p className="text-xs text-ink-text/75 leading-relaxed mb-6 font-sans">
                  Distribution index of logged grievances filtered by primary municipal sectors.
                </p>

                {
    /* Draw custom pure-Tailwind horizontal bar graph */
  }
                <div className="space-y-4">
                  {Object.entries(stats.categoryStats || {}).length > 0 ? Object.entries(stats.categoryStats).map(([cat, cVal]) => {
    const percentage = stats.total > 0 ? cVal.total / stats.total * 100 : 0;
    return <div key={cat} className="space-y-1">
                          <div className="flex justify-between items-center text-xs font-mono">
                            <span className="font-bold text-ink-navy truncate max-w-[160px]" title={cat}>
                              {cat}
                            </span>
                            <span className="text-ink-navy/60 font-bold">
                              {cVal.total} cases ({Math.round(percentage)}%)
                            </span>
                          </div>
                          
                          <div className="w-full h-2.5 bg-ink-navy/5 rounded-full overflow-hidden flex">
                            {
      /* Total bar in marigold */
    }
                            <div
      style={{ width: `${percentage}%` }}
      className="h-full bg-saffron rounded-l-full transition-all duration-500"
    />
                            {
      /* Resolved bar in moss inside the remaining if needed, but simple marigold bar is great */
    }
                          </div>
                          
                          {
      /* Resolved micro-stat */
    }
                          <div className="text-[10px] font-mono text-moss flex justify-between">
                            <span>RESOLVED METRIC:</span>
                            <span className="font-bold">{cVal.resolved} / {cVal.total} Addressing</span>
                          </div>
                        </div>;
  }) : <div className="py-12 text-center text-xs text-ink-navy/50 font-mono uppercase">
                      No category entries logged.
                    </div>}
                </div>
              </div>

              <button
    onClick={() => setActiveTab("mp-submissions")}
    className="w-full border-t border-ink-navy/10 pt-4 mt-8 text-center font-mono text-xs font-bold text-ink-navy hover:text-saffron flex items-center justify-center gap-1 cursor-pointer"
  >
                <span>COMMISSION DETAILED CATEGORY INSIGHT</span>
                <ArrowRight className="w-4 h-4 text-saffron" />
              </button>
            </div>

          </div>
        </> : <div className="py-12 text-center text-xs text-ink-navy/60 font-mono">
          Unable to pull system aggregates. Let's seed DB.
        </div>}

    </div>;
};
