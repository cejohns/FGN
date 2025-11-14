interface FgnHeaderProps {
  currentSection: string;
  onNavigate: (section: string) => void;
}

export default function FgnHeader({ currentSection, onNavigate }: FgnHeaderProps) {
  const navItems = [
    { id: 'news', label: 'News' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'guides', label: 'Tutorials' },
    { id: 'videos', label: 'Playthroughs' },
  ];

  return (
    <header className="bg-fs-dark border-b border-fs-panel sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 hover:opacity-90 transition-opacity"
        >
          <img
            src="/NewFSELogo.png"
            alt="FireStar Gaming Network"
            className="h-12 w-auto"
          />
          <div className="leading-tight">
            <div className="text-lg font-semibold tracking-wide bg-gradient-to-b from-fs-silverLight via-fs-silverMid to-fs-silverDark bg-clip-text text-transparent">
              FireStar Gaming Network
            </div>
            <div className="text-xs uppercase text-fs-blue tracking-wider">
              Gaming • News • Reviews • Tutorials • Playthroughs
            </div>
          </div>
        </button>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`transition-colors ${
                currentSection === item.id
                  ? 'text-fs-blue font-medium'
                  : 'text-fs-muted hover:text-fs-blue'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => onNavigate('releases')}
            className="px-4 py-1.5 rounded-full bg-fs-blue text-fs-dark font-medium hover:bg-fs-blueStrong transition-colors"
          >
            Join the Network
          </button>
        </nav>

        <button
          onClick={() => {
            const nav = document.getElementById('mobile-nav');
            nav?.classList.toggle('hidden');
          }}
          className="md:hidden text-fs-muted hover:text-fs-blue"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      <div id="mobile-nav" className="hidden md:hidden bg-fs-panel px-4 py-3 border-t border-fs-dark">
        <nav className="flex flex-col gap-3 text-sm">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                document.getElementById('mobile-nav')?.classList.add('hidden');
              }}
              className={`text-left transition-colors ${
                currentSection === item.id
                  ? 'text-fs-blue font-medium'
                  : 'text-fs-muted hover:text-fs-blue'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => {
              onNavigate('releases');
              document.getElementById('mobile-nav')?.classList.add('hidden');
            }}
            className="px-4 py-2 rounded-full bg-fs-blue text-fs-dark font-medium hover:bg-fs-blueStrong transition-colors text-center"
          >
            Join the Network
          </button>
        </nav>
      </div>
    </header>
  );
}
