import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SiteNav } from "@/components/SiteNav";
import { GoldParticles } from "@/components/GoldParticles";
import { Camera, CameraOff, Cpu, History, Sparkles, Activity, Check, X } from "lucide-react";
const sanskritLookup: Record<string, string> = {
  Pathaka: "पताक",
  Alapadmam: "अलपद्म",
  Katrimukha: "कर्तरीमुख",
  Mrigasirsha: "मृगशीर्ष",
  Mushti: "मुष्टि",
  Sikharam: "शिखर",
  Padmakosha: "पद्मकोश",
  Suchi: "सूची",
  Aralam: "अरल",
  Mayura: "मयूर",
};
const CORRECTION_OPTIONS = [
  "Pathaka", "Alapadmam", "Katrimukha", "Mrigasirsha", "Mushti",
  "Sikharam", "Padmakosha", "Suchi", "Aralam", "Mayura",
];

export const Route = createFileRoute("/detect")({
  component: DetectPage,
});

type Mudra = {
  name: string;
  sans: string;
  meaning: string;
  usage: string;
};

const LEXICON: Mudra[] = [
  { name: "Pathaka", sans: "पताक", meaning: "The Flag", usage: "Beginnings, clouds, forest, denial, river, entering a place." },
  { name: "Tripataka", sans: "त्रिपताक", meaning: "Three Parts of a Flag", usage: "Crown, tree, thunderbolt, an arrow, the king." },
  { name: "Ardhapataka", sans: "अर्धपताक", meaning: "Half-Flag", usage: "Tender shoots, a knife, banner, a tower." },
  { name: "Kartarimukha", sans: "कर्तरीमुख", meaning: "Scissor's Face", usage: "Separation, opposition, the falling of a star." },
  { name: "Mayura", sans: "मयूर", meaning: "The Peacock", usage: "The peacock's beak, vines, the neck, vomiting." },
  { name: "Ardhachandra", sans: "अर्धचन्द्र", meaning: "Half Moon", usage: "The moon on the eighth day, an axe, a plate, the waist." },
  { name: "Mushti", sans: "मुष्टि", meaning: "The Fist", usage: "Steadfastness, grasping the hair, holding things, strength." },
  { name: "Shikhara", sans: "शिखर", meaning: "The Peak", usage: "The bow, a pillar, the lower lip, asking a question." },
  { name: "Kapittha", sans: "कपित्थ", meaning: "Elephant Apple", usage: "Lakshmi, Sarasvati, holding cymbals, grasping a veil." },
  { name: "Hamsasya", sans: "हंसास्य", meaning: "Swan's Beak", usage: "Tying a sacred thread, drops of water, certainty, jasmine." },
];

