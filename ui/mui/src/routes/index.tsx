import { createFileRoute, Link } from "@tanstack/react-router";
import dancerImg from "@/assets/dancer-hero.jpg";
import { GoldParticles } from "@/components/GoldParticles";
import { SiteNav } from "@/components/SiteNav";
import { ArrowRight, Sparkles, Scan, BookOpen } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
});

const mudras = [
  { name: "Pathaka", sans: "पताक", meaning: "The flag — beginnings, clouds, forest, river" },
  { name: "Mayura", sans: "मयूर", meaning: "The peacock — vines, vomiting, neck, beak" },
  { name: "Mushti", sans: "मुष्टि", meaning: "The fist — steadfastness, grasping, strength" },
  { name: "Tripataka", sans: "त्रिपताक", meaning: "Three parts of a flag — crown, tree, arrow" },
];

function Home() {
  return (
    <div className="relative">
      <SiteNav />

      {/* HERO */}
      <section className="relative min-h-screen w-full overflow-hidden">
        {/* Background image with parallax-ish scaling */}
        <div className="absolute inset-0">
          <img
            src={dancerImg}
            alt="Indian classical dancer silhouette"
            width={1920}
            height={1080}
            className="absolute inset-0 h-full w-full object-cover opacity-70 float-slow"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background/70" />
        </div>

        <GoldParticles density={70} />

        <div className="relative z-10 mx-auto max-w-6xl px-6 pt-40 pb-32 min-h-screen flex flex-col justify-center">
          <div className="reveal flex items-center gap-3 text-[11px] uppercase tracking-[0.4em] text-gold">
            <span className="h-px w-10 bg-gold" />
            <Sparkles className="h-3.5 w-3.5" />
            An AI Exhibition of Indian Classical Gesture
          </div>

          <h1 className="reveal-blur mt-8 font-serif leading-[0.95] text-6xl md:text-8xl lg:text-[9rem] tracking-tight" style={{ animationDelay: "0.15s" }}>
            <span className="block text-foreground">The</span>
            <span className="block gold-text italic">Mudras.</span>
          </h1>

          <p className="reveal mt-10 max-w-2xl text-lg md:text-xl text-foreground/85 leading-relaxed" style={{ animationDelay: "0.5s" }}>
            Discover the language of classical gestures through artificial intelligence.
            Centuries of meaning, read in real time.
          </p>

          <div className="reveal mt-12 flex flex-wrap items-center gap-5" style={{ animationDelay: "0.75s" }}>
            <Link
              to="/detect"
              className="group inline-flex items-center gap-3 rounded-full bg-primary text-primary-foreground px-7 py-4 text-sm uppercase tracking-[0.25em] glow-gold hover:scale-[1.02] transition-transform"
            >
              Begin Journey
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a href="#about" className="text-sm uppercase tracking-[0.25em] text-muted-foreground hover:text-gold transition-colors">
              Explore the lexicon →
            </a>
          </div>

          {/* corner ornament */}
          <div className="reveal absolute bottom-10 left-6 right-6 flex items-end justify-between text-[10px] uppercase tracking-[0.35em] text-muted-foreground" style={{ animationDelay: "1s" }}>
            <div className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 pulse-dot" />
              AI Vision · Live
            </div>
            <div className="hidden md:block">28 Asamyukta Mudras · Bharatanatyam</div>
            <div>v 1.0 · 2026</div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="relative py-32 md:py-40">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="text-[11px] uppercase tracking-[0.4em] text-gold">The Project</div>
          <h2 className="mt-6 font-serif text-4xl md:text-6xl leading-tight">
            A grammar of gesture, <span className="italic gold-text">interpreted by machine.</span>
          </h2>
          <div className="hairline w-32 mx-auto mt-10" />
          <p className="mt-10 text-lg leading-relaxed text-muted-foreground max-w-3xl mx-auto">
            In Bharatanatyam, every gesture is a word. Every word, a story.
            <em className="text-foreground/80"> The Mudras </em>
            uses computer vision to read these hand symbols in real time — translating
            an ancient performative language into a living, interactive interface.
          </p>

          <div className="mt-20 grid gap-px bg-border rounded-2xl overflow-hidden border border-border md:grid-cols-3">
            {[
              { k: "28", v: "Asamyukta Hastas", s: "Single-hand mudras" },
              { k: "23", v: "Samyukta Hastas", s: "Combined-hand mudras" },
              { k: "AI", v: "Vision Pipeline", s: "Real-time inference" },
            ].map((s) => (
              <div key={s.v} className="bg-card py-10 px-6">
                <div className="font-serif text-5xl gold-text">{s.k}</div>
                <div className="mt-3 text-sm uppercase tracking-[0.2em] text-foreground">{s.v}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LEXICON */}
      <section className="relative py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <div className="text-[11px] uppercase tracking-[0.4em] text-gold">The Lexicon</div>
            <h2 className="mt-5 font-serif text-4xl md:text-5xl">
              A few words from <span className="italic gold-text">the silent vocabulary.</span>
            </h2>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {mudras.map((m, i) => (
              <article
                key={m.name}
                className="hover-lift glass rounded-2xl p-7 group relative overflow-hidden slide-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gold/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="font-serif text-5xl gold-text">{m.sans}</div>
                <div className="mt-6 font-serif text-2xl text-foreground">{m.name}</div>
                <div className="hairline w-12 mt-3 opacity-70" />
                <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{m.meaning}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32 md:py-40">
        <div className="mx-auto max-w-5xl px-6">
          <div className="glass-gold rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 shimmer opacity-30" />
            <div className="relative">
              <Scan className="h-8 w-8 mx-auto text-gold" />
              <h3 className="mt-6 font-serif text-4xl md:text-6xl leading-tight">
                Step before the camera.
                <span className="block italic gold-text mt-2">Speak with your hands.</span>
              </h3>
              <p className="mt-6 text-muted-foreground max-w-xl mx-auto">
                Activate the live detection studio. The AI is ready when you are.
              </p>
              <Link
                to="/detect"
                className="mt-10 inline-flex items-center gap-3 rounded-full bg-primary text-primary-foreground px-8 py-4 text-sm uppercase tracking-[0.25em] glow-gold hover:scale-[1.02] transition-transform"
              >
                Enter the Studio
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative border-t border-border/50 py-12">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="font-serif text-gold text-lg">ॐ</span>
            <span className="uppercase tracking-[0.3em]">The Mudras · 2026</span>
          </div>
          <div className="flex items-center gap-2 uppercase tracking-[0.25em]">
            <BookOpen className="h-3.5 w-3.5" />
            Bharatanatyam · Natya Shastra · AI
          </div>
        </div>
      </footer>
    </div>
  );
}
