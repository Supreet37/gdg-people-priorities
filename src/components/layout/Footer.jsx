/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Landmark } from "lucide-react";
export const Footer = () => {
  return <footer className="bg-ink-navy text-paper/60 border-t-2 border-marigold/40 py-8 px-6 md:px-12 mt-16 font-mono text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <Landmark className="w-5 h-5 text-marigold" />
          <div>
            <span className="font-serif font-bold text-sm tracking-tight text-paper block">
              PEOPLE'S PRIORITIES
            </span>
            <span className="text-[10px] tracking-wider text-marigold uppercase">
              Constituency Grievance Register
            </span>
          </div>
        </div>

        <div className="text-center md:text-right max-w-md">
          <p className="leading-relaxed">
            Digitizing paper registers into clean, ranked, actionable prioritization metrics. Designed for municipal accountability and transparent constituency administration.
          </p>
          <p className="text-[10px] mt-2 text-paper/40">
            © {(/* @__PURE__ */ new Date()).getFullYear()} Office of the Member of Parliament. All grievances are processed under local jurisdiction guidelines.
          </p>
        </div>
      </div>
    </footer>;
};
