import { useRef, useState } from "react";
import svgPaths from "../imports/svg-fertresihc";
import type { Page } from "./Navigation";

type HomePageProps = {
  onNavigate: (page: Page) => void;
};

/** The overlapping cyan heart outlines from the Figma design. */
function Hearts({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1186 1070" fill="none" aria-hidden>
      <path d={svgPaths.p40b4ce0} fill="#3CE6DD" />
      <path d={svgPaths.p2eb9f00} fill="#3CE6DD" />
      <path d={svgPaths.paa90600} fill="#37B1E6" />
      <path d={svgPaths.p29277100} fill="#37B1E6" />
      <path d={svgPaths.p2ce3ddf0} fill="#3CE6DD" />
    </svg>
  );
}

const STEPS = [
  {
    n: 1,
    title: "Upload a CSV and pick the columns",
    body: "Choose your file (or the built-in sample), then the outcome a model would predict (approved, hired…) and the columns that describe people (race, sex, age group…). FairLens suggests likely ones.",
    img: "/home/upload.jpg",
    alt: "The upload page with a sample loan dataset loaded, the outcome set to approved, and race and sex chosen",
    imgClass: "mx-auto max-w-[420px]",
  },
  {
    n: 2,
    title: "See where outcomes differ",
    body: "For each group, FairLens shows the outcome rate side by side and tests the gap with a χ² test plus an effect size, so tiny differences in big datasets aren't flagged.",
    img: "/home/outcomes.jpg",
    alt: "Outcome rate by race: 39% for White applicants versus 9% for Asian applicants, flagged as outcomes differ",
    imgClass: "",
  },
  {
    n: 3,
    title: "Read a plain-English report",
    body: "Every finding says what it means and what you can do about it, with an overall severity: high, moderate or low.",
    img: "/home/summary.jpg",
    alt: "The 'What this means' summary: outcomes differ by race, and some race groups are rare",
    imgClass: "",
  },
];

const CHECKS = [
  { title: "Rare groups", body: "Names any group too small for a model to learn from: under 10% of rows, or less when there are many groups." },
  { title: "Outcome gaps", body: "Compares outcome rates between groups (e.g. 39% vs 9%) and how strong the link is." },
  { title: "Lopsided outcomes", body: "Warns when one outcome far outnumbers the others." },
  { title: "Extreme values", body: "Spots numeric columns skewed by a few extreme values." },
];

const CARD = "rounded-2xl border border-[#3CE6DD]/20 bg-white/10 p-6 backdrop-blur-sm";

function PlayIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11.04-6.86a1 1 0 0 0 0-1.72L9.5 4.28A1 1 0 0 0 8 5.14z" />
    </svg>
  );
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const playDemo = () => {
    const v = videoRef.current;
    if (!v) return;
    v.scrollIntoView({ behavior: "smooth", block: "center" });
    setPlaying(true);
    v.play().catch(() => {});
  };

  return (
    <div className="relative overflow-hidden">
      {/* Full-width decorative heart glow behind the hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 grid h-[100vh] place-items-center"
      >
        <Hearts className="absolute h-[85vh] w-auto -translate-x-[14%] -translate-y-[6%] rotate-[-10deg] opacity-60 blur-[26px]" />
        <Hearts className="absolute h-[85vh] w-auto -translate-x-[14%] -translate-y-[6%] rotate-[-10deg] opacity-35 blur-[60px]" />
        <Hearts className="absolute h-[72vh] w-auto translate-x-[20%] -translate-y-[3%] -scale-x-100 rotate-[-14deg] opacity-55 blur-[24px]" />
        <Hearts className="absolute h-[72vh] w-auto translate-x-[20%] -translate-y-[3%] -scale-x-100 rotate-[-14deg] opacity-30 blur-[55px]" />
      </div>

      {/* Hero */}
      <section className="relative z-10 mx-auto flex min-h-[72vh] max-w-5xl flex-col items-center justify-center px-4 py-16 text-center">
        <p className="mb-6 whitespace-nowrap rounded-full bg-[#3CE6DD] px-4 py-2 font-display text-xs font-bold uppercase tracking-wide text-black shadow-[0_0_32px_rgba(60,230,221,0.55)] sm:px-6 sm:text-base">
          Made for the Responsible Computing Club at SJSU
        </p>        <h1 className="font-display text-[clamp(2.5rem,8vw,6.5rem)] font-bold leading-[1.05] text-white [text-shadow:0_0_36px_rgba(255,255,255,0.45),0_0_90px_rgba(60,230,221,0.4)]">
          RCC&nbsp;FairLens&#8209;A
          <br />
          Bias&nbsp;Detector
        </h1>
        <p className="mt-6 max-w-2xl font-body text-lg text-white/90 sm:text-xl">
          Check a dataset for bias <em>before</em> you train a model on it. Upload a CSV and get a
          plain-English report on which groups are rare and whether outcomes differ between them.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => onNavigate("upload")}
            className="rounded-xl bg-[#3CE6DD] px-8 py-4 font-display text-base font-bold text-black shadow-[0_8px_40px_rgba(60,230,221,0.45)] transition-colors hover:bg-[#37B1E6] sm:text-lg"
          >
            Get Started — Upload Your Dataset
          </button>
          <button
            onClick={playDemo}
            className="group relative flex items-center justify-center gap-3 rounded-xl border-2 border-[#3CE6DD] bg-black/40 px-8 py-4 font-display text-base font-bold text-[#3CE6DD] shadow-[0_0_32px_rgba(60,230,221,0.35)] transition-colors hover:bg-[#3CE6DD]/10 sm:text-lg"
          >
            <span className="relative grid size-8 place-items-center rounded-full bg-[#3CE6DD] text-black">
              <span className="absolute inset-0 animate-ping rounded-full bg-[#3CE6DD]/60" aria-hidden />
              <PlayIcon className="relative ml-0.5 size-4" />
            </span>
            Watch the 30-second demo
          </button>
        </div>
        <p className="mt-5 font-body text-sm text-white/60">
          Free · no sign-up · nothing you upload is stored · no model is trained
        </p>
      </section>

      {/* Demo video */}
      <section id="demo" className="relative z-10 mx-auto max-w-5xl scroll-mt-20 px-4 pb-8 pt-4">
        <h2 className="text-center font-display text-[clamp(1.75rem,4vw,3rem)] font-bold text-white">
          See it in 30 seconds
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center font-body text-lg text-white/75">
          FairLens checking 32,561 real census records, start to finish, on this site.
        </p>
        <div className="relative mt-8 overflow-hidden rounded-2xl border border-[#3CE6DD]/40 shadow-[0_12px_60px_rgba(60,230,221,0.3)]">
          <video
            ref={videoRef}
            src="/demo/fairlens-demo.mp4"
            poster="/demo/poster.jpg"
            controls={playing}
            playsInline
            preload="metadata"
            onPlay={() => setPlaying(true)}
            className="block aspect-video w-full bg-black"
          />
          {!playing && (
            <button
              onClick={playDemo}
              aria-label="Play the demo video"
              className="group absolute inset-0 grid place-items-center bg-black/35 transition-colors hover:bg-black/20"
            >
              <span className="relative grid size-20 place-items-center rounded-full bg-[#3CE6DD] text-black shadow-[0_0_48px_rgba(60,230,221,0.7)] transition-transform group-hover:scale-110 sm:size-28">
                <span className="absolute inset-0 animate-ping rounded-full bg-[#3CE6DD]/50" aria-hidden />
                <PlayIcon className="relative ml-1 size-9 sm:size-12" />
              </span>
              <span className="absolute bottom-5 rounded-full bg-black/70 px-4 py-1.5 font-ui text-sm font-semibold text-white sm:text-base">
                ▶ Watch the demo · 0:32
              </span>
            </button>
          )}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative z-10 mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
        <h2 className="text-center font-display text-[clamp(1.75rem,4vw,3rem)] font-bold text-white">
          How it works
        </h2>
        <div className="mt-12 space-y-16">
          {STEPS.map((s, i) => (
            <div
              key={s.n}
              className={`flex flex-col items-center gap-8 md:flex-row ${i % 2 ? "md:flex-row-reverse" : ""}`}
            >
              <div className="md:w-5/12">
                <div className="mb-3 grid size-10 place-items-center rounded-full bg-[#3CE6DD] font-display text-lg font-bold text-black">
                  {s.n}
                </div>
                <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">{s.title}</h3>
                <p className="mt-3 font-body text-lg leading-relaxed text-white/80">{s.body}</p>
              </div>
              <div className="w-full md:w-7/12">
                <img
                  src={s.img}
                  alt={s.alt}
                  loading="lazy"
                  className={`w-full rounded-2xl border border-[#3CE6DD]/30 shadow-[0_12px_48px_rgba(60,230,221,0.25)] ${s.imgClass}`}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What it checks */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center font-display text-[clamp(1.75rem,4vw,3rem)] font-bold text-white">
          What it checks
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CHECKS.map((c) => (
            <div key={c.title} className={CARD}>
              <h3 className="font-ui text-lg font-semibold text-[#3CE6DD] sm:text-xl">{c.title}</h3>
              <p className="mt-2 font-body text-white/80">{c.body}</p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-3xl text-center font-body text-sm text-white/60">
          These are statistical warning signs in the data, not proof of discrimination. FairLens answers
          “is this data safe to train on?”, not “is my model fair?”.
        </p>
      </section>

      {/* Why it matters */}
      <section className="relative z-10 mx-auto max-w-4xl px-4 py-16">
        <h2 className="text-center font-display text-[clamp(1.5rem,4vw,3rem)] font-bold text-white">
          Why Detecting Biases is Important
        </h2>
        <p className="mx-auto mt-8 max-w-3xl font-body text-lg leading-relaxed text-white/85 sm:text-xl">
          Bias in datasets has the potential to harm marginalized communities through
          inaccurate results and discrimination. By detecting the biases present within a
          dataset before deployment, we can work towards more fair and equitable AI systems
          that serve everyone.
        </p>
      </section>

      {/* Who it's for */}
      <section className="relative z-10 mx-auto max-w-4xl px-4 pb-28 pt-8 text-center">
        <div className={`${CARD} sm:p-10`}>
          <h2 className="font-display text-[clamp(1.5rem,3.5vw,2.25rem)] font-bold text-white">
            Built for SJSU
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-white/80">
            FairLens is a Responsible Computing Club project at San José State University, for students
            checking datasets for class projects, researchers vetting data before a study, or anyone who
            wants a quick fairness check before training a model.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              onClick={() => onNavigate("upload")}
              className="rounded-xl bg-[#3CE6DD] px-8 py-3 font-display font-bold text-black transition-colors hover:bg-[#37B1E6]"
            >
              Try it now
            </button>
            <a
              href="https://github.com/sweksha-cloud/Fairlens-a"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border-2 border-[#3CE6DD] px-8 py-3 font-display font-bold text-[#3CE6DD] transition-colors hover:bg-[#3CE6DD]/10"
            >
              View the code
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
