import React from "react";
import { Link } from "react-router-dom";

const Forbidden: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-xl text-center bg-white shadow rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-2">403 — Accès refusé</h1>
        <p className="text-gray-600 mb-6">
          Vous n'avez pas les autorisations nécessaires pour voir cette page.
        </p>
        <div className="flex justify-center gap-3">
          <Link to="/" className="px-4 py-2 rounded bg-yellow-400 text-black font-semibold">
            Retour à l'accueil
          </Link>
          <Link to="/login" className="px-4 py-2 rounded border">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;