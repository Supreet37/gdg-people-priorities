/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useState, useRef } from "react";
import { api } from "../../services/api";
import { WARDS_LIST } from "../../constants";
import { StampBadge } from "../../components/ui/StampBadge";
import { MapPin, Activity, Loader2, AlertTriangle, Layers, Info, CheckCircle2 } from "lucide-react";
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useMap } from "@vis.gl/react-google-maps";

//Enhanced API Key handling with better debugging
const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  import.meta.env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  globalThis.GOOGLE_MAPS_PLATFORM_KEY ||
  '';

// Debug: Show exactly what's happening
console.log('=== GOOGLE MAPS API DEBUG ===');
console.log('1. API Key exists?', Boolean(API_KEY));
console.log('2. API Key length:', API_KEY.length);
console.log('3. API Key prefix:', API_KEY.substring(0, 10) + '...');
console.log('4. Is it the default placeholder?', API_KEY === 'YOUR_API_KEY' || API_KEY === '');
console.log('5. Is it long enough?', API_KEY.length > 20);

// More robust validity check
const hasValidKey = Boolean(API_KEY) && 
                   API_KEY !== 'YOUR_API_KEY' && 
                   API_KEY.length > 20 &&
                   !API_KEY.includes('YOUR_');

console.log('6. Has valid key?', hasValidKey);

// Latitude & Longitude centroids for Balasore Sadar constituency Wards
const WARD_COORDINATES = {
  "Ward 1 - Sahadevkhunta": { lat: 21.4825, lng: 86.9252 },
  "Ward 2 - Mallikashpur": { lat: 21.4948, lng: 86.9112 },
  "Ward 3 - Kuruda": { lat: 21.4632, lng: 86.9485 },
  "Ward 4 - Station Road": { lat: 21.4885, lng: 86.9202 },
  "Ward 5 - Azimabad": { lat: 21.5045, lng: 86.9312 },
  "Ward 6 - Nua Bazar": { lat: 21.4955, lng: 86.9385 },
  "Ward 7 - Somanathpur": { lat: 21.4712, lng: 86.9525 },
  "Ward 8 - Phuladi": { lat: 21.5110, lng: 86.9412 },
  "Ward 9 - Angargadia": { lat: 21.4895, lng: 86.9054 },
  "Ward 10 - Sunhat": { lat: 21.5052, lng: 86.9185 },
  "Ward 11 - Arad Bazar": { lat: 21.5032, lng: 86.9512 },
  "Ward 12 - Gopalgaon": { lat: 21.4925, lng: 86.9282 }
};

// Map controller to handle pan and zoom when ward is changed
function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (map && center) {
      map.panTo(center);
      map.setZoom(13.5);
    }
  }, [map, center]);
  return null;
}

