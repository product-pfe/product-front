// src/components/admin/UsersList.tsx
import React, { useEffect, useMemo, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllUsers, UserDto } from "../../services/UserService";
import { AuthContext } from "../../context/authContext";

const STATUS_OPTIONS = ["ALL", "PENDING", "ACCEPTED", "REJECTED", "DELETED"] as const;
type StatusOption = typeof STATUS_OPTIONS[number];

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusOption>("ALL");
  const [showOnlyPending, setShowOnlyPending] = useState(false);

  const { hasRole } = useContext(AuthContext);
  const navigate = useNavigate();

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getAllUsers();
        setUsers(data ?? []);
      } catch (err: any) {
        console.error(err);
        setError(err?.response?.data?.message || "Impossible de récupérer la liste des utilisateurs");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // simple client-side counts
  const counts = useMemo(() => {
    const map = {
      total: users.length,
      pending: users.filter((u) => (u.status ?? "PENDING") === "PENDING").length,
      accepted: users.filter((u) => u.status === "ACCEPTED").length,
      rejected: users.filter((u) => u.status === "REJECTED").length,
      deleted: users.filter((u) => u.status === "DELETED").length,
    };
    return map;
  }, [users]);

  // filtered users
  const filtered = useMemo(() => {
    return users.filter((u) => {
      // status filter
      const status = u.status ?? "PENDING";
      if (statusFilter !== "ALL" && status !== statusFilter) return false;
      if (showOnlyPending && status !== "PENDING") return false;

      // search
      if (!debouncedSearch) return true;
      const hay = `${u.firstName ?? ""} ${u.lastName ?? ""} ${u.email ?? ""}`.toLowerCase();
      return hay.includes(debouncedSearch);
    });
  }, [users, debouncedSearch, statusFilter, showOnlyPending]);

  if (!hasRole("ADMIN")) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <p className="font-medium text-gray-800">Accès refusé</p>
          <p className="text-sm text-gray-600">Vous n'avez pas les droits nécessaires pour voir cette page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header / toolbar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Utilisateurs</h1>
            <p className="text-sm text-gray-500">Gérer les comptes utilisateurs — valider, rejeter ou supprimer.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="inline-flex items-center gap-2 bg-white rounded-md shadow-sm px-3 py-2 border border-gray-100">
              <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="10.5" cy="10.5" r="5.5" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <input
                aria-label="Recherche utilisateurs"
                placeholder="Rechercher par nom ou email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64 md:w-80 outline-none text-sm placeholder:text-gray-400 bg-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusOption)}
              className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm"
              aria-label="Filtrer par statut"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === "ALL" ? "Tous les statuts" : s}
                </option>
              ))}
            </select>

            <button
              onClick={() => { setShowOnlyPending((v) => !v); setStatusFilter("ALL"); }}
              className={`rounded-md px-3 py-2 text-sm border shadow-sm ${showOnlyPending ? "bg-yellow-400 text-black" : "bg-white text-gray-700"}`}
            >
              {showOnlyPending ? "Afficher tous" : "Uniquement PENDING"}
            </button>

            <button
              onClick={() => navigate("/admin/users/0")}
              className="rounded-md px-3 py-2 text-sm bg-yellow-400 text-black font-medium shadow-sm"
            >
              Nouveau
            </button>
          </div>
        </div>

        {/* summary chips */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="px-3 py-2 bg-white border rounded-md text-sm text-gray-700 shadow-sm">
            Total <span className="font-semibold ml-2">{counts.total}</span>
          </div>
          <div className="px-3 py-2 bg-yellow-50 border rounded-md text-sm text-yellow-800">
            Pending <span className="font-semibold ml-2">{counts.pending}</span>
          </div>
          <div className="px-3 py-2 bg-green-50 border rounded-md text-sm text-green-800">
            Accepted <span className="font-semibold ml-2">{counts.accepted}</span>
          </div>
          <div className="px-3 py-2 bg-red-50 border rounded-md text-sm text-red-800">
            Rejected <span className="font-semibold ml-2">{counts.rejected}</span>
          </div>
        </div>

        {/* container card */}
        <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
          {/* table header (desktop) */}
          <div className="hidden md:block">
            {loading ? (
              <div className="p-6">Chargement…</div>
            ) : error ? (
              <div className="p-6 text-red-600">{error}</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Nom</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Genre</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Statut</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="font-medium">{u.firstName} {u.lastName}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{u.gender ?? "-"}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium
                          ${u.status === "ACCEPTED" ? "bg-green-100 text-green-800" : u.status === "REJECTED" ? "bg-red-100 text-red-800" : u.status === "DELETED" ? "bg-gray-100 text-gray-800" : "bg-yellow-100 text-yellow-800"}`}>
                          {u.status ?? "PENDING"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        <Link to={`/admin/users/${u.id}`} className="inline-flex items-center gap-2 px-3 py-1 border rounded text-sm hover:bg-gray-50">
                          {/* eye icon */}
                          <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/></svg>
                          Voir
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td className="px-6 py-8 text-center text-sm text-gray-500" colSpan={5}>
                        Aucun utilisateur correspondant.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* mobile: cards */}
          <div className="md:hidden">
            {loading ? (
              <div className="p-4">Chargement…</div>
            ) : error ? (
              <div className="p-4 text-red-600">{error}</div>
            ) : filtered.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">Aucun utilisateur correspondant.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filtered.map((u) => (
                  <div key={u.id} className="p-4 flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{u.firstName} {u.lastName}</div>
                          <div className="text-xs text-gray-500">{u.email}</div>
                        </div>
                        <div>
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            u.status === "ACCEPTED" ? "bg-green-100 text-green-800" :
                            u.status === "REJECTED" ? "bg-red-100 text-red-800" :
                            u.status === "DELETED" ? "bg-gray-100 text-gray-800" : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {u.status ?? "PENDING"}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">{u.gender ?? "-"}</div>
                    </div>
                    <div className="flex items-center">
                      <Link to={`/admin/users/${u.id}`} className="inline-flex items-center gap-2 px-3 py-1 border rounded text-sm hover:bg-gray-50">
                        Voir
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* footer / optional */}
        <div className="mt-4 text-sm text-gray-500">
          {filtered.length} utilisateur(s) affiché(s){filtered.length !== users.length ? ` — filtré(s) depuis ${users.length}` : ""}
        </div>
      </div>
    </div>
  );
};

export default UsersList;