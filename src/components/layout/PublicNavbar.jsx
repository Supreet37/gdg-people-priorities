/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useAuth } from "../../context/AuthContext";
import { Landmark } from "lucide-react";
export const PublicNavbar = () => {
  const { setActiveTab } = useAuth();
  return <nav className="bg-ink-navy text-paper border-b-4 border-saffron py-4 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4 relative shadow-lg">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-saffron via-marigold to-moss" />
      <div
    className="flex items-center gap-3 cursor-pointer select-none group"
    onClick={() => setActiveTab("landing")}
  >
        <Landmark className="w-8 h-8 text-marigold group-hover:scale-105 transition-transform" />
        <div>
          <span className="font-serif text-xl md:text-2xl font-bold tracking-tight block leading-tight text-paper">
            PEOPLE'S PRIORITIES
          </span>
          <span className="font-mono text-[9px] uppercase tracking-widest text-marigold block font-bold">
            Digital Grievance Ledger
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6 text-xs font-mono tracking-wider">
        <button
    onClick={() => setActiveTab("landing")}
    className="hover:text-marigold transition-colors cursor-pointer font-semibold"
  >
          LEDGER HOME
        </button>
        <button
    onClick={() => {
      setActiveTab("landing");
      setTimeout(() => {
        document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }}
    className="hover:text-marigold transition-colors cursor-pointer font-semibold"
  >
          HOW IT WORKS
        </button>
        <button
    onClick={() => {
      setActiveTab("landing");
      setTimeout(() => {
        document.getElementById("active-schemes")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }}
    className="hover:text-marigold transition-colors cursor-pointer font-semibold"
  >
          CONSTITUENCY SCHEMES
        </button>
        
        <div className="flex items-center gap-3 md:ml-4 border-l border-paper/20 pl-4">
          <button
    onClick={() => setActiveTab("citizen-login")}
    className="bg-saffron hover:bg-saffron/90 text-[#FAF8F2] px-4 py-1.5 rounded-lg font-bold font-mono text-xs transition-colors cursor-pointer"
  >
            CITIZEN REGISTER
          </button>
          <button
    onClick={() => setActiveTab("mp-login")}
    className="border border-paper/40 hover:border-marigold hover:text-marigold px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer font-bold"
  >
            OFFICIAL MP LOGIN
          </button>
        </div>
      </div>
    </nav>;
};
