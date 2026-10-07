import { Link } from "react-router-dom";
import ConnectionStatus from "./ConnectionStatus";

function Navbar() {
  return (
    <nav className="flex justify-center gap-3 py-4 border-b border-white/10">

      {/* DASHBOARD */}
      <Link
        to="/"
        className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition"
      >
        Dashboard
      </Link>


      {/* LINTASAN A */}
      <Link
        to="/LintasanA"
        className="px-6 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
      >
        Lintasan A
      </Link>


      {/* LINTASAN B */}
      <Link
        to="/LintasanB"
        className="px-6 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
      >
        Lintasan B
      </Link>

    <ConnectionStatus />
    </nav>
  );
}

export default Navbar;