/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { WARDS_LIST, COMPLAINT_CATEGORIES } from "../../constants";
import { StampBadge } from "../../components/ui/StampBadge";
import { Loader2, Calendar, CheckCircle2, ChevronDown, ChevronUp, AlertCircle, Edit, ListFilter } from "lucide-react";
export const MPSubmissions = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWard, setSelectedWard] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [expandedId, setExpandedId] = useState(null);
  const [editStatusId, setEditStatusId] = useState(null);
  const [newStatus, setNewStatus] = useState("PENDING");
  const [resolutionDetails, setResolutionDetails] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
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
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!editStatusId) return;
    setActionLoading(true);
    setError(null);
    try {
      await api.mp.updateStatus(editStatusId, newStatus, resolutionDetails);
      setEditStatusId(null);
      setResolutionDetails("");
      await loadComplaints();
    } catch (err) {
      setError(err.message || "Could not update status in ledger.");
    } finally {
      setActionLoading(false);
    }
  };
  const handleOpenEditStatus = (c) => {
    setEditStatusId(c.id);
    setNewStatus(c.status);
    setResolutionDetails(c.resolutionDetails || "");
  };
  const filtered = complaints.filter((c) => {
    const wardMatch = selectedWard === "ALL" || c.ward === selectedWard;
    const catMatch = selectedCategory === "ALL" || c.category === selectedCategory;
    const statusMatch = selectedStatus === "ALL" || c.status === selectedStatus;
    return wardMatch && catMatch && statusMatch;
  });
  return <div className="max-w-[96%] mx-auto px-4 py-4 md:py-6">
      
      {
    /* Page Header */
  }
      <div className="border-b border-ink-navy/10 pb-3 mb-4">
        <span className="font-mono text-[10px] text-marigold tracking-widest uppercase block mb-1">
          CONSTITUENCY PRIMARY REGISTER
        </span>
        <h1 className="font-serif text-3xl font-bold text-ink-navy">
          Official Grievance Ledger Index
        </h1>
        <p className="text-sm text-ink-text/75 mt-1">
          Review, analyze, and dispatch resolutions for citizen-lodged priorities. Click any ledger entry to examine full AI prioritize analyses.
        </p>
      </div>

      {
    /* Filters Toolbar */
  }
      <div className="bg-paper border border-ink-navy/15 rounded-lg p-4 mb-4 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-ink-navy font-bold">
          <ListFilter className="w-4 h-4 text-marigold" />
          <span>FILTER REGISTER:</span>
        </div>

        <div className="flex flex-wrap gap-3 items-center flex-1 justify-end">
          {
    /* Ward filter */
  }
          <div>
            <select
    value={selectedWard}
    onChange={(e) => setSelectedWard(e.target.value)}
    className="bg-white/60 border border-ink-navy/15 rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-marigold"
  >
              <option value="ALL">ALL WARDS</option>
              {WARDS_LIST.map((w) => <option key={w} value={w}>
                  {w.toUpperCase()}
                </option>)}
            </select>
          </div>

          {
    /* Category filter */
  }
          <div>
            <select
    value={selectedCategory}
    onChange={(e) => setSelectedCategory(e.target.value)}
    className="bg-white/60 border border-ink-navy/15 rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-marigold"
  >
              <option value="ALL">ALL SECTORS</option>
              {COMPLAINT_CATEGORIES.map((cat) => <option key={cat} value={cat}>
                  {cat.toUpperCase()}
                </option>)}
            </select>
          </div>

          {
    /* Status filter */
  }
          <div>
            <select
    value={selectedStatus}
    onChange={(e) => setSelectedStatus(e.target.value)}
    className="bg-white/60 border border-ink-navy/15 rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-marigold"
  >
              <option value="ALL">ALL STATUSES</option>
              <option value="PENDING">PENDING REGISTER</option>
              <option value="IN_REVIEW">UNDER SCRUTINY</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>
        </div>
      </div>

      {
    /* Ledger Grid Feed */
  }
      {loading ? <div className="py-24 text-center font-mono text-sm text-ink-navy/65">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-marigold mb-3" />
          <span>Syncing with constituency registers...</span>
        </div> : filtered.length > 0 ? <div className="space-y-4">
          {filtered.map((c) => {
    const isExpanded = expandedId === c.id;
    return <div
      key={c.id}
      className="bg-paper border-2 border-ink-navy/15 rounded-lg overflow-hidden shadow-md hover:border-ink-navy/30 transition-all relative"
    >
                {
      /* Ledger Index Band */
    }
                <div className="bg-ink-navy/5 border-b border-ink-navy/10 py-3 px-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 font-mono text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-ink-navy bg-ink-navy/15 px-2.5 py-0.5 rounded text-[11px]">
                      {c.entryNumber}
                    </span>
                    <span>•</span>
                    <span className="font-bold text-marigold">{c.category.toUpperCase()}</span>
                    <span>•</span>
                    <span className="text-ink-navy/65">{c.ward.toUpperCase()}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-ink-navy/60 text-[10px]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(c.date).toLocaleDateString()}</span>
                    </div>
                    {
      /* Rotated badge stamp */
    }
                    <StampBadge status={c.status} />
                  </div>
                </div>

                {
      /* Complaint Body */
    }
                <div className="p-5 md:p-6">
                  <h3 className="font-serif text-xl font-bold text-ink-navy leading-snug mb-2">
                    {c.title}
                  </h3>
                  
                  <p className="text-sm text-ink-text/85 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>

                  {
      /* Summary / AI Summary Line */
    }
                  {c.aiSummary && <div className="bg-ink-navy text-paper/95 p-3 rounded mt-4 text-xs italic leading-normal border-l-3 border-marigold">
                      "{c.aiSummary}"
                    </div>}

                  {
      /* Resolution details */
    }
                  {c.status === "RESOLVED" && c.resolutionDetails && <div className="bg-moss/5 border border-moss rounded p-4 mt-4">
                      <div className="flex items-center gap-1.5 font-mono text-[9px] text-moss uppercase tracking-widest font-bold mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>SANCTION ACTION LOG FILE</span>
                      </div>
                      <p className="text-xs text-ink-text leading-relaxed">
                        {c.resolutionDetails}
                      </p>
                    </div>}

                  {
      /* Expansion Area */
    }
                  {isExpanded && <div className="border-t border-ink-navy/10 mt-6 pt-6 space-y-6 animate-fade-in text-sm font-sans">
                      <div>
                        <span className="font-mono text-[10px] text-ink-navy/60 uppercase block font-bold mb-1">
                          FULL CITIZEN OBSERVATION STATEMENT:
                        </span>
                        <p className="text-ink-text bg-white/40 border border-ink-navy/5 p-4 rounded leading-relaxed whitespace-pre-wrap">
                          {c.description}
                        </p>
                      </div>

                      {
      /* AI Priority Matrix Grid */
    }
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-ink-navy text-paper p-6 rounded-lg">
                        
                        <div className="md:col-span-4 space-y-4">
                          <div>
                            <span className="font-mono text-[9px] text-paper/50 block">AI CALCULATED URGENCY SCORE:</span>
                            <span className="font-mono text-2xl font-bold text-marigold block mt-0.5">
                              {c.aiAnalysis?.urgencyScore || 5} / 10
                            </span>
                            <span className="text-[9px] text-paper/40 block mt-0.5 leading-tight">Evaluated based on structural hazard and safety variables</span>
                          </div>

                          <div>
                            <span className="font-mono text-[9px] text-paper/50 block">ESTIMATED FAMILIES DIRECTLY IMPACTED:</span>
                            <span className="font-mono text-xl font-bold text-paper block mt-0.5">
                              ~{c.aiAnalysis?.estimatedImpact || 50} Households
                            </span>
                            <span className="text-[9px] text-paper/40 block mt-0.5 leading-tight">Census-weighted municipal impact coverage</span>
                          </div>
                        </div>

                        <div className="md:col-span-8 border-t md:border-t-0 md:border-l border-paper/10 pt-4 md:pt-0 md:pl-6 space-y-4">
                          <div>
                            <span className="font-mono text-[9px] text-marigold uppercase tracking-wider block font-bold mb-1">
                              MP OFFICE EXECUTIVE RECOMMENDATION:
                            </span>
                            <p className="text-paper/90 leading-relaxed text-xs">
                              {c.aiAnalysis?.recommendedAction}
                            </p>
                          </div>

                          <div>
                            <span className="font-mono text-[9px] text-marigold uppercase tracking-wider block font-bold mb-1">
                              EXTRACTED SYSTEM TAGS:
                            </span>
                            <div className="flex flex-wrap gap-2 mt-1.5">
                              {(c.aiAnalysis?.keyIssues || [c.category]).map((tag, idx) => <span key={idx} className="bg-paper/10 border border-paper/10 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wide">
                                  {tag}
                                </span>)}
                            </div>
                          </div>
                        </div>

                      </div>

                      <div className="border-t border-ink-navy/10 pt-4 flex justify-between items-center text-xs font-mono">
                        <div className="text-ink-navy/55">
                          LODGED BY: <span className="font-bold text-ink-navy">{c.citizenName}</span> | ENDORSERS: <span className="font-bold text-ink-navy">{c.upvotes} Citizens</span>
                        </div>
                        
                        <button
      onClick={() => handleOpenEditStatus(c)}
      className="bg-marigold hover:bg-amber-600 text-ink-navy font-bold font-sans px-4 py-2 rounded text-xs transition-colors cursor-pointer flex items-center gap-1.5"
    >
                          <Edit className="w-3.5 h-3.5" />
                          <span>DISPATCH LEGISLATIVE SANCTION</span>
                        </button>
                      </div>
                    </div>}

                  {
      /* Expansion Toggle footer */
    }
                  <div className="border-t border-ink-navy/10 mt-4 pt-3 flex justify-end text-xs font-mono">
                    <button
      onClick={() => setExpandedId(isExpanded ? null : c.id)}
      className="text-ink-navy/70 hover:text-marigold font-bold flex items-center gap-1 cursor-pointer transition-colors"
    >
                      <span>{isExpanded ? "COLLAPSE RECORD DETAILS" : "EXPAND FULL LEDGER &amp; AI FILES"}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

              </div>;
  })}
        </div> : <div className="py-24 text-center bg-paper border border-ink-navy/15 rounded-lg">
          <AlertCircle className="w-10 h-10 text-ink-navy/40 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-bold text-ink-navy uppercase tracking-tight">
            No matching complaints
          </h3>
          <p className="text-xs font-mono text-ink-navy/60 uppercase mt-1">
            Re-adjust your filter options to query other ledger leaves.
          </p>
        </div>}

      {
    /* Dispatches status action Modal */
  }
      {editStatusId && <div className="fixed inset-0 bg-ink-navy/85 flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
          <div className="bg-paper border-2 border-ink-navy p-6 md:p-8 rounded-lg max-w-md w-full shadow-2xl relative my-8">
            <h3 className="font-serif text-xl font-bold text-ink-navy mb-1 uppercase tracking-tight">
              Dispatch Legislative Sanction
            </h3>
            <p className="text-xs font-mono text-marigold tracking-widest uppercase mb-6 block font-bold">
              LEDGER NO: {complaints.find((c) => c.id === editStatusId)?.entryNumber}
            </p>

            {error && <div className="bg-stamp-red/5 border-l-4 border-stamp-red text-stamp-red text-xs p-3 rounded mb-4 font-mono">
                {error}
              </div>}

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-ink-navy/70 mb-1">
                  Revision Status Selection *
                </label>
                <select
    value={newStatus}
    onChange={(e) => setNewStatus(e.target.value)}
    className="w-full bg-white border border-ink-navy/15 rounded px-3 py-2 text-sm focus:outline-none focus:border-marigold font-mono"
    required
  >
                  <option value="PENDING">PENDING REGISTER</option>
                  <option value="IN_REVIEW">UNDER SCRUTINY (IN REVIEW)</option>
                  <option value="RESOLVED">SANCTIONED &amp; RESOLVED</option>
                </select>
              </div>

              {newStatus === "RESOLVED" && <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-ink-navy/70 mb-1">
                    Official Sanction &amp; Resolution Log Statement *
                  </label>
                  <textarea
    value={resolutionDetails}
    onChange={(e) => setResolutionDetails(e.target.value)}
    rows={5}
    placeholder="Provide exact legislative actions. E.g., 'Sanctioned ₹12 Lakhs from MPLAD Area Development fund on June 12, 2026. Transferred work order to City Irrigation Board. Contractor has started desiltation of Shastri Nagar drain...'"
    className="w-full bg-white border border-ink-navy/15 rounded px-3 py-2 text-sm focus:outline-none focus:border-marigold leading-relaxed text-xs"
    required
  />
                </div>}

              <div className="flex gap-3 justify-end text-xs font-mono pt-4 border-t border-ink-navy/10 mt-6">
                <button
    type="button"
    onClick={() => setEditStatusId(null)}
    className="px-4 py-2 border border-ink-navy/20 rounded hover:bg-white/40 cursor-pointer"
  >
                  CANCEL
                </button>
                <button
    type="submit"
    disabled={actionLoading}
    className="px-4 py-2 bg-ink-navy text-paper rounded hover:bg-ink-navy/90 cursor-pointer font-bold flex items-center gap-1.5"
  >
                  {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>COMMIT DISPATCH</span>
                </button>
              </div>

            </form>
          </div>
        </div>}

    </div>;
};
