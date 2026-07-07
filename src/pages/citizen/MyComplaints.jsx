/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { StampBadge } from "../../components/ui/StampBadge";
import { ThumbsUp, Calendar, Trash2, Edit3, Loader2, X, AlertCircle, CheckCircle2 } from "lucide-react";
export const MyComplaints = () => {
  const { user } = useAuth();
  const [myList, setMyList] = useState([]);
  const [fullList, setFullList] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState("mine");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [error, setError] = useState(null);
  async function loadComplaints() {
    setLoading(true);
    try {
      const [mine, all] = await Promise.all([
        api.complaints.getMine(),
        api.mp.getAllComplaints().catch(() => [])
        // Fallback in case of permissions, though standard endpoint handles both
      ]);
      setMyList(mine);
      setFullList(all);
    } catch (e) {
      console.error("Error fetching complaints:", e);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadComplaints();
  }, []);
  const handleUpvote = async (id) => {
    setActionLoading(id);
    try {
      await api.complaints.upvote(id);
      await loadComplaints();
    } catch (e) {
      console.error("Error toggling upvote:", e);
    } finally {
      setActionLoading(null);
    }
  };
  const handleDelete = async () => {
    if (!deleteId) return;
    setActionLoading(deleteId);
    try {
      await api.complaints.delete(deleteId);
      setDeleteId(null);
      await loadComplaints();
    } catch (e) {
      console.error("Error deleting complaint:", e);
    } finally {
      setActionLoading(null);
    }
  };
  const handleOpenEdit = (c) => {
    setEditId(c.id);
    setEditTitle(c.title);
    setEditDesc(c.description);
    setEditCategory(c.category);
    setEditPriority(c.priority);
  };
  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editId) return;
    setError(null);
    try {
      await api.complaints.edit(editId, {
        title: editTitle,
        description: editDesc,
        category: editCategory,
        priority: editPriority
      });
      setEditId(null);
      await loadComplaints();
    } catch (err) {
      setError(err.message || "Could not save register changes.");
    }
  };
  const complaintsToDisplay = activeSubTab === "mine" ? myList : fullList.filter((c) => c.citizenId !== user?.id);
  return <div className="max-w-[96%] mx-auto px-4 py-4 md:py-6">
      
      {
    /* Page Header */
  }
      <div className="border-b border-ink-navy/10 pb-3 mb-4">
        <span className="font-mono text-[10px] text-marigold tracking-widest uppercase block mb-1">
          CONSTITUENCY TRACKER
        </span>
        <h1 className="font-serif text-3xl font-bold text-ink-navy">
          Constituency Grievance Ledger
        </h1>
        <p className="text-sm text-ink-text/75 mt-1">
          Review, revise, or support logged concerns of your fellow citizens. Higher upvote endorsements push items up the MP action matrix.
        </p>
      </div>

      {
    /* Sub Tabs */
  }
      <div className="flex border-b border-ink-navy/10 mb-4 font-mono text-xs tracking-wider gap-4">
        <button
    onClick={() => setActiveSubTab("mine")}
    className={`
            pb-3 px-2 border-b-2 font-bold transition-all cursor-pointer
            ${activeSubTab === "mine" ? "border-marigold text-ink-navy font-bold" : "border-transparent text-ink-navy/65 hover:text-ink-navy hover:border-ink-navy/20"}
          `}
  >
          MY LODGED COMPLAINTS ({myList.length})
        </button>
        <button
    onClick={() => setActiveSubTab("constituency")}
    className={`
            pb-3 px-2 border-b-2 font-bold transition-all cursor-pointer
            ${activeSubTab === "constituency" ? "border-marigold text-ink-navy font-bold" : "border-transparent text-ink-navy/65 hover:text-ink-navy hover:border-ink-navy/20"}
          `}
  >
          CONSTITUENCY LEDGER ({fullList.length - myList.length})
        </button>
      </div>

      {
    /* Main Grid Feed */
  }
      {loading ? <div className="py-24 text-center font-mono text-sm text-ink-navy/65">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-marigold mb-3" />
          <span>Syncing with registry logs...</span>
        </div> : complaintsToDisplay.length > 0 ? <div className="space-y-4">
          {complaintsToDisplay.map((c) => {
    const hasUpvoted = c.upvotedBy?.includes(user?.id || "");
    return <div
      key={c.id}
      className="bg-paper border-2 border-ink-navy/15 rounded-lg p-4 shadow-md relative overflow-hidden"
    >
                {
      /* Vintage paper file header tag */
    }
                <div className="absolute top-0 left-0 right-0 h-1 bg-ink-navy/10" />

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-ink-navy/10 pb-3 mb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-ink-navy/60">
                      <span className="font-bold text-ink-navy text-xs bg-ink-navy/10 px-2 py-0.5 rounded">
                        {c.entryNumber}
                      </span>
                      <span>•</span>
                      <span className="font-bold uppercase text-marigold">{c.category}</span>
                      <span>•</span>
                      <span>{c.ward}</span>
                    </div>
                    
                    <h2 className="font-serif text-xl md:text-2xl font-bold text-ink-navy mt-2 leading-snug">
                      {c.title}
                    </h2>
                  </div>

                  {
      /* Stamp badge alignment */
    }
                  <div className="shrink-0">
                    <StampBadge status={c.status} />
                  </div>
                </div>

                {
      /* Description Body */
    }
                <p className="text-sm text-ink-text leading-relaxed whitespace-pre-wrap mb-4">
                  {c.description}
                </p>

                {
      /* AI Summary Banner */
    }
                {c.aiSummary && <div className="bg-ink-navy text-paper p-3 rounded mb-4 text-xs italic leading-relaxed border-l-4 border-marigold">
                    <span className="font-mono text-marigold uppercase tracking-wider text-[10px] font-bold block mb-1">
                      GEMINI CLASSIFIER SUMMARY
                    </span>
                    "{c.aiSummary}"
                  </div>}

                {
      /* Resolution block if resolved */
    }
                {c.status === "RESOLVED" && c.resolutionDetails && <div className="bg-moss/5 border border-moss rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 font-mono text-[10px] text-moss uppercase tracking-widest font-bold mb-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>OFFICIAL ACTION SEAL &amp; RESOLUTION RESOLVE</span>
                    </div>
                    <p className="text-xs text-ink-text leading-relaxed">
                      {c.resolutionDetails}
                    </p>
                    {c.resolutionDate && <span className="block font-mono text-[9px] text-ink-navy/50 mt-2">
                        SANCTIONED ON: {new Date(c.resolutionDate).toLocaleDateString()}
                      </span>}
                  </div>}

                {
      /* Footer Controls / Upvoting */
    }
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ink-navy/10 pt-4 text-xs font-mono">
                  <div className="flex items-center gap-2 text-ink-navy/60">
                    <Calendar className="w-4 h-4" />
                    <span>LODGED: {new Date(c.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>LODGER: {c.citizenName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {
      /* Citizen Action Controls (Edit/Delete only if pending & owned) */
    }
                    {activeSubTab === "mine" && c.status === "PENDING" && <div className="flex items-center gap-1 border-r border-ink-navy/20 pr-3 mr-1">
                        <button
      onClick={() => handleOpenEdit(c)}
      className="hover:text-marigold p-1.5 flex items-center gap-1 cursor-pointer transition-colors"
      title="Edit Grievance"
    >
                          <Edit3 className="w-4 h-4" />
                          <span>REVISE</span>
                        </button>
                        <button
      onClick={() => setDeleteId(c.id)}
      className="hover:text-stamp-red p-1.5 flex items-center gap-1 cursor-pointer transition-colors text-stamp-red/80"
      title="Remove Grievance"
    >
                          <Trash2 className="w-4 h-4" />
                          <span>REMOVE</span>
                        </button>
                      </div>}

                    {
      /* Upvote endorsement button */
    }
                    <button
      onClick={() => handleUpvote(c.id)}
      disabled={actionLoading === c.id}
      className={`
                        flex items-center gap-2 px-4 py-2 rounded font-bold font-sans text-xs transition-all cursor-pointer border
                        ${hasUpvoted ? "bg-marigold text-ink-navy border-marigold shadow-sm" : "bg-white/40 hover:bg-white border-ink-navy/15 text-ink-navy"}
                      `}
    >
                      {actionLoading === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? "fill-ink-navy" : ""}`} />}
                      <span>
                        {hasUpvoted ? "ENDORSED" : "SUPPORT CONCERN"} ({c.upvotes})
                      </span>
                    </button>
                  </div>
                </div>

              </div>;
  })}
        </div> : <div className="py-24 text-center bg-paper border border-ink-navy/15 rounded-lg">
          <AlertCircle className="w-10 h-10 text-ink-navy/40 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-bold text-ink-navy uppercase tracking-tight">
            No complaints found
          </h3>
          <p className="text-xs font-mono text-ink-navy/60 uppercase mt-1">
            {activeSubTab === "mine" ? "You have not submitted any complaints on this register leaf yet." : "All quiet in the surrounding constituency wards."}
          </p>
        </div>}

      {
    /* Delete Confirmation Modal */
  }
      {deleteId && <div className="fixed inset-0 bg-ink-navy/80 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-paper border-2 border-ink-navy p-6 rounded-lg max-w-sm w-full shadow-2xl relative">
            <h3 className="font-serif text-lg font-bold text-ink-navy mb-2 uppercase tracking-tight">
              Delete Register Record?
            </h3>
            <p className="text-xs text-ink-text/80 leading-relaxed mb-6 font-sans">
              This action is permanent and will completely remove register ledger entry number {myList.find((c) => c.id === deleteId)?.entryNumber} from the constituency records database.
            </p>
            <div className="flex gap-3 justify-end text-xs font-mono">
              <button
    onClick={() => setDeleteId(null)}
    className="px-4 py-2 border border-ink-navy/20 rounded hover:bg-white/40 cursor-pointer"
  >
                CANCEL
              </button>
              <button
    onClick={handleDelete}
    className="px-4 py-2 bg-stamp-red text-paper rounded hover:bg-red-800 cursor-pointer font-bold"
  >
                DELETE RECORD
              </button>
            </div>
          </div>
        </div>}

      {
    /* Revise/Edit Complaint Modal */
  }
      {editId && <div className="fixed inset-0 bg-ink-navy/85 flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
          <div className="bg-paper border-2 border-ink-navy p-6 md:p-8 rounded-lg max-w-lg w-full shadow-2xl relative my-8">
            <button
    onClick={() => setEditId(null)}
    className="absolute top-4 right-4 text-ink-navy/60 hover:text-ink-navy cursor-pointer"
  >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="font-mono text-[9px] text-marigold uppercase tracking-widest font-bold">REVISE RECORD ENTRY</span>
              <h3 className="font-serif text-2xl font-bold text-ink-navy">
                Edit Register Leaf
              </h3>
            </div>

            {error && <div className="bg-stamp-red/5 border-l-4 border-stamp-red text-stamp-red text-xs p-3 rounded mb-4 font-mono">
                {error}
              </div>}

            <form onSubmit={handleEditSave} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-ink-navy/70 mb-1">
                  Grievance Title *
                </label>
                <input
    type="text"
    value={editTitle}
    onChange={(e) => setEditTitle(e.target.value)}
    className="w-full bg-white border border-ink-navy/15 rounded px-3 py-2 text-sm focus:outline-none focus:border-marigold"
    required
  />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-ink-navy/70 mb-1">
                  Detailed Statement &amp; Observations *
                </label>
                <textarea
    value={editDesc}
    onChange={(e) => setEditDesc(e.target.value)}
    rows={5}
    className="w-full bg-white border border-ink-navy/15 rounded px-3 py-2 text-sm focus:outline-none focus:border-marigold leading-relaxed"
    required
  />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-ink-navy/70 mb-1">
                    Grievance Category *
                  </label>
                  <select
    value={editCategory}
    onChange={(e) => setEditCategory(e.target.value)}
    className="w-full bg-white border border-ink-navy/15 rounded px-3 py-2 text-sm focus:outline-none focus:border-marigold"
    required
  >
                    <option value="Roads">Roads</option>
                    <option value="Drainage &amp; Sewage">Drainage &amp; Sewage</option>
                    <option value="Water Supply">Water Supply</option>
                    <option value="Electricity &amp; Streetlights">Electricity &amp; Streetlights</option>
                    <option value="Education">Education</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Public Safety &amp; Policing">Public Safety &amp; Policing</option>
                    <option value="Sanitation &amp; Garbage">Sanitation &amp; Garbage</option>
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-ink-navy/70 mb-1">
                    Severity Estimate *
                  </label>
                  <select
    value={editPriority}
    onChange={(e) => setEditPriority(e.target.value)}
    className="w-full bg-white border border-ink-navy/15 rounded px-3 py-2 text-sm focus:outline-none focus:border-marigold font-mono"
    required
  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end text-xs font-mono pt-4 border-t border-ink-navy/10 mt-6">
                <button
    type="button"
    onClick={() => setEditId(null)}
    className="px-4 py-2 border border-ink-navy/20 rounded hover:bg-white/40 cursor-pointer"
  >
                  CANCEL
                </button>
                <button
    type="submit"
    className="px-4 py-2 bg-ink-navy text-paper rounded hover:bg-ink-navy/90 cursor-pointer font-bold"
  >
                  SAVE CORRECTIONS
                </button>
              </div>

            </form>
          </div>
        </div>}

    </div>;
};
