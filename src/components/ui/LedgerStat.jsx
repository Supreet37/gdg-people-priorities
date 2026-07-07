/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
export const LedgerStat = ({ label, value, subtext, indexCode }) => {
  return <div className="bg-paper border-r border-b border-ink-navy/20 p-5 flex flex-col justify-between h-36 relative overflow-hidden group hover:bg-[#eae8df] transition-colors duration-200">
      {
    /* Index label in the corner of physical register ledger sheets */
  }
      {indexCode && <span className="absolute top-2 right-3 font-mono text-[10px] text-ink-navy/40 tracking-wider">
          {indexCode}
        </span>}
      
      <div>
        <p className="text-xs uppercase font-mono tracking-wider text-ink-navy/60">
          {label}
        </p>
      </div>

      <div className="my-2">
        <p className="font-mono text-3xl font-bold text-ink-navy leading-none tracking-tight">
          {typeof value === "number" ? String(value).padStart(4, "0") : value}
        </p>
      </div>

      {subtext && <div className="text-[11px] font-mono text-ink-navy/50 truncate">
          {subtext}
        </div>}
    </div>;
};
