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

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="relative overflow-hidden">
      {/* Full-width decorative heart glow behind the hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 grid h-[110vh] place-items-center"
      >
        {/* heart cluster — left */}
        <Hearts className="absolute h-[95vh] w-auto -translate-x-[14%] -translate-y-[6%] rotate-[-10deg] opacity-60 blur-[26px]" />
        <Hearts className="absolute h-[95vh] w-auto -translate-x-[14%] -translate-y-[6%] rotate-[-10deg] opacity-35 blur-[60px]" />
        {/* heart cluster — right, mirrored */}
        <Hearts className="absolute h-[82vh] w-auto translate-x-[20%] -translate-y-[3%] -scale-x-100 rotate-[-14deg] opacity-55 blur-[24px]" />
        <Hearts className="absolute h-[82vh] w-auto translate-x-[20%] -translate-y-[3%] -scale-x-100 rotate-[-14deg] opacity-30 blur-[55px]" />
      </div>

      {/* Hero */}
      <section className="relative z-10 mx-auto flex min-h-[78vh] max-w-5xl flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="font-display text-[clamp(2.75rem,9vw,8rem)] font-bold leading-[1.05] text-white [text-shadow:0_0_36px_rgba(255,255,255,0.45),0_0_90px_rgba(60,230,221,0.4)]">
          RCC&nbsp;FairLens&#8209;A
          <br />
          Bias&nbsp;Detector
        </h1>
        <button
          onClick={() => onNavigate('upload')}
          className="mt-10 rounded-xl bg-[#3CE6DD] px-8 py-4 font-display text-base font-bold text-black shadow-[0_8px_40px_rgba(60,230,221,0.45)] transition-colors hover:bg-[#37B1E6] sm:text-lg"
        >
          Get Started — Upload Your Dataset
        </button>
      </section>

      {/* Why it matters */}
      <section className="relative z-10 mx-auto max-w-4xl px-4 pb-32 pt-12">
        <h2 className="text-center font-display text-[clamp(1.5rem,4vw,3.25rem)] font-bold text-white">
          Why Detecting Biases is Important
        </h2>
        <p className="mx-auto mt-8 max-w-3xl font-body text-lg leading-relaxed text-white/85 sm:text-xl">
          Bias in datasets has the potential to harm marginalized communities through
          inaccurate results and discrimination. By detecting the biases present within a
          dataset before deployment, we can work towards more fair and equitable AI systems
          that serve everyone.
        </p>
      </section>
    </div>
  );
}
