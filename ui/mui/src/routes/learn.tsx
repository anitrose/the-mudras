import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav } from "@/components/SiteNav";
import { GoldParticles } from "@/components/GoldParticles";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/learn")({
  component: LearnPage,
});

type MudraItem = {
  name: string;
  sans: string;
  meaning: string;
  usage: string;
};

const ASAMYUTA: MudraItem[] = [
  { name: "Pathaka", sans: "पताक", meaning: "The Flag", usage: "Beginnings, clouds, forest, river." },
  { name: "Tripataka", sans: "त्रिपताक", meaning: "Three Parts of a Flag", usage: "Crown, tree, thunderbolt, arrow." },
  { name: "Ardhapataka", sans: "अर्धपताक", meaning: "Half Flag", usage: "Tender shoots, a knife, banner, a tower." },
  { name: "Kartarimukha", sans: "कर्तरीमुख", meaning: "Scissors Face", usage: "Separation, opposition, the falling of a star." },
  { name: "Mayura", sans: "मयूर", meaning: "The Peacock", usage: "The peacock's beak, vines, the neck, vomiting." },
  { name: "Ardhachandra", sans: "अर्धचन्द्र", meaning: "Half Moon", usage: "The moon on the eighth day, an axe, a plate, the waist." },
  { name: "Arala", sans: "अरल", meaning: "Crooked", usage: "Wind, drinking, offering water." },
  { name: "Shukatunda", sans: "शुकतुण्ड", meaning: "Parrot Beak", usage: "Shooting an arrow, the god of love." },
  { name: "Mushti", sans: "मुष्टि", meaning: "The Fist", usage: "Steadfastness, grasping the hair, holding things, strength." },
  { name: "Shikhara", sans: "शिखर", meaning: "The Peak", usage: "The bow, a pillar, the lower lip, asking a question." },
  { name: "Kapittha", sans: "कपित्थ", meaning: "Elephant Apple", usage: "Lakshmi, Sarasvati, holding cymbals, grasping a veil." },
  { name: "Katakamukha", sans: "कटकामुख", meaning: "Broken Link", usage: "Picking flowers, stringing garlands." },
  { name: "Suchi", sans: "सूची", meaning: "The Needle", usage: "One, the universe, threatening." },
  { name: "Chandrakala", sans: "चन्द्रकला", meaning: "Moon Digit", usage: "Crescent moon, forehead mark." },
  { name: "Padmakosha", sans: "पद्मकोश", meaning: "Lotus Bud", usage: "Fruits, flowers, pot." },
  { name: "Sarpasirsham", sans: "सर्पशीर्ष", meaning: "Serpent Head", usage: "Sprinkling water, elephant trunk." },
  { name: "Mrigashirsha", sans: "मृगशीर्ष", meaning: "Deer Head", usage: "Deer, calling someone, cheek." },
  { name: "Simhamukha", sans: "सिंहमुख", meaning: "Lion Face", usage: "Throwing lotus flowers." },
  { name: "Kangula", sans: "कङ्गुल", meaning: "Fruit", usage: "Distant things, fruit." },
  { name: "Alapadma", sans: "अलपद्म", meaning: "Bloomed Lotus", usage: "Beauty, moon, breasts." },
  { name: "Chatura", sans: "चतुर", meaning: "The Clever", usage: "Gold, lamp, camphor." },
  { name: "Bhramara", sans: "भ्रमर", meaning: "The Bee", usage: "Bee, parrot, cuckoo." },
  { name: "Hamsasya", sans: "हंसास्य", meaning: "Swan Beak", usage: "Tying a sacred thread, drops of water, jasmine." },
  { name: "Hamsapaksha", sans: "हंसपक्ष", meaning: "Swan Wing", usage: "Number six." },
  { name: "Sandamsha", sans: "सन्दंश", meaning: "Tongs", usage: "Picking flowers, pulling out thorns." },
  { name: "Mukula", sans: "मुकुल", meaning: "Bud", usage: "Lotus bud, eating food." },
  { name: "Tamrachuda", sans: "ताम्रचूड", meaning: "Rooster", usage: "Cock crowing." },
  { name: "Trishula", sans: "त्रिशूल", meaning: "Trident", usage: "Trident of Shiva, three." },
];

