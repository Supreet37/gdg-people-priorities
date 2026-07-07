/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { COMPLAINT_CATEGORIES } from "../../constants";
import { StampBadge } from "../../components/ui/StampBadge";
import { AlertTriangle, Loader2, ChevronRight, Camera, Mic, Square, Trash2, Upload, Volume2, Music, Check, RefreshCw } from "lucide-react";

export const SubmitComplaint = () => {
  const { user, setActiveTab } = useAuth();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(COMPLAINT_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [successResult, setSuccessResult] = useState(null);
  const [error, setError] = useState(null);

  // Multimodal Evidence States
  const [photo, setPhoto] = useState("");
  const [photoMimeType, setPhotoMimeType] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");

  const [audio, setAudio] = useState("");
  const [audioMimeType, setAudioMimeType] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [activeTab, setActiveEvidenceTab] = useState("voice");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);

  // Speech to Text Dictation States
  const [isDictating, setIsDictating] = useState(false);
  const [dictationLang, setDictationLang] = useState("en-IN");
  const recognitionRef = useRef(null);
  const textBeforeDictationRef = useRef("");

  const handleDictationToggle = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or another compatible browser.");
      return;
    }

    if (isDictating) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsDictating(false);
    } else {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = dictationLang;

        textBeforeDictationRef.current = description;

        rec.onstart = () => {
          setIsDictating(true);
        };

        rec.onresult = (event) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcriptSegment = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcriptSegment;
            } else {
              interimTranscript += transcriptSegment;
            }
          }

          const combined = textBeforeDictationRef.current + 
            (textBeforeDictationRef.current && (finalTranscript || interimTranscript) ? " " : "") + 
            finalTranscript + interimTranscript;
          
          setDescription(combined);
        };

        rec.onerror = (e) => {
          console.error("Speech Recognition Error:", e);
          if (e.error === "not-allowed") {
            alert("Microphone permission denied. Please enable microphone permissions in your browser.");
          } else if (e.error !== "aborted") {
            alert(`Speech recognition error: ${e.error}`);
          }
          setIsDictating(false);
        };

        rec.onend = () => {
          setIsDictating(false);
        };

        recognitionRef.current = rec;
        rec.start();
      } catch (err) {
        console.error("Speech Recognition initialization failed:", err);
        setIsDictating(false);
      }
    }
  };

  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  // Photo handlers
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Photo file must be less than 5MB.");
      return;
    }
    setPhotoMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result);
      const base64Data = reader.result.split(",")[1];
      setPhoto(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhoto("");
    setPhotoMimeType("");
    setPhotoPreview("");
  };

  // Audio recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioMimeType("audio/webm");
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result.split(",")[1];
          setAudio(base64Data);
        };
        reader.readAsDataURL(audioBlob);

        // Stop all tracks to release mic
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access failed:", err);
      alert("Could not access microphone. Please check system permissions or upload an audio file instead.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("Audio file must be less than 10MB.");
      return;
    }
    setAudioMimeType(file.type);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result.split(",")[1];
      setAudio(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const removeAudio = () => {
    setAudio("");
    setAudioMimeType("");
    setAudioUrl("");
    setRecordingDuration(0);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setSuccessResult(null);
    try {
      if (!title || !description) {
        throw new Error("Title and detailed description are required.");
      }
      setLoadingStage("Recording draft in local constituency ledger registry...");
      await sleep(1000);
      setLoadingStage("Analyzing keywords & routing to category inspectors...");
      await sleep(800);
      setLoadingStage("Connecting to Google Gemini API (gemini-3.5-flash) for priority weighting...");
      await sleep(1200);
      if (photo || audio) {
        setLoadingStage("Analyzing attached multimodal proof (images & voice files) with Gemini...");
        await sleep(1000);
      }
      setLoadingStage("Generating urgency score & calculating affected population impact...");
      await sleep(900);
      setLoadingStage("Creating recommended Member of Parliament action draft...");
      
      const saved = await api.complaints.submit({
        title,
        description,
        category,
        priority,
        ward: user?.ward || "Ward 7 - Somanathpur",
        photo,
        photoMimeType,
        audio,
        audioMimeType
      });

      await sleep(500);
      setSuccessResult(saved);
      setTitle("");
      setDescription("");
      setCategory(COMPLAINT_CATEGORIES[0]);
      setPriority("MEDIUM");
      removePhoto();
      removeAudio();
    } catch (err) {
      setError(err.message || "Grievance could not be registered. Please check backend services.");
    } finally {
      setLoading(false);
      setLoadingStage("");
    }
  };

  return (
    <div className="max-w-[96%] mx-auto px-4 py-4 md:py-6">
      {/* Title */}
      <div className="border-b border-ink-navy/10 pb-3 mb-4">
        <span className="font-mono text-[10px] text-marigold tracking-widest uppercase block mb-1">
          Grievance Lodge Counter
        </span>
        <h1 className="font-serif text-3xl font-bold text-ink-navy">
          Lodge New Ward Grievance
        </h1>
        <p className="text-sm text-ink-text/70 mt-1">
          Your complaint will be logged into the official register, indexed, and analyzed using AI to rank its urgency for the Member of Parliament's immediate review.
        </p>
      </div>

      {error && (
        <div className="bg-stamp-red/5 border-l-4 border-stamp-red text-stamp-red text-xs p-3 rounded mb-6 font-mono">
          {error}
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="bg-paper border-2 border-dashed border-marigold p-8 rounded-lg text-center my-8 shadow-inner animate-pulse">
          <Loader2 className="w-8 h-8 text-marigold animate-spin mx-auto mb-4" />
          <h3 className="font-serif text-lg font-bold text-ink-navy uppercase tracking-tight">
            PROCESSING LEDGER ENTRY
          </h3>
          <p className="font-mono text-xs text-marigold mt-2 tracking-wider uppercase">
            {loadingStage}
          </p>
          <div className="mt-4 max-w-md mx-auto h-1.5 bg-ink-navy/10 rounded-full overflow-hidden">
            <div className="h-full bg-marigold rounded-full animate-infinite-bar w-1/2" />
          </div>
        </div>
      )}

      {/* Success Result Display (The Ledger Page) */}
      {successResult && !loading && (
        <div className="bg-paper border-2 border-ink-navy shadow-lg rounded-lg p-6 md:p-8 mb-8 relative overflow-hidden">
          {/* Certificate style corners */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-moss" />
          <div className="flex justify-between items-start flex-col sm:flex-row gap-4 mb-6">
            <div>
              <span className="font-mono text-[10px] text-moss uppercase tracking-widest block font-bold">
                REGISTRY RECEIPT // RECORDED
              </span>
              <h3 className="font-serif text-2xl font-bold text-ink-navy mt-1">
                Grievance Recorded Successfully
              </h3>
            </div>
            <StampBadge status={successResult.status} />
          </div>

          <div className="border border-ink-navy/15 rounded bg-white/40 p-4 font-mono text-xs space-y-2 mb-6">
            <div className="flex justify-between border-b border-ink-navy/5 pb-2">
              <span className="text-ink-navy/60">LEDGER NO:</span>
              <span className="font-bold text-ink-navy">{successResult.entryNumber}</span>
            </div>
            <div className="flex justify-between border-b border-ink-navy/5 pb-2">
              <span className="text-ink-navy/60">WARD:</span>
              <span className="font-bold text-ink-navy">{successResult.ward}</span>
            </div>
            <div className="flex justify-between border-b border-ink-navy/5 pb-2">
              <span className="text-ink-navy/60">CATEGORY:</span>
              <span className="font-bold text-ink-navy">{successResult.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-navy/60">LODGED ON:</span>
              <span className="font-bold text-ink-navy">
                {new Date(successResult.date).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* AI Prioritization Summary block */}
          <div className="bg-ink-navy text-paper p-5 rounded-lg mb-6 border border-ink-navy/25">
            <h4 className="font-mono text-[10px] text-marigold tracking-widest uppercase mb-3 font-bold flex items-center gap-1.5">
              <span>●</span> AI LEDGER INSIGHT (GEMINI SUMMARY)
            </h4>
            <p className="font-sans text-sm italic leading-relaxed text-paper/90 border-l-2 border-marigold pl-3 mb-4">
              "{successResult.aiSummary}"
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-paper/10 pt-4 text-xs font-mono">
              <div className="bg-paper/5 p-3 rounded">
                <span className="text-paper/60 uppercase block">URGENCY SCORE:</span>
                <span className="font-bold text-marigold text-lg block mt-1">
                  {successResult.aiAnalysis?.urgencyScore || 5} / 10
                </span>
                <span className="text-[9px] text-paper/40 block mt-0.5">Calculated by safety impact</span>
              </div>
              <div className="bg-paper/5 p-3 rounded">
                <span className="text-paper/60 uppercase block">AFFECTED HOUSEHOLDS:</span>
                <span className="font-bold text-paper text-lg block mt-1">
                  ~{successResult.aiAnalysis?.estimatedImpact || 50} Families
                </span>
                <span className="text-[9px] text-paper/40 block mt-0.5">Density-weighted scope</span>
              </div>
            </div>

            <div className="mt-4 bg-paper/5 p-3 rounded font-sans text-xs">
              <span className="font-mono text-marigold uppercase text-[10px] tracking-wider block font-bold mb-1">
                RECOMMENDED ACTION PLAN:
              </span>
              <p className="text-paper/85 leading-normal">
                {successResult.aiAnalysis?.recommendedAction}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setActiveTab("citizen-complaints")}
              className="bg-ink-navy text-paper hover:bg-ink-navy/90 px-6 py-2.5 rounded font-mono text-xs tracking-wider transition-colors cursor-pointer flex-1 text-center font-bold"
            >
              TRACK COMPLAINT IN MY LEDGER
            </button>
            <button
              onClick={() => setSuccessResult(null)}
              className="border border-ink-navy/20 hover:bg-white/50 px-5 py-2.5 rounded font-mono text-xs tracking-wider transition-colors cursor-pointer"
            >
              LODGE ANOTHER GRIEVANCE
            </button>
          </div>
        </div>
      )}

      {/* Main Submission Form */}
      {!loading && !successResult && (
        <form onSubmit={handleSubmit} className="bg-paper border border-ink-navy/15 rounded-lg p-4 md:p-6 space-y-4 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-ink-navy/70 mb-1">
                Grievance Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Clogged drain canal causing backup flood in Main Bazaar"
                className="w-full bg-white/60 border border-ink-navy/15 rounded px-3 py-2 text-sm focus:outline-none focus:border-marigold"
                required
              />
              <span className="text-[10px] text-ink-navy/50 block mt-1 font-mono">
                Give a short, precise summary of the immediate concern.
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-ink-navy/70 mb-1">
                Grievance Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white/60 border border-ink-navy/15 rounded px-3 py-2 text-sm focus:outline-none focus:border-marigold"
                required
              >
                {COMPLAINT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-ink-navy/50 block mt-1 font-mono">
                Enables sorting to appropriate municipal division teams.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-ink-navy/70 mb-1">
                Primary Constituency Ward
              </label>
              <input
                type="text"
                value={user?.ward || "Ward 7 - Somanathpur"}
                disabled
                className="w-full bg-ink-navy/5 border border-ink-navy/10 rounded px-3 py-2 text-sm font-mono text-ink-navy/60 cursor-not-allowed"
              />
              <span className="text-[10px] text-ink-navy/50 block mt-1 font-mono">
                Auto-locked to your registered residence ward record.
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-ink-navy/70 mb-1">
                Initial Severity Estimation *
              </label>
              <div className="flex gap-2">
                {["LOW", "MEDIUM", "HIGH"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`
                      flex-1 py-2 text-xs font-mono rounded border font-bold transition-all cursor-pointer
                      ${priority === p ? (p === "HIGH" ? "bg-stamp-red text-paper border-stamp-red shadow-sm" : p === "MEDIUM" ? "bg-marigold text-ink-navy border-marigold shadow-sm" : "bg-moss text-paper border-moss shadow-sm") : "bg-white/40 border-ink-navy/15 text-ink-navy/60 hover:bg-white/80"}
                    `}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-ink-navy/50 block mt-1 font-mono">
                Self-reported distress level of the situation.
              </span>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-ink-navy/70">
                Detailed Statement &amp; Observations *
              </label>
              
              <div className="flex items-center gap-2">
                <select
                  value={dictationLang}
                  onChange={(e) => setDictationLang(e.target.value)}
                  disabled={isDictating}
                  className="text-[10px] font-mono bg-[#EDEBE2] border border-ink-navy/15 rounded px-2 py-1 focus:outline-none text-ink-navy cursor-pointer disabled:opacity-50"
                >
                  <option value="en-IN">EN (India)</option>
                  <option value="hi-IN">हिन्दी (Hindi)</option>
                </select>

                <button
                  type="button"
                  onClick={handleDictationToggle}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer shadow-sm ${
                    isDictating
                      ? "bg-stamp-red text-[#FAF8F2] border border-stamp-red animate-pulse"
                      : "bg-marigold text-ink-navy border border-marigold/30 hover:bg-amber-600 hover:text-white"
                  }`}
                >
                  <Mic className={`w-3.5 h-3.5 ${isDictating ? "animate-bounce" : ""}`} />
                  <span>{isDictating ? "STOP DICTATING" : "DICTATE WITH VOICE"}</span>
                </button>

                {isDictating && (
                  <div className="flex items-end gap-0.5 h-4.5 px-2 bg-stamp-red/5 rounded border border-stamp-red/15 py-0.5">
                    <div className="w-0.5 bg-stamp-red rounded-full animate-voice-bar h-2.5" style={{ animationDelay: "0.1s" }} />
                    <div className="w-0.5 bg-stamp-red rounded-full animate-voice-bar h-5" style={{ animationDelay: "0.3s" }} />
                    <div className="w-0.5 bg-stamp-red rounded-full animate-voice-bar h-1.5" style={{ animationDelay: "0.5s" }} />
                    <div className="w-0.5 bg-stamp-red rounded-full animate-voice-bar h-4" style={{ animationDelay: "0.2s" }} />
                    <div className="w-0.5 bg-stamp-red rounded-full animate-voice-bar h-5.5" style={{ animationDelay: "0.4s" }} />
                    <div className="w-0.5 bg-stamp-red rounded-full animate-voice-bar h-3" style={{ animationDelay: "0.6s" }} />
                  </div>
                )}
              </div>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Provide a thorough, detailed account. E.g., 'The open drain adjacent to Lane 3 in Mallikashpur has been overflowing for the last 12 days. The septic gas odor is overwhelming, mosquitoes are breeding in large numbers, and water has pooled inside the front yards of houses 45, 47, and 49...'"
              className="w-full bg-white/60 border border-ink-navy/15 rounded px-3 py-3 text-sm focus:outline-none focus:border-marigold leading-relaxed"
              required
            />
            <span className="text-[10px] text-ink-navy/50 block mt-1 font-mono">
              PRO TIP: Detailed statements provide high-quality Gemini analysis outputs, improving your overall urgency rating in priorities ranking!
            </span>
          </div>

          {/* Multimodal Media Intake Block */}
          <div className="border border-ink-navy/15 rounded-lg overflow-hidden bg-white/40">
            <div className="bg-[#eae8df] px-4 py-2 border-b border-ink-navy/15 flex justify-between items-center">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink-navy/80">
                MULTIMODAL EVIDENCE REGISTER
              </span>
              <span className="font-mono text-[9px] text-marigold bg-ink-navy/5 px-2 py-0.5 rounded uppercase font-bold">
                Direct Gemini Analysis Support
              </span>
            </div>

            <div className="flex border-b border-ink-navy/10 bg-white/20">
              <button
                type="button"
                onClick={() => setActiveEvidenceTab("voice")}
                className={`flex-1 py-2 text-xs font-mono font-bold flex justify-center items-center gap-1.5 border-r border-ink-navy/10 ${activeTab === "voice" ? "bg-white text-ink-navy border-b-2 border-b-marigold" : "text-ink-navy/60 hover:bg-white/45"}`}
              >
                <Mic className="w-3.5 h-3.5" />
                VOICE INTAKE (MULTILINGUAL)
              </button>
              <button
                type="button"
                onClick={() => setActiveEvidenceTab("photo")}
                className={`flex-1 py-2 text-xs font-mono font-bold flex justify-center items-center gap-1.5 ${activeTab === "photo" ? "bg-white text-ink-navy border-b-2 border-b-marigold" : "text-ink-navy/60 hover:bg-white/45"}`}
              >
                <Camera className="w-3.5 h-3.5" />
                PHOTO PROOF
              </button>
            </div>

            <div className="p-4 bg-white/30">
              {/* Voice Intake Tab */}
              {activeTab === "voice" && (
                <div className="space-y-4">
                  <p className="text-[11px] text-ink-navy/70 leading-normal">
                    Submit your issue in Hindi, Tamil, Telugu, English, or any regional language. Gemini translates and integrates the recording into the constituency priority index.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-3">
                    {!audioUrl && !isRecording && (
                      <button
                        type="button"
                        onClick={startRecording}
                        className="bg-stamp-red text-paper hover:bg-stamp-red/90 px-5 py-3 rounded-full font-mono text-xs font-bold tracking-wider flex items-center gap-2 shadow transition-all cursor-pointer"
                      >
                        <Mic className="w-4 h-4 animate-pulse" />
                        START RECORDING GRIEVANCE
                      </button>
                    )}

                    {isRecording && (
                      <div className="flex flex-col items-center gap-2 w-full">
                        <div className="flex items-center gap-3">
                          <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stamp-red opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-stamp-red"></span>
                          </span>
                          <span className="font-mono text-sm font-bold text-stamp-red animate-pulse">
                            RECORDING LIVE: {formatDuration(recordingDuration)}
                          </span>
                        </div>
                        {/* Audio Wave Visualizer Block */}
                        <div className="flex items-center gap-1 h-8 px-8 w-full max-w-xs justify-center">
                          {[...Array(12)].map((_, i) => (
                            <div
                              key={i}
                              className="w-1.5 bg-stamp-red rounded-full animate-voice-bar"
                              style={{
                                animationDelay: `${i * 0.1}s`,
                                height: `${Math.floor(Math.random() * 24) + 6}px`
                              }}
                            />
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="bg-ink-navy text-paper hover:bg-ink-navy/90 px-4 py-2 rounded-full font-mono text-xs font-bold tracking-wider flex items-center gap-1.5 cursor-pointer mt-1"
                        >
                          <Square className="w-3.5 h-3.5" />
                          STOP RECORDING
                        </button>
                      </div>
                    )}

                    {audioUrl && (
                      <div className="w-full space-y-3 bg-paper/65 border border-ink-navy/10 rounded p-3 flex flex-col sm:flex-row items-center gap-3 justify-between">
                        <div className="flex items-center gap-2">
                          <div className="bg-moss/10 text-moss p-2 rounded-full">
                            <Music className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-mono text-[10px] text-moss uppercase tracking-wider block font-bold">
                              VOICE STATEMENT RECORDED
                            </span>
                            <span className="text-[10px] text-ink-navy/50 block font-mono">
                              File registered &amp; queued for Gemini translation
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <audio src={audioUrl} controls className="h-8 max-w-[200px]" />
                          <button
                            type="button"
                            onClick={removeAudio}
                            className="text-stamp-red hover:bg-stamp-red/10 p-2 rounded transition-colors"
                            title="Delete voice statement"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {!audioUrl && !isRecording && (
                    <div className="border-t border-dashed border-ink-navy/10 pt-3 flex items-center justify-between">
                      <span className="font-mono text-[9px] text-ink-navy/40">OR UPLOAD RECORDED AUDIO:</span>
                      <label className="text-[10px] font-mono text-marigold hover:underline cursor-pointer font-bold uppercase">
                        Browse Audio File
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={handleAudioUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* Photo Evidence Tab */}
              {activeTab === "photo" && (
                <div className="space-y-4">
                  <p className="text-[11px] text-ink-navy/70 leading-normal">
                    Upload clear photo proof of road defects, drainage, streetlights, or sanitation blockages. Gemini visual models analyze images directly to verify severity.
                  </p>

                  <div className="flex items-center justify-center">
                    {!photoPreview ? (
                      <label className="border-2 border-dashed border-ink-navy/15 hover:border-marigold bg-paper/30 hover:bg-paper/50 rounded-lg p-6 w-full text-center cursor-pointer transition-colors flex flex-col items-center gap-2">
                        <Camera className="w-8 h-8 text-ink-navy/40" />
                        <span className="text-xs font-mono font-bold text-ink-navy/80">
                          CLICK TO CHOOSE OR DRAG PROTO GRAPH HERE
                        </span>
                        <span className="text-[9px] text-ink-navy/50 font-mono">
                          Supports PNG, JPG (Max 5MB)
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="w-full relative border border-ink-navy/10 rounded-lg overflow-hidden bg-paper/60 p-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-16 h-16 border-2 border-ink-navy bg-white rounded overflow-hidden shadow-sm flex-shrink-0">
                            <img
                              src={photoPreview}
                              alt="Grievance evidence"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-ink-navy/10" />
                          </div>
                          <div>
                            <span className="font-mono text-[10px] text-moss uppercase tracking-wider block font-bold">
                              PHOTO ATTACHED
                            </span>
                            <span className="text-[10px] text-ink-navy/50 block font-mono">
                              File registered &amp; queued for multimodal vision analysis
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="bg-stamp-red/10 text-stamp-red hover:bg-stamp-red/25 p-2 rounded transition-colors self-center flex items-center gap-1 font-mono text-[10px] font-bold"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          REMOVE
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#eae8df] p-4 rounded border border-ink-navy/10 flex gap-3 items-start text-xs text-ink-navy/70 leading-relaxed">
            <AlertTriangle className="w-5 h-5 text-marigold shrink-0" />
            <p>
              I hereby declare that this grievance is genuine and describes a real infrastructure or municipal bottleneck in my primary ward. I understand that filing false, abusive, or spam register records will lead to account restrictions.
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-ink-navy text-paper hover:bg-ink-navy/90 font-bold px-6 py-3.5 rounded transition-colors text-xs font-mono tracking-widest uppercase flex justify-center items-center gap-2 cursor-pointer shadow-md"
          >
            <span>SUBMIT GRIEVANCE TO DIGITAL LEDGER</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
};
