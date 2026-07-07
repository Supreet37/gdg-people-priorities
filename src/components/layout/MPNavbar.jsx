/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useAuth } from "../../context/AuthContext";
import { Landmark, LogOut, UserCircle, LayoutDashboard, Database, BarChart3, Map, FileSpreadsheet, Settings2 } from "lucide-react";
export const MPNavbar = () => {
  const { user, activeTab, setActiveTab, logout } = useAuth();
  const navItems = [
    { id: "mp-overview", label: "OVERVIEW", icon: LayoutDashboard },
    { id: "mp-submissions", label: "GRIEVANCE REGISTER", icon: Database },
    { id: "mp-rankings", label: "PRIORITIES", icon: BarChart3 },
    { id: "mp-heatmap", label: "WARD MAP", icon: Map },
    { id: "mp-schemes", label: "SCHEMES ADMIN", icon: Settings2 },
    { id: "mp-reports", label: "AUDIT REPORTS", icon: FileSpreadsheet }
  ];
  return <nav className="bg-ink-navy text-paper border-b-4 border-saffron py-4 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4 relative shadow-lg">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-saffron via-marigold to-moss" />
      <div
    className="flex items-center gap-3 cursor-pointer select-none group"
    onClick={() => setActiveTab("mp-overview")}
  >
        <Landmark className="w-8 h-8 text-marigold group-hover:scale-105 transition-transform" />
        <div>
          <span className="font-serif text-xl md:text-2xl font-bold tracking-tight block leading-tight text-paper">
            PEOPLE'S PRIORITIES
          </span>
          <span className="font-mono text-[9px] uppercase tracking-widest text-marigold block font-bold">
            MP Command Console
          </span>
        </div>
      </div>

      {
    /* Tabs */
  }
      <div className="flex flex-wrap items-center justify-center gap-1 md:gap-2">
        {navItems.map((item) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    return <button
      key={item.id}
      onClick={() => setActiveTab(item.id)}
      className={`
                flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-xs tracking-wider transition-all cursor-pointer font-semibold
                ${isActive ? "bg-saffron text-[#FAF8F2] font-bold shadow-md shadow-saffron/25" : "text-paper/80 hover:text-paper hover:bg-paper/5"}
              `}
    >
              <Icon className="w-4 h-4" />
              <span className="hidden xl:inline">{item.label}</span>
            </button>;
  })}
      </div>

      {
    /* MP Profile Actions */
  }
      <div className="flex items-center gap-4 border-t border-paper/10 pt-3 md:pt-0 md:border-t-0 w-full md:w-auto justify-between md:justify-end">
        <div className="flex items-center gap-2 text-xs font-mono text-paper/80">
          <UserCircle className="w-5 h-5 text-marigold animate-pulse" />
          <div className="text-left leading-tight">
            <span className="font-bold text-[#FAF8F2] block text-sm">{user?.name}</span>
            <span className="text-[9px] text-marigold block tracking-widest uppercase font-bold">CONSTITUENCY MP</span>
          </div>
        </div>

        <button
    onClick={logout}
    className="flex items-center gap-1.5 border border-paper/20 hover:border-stamp-red hover:bg-stamp-red/10 hover:text-stamp-red px-3 py-1.5 rounded-lg font-mono text-xs tracking-wider transition-all cursor-pointer font-bold"
  >
          <LogOut className="w-3.5 h-3.5" />
          <span>EXIT CONSOLE</span>
        </button>
      </div>
    </nav>;
};
