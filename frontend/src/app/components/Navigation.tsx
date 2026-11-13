export type Page = 'home' | 'upload' | 'about' | 'analysis';

type NavigationProps = {
  currentPage: Page;
  onNavigate: (page: Page) => void;
};

const LINKS: { id: Page; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'upload', label: 'Upload' },
  { id: 'about', label: 'About' },
  { id: 'analysis', label: 'Analysis' },
];

export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
  return (
    <header className="sticky top-0 z-50 bg-black/85 shadow-[0_4px_24px_rgba(0,0,0,0.5)] backdrop-blur">
      <nav className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-3 sm:flex-row sm:gap-8 sm:px-8 sm:py-4">
        {/* Logo badge */}
        <button
          onClick={() => onNavigate('home')}
          aria-label="FairLens-A home"
          className="grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#0FDBFA] to-[#1CB4EB] font-logo text-xs font-bold text-white shadow-[0_0_24px_rgba(15,219,250,0.5)] sm:size-16 sm:text-sm"
        >
          LOGO
        </button>

        {/* Links */}
        <ul className="flex w-full flex-wrap items-center justify-center gap-x-5 gap-y-1.5 sm:flex-1 sm:justify-around sm:gap-x-4">
          {LINKS.map(({ id, label }) => {
            const active = currentPage === id;
            return (
              <li key={id}>
                <button
                  onClick={() => onNavigate(id)}
                  className={`font-display text-lg font-bold underline decoration-solid underline-offset-[6px] transition-colors sm:text-2xl lg:text-[28px] ${
                    active ? 'text-[#3CE6DD]' : 'text-white hover:text-[#3CE6DD]'
                  }`}
                >
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
