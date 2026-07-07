/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { AuthProvider, useAuth } from "./context/AuthContext";
import { PublicNavbar } from "./components/layout/PublicNavbar";
import { CitizenNavbar } from "./components/layout/CitizenNavbar";
import { MPNavbar } from "./components/layout/MPNavbar";
import { Footer } from "./components/layout/Footer";
import { Landing } from "./pages/Landing";
import { CitizenLogin } from "./pages/auth/CitizenLogin";
import { MPLogin } from "./pages/auth/MPLogin";
import { CitizenDashboard } from "./pages/citizen/CitizenDashboard";
import { SubmitComplaint } from "./pages/citizen/SubmitComplaint";
import { MyComplaints } from "./pages/citizen/MyComplaints";
import { SchemesView } from "./pages/citizen/SchemesView";
import { MPOverview } from "./pages/mp/MPOverview";
import { MPSubmissions } from "./pages/mp/MPSubmissions";
import { MPRankings } from "./pages/mp/MPRankings";
import { MPHeatmap } from "./pages/mp/MPHeatmap";
import { MPSchemes } from "./pages/mp/MPSchemes";
import { MPReports } from "./pages/mp/MPReports";
const AppContent = () => {
  const { user, activeTab } = useAuth();
  if (!user) {
    return <div className="min-h-screen bg-[#EDEBE2] text-ink-text flex flex-col">
        <PublicNavbar />
        <main className="flex-grow animate-fade-in">
          {activeTab === "landing" && <Landing />}
          {activeTab === "citizen-login" && <CitizenLogin />}
          {activeTab === "mp-login" && <MPLogin />}
        </main>
        <Footer />
      </div>;
  }
  if (user.role === "citizen") {
    return <div className="min-h-screen bg-[#EDEBE2] text-ink-text flex flex-col">
        <CitizenNavbar />
        <main className="flex-grow animate-fade-in">
          {activeTab === "citizen-overview" && <CitizenDashboard />}
          {activeTab === "citizen-submit" && <SubmitComplaint />}
          {activeTab === "citizen-complaints" && <MyComplaints />}
          {activeTab === "citizen-schemes" && <SchemesView />}
        </main>
        <Footer />
      </div>;
  }
  if (user.role === "mp") {
    return <div className="min-h-screen bg-[#EDEBE2] text-ink-text flex flex-col">
        <MPNavbar />
        <main className="flex-grow animate-fade-in">
          {activeTab === "mp-overview" && <MPOverview />}
          {activeTab === "mp-submissions" && <MPSubmissions />}
          {activeTab === "mp-rankings" && <MPRankings />}
          {activeTab === "mp-heatmap" && <MPHeatmap />}
          {activeTab === "mp-schemes" && <MPSchemes />}
          {activeTab === "mp-reports" && <MPReports />}
        </main>
        <Footer />
      </div>;
  }
  return <div className="min-h-screen bg-[#EDEBE2] flex items-center justify-center p-4">
      <div className="text-center font-mono text-sm text-ink-navy/60">
        Initiating safe digital registry fallback...
      </div>
    </div>;
};
export default function App() {
  return <AuthProvider>
      <AppContent />
    </AuthProvider>;
}
