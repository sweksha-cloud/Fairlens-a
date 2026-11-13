import { Shield, Target, Users, Zap } from 'lucide-react';
import type { Page } from './Navigation';

type AboutPageProps = {
  onNavigate: (page: Page) => void;
};

const features = [
  {
    icon: <Shield className="size-12" />,
    title: 'Bias Detection',
    description:
      'Automatically identify various types of biases in your datasets including gender, age, geographic, and socioeconomic biases.',
  },
  {
    icon: <Target className="size-12" />,
    title: 'Detailed Analysis',
    description:
      'Get comprehensive reports with severity ratings, affected columns, and actionable insights to improve your data quality.',
  },
  {
    icon: <Users className="size-12" />,
    title: 'Fairness Metrics',
    description:
      'Understand demographic distributions and representation gaps to ensure your AI models serve all communities fairly.',
  },
  {
    icon: <Zap className="size-12" />,
    title: 'Fast Processing',
    description:
      'Upload CSV or Excel files and receive instant analysis results powered by advanced statistical methods.',
  },
];

const biasTypes = [
  {
    name: 'Selection Bias',
    description: 'Occurs when the data sample is not representative of the population being studied.',
  },
  {
    name: 'Measurement Bias',
    description: 'Arises from systematic errors in how data is collected or measured.',
  },
  {
    name: 'Representation Bias',
    description: 'Happens when certain groups are over- or under-represented in the dataset.',
  },
  {
    name: 'Historical Bias',
    description:
      'Reflects existing prejudices and inequalities in society that are captured in the data.',
  },
  {
    name: 'Aggregation Bias',
    description: 'Results from combining data groups that should be analyzed separately.',
  },
  {
    name: 'Evaluation Bias',
    description: 'Occurs when benchmark data does not represent the use case population.',
  },
];

const steps = [
  {
    title: 'Upload Your Dataset',
    description:
      'Upload your CSV or Excel file containing your dataset. Our system accepts various data formats and sizes.',
  },
  {
    title: 'Automated Analysis',
    description:
      'Our algorithms analyze your data for various types of biases, examining demographic distributions, representation gaps, and statistical anomalies.',
  },
  {
    title: 'Review Results',
    description:
      'Receive a comprehensive report detailing detected biases, their severity levels, affected columns, and actionable recommendations for improvement.',
  },
];

export default function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:py-20">
      {/* Header */}
      <div className="mb-14 text-center">
        <h1 className="font-display text-[clamp(2rem,6vw,4rem)] font-bold text-white">
          About RCC FairLens
        </h1>
        <p className="mx-auto mt-6 max-w-2xl font-body text-lg leading-relaxed text-white/80 sm:text-xl">
          A comprehensive tool for detecting and analyzing statistical biases in datasets to help
          build more fair and equitable AI systems.
        </p>
      </div>

      {/* Mission */}
      <div className="mb-16 rounded-3xl border border-[#3CE6DD]/30 bg-gradient-to-r from-[#3CE6DD]/20 to-[#37B1E6]/20 p-6 backdrop-blur-sm sm:p-12">
        <h2 className="mb-6 font-display text-[clamp(1.5rem,3.5vw,2.5rem)] font-bold text-[#3CE6DD]">
          Our Mission
        </h2>
        <p className="font-body text-lg leading-relaxed text-white sm:text-xl">
          Bias in datasets has the potential to harm marginalized communities through inaccurate
          results and discrimination. By detecting the biases present within a dataset before
          deployment, we can work towards more fair and equitable AI systems that serve everyone. RCC
          FairLens empowers data scientists, researchers, and organizations to identify and address
          biases proactively, ensuring that technology benefits all members of society equally.
        </p>
      </div>

      {/* Features */}
      <div className="mb-16">
        <h2 className="mb-10 text-center font-display text-[clamp(1.75rem,4vw,3rem)] font-bold text-white">
          Key Features
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl bg-white p-8 shadow-[0_8px_32px_rgba(60,230,221,0.2)] transition-shadow hover:shadow-[0_12px_48px_rgba(60,230,221,0.3)]"
            >
              <div className="mb-5 text-[#3CE6DD]">{feature.icon}</div>
              <h3 className="mb-4 font-ui text-xl font-semibold text-black sm:text-2xl">
                {feature.title}
              </h3>
              <p className="font-ui leading-relaxed text-black/70 sm:text-lg">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bias types */}
      <div className="mb-16">
        <h2 className="mb-10 text-center font-display text-[clamp(1.75rem,4vw,3rem)] font-bold text-white">
          Types of Biases We Detect
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {biasTypes.map((bias) => (
            <div
              key={bias.name}
              className="rounded-xl border border-[#3CE6DD]/20 bg-white/10 p-6 backdrop-blur-sm transition-colors hover:border-[#3CE6DD]/50"
            >
              <h3 className="mb-3 font-ui text-lg font-semibold text-[#3CE6DD] sm:text-xl">
                {bias.name}
              </h3>
              <p className="font-ui text-sm leading-relaxed text-white/80 sm:text-base">
                {bias.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="mb-16 rounded-3xl bg-white p-6 shadow-[0_8px_32px_rgba(60,230,221,0.2)] sm:p-12">
        <h2 className="mb-10 text-center font-display text-[clamp(1.5rem,3.5vw,2.5rem)] font-bold text-black">
          How It Works
        </h2>
        <div className="space-y-8">
          {steps.map((step, index) => (
            <div key={step.title} className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
              <div className="grid size-14 shrink-0 place-items-center rounded-full bg-[#3CE6DD] font-display text-2xl font-bold text-black">
                {index + 1}
              </div>
              <div>
                <h3 className="mb-2 font-ui text-lg font-semibold text-black sm:text-xl">
                  {step.title}
                </h3>
                <p className="font-ui text-black/70 sm:text-lg">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <p className="mb-8 font-body text-xl text-white sm:text-2xl">
          Ready to ensure fairness in your datasets?
        </p>
        <button
          onClick={() => onNavigate('upload')}
          className="rounded-xl bg-[#3CE6DD] px-12 py-5 font-display text-lg font-bold text-black shadow-[0_8px_32px_rgba(60,230,221,0.3)] transition-colors hover:bg-[#37B1E6] sm:text-xl"
        >
          Start Analyzing Now
        </button>
      </div>
    </div>
  );
}
