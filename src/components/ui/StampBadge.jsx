/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
export const StampBadge = ({ status }) => {
  let text = "PENDING REGISTER";
  let colorClass = "";
  let animClass = "";
  switch (status) {
    case "PENDING":
      text = "PENDING REGISTER";
      colorClass = "text-stamp-red border-stamp-red bg-stamp-red/5";
      animClass = "stamp-badge-thunk-red";
      break;
    case "IN_REVIEW":
      text = "IN REVIEW";
      colorClass = "text-marigold border-marigold bg-marigold/5";
      animClass = "stamp-badge-thunk-orange";
      break;
    case "RESOLVED":
      text = "RESOLVED & ADDRESSED";
      colorClass = "text-moss border-moss bg-moss/5";
      animClass = "stamp-badge-thunk-green";
      break;
  }
  return <div className="inline-block overflow-visible py-2 px-3">
      <div
    className={`
          ${colorClass} ${animClass}
          font-mono font-bold text-xs tracking-widest uppercase
          border-3 border-dashed px-3 py-1.5 rounded
          inline-flex items-center justify-center gap-1.5
          shadow-sm opacity-90
          select-none
        `}
    style={{
      boxShadow: "inset 0 0 4px rgba(0,0,0,0.03)"
    }}
  >
        <span className="text-[10px]">●</span> {text}
      </div>
    </div>;
};
