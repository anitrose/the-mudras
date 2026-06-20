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
  const [liveLandmarks, setLiveLandmarks] = useState<number[] | null>(null);
  const [suggestion, setSuggestion] = useState<string>("");
  const [suggestionFinger, setSuggestionFinger] = useState<string | null>(null);
  const [matched, setMatched] = useState(false);
  const [ignoreUntil, setIgnoreUntil] = useState<number>(0);
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
        // Server now returns raw landmarks for guidance
        if (data.landmarks && data.landmarks.length >= 63) {
          setLiveLandmarks(data.landmarks as number[]);
        } else {
          setLiveLandmarks(null);
        }
        if (data.mudra === mudraName && Date.now() >= ignoreUntil) {
          setMatched(true);
        }
      } catch (err) {
        console.error("Prediction fetch failed:", err);
      }
    };

    fetchPrediction();
    // faster polling for live suggestions
    const interval = setInterval(fetchPrediction, 400);
    return () => clearInterval(interval);
  }, [cameraStarted, matched, mudraName]);

  // Compute a single prioritized suggestion whenever liveLandmarks or reference changes
  useEffect(() => {
    if (!liveLandmarks || !referenceLandmarks) {
      setSuggestion("");
      setSuggestionFinger(null);
      return;
    }

    const pt = (arr: number[], i: number) => ({ x: arr[i * 3], y: arr[i * 3 + 1] });

    // compute hand span from current landmarks
    const xs: number[] = [];
    const ys: number[] = [];
    for (let i = 0; i < 21; i++) { xs.push(liveLandmarks[i * 3]); ys.push(liveLandmarks[i * 3 + 1]); }
    const handSpan = Math.max(...xs) - Math.min(...xs) || Math.max(...ys) - Math.min(...ys) || 0.1;

    const tips = { thumb:4, index:8, middle:12, ring:16, pinky:20 };
    const mcps = { thumb:1, index:5, middle:9, ring:13, pinky:17 };

    type Score = { finger: string; score: number; type: 'close'|'open'|'pos'; detail?: any };
    const scores: Score[] = [];

    const closedThreshold = handSpan * 0.18;
    const posThresh = handSpan * 0.05;

    for (const finger of Object.keys(tips)) {
      const t = tips[finger as keyof typeof tips];
      const m = mcps[finger as keyof typeof mcps];
      const refDist = Math.hypot(pt(referenceLandmarks, t).x - pt(referenceLandmarks, m).x, pt(referenceLandmarks, t).y - pt(referenceLandmarks, m).y);
      const curDist = Math.hypot(pt(liveLandmarks, t).x - pt(liveLandmarks, m).x, pt(liveLandmarks, t).y - pt(liveLandmarks, m).y);

      const wantsClosed = refDist < closedThreshold;

      if (wantsClosed) {
        // higher score when curDist much larger than desired
        const diff = (curDist - refDist) / (handSpan || 1);
        if (diff > 0.06) scores.push({ finger, score: diff, type: 'close' });
      } else {
        const diff = (refDist - curDist) / (handSpan || 1);
        if (diff > 0.06) scores.push({ finger, score: diff, type: 'open' });
      }

      // positional offset of tip
      const dx = pt(liveLandmarks, t).x - pt(referenceLandmarks, t).x;
      const dy = pt(liveLandmarks, t).y - pt(referenceLandmarks, t).y;
      const posMag = Math.hypot(dx, dy) / (handSpan || 1);
      if (posMag > 0.06) scores.push({ finger, score: posMag * 0.7, type: 'pos', detail: { dx, dy } });
    }

    if (scores.length === 0) {
      setSuggestion("");
      setSuggestionFinger(null);
      return;
    }

    // pick highest score
    scores.sort((a,b) => b.score - a.score);
    const top = scores[0];

    const fingerName = top.finger === 'thumb' ? 'thumb' : `${top.finger} finger`;
    if (top.type === 'close') {
      setSuggestion(`Close your ${fingerName}`);
      setSuggestionFinger(top.finger);
    } else if (top.type === 'open') {
      setSuggestion(`Open your ${fingerName}`);
      setSuggestionFinger(top.finger);
    } else {
      const dx = top.detail.dx;
      const dy = top.detail.dy;
      const absdx = Math.abs(dx);
      const absdy = Math.abs(dy);
      let dir = '';
      if (absdx > absdy) dir = dx > 0 ? 'move left' : 'move right';
      else dir = dy > 0 ? 'move up' : 'move down';
      setSuggestion(`${fingerName}: ${dir}`);
      setSuggestionFinger(top.finger);
    }
  }, [liveLandmarks, referenceLandmarks]);

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
                <img
                  src={`http://127.0.0.1:5000/sample_image/${mudraName}`}
                  alt={`${mudraName} reference`}
                  className="w-full h-full object-contain rounded-xl"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div className="text-muted-foreground text-sm">Loading reference...</div>
              )}
            </div>

            {/* Small coordinate skeleton under the image */}
            {!referenceError && referenceLandmarks && (
              <div className="mt-4 mx-auto w-48">
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
              </div>
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
                        onClick={() => {
                          setMatched(false);
                          setDetected("");
                          // ignore matches for 2s so the server prediction doesn't immediately re-match
                          setIgnoreUntil(Date.now() + 2000);
                        }}
                        className="px-8 py-3 border-2 border-gold text-gold font-sans text-sm uppercase tracking-widest hover:bg-gold hover:text-black transition-all duration-300"
                      >
                        Try Again →
                      </button>
                    </div>
                  )}
                  {/* Live suggestion panel */}
                  {!matched && suggestion && (
                    <div className="absolute bottom-4 left-4 bg-black/70 text-sm text-white rounded-lg p-3 max-w-xs">
                      <div className="font-semibold mb-1">Suggestion</div>
                      <div className="truncate">{suggestion}</div>
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