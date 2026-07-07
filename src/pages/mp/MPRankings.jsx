/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { Calculator, HelpCircle, Loader2, Database, Sparkles, AlertCircle, FileText, ChevronRight, TrendingUp, Users, ArrowRight } from "lucide-react";

// Static public datasets (resembling data.gov.in, Census, and Ministry databases)
const PUBLIC_DATASETS = [
  { ward: "Ward 1 - Sahadevkhunta", pop: "14,500", schoolDist: "2.1", waterCoverage: "85%", docRatio: "1:1500", roadDefectIndex: "Low" },
  { ward: "Ward 2 - Mallikashpur", pop: "18,200", schoolDist: "1.8", waterCoverage: "78%", docRatio: "1:2200", roadDefectIndex: "Medium" },
  { ward: "Ward 3 - Kuruda", pop: "12,100", schoolDist: "4.2", waterCoverage: "60%", docRatio: "1:3100", roadDefectIndex: "Low" },
  { ward: "Ward 4 - Station Road", pop: "22,400", schoolDist: "3.1", waterCoverage: "72%", docRatio: "1:1900", roadDefectIndex: "High" },
  { ward: "Ward 5 - Azimabad", pop: "19,800", schoolDist: "2.5", waterCoverage: "90%", docRatio: "1:1200", roadDefectIndex: "Low" },
  { ward: "Ward 6 - Nua Bazar", pop: "15,600", schoolDist: "2.8", waterCoverage: "80%", docRatio: "1:1800", roadDefectIndex: "Medium" },
  { ward: "Ward 7 - Somanathpur", pop: "28,900", schoolDist: "6.5", waterCoverage: "45%", docRatio: "1:4800", roadDefectIndex: "High" },
  { ward: "Ward 8 - Phuladi", pop: "31,200", schoolDist: "5.8", waterCoverage: "30%", docRatio: "1:5200", roadDefectIndex: "High" },
  { ward: "Ward 9 - Angargadia", pop: "16,400", schoolDist: "3.4", waterCoverage: "65%", docRatio: "1:2400", roadDefectIndex: "Medium" },
  { ward: "Ward 10 - Sunhat", pop: "13,900", schoolDist: "2.2", waterCoverage: "88%", docRatio: "1:1400", roadDefectIndex: "Low" },
  { ward: "Ward 11 - Arad Bazar", pop: "17,100", schoolDist: "4.9", waterCoverage: "52%", docRatio: "1:3500", roadDefectIndex: "Medium" },
  { ward: "Ward 12 - Gopalgaon", pop: "24,500", schoolDist: "5.1", waterCoverage: "35%", docRatio: "1:4100", roadDefectIndex: "High" }
];

const FUNDING_RECOMMENDATIONS = [
  {
    id: "rec_1",
    title: "Ward 7 School Expansion Grant vs. Vocational Center",
    category: "Education",
    ward: "Ward 7 - Somanathpur",
    demandLevel: "High (12 requests, 180 citizen upvotes)",
    datasetFact: "Census/UDISE database indicates children travel over 6.5km. Nearest school is currently at 145% enrollment capacity limit.",
    recommendation: "Recommending ₹45 Lakhs from MPLAD fund to expand primary school classrooms in Somanathpur, rather than a vocational center. Travel distance and capacity bottlenecks present immediate child safety hazards.",
    urgency: "HIGH PRIORITY",
    impact: "~450 Households benefited"
  },
  {
    id: "rec_2",
    title: "Ward 8 High-Yield Deep Borewell & Distribution Grid",
    category: "Water Supply",
    ward: "Ward 8 - Phuladi",
    demandLevel: "Extreme (22 requests, 310 citizen upvotes)",
    datasetFact: "Ministry of Water Resources map indicates 30% piped water supply coverage with static groundwater table drop of -18m.",
    recommendation: "Approve ₹32 Lakhs for localized high-yield solar solar tube-wells and primary trunk mains. High density of informal settlers in Phuladi suffer persistent drinking shortages.",
    urgency: "CRITICAL PRIORITY",
    impact: "~800 Families benefited"
  },
  {
    id: "rec_3",
    title: "Ward 4 Pothole Repair & Asphalt Overhaul",
    category: "Roads",
    ward: "Ward 4 - Station Road",
    demandLevel: "High (15 requests, 120 citizen upvotes)",
    datasetFact: "State PWD Pothole Index rating for Station Road Arterial is 'Severe' with average accident incidents of 4.2 per month.",
    recommendation: "Direct Public Works Commissioner to initiate emergency cold-mix re-paving on Link Road 3 (Estimated budget ₹18 Lakhs). Recommended action prevents transit injuries and cargo delays.",
    urgency: "MEDIUM PRIORITY",
    impact: "~1,200 Commuters daily"
  }
];