const SAMYUTA: MudraItem[] = [
  { name: "Anjali", sans: "अञ्जलि", meaning: "Salutation", usage: "Worshipping, greeting gods." },
  { name: "Kapota", sans: "कपोत", meaning: "Pigeon", usage: "Respect, acceptance." },
  { name: "Karkata", sans: "कर्कट", meaning: "Crab", usage: "Holding a thick object." },
  { name: "Swastika", sans: "स्वस्तिक", meaning: "Auspicious Mark", usage: "Crossing rivers, auspiciousness." },
  { name: "Dola", sans: "डोला", meaning: "Swing", usage: "Arms hanging naturally." },
  { name: "Pushpaputa", sans: "पुष्पपुट", meaning: "Flower Basket", usage: "Offerings, water, ablutions." },
  { name: "Utsanga", sans: "उत्सङ्ग", meaning: "Embrace", usage: "Embracing, shyness." },
  { name: "Shivalinga", sans: "शिवलिङ्ग", meaning: "Shiva Linga", usage: "Worshipping Shiva." },
  { name: "Katakavardhana", sans: "कटकवर्धन", meaning: "Coronation", usage: "Coronation, auspicious ritual." },
  { name: "Kartariswastika", sans: "कर्तरीस्वस्तिक", meaning: "Crossed Scissors", usage: "Trees, crossing creepers." },
  { name: "Shakata", sans: "शकट", meaning: "Wagon", usage: "Demon Bali, wagon." },
  { name: "Shankha", sans: "शङ्ख", meaning: "Conch", usage: "Conch shell blowing." },
  { name: "Chakra", sans: "चक्र", meaning: "Wheel", usage: "Wheel of Vishnu." },
  { name: "Samputa", sans: "सम्पुट", meaning: "Casket", usage: "Holding something precious." },
  { name: "Pasha", sans: "पाश", meaning: "Noose", usage: "Bond, love, ensnaring." },
  { name: "Kilaka", sans: "किलक", meaning: "Bond", usage: "Lovers' bond, friendship." },
  { name: "Matsya", sans: "मत्स्य", meaning: "Fish", usage: "Fish swimming." },
  { name: "Kurma", sans: "कूर्म", meaning: "Tortoise", usage: "Tortoise." },
  { name: "Varaha", sans: "वाराह", meaning: "Boar", usage: "Boar avatar of Vishnu." },
  { name: "Garuda", sans: "गरुड", meaning: "Eagle", usage: "Garuda, vehicle of Vishnu." },
  { name: "Nagabandha", sans: "नागबन्ध", meaning: "Serpent Coil", usage: "Serpents entwined." },
  { name: "Khatva", sans: "खट्वा", meaning: "Cot", usage: "Cot, bedstead." },
  { name: "Bherunda", sans: "भेरुण्ड", meaning: "Terrible Bird", usage: "Two-headed bird." },
];

type Tab = "asamyuta" | "samyuta";

function LearnPage() {
  const [tab, setTab] = useState<Tab>("asamyuta");
  const items = tab === "asamyuta" ? ASAMYUTA : SAMYUTA;

  return (
    <div className="relative min-h-screen">
      <SiteNav />
      <GoldParticles density={40} className="opacity-40" />

      <div className="relative mx-auto max-w-7xl px-6 pt-32 pb-24">
        {/* HERO */}
        <div className="reveal max-w-3xl">
          <div className="text-[11px] uppercase tracking-[0.4em] text-gold flex items-center gap-2">
            <span className="h-px w-8 bg-gold" />
            The Lexicon
          </div>
          <h1 className="mt-6 font-serif text-5xl md:text-7xl leading-[0.95] tracking-tight">
            A grammar of <span className="italic gold-text">gesture.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            28 Asamyuta Hastas · 23 Samyuta Hastas · The complete vocabulary of Bharatanatyam hand language
          </p>
        </div>

        <div className="hairline mt-12 opacity-60" />

        {/* TABS */}
        <div className="reveal mt-10 flex gap-8 border-b border-border/40" style={{ animationDelay: "0.15s" }}>
          <button
            onClick={() => setTab("asamyuta")}
            className={`pb-3 text-xs uppercase tracking-[0.3em] transition-colors relative ${
              tab === "asamyuta" ? "text-gold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Asamyuta Hastas
            {tab === "asamyuta" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold rounded-full" />
            )}
          </button>
          <button
            onClick={() => setTab("samyuta")}
            className={`pb-3 text-xs uppercase tracking-[0.3em] transition-colors relative ${
              tab === "samyuta" ? "text-gold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Samyuta Hastas
            {tab === "samyuta" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold rounded-full" />
            )}
          </button>
        </div>

        {/* GALLERY */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((m, i) => (
            <article
              key={m.name}
              className="hover-lift glass rounded-2xl p-6 group relative overflow-hidden slide-up"
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gold/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="font-serif text-5xl gold-text leading-none">{m.sans}</div>
              <div className="mt-5 font-serif text-xl text-foreground">{m.name}</div>
              <div className="hairline w-12 mt-3 opacity-70" />
              <div className="mt-4 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Meaning</div>
              <div className="mt-1 text-sm text-foreground/85">{m.meaning}</div>
              <div className="mt-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Usage</div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{m.usage}</p>
              <div className="mt-6 pt-4 border-t border-border/40">
                <Link
                  to="/detect"
                  className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-gold hover:text-gold-soft transition-colors group/btn"
                >
                  Detect This
                  <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}