/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { PlusCircle, Trash2, Loader2, AlertTriangle, X } from "lucide-react";
export const MPSchemes = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [ministry, setMinistry] = useState("Ministry of Education & Social Welfare");
  const [description, setDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [benefits, setBenefits] = useState("");
  const [budgetAllocated, setBudgetAllocated] = useState("");
  async function loadSchemes() {
    setLoading(true);
    try {
      const list = await api.schemes.getAll();
      setSchemes(list);
    } catch (e) {
      console.error("Error fetching schemes:", e);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadSchemes();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !budgetAllocated) {
      setError("Please fill out all required fields.");
      return;
    }
    setActionLoading(true);
    setError(null);
    try {
      await api.schemes.create({
        title,
        description,
        ministry,
        targetAudience,
        benefits,
        budgetAllocated,
        status: "ACTIVE"
      });
      setTitle("");
      setDescription("");
      setTargetAudience("");
      setBenefits("");
      setBudgetAllocated("");
      setIsFormOpen(false);
      await loadSchemes();
    } catch (err) {
      setError(err.message || "Could not register new scheme.");
    } finally {
      setActionLoading(false);
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Are you absolutely sure you want to remove this welfare scheme from the database records?")) {
      return;
    }
    try {
      await api.schemes.delete(id);
      await loadSchemes();
    } catch (e) {
      console.error("Error deleting scheme:", e);
    }
  };
  return <div className="max-w-[96%] mx-auto px-4 py-4 md:py-6">
      
      {
    /* Page Header */
  }
      <div className="border-b border-ink-navy/10 pb-3 mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] text-marigold tracking-widest uppercase block mb-1">
            SCHEME MANAGEMENT SERVICE
          </span>
          <h1 className="font-serif text-3xl font-bold text-ink-navy">
            Constituency Welfare Admin
          </h1>
          <p className="text-sm text-ink-text/75 mt-1">
            Author and publish development schemes, social commissions, and financial allocations to the public register.
          </p>
        </div>

        {!isFormOpen && <button
    onClick={() => setIsFormOpen(true)}
    className="bg-ink-navy hover:bg-ink-navy/90 text-paper font-bold px-4 py-2.5 rounded font-mono text-xs tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 shadow"
  >
            <PlusCircle className="w-4 h-4 text-marigold" />
            <span>PUBLISH NEW SCHEME</span>
          </button>}
      </div>

      {
    /* Save Error */
  }
      {error && <div className="bg-stamp-red/5 border-l-4 border-stamp-red text-stamp-red text-xs p-3 rounded mb-6 font-mono">
          {error}
        </div>}

      {
    /* Create New Scheme Modal Form */
  }
      {isFormOpen && <div className="fixed inset-0 bg-ink-navy/85 flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
          <div className="bg-paper border-2 border-ink-navy p-6 md:p-8 rounded-lg max-w-xl w-full shadow-2xl relative my-8">
            <button
    onClick={() => {
      setIsFormOpen(false);
      setError(null);
    }}
    className="absolute top-4 right-4 text-ink-navy/60 hover:text-ink-navy cursor-pointer"
  >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="font-mono text-[9px] text-marigold uppercase tracking-widest font-bold">SCHEME INCEPTION counter</span>
              <h3 className="font-serif text-2xl font-bold text-ink-navy">
                Publish New Welfare Scheme
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-ink-navy/70 mb-1">
                  Scheme / Policy Title *
                </label>
                <input
    type="text"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    placeholder="e.g. MP Ladli Shiksha Protsahan Yojana"
    className="w-full bg-white border border-ink-navy/15 rounded px-3 py-2 text-sm focus:outline-none focus:border-marigold"
    required
  />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-ink-navy/70 mb-1">
                    Sponsoring Ministry / Department *
                  </label>
                  <select
    value={ministry}
    onChange={(e) => setMinistry(e.target.value)}
    className="w-full bg-white border border-ink-navy/15 rounded px-3 py-2 text-xs focus:outline-none focus:border-marigold"
    required
  >
                    <option value="Ministry of Education &amp; Social Welfare">Ministry of Education &amp; Social Welfare</option>
                    <option value="Department of Drinking Water &amp; Sanitation">Department of Drinking Water &amp; Sanitation</option>
                    <option value="Ministry of Road Transport &amp; Highways">Ministry of Road Transport &amp; Highways</option>
                    <option value="Ministry of Health &amp; Family Welfare">Ministry of Health &amp; Family Welfare</option>
                    <option value="District Power Supply Board">District Power Supply Board</option>
                    <option value="Constituency Development Fund">Constituency Development Fund</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-ink-navy/70 mb-1">
                    Sanctioned Budget (MPLAD) *
                  </label>
                  <input
    type="text"
    value={budgetAllocated}
    onChange={(e) => setBudgetAllocated(e.target.value)}
    placeholder="e.g. ₹25,00,000"
    className="w-full bg-white border border-ink-navy/15 rounded px-3 py-2 text-sm focus:outline-none focus:border-marigold font-mono"
    required
  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-ink-navy/70 mb-1">
                  Scheme Policy Description *
                </label>
                <textarea
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    rows={4}
    placeholder="Explain the overarching purpose, infrastructure goals, and funding channels..."
    className="w-full bg-white border border-ink-navy/15 rounded px-3 py-2 text-xs focus:outline-none focus:border-marigold leading-relaxed"
    required
  />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-ink-navy/70 mb-1">
                    Target Eligibility Scope *
                  </label>
                  <input
    type="text"
    value={targetAudience}
    onChange={(e) => setTargetAudience(e.target.value)}
    placeholder="e.g. Higher secondary girl students in Ward 7"
    className="w-full bg-white border border-ink-navy/15 rounded px-3 py-2 text-xs focus:outline-none focus:border-marigold"
  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-ink-navy/70 mb-1">
                    Specific Promised Benefits *
                  </label>
                  <input
    type="text"
    value={benefits}
    onChange={(e) => setBenefits(e.target.value)}
    placeholder="e.g. ₹10,000 grants and commuter bicycle"
    className="w-full bg-white border border-ink-navy/15 rounded px-3 py-2 text-xs focus:outline-none focus:border-marigold"
  />
                </div>
              </div>

              <div className="flex gap-3 justify-end text-xs font-mono pt-4 border-t border-ink-navy/10 mt-6">
                <button
    type="button"
    onClick={() => setIsFormOpen(false)}
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
                  <span>PUBLISH &amp; REGISTER OUTLAY</span>
                </button>
              </div>

            </form>
          </div>
        </div>}

      {
    /* Schemes Grid */
  }
      {loading ? <div className="py-24 text-center font-mono text-sm text-ink-navy/60">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-marigold mb-3" />
          <span>Syncing social programs...</span>
        </div> : schemes.length > 0 ? <div className="grid grid-cols-1 gap-4 animate-fade-in">
          {schemes.map((s) => <div
    key={s.id}
    className="bg-paper border-2 border-ink-navy/15 rounded-lg p-4 shadow-md flex flex-col md:flex-row justify-between items-start gap-4 hover:border-ink-navy/30 transition-all relative overflow-hidden"
  >
              {
    /* Paper line decoration */
  }
              <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-marigold" />

              <div className="flex-1 space-y-3 pl-3">
                <div className="flex items-center gap-2">
                  <span className="inline-block bg-ink-navy text-paper text-[9px] font-mono font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                    {s.ministry}
                  </span>
                  <span className="inline-block bg-moss text-paper text-[9px] font-mono font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                    {s.status}
                  </span>
                </div>

                <h3 className="font-serif text-xl font-bold text-ink-navy leading-snug">
                  {s.title}
                </h3>

                <p className="text-sm text-ink-text leading-relaxed">
                  {s.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#eae8df]/60 border border-ink-navy/5 p-3 rounded text-xs leading-relaxed font-sans">
                  <div>
                    <span className="font-mono text-[9px] uppercase text-ink-navy/50 block font-bold mb-0.5">TARGET AUDIENCE:</span>
                    <p className="font-medium text-ink-text">{s.targetAudience}</p>
                  </div>
                  <div>
                    <span className="font-mono text-[9px] uppercase text-ink-navy/50 block font-bold mb-0.5">BENEFITS METRIC:</span>
                    <p className="font-medium text-ink-text">{s.benefits}</p>
                  </div>
                </div>
              </div>

              {
    /* Action Controls & Budget */
  }
              <div className="shrink-0 flex flex-col justify-between items-end gap-4 w-full md:w-auto border-t md:border-t-0 md:border-l border-ink-navy/10 pt-3 md:pt-0 md:pl-4 text-right self-stretch">
                <div>
                  <span className="font-mono text-[9px] text-ink-navy/50 block">BUDGET SANCTIONED</span>
                  <span className="font-mono text-xl font-bold text-ink-navy block mt-0.5">{s.budgetAllocated}</span>
                </div>

                <button
    onClick={() => handleDelete(s.id)}
    className="flex items-center gap-1.5 text-stamp-red/80 hover:text-stamp-red border border-stamp-red/25 hover:border-stamp-red px-3 py-1.5 rounded font-mono text-xs tracking-wider transition-colors cursor-pointer w-full md:w-auto justify-center"
  >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>DELETE SCHEME</span>
                </button>
              </div>

            </div>)}
        </div> : <div className="py-24 text-center bg-paper border border-ink-navy/15 rounded-lg">
          <AlertTriangle className="w-10 h-10 text-ink-navy/40 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-bold text-ink-navy uppercase tracking-tight">
            No published schemes
          </h3>
          <p className="text-xs font-mono text-ink-navy/60 uppercase mt-1">
            Publish a scheme to populate the constituency Social registers.
          </p>
        </div>}

    </div>;
};
