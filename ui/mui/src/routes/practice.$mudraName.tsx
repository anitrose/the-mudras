import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteNav } from "@/components/SiteNav";
import { GoldParticles } from "@/components/GoldParticles";
import { Camera, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/practice/$mudraName")({
  component: PracticePage,
});

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

const CONNECTIONS: [number, number][] = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [0,9],[9,10],[10,11],[11,12],
  [0,13],[13,14],[14,15],[15,16],
  [0,17],[17,18],[18,19],[19,20],
  [5,9],[9,13],[13,17],
];
function getNormalizedPoints(landmarks: number[], size = 400, padding = 40) {
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i < 21; i++) {
    xs.push(landmarks[i * 3]);
    ys.push(landmarks[i * 3 + 1]);
  }
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const rangeX = maxX - minX;
  const rangeY = maxY - minY;
  const range = Math.max(rangeX, rangeY) || 1;
  const usable = size - padding * 2;

  const offsetX = (range - rangeX) / 2;
  const offsetY = (range - rangeY) / 2;

  return Array.from({ length: 21 }, (_, i) => ({
    x: ((xs[i] - minX + offsetX) / range) * usable + padding,
    y: ((ys[i] - minY + offsetY) / range) * usable + padding,
  }));
}
  
function PracticePage() {
  const { mudraName } = useParams({ from: "/practice/$mudraName" });
  const [referenceLandmarks, setReferenceLandmarks] = useState<number[] | null>(null);
  const [referenceError, setReferenceError] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [detected, setDetected] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [matched, setMatched] = useState(false);
  const points = referenceLandmarks ? getNormalizedPoints(referenceLandmarks) : [];

  // Fetch reference skeleton
  useEffect(() => {
    const fetchRef = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:5000/reference/${mudraName}`);
        const data = await res.json();
        if (data.landmarks) {
          setReferenceLandmarks(data.landmarks);
        } else {
          setReferenceError(true);
        }
      } catch (err) {
        setReferenceError(true);
      }
    };
    fetchRef();
  }, [mudraName]);

  // Poll prediction
  useEffect(() => {
    if (!cameraStarted || matched) return;

    const fetchPrediction = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/prediction");
        const data = await res.json();
        setDetected(data.mudra || "");
        setConfidence(data.confidence || 0);
        if (data.mudra === mudraName) {
          setMatched(true);
        }
      } catch (err) {
        console.error("Prediction fetch failed:", err);
      }
    };

    fetchPrediction();
    const interval = setInterval(fetchPrediction, 1000);
    return () => clearInterval(interval);
  }, [cameraStarted, matched, mudraName]);

  const isMatch = detected === mudraName;
  const isWrong = detected !== "" && detected !== mudraName;

  return (
    <div className="relative min-h-screen">
      <SiteNav />
      <GoldParticles density={30} className="opacity-50" />

      <div className="relative mx-auto max-w-7xl px-6 pt-32 pb-20">
        {/* Header */}
        <div className="reveal">
          <Link to="/learn" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Lexicon
          </Link>
          <div className="mt-4 text-[11px] uppercase tracking-[0.4em] text-gold">
            Practice Mode
          </div>
          <h1 className="mt-2 font-serif text-5xl md:text-6xl leading-none">
            Practice <span className="italic gold-text">{mudraName}</span>
          </h1>
        </div>

        <div className="hairline mt-8 opacity-60" />

        {/* Two panels */}
        <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:sticky lg:top-24 lg:self-start">
          {/* Reference */}
          <div className="reveal glass rounded-3xl p-8">
            <div className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4">Reference Pose</div>
            <div className="aspect-square w-full flex items-center justify-center">
              {referenceError ? (
  <div className="flex flex-col items-center text-center px-6">
    <div className="font-serif text-2xl mb-2 text-foreground">Not Available Yet</div>
    <p className="text-sm text-muted-foreground max-w-xs">
      Live practice currently supports the 10 core mudras. This one is coming soon.
    </p>
  </div>
) : referenceLandmarks ? (
  <svg viewBox="0 0 400 400" className="w-full h-full">
                  {CONNECTIONS.map(([a, b], i) => (
                    <line
                      key={i}
                      x1={points[a].x}
                      y1={points[a].y}
                      x2={points[b].x}
                      y2={points[b].y}
                      stroke="#c9a84c"
                      strokeWidth={2}
                      style={{ filter: "drop-shadow(0 0 4px #c9a84c)" }}
                    />
                  ))}
                  {points.map((p, i) => (
                    <circle
                      key={i}
                      cx={p.x}
                      cy={p.y}
                      r={5}
                      fill="#c9a84c"
                      style={{ filter: "drop-shadow(0 0 4px #c9a84c)" }}
                    />
                  ))}
                </svg>
              ) : (
                <div className="text-muted-foreground text-sm">Loading reference...</div>
              )}
            </div>
             {!referenceError && (
              <img
                src={`http://127.0.0.1:5000/sample_image/${mudraName}`}
                alt={`${mudraName} reference`}
                className="mt-4 mx-auto rounded-xl max-h-64 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            <div className="mt-4 text-center font-serif text-5xl gold-text">
              {sanskritLookup[mudraName] || mudraName}
            </div>
          </div>

          {/* Webcam */}
          <div className="reveal glass rounded-3xl p-8" style={{ animationDelay: "0.15s" }}>
            <div className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4">Your Hand</div>
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black/40 flex items-center justify-center">
              {cameraStarted ? (
                <>
                  <img
                    src="http://127.0.0.1:5000/video_feed"
                    alt="Live feed"
                    className="w-full h-full object-cover"
                  />
                  {matched && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
                      <CheckCircle2 className="h-16 w-16 text-green-400 mb-4" />
                      <div className="font-serif text-3xl text-green-400 mb-2">Perfect Match!</div>
                      <div className="text-sm text-muted-foreground mb-6 uppercase tracking-[0.3em]">
                        {confidence.toFixed(1)}% Confidence
                      </div>
                      <button
                        onClick={() => setMatched(false)}
                        className="px-8 py-3 border-2 border-gold text-gold font-sans text-sm uppercase tracking-widest hover:bg-gold hover:text-black transition-all duration-300"
                      >
                        Try Again →
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center text-center px-6">
                  <Camera className="h-10 w-10 text-gold mb-4 animate-pulse" />
                  <div className="font-serif text-2xl mb-2">Ready to Practice</div>
                  <p className="text-sm text-muted-foreground mb-6">Click below to activate your camera</p>
                  <button
                    onClick={() => setCameraStarted(true)}
                    className="px-8 py-3 border-2 border-gold text-gold font-sans text-sm uppercase tracking-widest hover:bg-gold hover:text-black transition-all duration-300"
                  >
                    Activate Camera →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Match Result */}
        <div className="mt-8 glass rounded-3xl p-8 reveal" style={{ animationDelay: "0.3s" }}>
          {referenceError ? (
            <div className="text-center text-muted-foreground text-sm uppercase tracking-[0.3em]">
              Practice mode unavailable for this mudra
            </div>
          ) : !cameraStarted ? (
            <div className="text-center text-muted-foreground text-sm uppercase tracking-[0.3em]">
              Activate camera to begin
            </div>
          ) : null}

          {!referenceError && cameraStarted && detected === "" && (
            <div className="text-center text-muted-foreground text-sm uppercase tracking-[0.3em]">
              Show your hand to the camera
            </div>
          )}

          {!referenceError && cameraStarted && isMatch && (
            <div>
              <div className="flex items-center justify-center gap-3 text-green-400 text-2xl font-serif">
                <CheckCircle2 className="h-7 w-7" /> Perfect Match!
              </div>
              <div className="mt-4 relative h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-300 ease-out"
                  style={{
                    width: `${confidence}%`,
                    background: "linear-gradient(90deg, #8a5a2b, #c9a84c 50%, #e6cd7a)",
                    boxShadow: "0 0 16px rgba(201,168,76,0.7)",
                  }}
                />
              </div>
              <div className="mt-2 text-center text-xs text-muted-foreground uppercase tracking-[0.3em]">
                {confidence.toFixed(1)}% Confidence
              </div>
            </div>
          )}

          {!referenceError && cameraStarted && isWrong && (
            <div className="flex items-center justify-center gap-3 text-amber-400 text-xl font-serif">
              <XCircle className="h-6 w-6" /> Keep Trying — You're showing {detected}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}