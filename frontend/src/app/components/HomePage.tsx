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
  { title: "Rare groups", body: "Flags any group that makes up under 10% of the rows, by name." },
  { title: "Outcome gaps", body: "Compares outcome rates between groups (e.g. 39% vs 9%) and how strong the link is." },
  { title: "Lopsided outcomes", body: "Warns when one outcome far outnumbers the others." },
  { title: "Extreme values", body: "Spots numeric columns skewed by a few extreme values." },
];

const CARD = "rounded-2xl border border-[#3CE6DD]/20 bg-white/10 p-6 backdrop-blur-sm";

export default function HomePage({ onNavigate }: HomePageProps) {
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
        <h1 className="font-display text-[clamp(2.5rem,8vw,6.5rem)] font-bold leading-[1.05] text-white [text-shadow:0_0_36px_rgba(255,255,255,0.45),0_0_90px_rgba(60,230,221,0.4)]">
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
          <a
            href="#how-it-works"
            className="rounded-xl border-2 border-[#3CE6DD] px-8 py-4 font-display text-base font-bold text-[#3CE6DD] transition-colors hover:bg-[#3CE6DD]/10 sm:text-lg"
          >
            See how it works
          </a>
        </div>
        <p className="mt-5 font-body text-sm text-white/60">
          Free · no sign-up · nothing you upload is stored · no model is trained
        </p>
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
