/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { Search, HelpCircle, Loader2 } from "lucide-react";
export const SchemesView = () => {
  const [schemes, setSchemes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchSchemes() {
      try {
        const list = await api.schemes.getAll();
        setSchemes(list);
      } catch (e) {
        console.error("Error fetching schemes:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchSchemes();
  }, []);
  const filteredSchemes = schemes.filter(
    (s) => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.description.toLowerCase().includes(searchQuery.toLowerCase()) || s.ministry && s.ministry.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return <div className="max-w-[96%] mx-auto px-4 py-4 md:py-6">
      
      {
    /* Header */
  }
      <div className="border-b border-ink-navy/10 pb-3 mb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] text-marigold tracking-widest uppercase block mb-1">
            LEGISLATIVE OUTLAYS
          </span>
          <h1 className="font-serif text-3xl font-bold text-ink-navy">
            Constituency Welfare &amp; MPLAD Schemes
          </h1>
          <p className="text-sm text-ink-text/75 mt-1">
            Active developmental policies, educational scholarships, and local infrastructure projects directly funded or facilitated by your Member of Parliament's office.
          </p>
        </div>

        {
    /* Search */
  }
        <div className="relative max-w-xs w-full shrink-0">
          <Search className="w-4 h-4 text-ink-navy/40 absolute left-3 top-3" />
          <input
    type="text"
    placeholder="Search active policies..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="w-full bg-paper border border-ink-navy/15 rounded-lg pl-9 pr-3 py-2 text-xs font-mono focus:outline-none focus:border-marigold"
  />
        </div>
      </div>

      {
    /* Schemes List */
  }
      {loading ? <div className="py-24 text-center font-mono text-sm text-ink-navy/60">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-marigold mb-3" />
          <span>Consulting legislative outlays database...</span>
        </div> : filteredSchemes.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
          {filteredSchemes.map((s) => <div
    key={s.id}
    className="bg-paper border-2 border-ink-navy/15 rounded-lg p-4 shadow-md hover:border-marigold transition-all relative flex flex-col justify-between group overflow-hidden"
  >
              {
    /* Paper background grid watermark */
  }
              <div className="absolute top-0 right-0 w-20 h-20 bg-marigold/5 rounded-bl-full pointer-events-none group-hover:bg-marigold/15 transition-all" />

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-block bg-ink-navy text-paper text-[9px] font-mono font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                    {s.ministry || "Constituency Allocation"}
                  </span>
                  <span className="inline-block bg-moss text-paper text-[9px] font-mono font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                    {s.status}
                  </span>
                </div>

                <h3 className="font-serif text-xl font-bold text-ink-navy group-hover:text-marigold transition-colors leading-tight mb-3">
                  {s.title}
                </h3>

                <p className="text-sm text-ink-text leading-relaxed mb-4 whitespace-pre-wrap">
                  {s.description}
                </p>

                {
    /* Scope specifics */
  }
                <div className="space-y-3 bg-[#eae8df]/60 border border-ink-navy/5 p-3 rounded text-xs mb-4 font-sans">
                  <div>
                    <span className="font-mono text-[10px] uppercase text-ink-navy/60 block font-bold">
                      ELIGIBLE AUDIENCE / SCOPE:
                    </span>
                    <p className="text-ink-text font-medium mt-0.5">{s.targetAudience}</p>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] uppercase text-ink-navy/60 block font-bold">
                      BENEFITS &amp; ANNOUNCED PROVISIONS:
                    </span>
                    <p className="text-ink-text font-medium mt-0.5">{s.benefits}</p>
                  </div>
                </div>
              </div>

              {
    /* Policy Footer */
  }
              <div className="border-t border-ink-navy/10 pt-4 flex justify-between items-center text-xs font-mono">
                <span className="text-ink-navy/60 uppercase">BUDGET SANCTIONED:</span>
                <span className="font-bold text-ink-navy text-sm">
                  {s.budgetAllocated || "\u20B90 (Constituency Fund)"}
                </span>
              </div>

            </div>)}
        </div> : <div className="py-24 text-center bg-paper border border-ink-navy/15 rounded-lg">
          <HelpCircle className="w-10 h-10 text-ink-navy/40 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-bold text-ink-navy uppercase tracking-tight">
            No matching policies
          </h3>
          <p className="text-xs font-mono text-ink-navy/60 uppercase mt-1">
            Try revising your search keyword for welfare listings.
          </p>
        </div>}

    </div>;
};