export const MPRankings = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState("prioritized");

  async function loadComplaints() {
    setLoading(true);
    try {
      const data = await api.mp.getAllComplaints();
      setComplaints(data);
    } catch (e) {
      console.error("Error loading MP complaints:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComplaints();
  }, []);

  const activeComplaints = complaints.filter((c) => c.status !== "RESOLVED");

  const ranked = activeComplaints.map((c) => {
    const urgency = c.aiAnalysis?.urgencyScore || 5;
    const impact = c.aiAnalysis?.estimatedImpact || 50;
    const upvotes = c.upvotes || 1;
    const lnImpact = Math.log(impact + 1);
    const multiplier = 1 + upvotes / 20;
    const score = Number((urgency * lnImpact * multiplier).toFixed(1));
    return {
      ...c,
      calculatedScore: score,
      formulaParts: {
        urgency,
        impact,
        upvotes,
        lnImpact: Number(lnImpact.toFixed(2)),
        multiplier: Number(multiplier.toFixed(2))
      }
    };
  }).sort((a, b) => b.calculatedScore - a.calculatedScore);

  return (
    <div className="max-w-[96%] mx-auto px-4 py-4 md:py-6">
      {/* Page Header */}
      <div className="border-b border-ink-navy/10 pb-3 mb-4">
        <span className="font-mono text-[10px] text-marigold tracking-widest uppercase block mb-1">
          DECISION MATRIX
        </span>
        <h1 className="font-serif text-3xl font-bold text-ink-navy">
          Constituency Action Prioritization Index
        </h1>
        <p className="text-sm text-ink-text/75 mt-1">
          Review complaints sorted by mathematical prioritization score. This scientific coefficient balances urgency, community impact scope, and citizen endorsement backing.
        </p>
      </div>

      {/* Segmented Navigation Tabs */}
      <div className="flex border border-ink-navy/15 rounded-lg overflow-hidden mb-4 bg-paper font-mono text-xs font-bold">
        <button
          onClick={() => setActiveSubTab("prioritized")}
          className={`flex-1 py-3 text-center transition-colors flex justify-center items-center gap-2 ${activeSubTab === "prioritized" ? "bg-ink-navy text-paper" : "text-ink-navy/70 hover:bg-white/45"}`}
        >
          <TrendingUp className="w-4 h-4" />
          PRIORITIZED GRIEVANCES ({ranked.length})
        </button>
        <button
          onClick={() => setActiveSubTab("datasets")}
          className={`flex-1 py-3 text-center transition-colors flex justify-center items-center gap-2 border-x border-ink-navy/10 ${activeSubTab === "datasets" ? "bg-ink-navy text-paper" : "text-ink-navy/70 hover:bg-white/45"}`}
        >
          <Database className="w-4 h-4" />
          PUBLIC DATASETS &amp; GAPS
        </button>
        <button
          onClick={() => setActiveSubTab("recommendations")}
          className={`flex-1 py-3 text-center transition-colors flex justify-center items-center gap-2 ${activeSubTab === "recommendations" ? "bg-ink-navy text-paper" : "text-ink-navy/70 hover:bg-white/45"}`}
        >
          <Sparkles className="w-4 h-4" />
          AI RECOMMENDATIONS
        </button>
      </div>

      {/* PRIORITIZED TAB */}
      {activeSubTab === "prioritized" && (
        <>
          {/* Formula Explanation box */}
          <div className="bg-ink-navy text-paper rounded-lg p-4 mb-4 border-2 border-marigold shadow-inner">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <h3 className="font-mono text-xs text-marigold tracking-widest uppercase mb-2 font-bold flex items-center gap-1.5">
                  <Calculator className="w-4 h-4" />
                  <span>THE LEGISLATIVE SCORING ALGORITHM</span>
                </h3>
                <p className="font-mono text-lg md:text-xl font-bold text-paper mb-2 tracking-tight">
                  Score = Urgency × ln(Impact + 1) × (1 + Upvotes/20)
                </p>
                <p className="font-sans text-xs text-paper/80 leading-relaxed">
                  Balances raw severity weight (1–10) with an exponential logarithm of affected households to check density bias, then multiplies by support endorsements to amplify democratic local priorities.
                </p>
              </div>
              <div className="bg-paper/10 px-4 py-3 rounded border border-paper/10 text-center font-mono shrink-0">
                <span className="text-[10px] text-paper/60 uppercase block">ACTIVE LEAF COUNT:</span>
                <span className="text-2xl font-bold text-marigold block mt-0.5">
                  {ranked.length.toString().padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-24 text-center font-mono text-sm text-ink-navy/60">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-marigold mb-3" />
              <span>Generating prioritized action weights...</span>
            </div>
          ) : ranked.length > 0 ? (
            <div className="space-y-4">
              {ranked.map((c, index) => (
                <div
                  key={c.id}
                  className="bg-paper border-2 border-ink-navy/15 rounded-lg p-4 shadow-md hover:border-marigold transition-all relative overflow-hidden"
                >
                  {/* Rank Counter ribbon */}
                  <div className="absolute top-0 left-0 bg-ink-navy text-paper px-3 py-1 font-mono text-xs font-bold rounded-br">
                    RANK #{index + 1}
                  </div>

                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-ink-navy/10 pb-3 mb-3 mt-4">
                    <div className="max-w-2xl">
                      <div className="flex items-center gap-2.5 font-mono text-[10px] text-ink-navy/60">
                        <span className="font-bold text-ink-navy bg-ink-navy/10 px-2 py-0.5 rounded">
                          {c.entryNumber}
                        </span>
                        <span>•</span>
                        <span className="font-bold text-marigold uppercase">{c.category}</span>
                        <span>•</span>
                        <span>{c.ward}</span>
                      </div>

                      <h3 className="font-serif text-xl font-bold text-ink-navy mt-2 leading-snug">
                        {c.title}
                      </h3>

                      <p className="text-xs text-ink-text/80 leading-relaxed mt-2 line-clamp-2">
                        {c.description}
                      </p>
                    </div>

                    {/* Prioritization Score box */}
                    <div className="bg-ink-navy text-paper px-5 py-4 rounded text-center border border-ink-navy/20 min-w-[130px] shrink-0 self-start md:self-center">
                      <span className="font-mono text-[8px] text-paper/50 uppercase block">PRIORITY COEFFICIENT:</span>
                      <span className="font-mono text-3xl font-bold text-marigold block mt-0.5">
                        {c.calculatedScore}
                      </span>
                      <span className="font-mono text-[8px] text-paper/40 block mt-0.5">MATRIX WEIGHTED</span>
                    </div>
                  </div>

                  {/* Formula Math Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center text-xs text-ink-navy/80">
                    <div className="md:col-span-8 bg-white/40 p-3 rounded border border-ink-navy/5 font-mono text-[11px] leading-relaxed flex flex-wrap gap-x-4 gap-y-1">
                      <span>URGENCY: <span className="font-bold text-ink-navy">{c.formulaParts.urgency}</span></span>
                      <span>•</span>
                      <span>IMPACT: <span className="font-bold text-ink-navy">~{c.formulaParts.impact} FAMILIES</span> (ln={c.formulaParts.lnImpact})</span>
                      <span>•</span>
                      <span>UPVOTES: <span className="font-bold text-ink-navy">{c.formulaParts.upvotes}</span> (coef={c.formulaParts.multiplier})</span>
                    </div>

                    <div className="md:col-span-4 text-right">
                      <span className="inline-block bg-marigold/10 border border-marigold/20 text-amber-800 text-[10px] font-mono px-3 py-1 rounded font-bold uppercase">
                        {c.priority} SEVERITY REPORT
                      </span>
                    </div>
                  </div>

                  {/* Action plan citation block */}
                  {c.aiAnalysis?.recommendedAction && (
                    <div className="mt-4 border-t border-ink-navy/5 pt-4">
                      <span className="font-mono text-[10px] uppercase text-ink-navy/50 block font-bold">
                        RECOMMENDED DISPATCH COURSE:
                      </span>
                      <p className="text-xs text-ink-text/80 leading-normal mt-0.5 font-sans italic">
                        "{c.aiAnalysis.recommendedAction}"
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center bg-paper border border-ink-navy/15 rounded-lg">
              <HelpCircle className="w-10 h-10 text-ink-navy/40 mx-auto mb-3" />
              <h3 className="font-serif text-lg font-bold text-ink-navy uppercase tracking-tight">
                Matrix empty
              </h3>
              <p className="text-xs font-mono text-ink-navy/60 uppercase mt-1">
                There are no active outstanding grievances in the prioritization index.
              </p>
            </div>
          )}
        </>
      )}

      {/* DATASETS TAB */}
      {activeSubTab === "datasets" && (
        <div className="bg-paper border border-ink-navy/15 rounded-lg p-4 shadow-md">
          <div className="flex items-center gap-3 border-b border-ink-navy/10 pb-3 mb-4">
            <Database className="w-5 h-5 text-marigold" />
            <div>
              <h3 className="font-serif text-lg font-bold text-ink-navy uppercase">
                Consolidated Public Datasets &amp; Infrastructure Gaps
              </h3>
              <p className="text-xs text-ink-navy/60 font-mono uppercase mt-0.5">
                Integrating Census 2011, Ministry of Education UDISE, &amp; Ministry of Water Resources maps
              </p>
            </div>
          </div>

          <p className="text-xs text-ink-text/80 leading-relaxed mb-4">
            Below is the verified municipal database showing ward-level population demographics and measured infrastructure deficits. The prioritizer flags gaps like <strong>school commutes exceeding 5km</strong> or <strong>piped water coverage dropping below 50%</strong>.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-ink-navy/20 bg-[#eae8df] text-ink-navy font-mono font-bold uppercase">
                  <th className="py-3 px-4">Ward Location</th>
                  <th className="py-3 px-4">Est. Population</th>
                  <th className="py-3 px-4">Avg School Travel (km)</th>
                  <th className="py-3 px-4">Piped Water Coverage</th>
                  <th className="py-3 px-4">Patient-to-Doctor (PHC)</th>
                  <th className="py-3 px-4">Road Pothole Index</th>
                </tr>
              </thead>
              <tbody className="font-mono divide-y divide-ink-navy/5">
                {PUBLIC_DATASETS.map((d, idx) => {
                  const isHighTravel = parseFloat(d.schoolDist) >= 5.0;
                  const isLowWater = parseInt(d.waterCoverage) < 50;
                  const isBadRatio = parseInt(d.docRatio.split(":")[1]) > 4000;

                  return (
                    <tr key={idx} className="hover:bg-white/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-ink-navy">{d.ward}</td>
                      <td className="py-3 px-4 text-ink-navy/80">{d.pop}</td>
                      <td className={`py-3 px-4 font-bold ${isHighTravel ? "text-stamp-red" : "text-ink-navy/80"}`}>
                        {d.schoolDist} km {isHighTravel && "⚠️ (>5km)"}
                      </td>
                      <td className={`py-3 px-4 font-bold ${isLowWater ? "text-stamp-red" : "text-moss"}`}>
                        {d.waterCoverage} {isLowWater && "⚠️ (<50%)"}
                      </td>
                      <td className={`py-3 px-4 font-bold ${isBadRatio ? "text-stamp-red" : "text-ink-navy/80"}`}>
                        {d.docRatio} {isBadRatio && "⚠️ (Deficit)"}
                      </td>
                      <td className={`py-3 px-4 font-bold ${d.roadDefectIndex === "High" ? "text-stamp-red" : "text-ink-navy/80"}`}>
                        {d.roadDefectIndex}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI RECOMMENDATIONS TAB */}
      {activeSubTab === "recommendations" && (
        <div className="space-y-4">
          <div className="bg-paper border border-ink-navy/15 rounded-lg p-4 shadow-md">
            <div className="flex items-center gap-3 border-b border-ink-navy/10 pb-3 mb-3">
              <Sparkles className="w-5 h-5 text-marigold animate-pulse" />
              <div>
                <h3 className="font-serif text-lg font-bold text-ink-navy uppercase">
                  Data-Driven AI Funding Recommendations
                </h3>
                <p className="text-xs text-ink-navy/60 font-mono uppercase mt-0.5">
                  Resolving citizen grievances by weighing public dataset deficits vs. popular demands
                </p>
              </div>
            </div>
            <p className="text-xs text-ink-text/80 leading-relaxed">
              Gemini has analyzed active ledger records alongside the demographic public datasets. Under <strong>MPLAD guidelines</strong>, the system automatically surfaces and compares competing project requests to suggest the highest-value local developments for immediate project approval.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {FUNDING_RECOMMENDATIONS.map((r) => (
              <div
                key={r.id}
                className="bg-paper border-2 border-ink-navy shadow-md rounded-lg p-4 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-marigold text-ink-navy px-3 py-1 font-mono text-[9px] font-bold uppercase rounded-bl">
                  {r.urgency}
                </div>

                <span className="font-mono text-[9px] text-moss uppercase tracking-widest font-bold block mb-1">
                  MPLAD FUNDING RECOMMENDATION // {r.category}
                </span>

                <h3 className="font-serif text-xl font-bold text-ink-navy mb-3">
                  {r.title}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-y border-ink-navy/10 py-3 mb-3 text-xs">
                  <div className="space-y-2">
                    <span className="font-mono text-[9px] text-ink-navy/50 block font-bold">CITIZEN DEMAND RATIO:</span>
                    <p className="text-ink-navy font-bold">{r.demandLevel}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="font-mono text-[9px] text-ink-navy/50 block font-bold">PUBLIC CENSUS FACTOR:</span>
                    <p className="text-ink-navy font-sans leading-relaxed italic">"{r.datasetFact}"</p>
                  </div>
                </div>

                <div className="bg-ink-navy text-paper p-3 rounded mb-3 text-xs font-sans">
                  <span className="font-mono text-marigold text-[9px] tracking-wider block font-bold mb-1 uppercase">
                    PROPOSED MPLAD ALLOCATION STRATEGY:
                  </span>
                  <p className="leading-relaxed text-paper/90">
                    {r.recommendation}
                  </p>
                </div>

                <div className="flex justify-between items-center text-xs font-mono text-ink-navy/60">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-marigold" />
                    <span className="font-bold">{r.impact}</span>
                  </div>
                  <span className="text-[10px] font-bold text-ink-navy hover:underline cursor-pointer flex items-center gap-1">
                    GENERATE PROJECT SANCTION ORDER <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
