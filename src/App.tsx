// src/App.tsx
import AppRouter from "./routing/router";
import Navbar from "./components/home/Navbar";
import "./index.css";
import { BrowserRouter as Router } from "react-router-dom";
import { Suspense } from "react";

function App() {
  return (
      <Router>
        {/* ⬇️ variable de hauteur du header, responsive */}
        <div className="min-h-screen flex flex-col [--app-header-h:3rem] md:[--app-header-h:4rem]">

          {/* Header */}
          <Navbar />

          {/* main : top padding = hauteur exacte du header */}
          <main className="flex-1 pt-[var(--app-header-h)] pb-16 md:pb-0">
            <Suspense>
              <AppRouter />
            </Suspense>
          </main>

        </div>
      </Router>
  );
}

export default App;