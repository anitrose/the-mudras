import { Link } from "@tanstack/react-router";

export function SiteNav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-8 w-8 rounded-full glass-gold flex items-center justify-center">
            <span className="font-serif text-gold text-lg">ॐ</span>
          </div>
          <div className="font-serif text-lg tracking-wide">
            <span className="text-foreground">The</span>{" "}
            <span className="gold-text italic">Mudras</span>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-1 glass rounded-full px-2 py-1.5">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/learn">Learn</NavLink>
          <NavLink to="/detect">Detection</NavLink>
        </nav>
        <Link
          to="/detect"
          className="text-xs uppercase tracking-[0.25em] rounded-full bg-primary text-primary-foreground px-4 py-2 hover:opacity-90 transition"
        >
          Launch
        </Link>
      </div>
    </header>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-gold transition-colors rounded-full"
      activeProps={{ className: "px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-gold rounded-full bg-white/5" }}
    >
      {children}
    </Link>
  );
}