function DetectPage() {
  
  const [current, setCurrent] = useState<Mudra>({ name: "", sans: "", meaning: "", usage: "" });
  const [confidence, setConfidence] = useState(0);
  const [displayConf, setDisplayConf] = useState(0);
  const [history, setHistory] = useState<{ mudra: Mudra; conf: number; t: number }[]>([]);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [correction, setCorrection] = useState("");
  const [feedbackSaved, setFeedbackSaved] = useState(false);
  const savedTimerRef = useRef<number>(0);
 
 useEffect(() => {
    if (!cameraStarted) return;

    const fetchPrediction = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/prediction");
        const data = await response.json();

        if (!data.mudra) return;

        const infoParts = data.info.split("|");
        const meaning = infoParts.length > 0 ? infoParts[0].trim() : "";
        const usage = infoParts.length > 1 ? infoParts[1].trim() : "";

        const mudraData: Mudra = {
          name: data.mudra,
          sans: sanskritLookup[data.mudra] || data.mudra,
          meaning,
          usage,
        };

        setCurrent(mudraData);
        setConfidence(data.confidence/100);
        setHistory((prev) => {
          const exists = prev.some((item) => item.mudra.name === mudraData.name);
          if (exists) return prev;
          return [{ mudra: mudraData, conf: data.confidence / 100, t: Date.now() }, ...prev].slice(0, 8);
        });
      } catch (err) {
        console.error("Prediction fetch failed:", err);
      }
    };

    fetchPrediction();
    const interval = setInterval(fetchPrediction, 1000);
    return () => clearInterval(interval);
  }, [cameraStarted]);

  // Smooth confidence animation
  useEffect(() => {
    let raf = 0;
    const animate = () => {
      setDisplayConf((d) => {
        const diff = confidence * 100 - d;
        if (Math.abs(diff) < 0.2) return confidence * 100;
        return d + diff * 0.08;
      });
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [confidence]);


  async function sendFeedback(mudraName: string, correct: boolean, predicted?: string) {
  try {
    const body: Record<string, unknown> = { mudra: mudraName, correct };
    if (predicted !== undefined) body.predicted = predicted;
    await fetch("http://127.0.0.1:5000/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    // silently ignore
  }
  setFeedbackSaved(true);
  window.clearTimeout(savedTimerRef.current);
  savedTimerRef.current = window.setTimeout(() => setFeedbackSaved(false), 2000);
}

  return (
    <div className="relative min-h-screen">
      <SiteNav />
      <GoldParticles density={30} className="opacity-50" />

      <div className="relative mx-auto max-w-7xl px-6 pt-32 pb-20">
        {/* Header */}
        <div className="reveal flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.4em] text-gold flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" /> Live Detection Studio
            </div>
            <h1 className="mt-4 font-serif text-5xl md:text-6xl leading-none">
              Show a <span className="italic gold-text">Mudra.</span>
            </h1>
          </div>
          <StatusPill active={true} />
        </div>

        <div className="hairline mt-8 opacity-60" />

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          {/* LEFT — webcam */}
          <div className="reveal" style={{ animationDelay: "0.15s" }}>
            <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden glass-gold float-slow">
              <div className="absolute inset-0 rounded-3xl shimmer opacity-25 pointer-events-none" />
              {cameraStarted ? (
  <img
    src="http://127.0.0.1:5000/video_feed"
    alt="Live Mudra Detection"
    className="absolute inset-0 h-full w-full object-cover"
  />
) : (
  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
    <Camera className="h-12 w-12 text-gold mb-6" />
    <div className="font-serif text-3xl mb-3">Ready to Detect</div>
    <p className="text-sm text-muted-foreground mb-8">
      Click below to activate the live detection studio
    </p>
    <button
      onClick={() => setCameraStarted(true)}
      className="px-8 py-3 border-2 border-gold text-gold font-sans text-sm uppercase tracking-widest hover:bg-gold hover:text-black transition-all duration-300"
    >
      Activate Camera →
    </button>
  </div>
)}
              

              {/* Corner crosshairs */}
              {[
                "top-4 left-4 border-l-2 border-t-2",
                "top-4 right-4 border-r-2 border-t-2",
                "bottom-4 left-4 border-l-2 border-b-2",
                "bottom-4 right-4 border-r-2 border-b-2",
              ].map((c) => (
                <div key={c} className={`absolute h-6 w-6 border-gold ${c} rounded-sm`} />
              ))}

              {/* Bottom HUD */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-cream/80">
                <span className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-border text-foreground flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 pulse-dot" />
                  REC · 1280 × 720
                </span>
                <span className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-border text-foreground">
                  Vision · Inference Active
                </span>
              </div>
            </div>

            {/* Tech strip */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <TechStat icon={<Cpu className="h-4 w-4" />} label="Model" value="MudraNet v1" />
              <TechStat icon={<Activity className="h-4 w-4" />} label="Inference" value="32 fps" />
              <TechStat icon={<Sparkles className="h-4 w-4" />} label="Lexicon" value="28 hastas" />
            </div>
          </div>

          {/* RIGHT — readout */}
          <div className="space-y-6">
            {/* Mudra card */}
            {current.name !== "" && (
              <div key={current.name} className="glass rounded-3xl p-8 slide-up">
              <div className="text-[10px] uppercase tracking-[0.4em] text-gold">Detected Mudra</div>
              <div className="mt-4 font-serif text-7xl gold-text leading-none">{current.sans}</div>
              <div className="mt-3 font-serif text-3xl text-foreground">{current.name}</div>
              <div className="hairline w-16 mt-4 opacity-60" />
              <div className="mt-5">
                <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Meaning</div>
                <div className="mt-1 text-foreground/90">{current.meaning}</div>
              </div>
              <div className="mt-4">
                <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Symbolism & Usage</div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{current.usage}</p>
              </div>
            </div>
            )}

            {/* Confidence */}
            <div className="glass rounded-3xl p-7">
              <div className="flex items-center justify-between">
                <div className="text-[10px] uppercase tracking-[0.4em] text-gold">Confidence</div>
                <div className="font-serif text-3xl gold-text tabular-nums">{displayConf.toFixed(1)}%</div>
              </div>
              <div className="mt-4 relative h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-300 ease-out"
                  style={{
                    width: `${displayConf}%`,
                    background: "linear-gradient(90deg, #8a5a2b, #c9a84c 50%, #e6cd7a)",
                    boxShadow: "0 0 16px rgba(201,168,76,0.7)",
                  }}
                />
                <div className="absolute inset-0 shimmer opacity-40 pointer-events-none" />
              </div>
              <div className="mt-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Live inference · updated continuously
              </div>
            </div>
            {/* Feedback */}
{current.name !== "" && (
  <div className="glass rounded-3xl p-6">
    <div className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4">Is This Correct?</div>
    {!correctionOpen ? (
      <div className="flex items-center gap-3">
        <button
          onClick={() => sendFeedback(current.name, true)}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-2.5 text-sm text-green-400 backdrop-blur-md transition hover:bg-green-500/20 hover:border-green-500/50"
        >
          <Check className="h-4 w-4" /> Correct
        </button>
        <button
          onClick={() => setCorrectionOpen(true)}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400 backdrop-blur-md transition hover:bg-red-500/20 hover:border-red-500/50"
        >
          <X className="h-4 w-4" /> Wrong
        </button>
      </div>
    ) : (
      <div className="space-y-3">
        <select
          value={correction}
          onChange={(e) => {
            const val = e.target.value;
            setCorrection(val);
            if (val) {
              sendFeedback(val, false, current.name);
              setCorrectionOpen(false);
              setCorrection("");
            }
          }}
          className="w-full rounded-2xl border border-gold/30 bg-white/[0.04] px-4 py-2.5 text-sm text-foreground backdrop-blur-md outline-none focus:border-gold/60"
        >
          <option value="" className="bg-[#111]">Select correct mudra…</option>
          {CORRECTION_OPTIONS.map((opt) => (
            <option key={opt} value={opt} className="bg-[#111]">{opt}</option>
          ))}
        </select>
        <button
          onClick={() => { setCorrectionOpen(false); setCorrection(""); }}
          className="text-xs text-muted-foreground hover:text-foreground transition"
        >
          Cancel
        </button>
      </div>
    )}
    {feedbackSaved && (
      <div className="mt-3 text-sm text-green-400 transition-opacity duration-500">
        Saved <Check className="inline h-3.5 w-3.5" />
      </div>
    )}
  </div>
)}



            {/* History */}
            <div className="glass rounded-3xl p-7">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-gold">
                <History className="h-3.5 w-3.5" /> Detection History
              </div>
              <ul className="mt-5 space-y-2">
                {history.length === 0 && (
                  <li className="text-sm text-muted-foreground">Awaiting first detection…</li>
                )}
                {history.map((h, i) => (
                  <li
                    key={h.t}
                    className="slide-up flex items-center justify-between rounded-xl border border-border/60 bg-white/[0.02] px-4 py-3 hover:border-gold/40 transition-colors"
                    style={{ animationDelay: `${i * 0.04}s` }}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="font-serif text-2xl gold-text shrink-0">{h.mudra.sans}</div>
                      <div className="min-w-0">
                        <div className="font-serif text-base text-foreground truncate">{h.mudra.name}</div>
                        <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground truncate">
                          {h.mudra.meaning}
                        </div>
                      </div>
                    </div>
                    <div className="font-mono text-xs text-gold tabular-nums shrink-0">
                      {(h.conf * 100).toFixed(0)}%
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full glass px-5 py-2.5">
      <span className={`h-2 w-2 rounded-full ${active ? "bg-green-500 pulse-dot" : "bg-red-500"}`} />
      <span className="text-[11px] uppercase tracking-[0.3em] text-foreground">
        {active ? "AI Detection Active" : "AI Detection Idle"}
      </span>
    </div>
  );
}

function TechStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-2 text-gold">{icon}<span className="text-[10px] uppercase tracking-[0.3em]">{label}</span></div>
      <div className="mt-1.5 font-serif text-lg text-foreground">{value}</div>
    </div>
  );
}
