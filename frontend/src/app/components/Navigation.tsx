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
      <nav className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2 sm:gap-8 sm:px-8">
        {/* Logo badge */}
        <button
          onClick={() => onNavigate('home')}
          aria-label="FairLens-A home"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#0FDBFA] to-[#1CB4EB] font-logo text-sm font-bold text-white shadow-[0_0_16px_rgba(15,219,250,0.5)] sm:size-10 sm:text-base"
        >
          FL
        </button>

        {/* Links */}
        <ul className="flex flex-1 flex-wrap items-center justify-around gap-x-3 gap-y-1 sm:gap-x-4">
          {LINKS.map(({ id, label }) => {
            const active = currentPage === id;
            return (
              <li key={id}>
                <button
                  onClick={() => onNavigate(id)}
                  className={`font-display text-base font-bold underline decoration-solid underline-offset-4 transition-colors sm:text-lg lg:text-xl ${
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
