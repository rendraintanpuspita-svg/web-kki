import { Routes, Route } from "react-router-dom";

import Navbar from "./Components/Navbar";
import Dashboard from "./routes/Dashboard";
import LintasanA from "./routes/LintasanA";
import LintasanB from "./routes/LintasanB";

import polbatam from "./assets/polbatam.png";
import bmrt from "./assets/bmrt.png";

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* HEADER */}
      <header className="h-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto h-full px-8 flex items-center justify-between">

          {/* POLIBATAM */}
          <div className="flex items-center gap-4">
            <img
              src={polbatam}
              alt="Logo Politeknik Negeri Batam"
              className="h-12 w-auto"
            />

            <h1 className="text-lg font-bold">
              POLITEKNIK NEGERI BATAM
            </h1>
          </div>

          {/* BMRT */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <h2 className="text-lg font-bold">
                BARELANG MARINE ROBOTICS TEAM
              </h2>

              <p className="text-xs text-slate-400">
                Autonomous Surface Vessel
              </p>
            </div>

            <img
              src={bmrt}
              alt="Logo Barelang Marine Robotics Team"
              className="h-12 w-auto"
            />
          </div>

        </div>
      </header>

      {/* NAVBAR */}
      <Navbar />

      {/* ROUTES */}
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/LintasanA" element={<LintasanA />} />
          <Route path="/LintasanB" element={<LintasanB />} />
        </Routes>
      </main>

    </div>
  );
}

export default App;