export const MPHeatmap = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWardIndex, setSelectedWardIndex] = useState(6); // Default: Somanathpur
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [mapCenter, setMapCenter] = useState(WARD_COORDINATES["Ward 7 - Somanathpur"]);
  const [viewMode, setViewMode] = useState("all"); // "all", "unresolved", "resolved"

  useEffect(() => {
    async function fetchComplaints() {
      try {
        const data = await api.mp.getAllComplaints();
        setComplaints(data);
      } catch (e) {
        console.error("Error fetching complaints:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchComplaints();
  }, []);

  const wardStatsList = WARDS_LIST.map((wardName, idx) => {
    const wardComplaints = complaints.filter((c) => c.ward === wardName);
    const total = wardComplaints.length;
    const resolved = wardComplaints.filter((c) => c.status === "RESOLVED").length;
    const active = total - resolved;
    const resolvedPercentage = total > 0 ? Math.round(resolved / total * 100) : 100;
    const estimatedPopulation = 25e3 + (idx * 4200) % 15e3;
    const catCounts = {};
    wardComplaints.forEach((c) => {
      catCounts[c.category] = (catCounts[c.category] || 0) + 1;
    });
    const topCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Water Supply";
    return {
      wardName,
      total,
      resolved,
      active,
      resolvedPercentage,
      estimatedPopulation,
      topCategory,
      wardComplaints,
      coords: WARD_COORDINATES[wardName] || { lat: 28.66, lng: 77.21 }
    };
  });

  const activeWardData = wardStatsList[selectedWardIndex] || wardStatsList[0];

  const handleWardClick = (index, wData) => {
    setSelectedWardIndex(index);
    setMapCenter(wData.coords);
    setSelectedComplaint(null);
  };

  // Generate deterministic coordinates for individual complaints in the ward
  const getComplaintCoordinates = (complaint, index) => {
    const wardName = complaint.ward || "Ward 7 - Somanathpur";
    const baseCoord = WARD_COORDINATES[wardName] || { lat: 21.49, lng: 86.93 };
    
    // Golden angle distribution so multiple complaints do not overlay exactly
    const angle = (index * 137.5) * (Math.PI / 180);
    const radius = 0.0035 + (index % 4) * 0.0012; 
    
    return {
      lat: baseCoord.lat + radius * Math.sin(angle),
      lng: baseCoord.lng + radius * Math.cos(angle)
    };
  };

  const filteredComplaints = complaints.filter((c) => {
    if (viewMode === "resolved") return c.status === "RESOLVED";
    if (viewMode === "unresolved") return c.status !== "RESOLVED";
    return true;
  });

  return (
    <div className="max-w-[96%] mx-auto px-4 py-4 md:py-6">
      {/* Header */}
      <div className="border-b border-ink-navy/10 pb-3 mb-4 flex flex-wrap justify-between items-end gap-3">
        <div>
          <span className="font-mono text-[10px] text-marigold tracking-widest uppercase block mb-1">
            TOPOLOGICAL AUDIT &amp; GEOSPATIAL INTELLIGENCE
          </span>
          <h1 className="font-serif text-3xl font-bold text-ink-navy">
            Constituency Hotspot Map
          </h1>
          <p className="text-sm text-ink-text/75 mt-1">
            Visual territorial index of critical public priorities. Trace active grievances and infrastructure deficits in real-time.
          </p>
        </div>

        {/* View filters */}
        <div className="flex bg-[#EDEBE2] border border-ink-navy/15 p-0.5 rounded-lg text-xs font-mono">
          <button
            onClick={() => setViewMode("all")}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${viewMode === "all" ? "bg-ink-navy text-white font-bold" : "text-ink-navy/70 hover:bg-white/20"}`}
          >
            ALL
          </button>
          <button
            onClick={() => setViewMode("unresolved")}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${viewMode === "unresolved" ? "bg-stamp-red text-white font-bold animate-pulse" : "text-ink-navy/70 hover:bg-white/20"}`}
          >
            ACTIVE PENDING
          </button>
          <button
            onClick={() => setViewMode("resolved")}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${viewMode === "resolved" ? "bg-moss text-white font-bold" : "text-ink-navy/70 hover:bg-white/20"}`}
          >
            RESOLVED
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center font-mono text-sm text-ink-navy/60">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-marigold mb-3" />
          <span>Formulating spatial coordinates...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Main Visualizer Panel */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            
            {/* Real Google Maps Platform Component */}
            {hasValidKey ? (
              <div className="bg-paper border border-ink-navy/15 rounded-xl overflow-hidden shadow-sm h-[520px] relative">
                <div className="absolute top-3 left-3 z-10 bg-ink-navy text-white px-3 py-1.5 rounded-md font-mono text-[10px] font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-marigold animate-pulse" />
                  <span>Interactive Hotspot Map Active</span>
                </div>

                <APIProvider apiKey={API_KEY} version="weekly">
                  <Map
                    defaultCenter={{ lat: 28.66, lng: 77.21 }}
                    defaultZoom={12}
                    mapId="DEMO_MAP_ID"
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    style={{ width: '100%', height: '100%' }}
                    gestureHandling="cooperative"
                    disableDefaultUI={false}
                  >
                    <MapController center={mapCenter} />

                    {/* Ward Centroids & Heat intensity */}
                    {wardStatsList.map((w, idx) => {
                      const isSelected = selectedWardIndex === idx;
                      let intensityColor = "#10B981"; // Green
                      if (w.active > 0 && w.active <= 2) intensityColor = "#D97706"; // Amber
                      if (w.active > 2) intensityColor = "#BE184A"; // Red

                      return (
                        <AdvancedMarker
                          key={`ward-${idx}`}
                          position={w.coords}
                          title={w.wardName}
                          onClick={() => handleWardClick(idx, w)}
                        >
                          <div className={`p-1.5 rounded-full flex items-center justify-center transition-all ${
                            isSelected ? "ring-4 ring-marigold scale-110" : "hover:scale-105"
                          }`} style={{ backgroundColor: `${intensityColor}33`, border: `2px solid ${intensityColor}` }}>
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: intensityColor }} />
                          </div>
                        </AdvancedMarker>
                      );
                    })}

                    {/* Complaint Specific Pins */}
                    {filteredComplaints.map((c, idx) => {
                      const coords = getComplaintCoordinates(c, idx);
                      const isSelected = selectedComplaint?.id === c.id;

                      let pinBg = "#D97706";
                      if (c.status === "RESOLVED") pinBg = "#10B981";
                      else if (c.priority === "HIGH" || c.priority === "URGENT") pinBg = "#BE184A";

                      return (
                        <AdvancedMarker
                          key={`complaint-${c.id}`}
                          position={coords}
                          title={c.title}
                          onClick={() => setSelectedComplaint({ ...c, coords })}
                        >
                          <Pin
                            background={pinBg}
                            borderColor="#1B2A4A"
                            glyphColor="#FAF8F2"
                            scale={isSelected ? 1.25 : 0.95}
                          />
                        </AdvancedMarker>
                      );
                    })}

                    {/* Active Complaint Popup details */}
                    {selectedComplaint && (
                      <InfoWindow
                        position={selectedComplaint.coords}
                        onCloseClick={() => setSelectedComplaint(null)}
                      >
                        <div className="p-1 max-w-[240px] font-sans">
                          <div className="flex items-center gap-1.5 mb-1 text-[9px] font-mono font-bold text-ink-navy/60 uppercase">
                            <span>{selectedComplaint.entryNumber || "Grievance Entry"}</span>
                            <span>•</span>
                            <span className="text-marigold">{selectedComplaint.category}</span>
                          </div>
                          <h4 className="font-serif font-bold text-xs text-ink-navy leading-snug mb-1">
                            {selectedComplaint.title}
                          </h4>
                          <p className="text-[10px] text-ink-text/85 line-clamp-3 mb-2 leading-relaxed">
                            {selectedComplaint.description}
                          </p>
                          <div className="flex justify-between items-center border-t border-ink-navy/10 pt-1.5 mt-1">
                            <span className="text-[9px] font-mono text-ink-navy/50">{selectedComplaint.ward.split(" - ")[0]}</span>
                            <StampBadge status={selectedComplaint.status} />
                          </div>
                        </div>
                      </InfoWindow>
                    )}
                  </Map>
                </APIProvider>
              </div>
            ) : (
              /* Fallback Sandbox View with detailed visual step-by-step setup guide */
              <div className="bg-paper border border-ink-navy/15 rounded-xl p-5 shadow-sm flex flex-col gap-5">
                <div className="bg-amber-500/10 border border-marigold/30 rounded-lg p-4 flex gap-3 items-start">
                  <AlertTriangle className="w-5 h-5 text-marigold shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-mono font-bold uppercase text-ink-navy tracking-wide">
                      Google Maps Platform Integration Ready
                    </h4>
                    <p className="text-xs text-ink-text/80 leading-relaxed mt-1">
                      Our system is fully equipped to overlay live grievance coordinates, heat intensity layers, and ward boundaries using official Google Maps SDKs. Set your credentials below to active the immersive spatial console.
                    </p>
                  </div>
                </div>

                {/* Setup Instructions Card */}
                <div className="border border-ink-navy/10 bg-[#EDEBE2]/30 rounded-lg p-5 font-mono text-xs">
                  <h5 className="font-bold text-ink-navy uppercase text-[10px] tracking-wider mb-3 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-marigold" />
                    <span>Instructions to enable live Google Maps Hotspots</span>
                  </h5>
                  <ol className="list-decimal list-inside space-y-2 text-ink-navy/80 leading-relaxed">
                    <li>
                      Generate a web API key via the{" "}
                      <a
                        href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-600 underline font-bold"
                      >
                        Google Maps Platform Console
                      </a>.
                    </li>
                    <li>
                      When the <span className="font-bold text-ink-navy">"Enter your environment variable to continue"</span> popup appears, paste your key.
                    </li>
                    <li>
                      Or click the <span className="font-bold text-ink-navy">Settings (⚙️ Gear Icon)</span> in the top-right corner of the editor, choose <span className="font-bold">Secrets</span>, add <code className="bg-[#EDEBE2] px-1 rounded font-bold">GOOGLE_MAPS_PLATFORM_KEY</code>, paste your token, and hit Enter.
                    </li>
                    <li>
                      The environment automatically triggers a production compile. No page reload required!
                    </li>
                  </ol>
                </div>

                {/* Visual fallback ward list */}
                <div>
                  <h3 className="font-serif text-lg font-bold text-ink-navy mb-3 flex items-center gap-2 uppercase tracking-tight">
                    <MapPin className="w-5 h-5 text-marigold" />
                    <span>Balasore Sadar Ward Heat Matrix (Sandbox Fallback)</span>
                  </h3>
                  <p className="text-xs text-ink-text/70 mb-4">
                    Color depth is relative to unresolved grievance count. Click any card to audit the localized register.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {wardStatsList.map((wData, index) => {
                      const isSelected = selectedWardIndex === index;
                      let intensityClass = "bg-moss/10 hover:bg-moss/20 text-[#1B2A4A]";
                      if (wData.active > 0 && wData.active <= 2) {
                        intensityClass = "bg-marigold/10 hover:bg-marigold/20 text-[#1B2A4A]";
                      } else if (wData.active > 2) {
                        intensityClass = "bg-stamp-red/10 hover:bg-stamp-red/20 text-[#1B2A4A]";
                      }
                      return (
                        <div
                          key={index}
                          onClick={() => handleWardClick(index, wData)}
                          className={`
                            border-2 p-3 rounded-lg cursor-pointer transition-all flex flex-col justify-between text-left h-24
                            ${isSelected ? "border-marigold bg-[#EDEBE2] shadow-md ring-2 ring-marigold/25 scale-102" : "border-ink-navy/15 hover:border-ink-navy/30"}
                            ${!isSelected ? intensityClass : ""}
                          `}
                        >
                          <div>
                            <span className="font-mono text-[9px] text-ink-navy/55 block">JURISDICTION ZONE</span>
                            <h4 className="font-serif text-sm font-bold truncate mt-0.5">
                              {wData.wardName.split(" - ")[0]}
                            </h4>
                            <span className="font-mono text-[8px] text-ink-navy/50 block font-bold leading-none mt-1">
                              {wData.wardName.split(" - ")[1]}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-[10px] font-mono border-t border-ink-navy/10 pt-2 mt-2">
                            <span>ACTIVE: <span className="font-bold">{wData.active}</span></span>
                            <span className="text-[9px] font-bold text-moss">{wData.resolvedPercentage}% RES</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Selected Ward Register Logs */}
          <div className="lg:col-span-4 bg-paper border-2 border-ink-navy/15 p-4 rounded-xl shadow-md flex flex-col h-[520px] overflow-hidden">
            <span className="font-mono text-[9px] text-marigold uppercase tracking-widest font-bold">WARD GENERAL FILE</span>
            <h3 className="font-serif text-xl font-bold text-ink-navy border-b border-ink-navy/10 pb-2 mt-1 leading-tight">
              {activeWardData.wardName}
            </h3>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2.5 py-3 border-b border-ink-navy/10 font-mono text-xs text-ink-navy">
              <div className="bg-[#EDEBE2]/40 border border-ink-navy/5 rounded p-2">
                <span className="text-[9px] text-ink-navy/55 block font-bold">POPULATION CENSUS</span>
                <span className="font-bold mt-1 block truncate">
                  {activeWardData.estimatedPopulation.toLocaleString()}
                </span>
              </div>
              <div className="bg-[#EDEBE2]/40 border border-ink-navy/5 rounded p-2">
                <span className="text-[9px] text-ink-navy/55 block font-bold">ACTIVE PRIORITY</span>
                <span className="font-bold mt-1 block text-stamp-red">
                  {activeWardData.active} Cases
                </span>
              </div>
              <div className="bg-[#EDEBE2]/40 border border-ink-navy/5 rounded p-2">
                <span className="text-[9px] text-ink-navy/55 block font-bold">TOTAL REGISTERED</span>
                <span className="font-bold mt-1 block">
                  {activeWardData.total} Grievances
                </span>
              </div>
              <div className="bg-[#EDEBE2]/40 border border-ink-navy/5 rounded p-2">
                <span className="text-[9px] text-ink-navy/55 block font-bold">TOP PRIMARY SECTOR</span>
                <span className="font-bold mt-1 block text-marigold uppercase text-[10px] truncate">
                  {activeWardData.topCategory}
                </span>
              </div>
            </div>

            {/* Ward Grievances Feed */}
            <div className="mt-4 flex-1 flex flex-col min-h-0">
              <h4 className="font-mono text-[10px] text-ink-navy/60 uppercase font-bold mb-3 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-marigold" />
                <span>Localized Register Feed ({activeWardData.wardComplaints.length})</span>
              </h4>

              {activeWardData.wardComplaints.length > 0 ? (
                <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
                  {activeWardData.wardComplaints.map((c, idx) => {
                    const coords = getComplaintCoordinates(c, idx);
                    return (
                      <div
                        key={c.id}
                        onClick={() => {
                          if (hasValidKey) {
                            setSelectedComplaint({ ...c, coords });
                            setMapCenter(coords);
                          }
                        }}
                        className={`border p-2.5 rounded transition-all cursor-pointer text-left ${
                          selectedComplaint?.id === c.id
                            ? "border-marigold bg-[#EDEBE2] ring-1 ring-marigold/35"
                            : "bg-white/40 border-ink-navy/5 hover:border-ink-navy/25"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1.5 text-[9px] font-mono text-ink-navy/50 mb-0.5">
                          <span>{c.entryNumber}</span>
                          <span>{c.category}</span>
                        </div>
                        <h5 className="font-serif text-xs font-bold text-ink-navy leading-tight line-clamp-1 mb-1">
                          {c.title}
                        </h5>
                        <p className="text-[10px] text-ink-text/70 line-clamp-1 leading-normal">
                          {c.description}
                        </p>
                        <div className="flex justify-between items-center mt-2 pt-1 border-t border-ink-navy/5">
                          <span className="text-[8px] font-mono text-ink-navy/40">
                            {c.date ? new Date(c.date).toLocaleDateString() : "Pending date"}
                          </span>
                          <span className="scale-75 origin-right">
                            <StampBadge status={c.status} />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-ink-navy/15 rounded-lg py-12 text-center">
                  <CheckCircle2 className="w-6 h-6 text-moss mb-2 opacity-60" />
                  <span className="text-[10px] font-mono text-ink-navy/40 uppercase">No active grievances registered</span>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

