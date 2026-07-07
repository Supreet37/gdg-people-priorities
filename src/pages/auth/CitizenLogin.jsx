/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { WARDS_LIST } from "../../constants";
import { Landmark, ArrowLeft, Loader2 } from "lucide-react";
export const CitizenLogin = () => {
  const { login, register, loginWithGoogle, setActiveTab } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [ward, setWard] = useState(WARDS_LIST[0]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error("Google sign in failed:", err);
      setError(err.message || "Google Sign-In was interrupted. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isRegisterMode) {
        if (!name || !username || !password || !ward) {
          throw new Error("Please fill out all required register entries.");
        }
        await register({
          username,
          password,
          name,
          role: "citizen",
          ward,
          phoneNumber
        });
      } else {
        if (!username || !password) {
          throw new Error("Please enter your username and secret key.");
        }
        await login(username, password);
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Review your entries.");
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

      <div className="india-royal-card p-8 relative rounded-xl shadow-2xl">
        {
    /* Visual ribbon to mimic formal paperwork files */
  }
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-saffron via-marigold to-moss rounded-t-xl" />

        <div className="text-center mb-8 mt-2">
          <Landmark className="w-10 h-10 text-saffron mx-auto mb-2" />
          <h2 className="font-serif text-2xl font-bold text-ink-navy">
            {isRegisterMode ? "Citizen Registration" : "Citizen Grievance Register"}
          </h2>
          <p className="font-mono text-[10px] uppercase tracking-widest text-saffron mt-1 font-bold">
            {isRegisterMode ? "REGISTER NO. 10B / ENTRY" : "OFFICIAL LEDGER SIGN-IN"}
          </p>
        </div>

        {error && <div className="bg-stamp-red/5 border-l-4 border-stamp-red text-stamp-red text-xs p-3 rounded mb-6 font-mono">
            {error}
          </div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegisterMode && <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-ink-navy/70 mb-1">
                Full Name (in English or Hindi) *
              </label>
              <input
    type="text"
    value={name}
    onChange={(e) => setName(e.target.value)}
    placeholder="e.g., Aman Patel"
    className="w-full bg-white/60 border border-ink-navy/15 rounded px-3 py-2 text-sm focus:outline-none focus:border-marigold"
    required
  />
            </div>}

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-ink-navy/70 mb-1">
              Registered Email (Username) *
            </label>
            <input
    type="email"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    placeholder="citizen@people.in"
    className="w-full bg-white/60 border border-ink-navy/15 rounded px-3 py-2 text-sm focus:outline-none focus:border-marigold"
    required
  />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-ink-navy/70 mb-1">
              Secret Passkey (Password) *
            </label>
            <input
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="••••••••"
    className="w-full bg-white/60 border border-ink-navy/15 rounded px-3 py-2 text-sm focus:outline-none focus:border-marigold"
    required
  />
          </div>

          {isRegisterMode && <>
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-ink-navy/70 mb-1">
                  Primary Ward *
                </label>
                <select
    value={ward}
    onChange={(e) => setWard(e.target.value)}
    className="w-full bg-white/60 border border-ink-navy/15 rounded px-3 py-2 text-sm focus:outline-none focus:border-marigold"
    required
  >
                  {WARDS_LIST.map((w) => <option key={w} value={w}>
                      {w}
                    </option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-ink-navy/70 mb-1">
                  Mobile Number (For SMS Tracking)
                </label>
                <input
    type="tel"
    value={phoneNumber}
    onChange={(e) => setPhoneNumber(e.target.value)}
    placeholder="+91 99000 11000"
    className="w-full bg-white/60 border border-ink-navy/15 rounded px-3 py-2 text-sm focus:outline-none focus:border-marigold"
  />
              </div>
            </>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-saffron hover:bg-saffron/90 text-[#FAF8F2] font-bold px-4 py-3 rounded-lg shadow-md hover:shadow-saffron/10 transition-all text-xs font-mono tracking-widest uppercase mt-6 flex justify-center items-center gap-2 cursor-pointer"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isRegisterMode ? "REGISTER ACCOUNT" : "SECURE SIGN IN"}</span>
          </button>
        </form>

        <div className="flex items-center my-5">
          <div className="flex-1 border-t border-ink-navy/10" />
          <span className="px-3 text-[10px] font-mono uppercase text-ink-navy/40">OR</span>
          <div className="flex-1 border-t border-ink-navy/10" />
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          type="button"
          className="w-full flex items-center justify-center gap-2.5 bg-white border border-ink-navy/15 hover:bg-[#FAF8F2] text-ink-navy font-bold px-4 py-3 rounded-lg shadow-sm hover:shadow-md transition-all text-xs font-mono tracking-wider cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.53-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-8.83z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.74-2.11-6.68-4.96H1.21v3.15C3.18 21.88 7.39 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.32 14.24c-.24-.72-.38-1.5-.38-2.3c0-.8.14-1.58.38-2.3V6.49H1.21C.44 8.04 0 9.77 0 11.6c0 1.83.44 3.56 1.21 5.11l4.11-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.39 0 3.18 2.12 1.21 5.49l4.11 3.15c.94-2.85 3.57-4.89 6.68-4.89z"
              />
            </svg>
          )}
          <span>SIGN IN WITH GOOGLE</span>
        </button>

        <div className="border-t border-ink-navy/10 mt-8 pt-4 text-center">
          <p className="text-xs text-ink-text/60 font-medium">
            {isRegisterMode ? "Already registered?" : "First time submitting a grievance?"}
          </p>
          <button
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setError(null);
            }}
            className="text-xs font-mono font-bold text-saffron hover:text-amber-600 mt-1 cursor-pointer tracking-wider"
          >
            {isRegisterMode ? "LOG IN INSTEAD" : "CREATE CITIZEN REGISTER ENTRY"}
          </button>
        </div>

        {
    /* Demo Credentials Helper */
  }
        {!isRegisterMode && <div className="mt-6 bg-[#F1EDE2] p-3 rounded-lg border-2 border-marigold/30 text-[11px] font-mono leading-relaxed text-ink-navy/75 shadow-inner">
            <span className="font-bold uppercase text-saffron block mb-1">DEMO CITIZEN ACCOUNT:</span>
            <span>Username: </span><span className="font-bold text-ink-navy">citizen@people.in</span><br />
            <span>Passkey: </span><span className="font-bold text-ink-navy">password123</span>
          </div>}
      </div>
    </div>;
};
