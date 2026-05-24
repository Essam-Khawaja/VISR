import { Link } from "react-router-dom";

export function Navigation() {
  return (
    <nav className="w-full bg-[#1d1d1f] text-white px-6 py-3">
      <div className="max-w-[980px] mx-auto flex items-center justify-between">
        <Link to="/" className="text-lg font-medium tracking-tight">
          Constellation
        </Link>

        <div className="flex items-center gap-8 text-sm">
          <Link to="/features" className="hover:opacity-70 transition-opacity">
            Features
          </Link>
          <Link to="/how-it-works" className="hover:opacity-70 transition-opacity">
            How it works
          </Link>
          <Link to="/pricing" className="hover:opacity-70 transition-opacity">
            Pricing
          </Link>
        </div>

        <Link
          to="/dashboard"
          className="text-sm hover:opacity-70 transition-opacity"
        >
          Sign in
        </Link>
      </div>
    </nav>
  );
}
