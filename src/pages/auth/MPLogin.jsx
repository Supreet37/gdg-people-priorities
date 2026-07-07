/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Landmark, ArrowLeft, ShieldAlert, Loader2 } from "lucide-react";
export const MPLogin = () => {
  const { login, setActiveTab } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!username || !password) {
        throw new Error("Please enter official credentials.");
      }
      await login(username, password);
    } catch (err) {
      setError(err.message || "Credentials invalid. Offical administration access restricted.");
    } finally {
      setLoading(false);
    }
  };
  return <div className="max-w-md mx-auto my-12 px-4">
      <button
    onClick={() => setActiveTab("landing")}
    className="flex items-center gap-2 text-xs font-mono text-ink-navy hover:text-marigold mb-6 cursor-pointer group"
  >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>BACK TO LEDGER HOME</span>
      </button>

      <div className="bg-ink-navy text-paper border-2 border-marigold/40 shadow-2xl rounded-xl p-8 relative overflow-hidden">
        {
    /* Seal design to elevate command feel */
  }
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-saffron via-marigold to-moss rounded-t-xl" />

        <div className="text-center mb-8">
          <Landmark className="w-12 h-12 text-marigold mx-auto mb-2" />
          <h2 className="font-serif text-2xl font-bold tracking-tight text-paper">
            Office of the MP
          </h2>
          <p className="font-mono text-[9px] uppercase tracking-widest text-marigold mt-1">
            CONSTITUENCY COMMAND CONSOLE
          </p>
        </div>

        {error && <div className="bg-stamp-red/10 border-l-4 border-stamp-red text-stamp-red text-xs p-3 rounded mb-6 font-mono">
            {error}
          </div>}

        <div className="bg-paper/5 border border-paper/10 p-4 rounded mb-6 flex gap-3 items-start">
          <ShieldAlert className="w-5 h-5 text-marigold shrink-0 mt-0.5" />
          <p className="text-[11px] text-paper/80 leading-normal font-sans">
            WARNING: This system logs and processes official legislative priorities and MPLAD funds. Unauthorized login attempts are tracked and flagged.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-paper/60 mb-1">
              Official Username *
            </label>
            <input
    type="email"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    placeholder="e.g., mp@people.in"
    className="w-full bg-paper/5 border border-paper/20 rounded px-3 py-2 text-sm text-paper focus:outline-none focus:border-marigold"
    required
  />
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-paper/60 mb-1">
              Official Passkey *
            </label>
            <input
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="••••••••"
    className="w-full bg-paper/5 border border-paper/20 rounded px-3 py-2 text-sm text-paper focus:outline-none focus:border-marigold"
    required
  />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-saffron hover:bg-saffron/90 text-[#FAF8F2] font-bold px-4 py-3 rounded-lg shadow-md hover:shadow-saffron/15 transition-all text-xs font-mono tracking-widest uppercase mt-6 flex justify-center items-center gap-2 cursor-pointer"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>ENTER MP COMMAND DASHBOARD</span>
          </button>
        </form>

        {
    /* Demo Credentials Helper */
  }
        <div className="mt-8 bg-[#FAF8F2]/5 p-3 rounded-lg border-2 border-marigold/20 text-[11px] font-mono leading-relaxed text-paper/70">
          <span className="font-bold uppercase text-marigold block mb-1">MP DEMO ACCOUNT:</span>
          <span>Username: </span><span className="font-bold text-[#FAF8F2]">mp@people.in</span><br />
          <span>Passkey: </span><span className="font-bold text-[#FAF8F2]">password123</span>
        </div>
      </div>
    </div>;
};
