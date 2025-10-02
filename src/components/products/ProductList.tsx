// src/components/products/ProductList.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listProducts } from "../../services/ProductService";
import type { ProductDto } from "../../types/product";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts";

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50];
const DEFAULT_PAGE_SIZE = 10; // <- 10 per page by default

const THEME_COLORS = {
  yellow: "#F59E0B", // yellow-400
  yellowDark: "#B45309",
  black: "#000000",
  green: "#10B981",
  red: "#EF4444",
  gray: "#6B7280",
};

const formatPrice = (p: any) => {
  if (p == null) return "-";
  const n = typeof p === "number" ? p : Number(String(p));
  if (Number.isNaN(n)) return String(p);
  return n.toFixed(2);
};

const ProductList: React.FC = () => {
  const navigate = useNavigate();

  // data
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // filters + search + pagination + sort
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "priceAsc" | "priceDesc" | "name">("newest");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);

  // fetch products (category param optionally sent to backend via service)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listProducts(category || undefined);
        if (!cancelled) {
          setProducts(data ?? []);
          setPage(1);
        }
      } catch (err: any) {
        console.error(err);
        setError(err?.response?.data?.message || "Impossible de récupérer les produits");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [category]);

  // derived categories from data
  const categoriesFromData = useMemo(() => {
    const s = new Set<string>();
    products.forEach((p) => p.category && s.add(String(p.category)));
    return Array.from(s).sort();
  }, [products]);

  // filtered + sorted
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const min = Number(minPrice || NaN);
    const max = Number(maxPrice || NaN);

    let arr = products.filter((p) => {
      if (category && String(p.category) !== category) return false;
      if (status && String(p.status) !== status) return false;

      const priceNum = typeof p.price === "number" ? p.price : Number(String(p.price));
      if (!Number.isNaN(min) && !Number.isNaN(priceNum) && priceNum < min) return false;
      if (!Number.isNaN(max) && !Number.isNaN(priceNum) && priceNum > max) return false;

      if (!q) return true;
      const hay = `${p.name ?? ""} ${p.description ?? ""} ${p.category ?? ""}`.toLowerCase();
      return hay.includes(q);
    });

    arr.sort((a, b) => {
      if (sortBy === "newest") {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      }
      if (sortBy === "priceAsc") return Number(a.price ?? 0) - Number(b.price ?? 0);
      if (sortBy === "priceDesc") return Number(b.price ?? 0) - Number(a.price ?? 0);
      if (sortBy === "name") return String(a.name ?? "").localeCompare(String(b.name ?? ""));
      return 0;
    });

    return arr;
  }, [products, search, category, status, minPrice, maxPrice, sortBy]);

  // pagination
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // stats for charts
  const stats = useMemo(() => {
    const byCategory: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const monthly: Record<string, number> = {};
    let priceSum = 0;
    let priceCount = 0;

    products.forEach((p) => {
      const cat = p.category ?? "OTHER";
      byCategory[cat] = (byCategory[cat] || 0) + 1;

      const st = (p.status ?? "ACTIVE").toString();
      byStatus[st] = (byStatus[st] || 0) + 1;

      if (p.createdAt) {
        // group by YYYY-MM
        const d = new Date(p.createdAt);
        if (!Number.isNaN(d.getTime())) {
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          monthly[key] = (monthly[key] || 0) + 1;
        }
      }

      const pv = typeof p.price === "number" ? p.price : Number(String(p.price));
      if (!Number.isNaN(pv)) {
        priceSum += pv;
        priceCount++;
      }
    });

    const categoryData = Object.entries(byCategory).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const statusData = Object.entries(byStatus).map(([name, value]) => ({ name, value }));
    const monthlyData = Object.entries(monthly)
      .map(([k, v]) => ({ month: k, value: v }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const avgPrice = priceCount > 0 ? priceSum / priceCount : 0;

    return { categoryData, statusData, monthlyData, avgPrice, total: products.length };
  }, [products]);

  // reset filters
  const handleResetFilters = () => {
    setSearch("");
    setCategory("");
    setStatus("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
    setPage(1);
  };

  const goTo = (n: number) => setPage(Math.min(Math.max(1, n), totalPages));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
          <p className="text-sm text-gray-500">Voir et gérer vos produits</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/products/new")}
            className="px-4 py-2 rounded-md bg-yellow-400 text-black font-medium shadow-sm"
          >
            Nouveau produit
          </button>
        </div>
      </div>

      {/* Filters card */}
      <div className="bg-white border rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 flex items-center gap-2">
            <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-100 rounded px-3 py-2 w-full">
              <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="10.5" cy="10.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              <input
                aria-label="Recherche produits"
                placeholder="Rechercher par nom, description..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="bg-transparent w-full outline-none text-sm"
              />
            </div>
          </div>

          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="rounded-md border px-3 py-2 text-sm"
            aria-label="Filtrer par catégorie"
          >
            <option value="">Toutes catégories</option>
            {categoriesFromData.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="rounded-md border px-3 py-2 text-sm"
            aria-label="Filtrer par statut"
          >
            <option value="">Tous statuts</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          <div className="flex gap-2">
            <input
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Prix min"
              className="rounded-md border px-3 py-2 text-sm w-full"
              inputMode="numeric"
              aria-label="Prix minimum"
            />
            <input
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Prix max"
              className="rounded-md border px-3 py-2 text-sm w-full"
              inputMode="numeric"
              aria-label="Prix maximum"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-md border px-3 py-2 text-sm"
              aria-label="Trier par"
            >
              <option value="newest">Plus récent</option>
              <option value="priceAsc">Prix ↑</option>
              <option value="priceDesc">Prix ↓</option>
              <option value="name">Nom A–Z</option>
            </select>

            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="rounded-md border px-3 py-2 text-sm"
              aria-label="Taille page"
            >
              {DEFAULT_PAGE_SIZE_OPTIONS.map((s) => (
                <option key={s} value={s}>{s} / page</option>
              ))}
            </select>

            <button
              onClick={handleResetFilters}
              className="ml-auto text-sm px-3 py-2 rounded border bg-white hover:bg-gray-50"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* results */}
      {loading ? (
        <div className="p-8 bg-white rounded-lg shadow text-center">Chargement…</div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-700 rounded">{error}</div>
      ) : (
        <>
          {/* desktop table */}
          <div className="hidden md:block bg-white shadow rounded-lg border overflow-hidden mb-6">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm text-gray-600">Produit</th>
                  <th className="px-6 py-3 text-left text-sm text-gray-600">Prix</th>
                  <th className="px-6 py-3 text-left text-sm text-gray-600">Quantité</th>
                  <th className="px-6 py-3 text-left text-sm text-gray-600">Catégorie</th>
                  <th className="px-6 py-3 text-left text-sm text-gray-600">Statut</th>
                  <th className="px-6 py-3 text-right text-sm text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-gray-500">{p.description}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">{formatPrice(p.price)} {p.currency}</td>
                    <td className="px-6 py-4 text-sm">{p.quantity ?? 0}</td>
                    <td className="px-6 py-4 text-sm">{p.category ?? "-"}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-50 text-yellow-800">
                        {p.status ?? "ACTIVE"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <button onClick={() => navigate(`/products/${p.id}`)} className="px-3 py-1 border rounded text-sm hover:bg-gray-50">
                        Voir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* mobile grid */}
          <div className="md:hidden grid gap-4 mb-6">
            {paginated.map((p) => (
              <div key={p.id} className="bg-white shadow rounded-lg p-4 flex gap-4">
                <div className="w-20 h-20 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                  {p.imageUrls?.[0] ? (
                    <img src={p.imageUrls[0]} alt={p.name} className="object-cover w-full h-full" />
                  ) : (
                    <div className="text-xs text-gray-500">No image</div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm text-gray-500">{p.status ?? "ACTIVE"}</div>
                  </div>
                  <div className="text-sm text-gray-500">{formatPrice(p.price)} {p.currency}</div>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => navigate(`/products/${p.id}`)} className="text-sm px-3 py-1 rounded border">Voir</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-700">Répartition par catégorie</div>
                <div className="text-xs text-gray-500">{stats.categoryData.reduce((s, x) => s + x.value, 0)} produits</div>
              </div>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie dataKey="value" data={stats.categoryData} outerRadius={70} innerRadius={28} label>
                      {stats.categoryData.map((entry, idx) => (
                        <Cell key={`c-${idx}`} fill={[THEME_COLORS.yellow, THEME_COLORS.green, THEME_COLORS.red, THEME_COLORS.gray][idx % 4]} />
                      ))}
                    </Pie>
                    <ReTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-700">Statut des produits</div>
                <div className="text-xs text-gray-500">{stats.statusData.reduce((s, x) => s + x.value, 0)} produits</div>
              </div>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.statusData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ReTooltip />
                    <Bar dataKey="value" fill={THEME_COLORS.yellow} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-700">Ajouts par mois</div>
                <div className="text-xs text-gray-500">Derniers mois</div>
              </div>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ReTooltip />
                    <Line type="monotone" dataKey="value" stroke={THEME_COLORS.black} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* pagination */}
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="text-sm text-gray-600">
              Affichage <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> -{" "}
              <span className="font-medium">{Math.min(currentPage * pageSize, total)}</span> sur <span className="font-medium">{total}</span>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => goTo(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 rounded border bg-white hover:bg-gray-50 disabled:opacity-50">
                Préc.
              </button>

              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const n = idx + 1;
                  const show = totalPages <= 7 || Math.abs(n - currentPage) <= 2 || n === 1 || n === totalPages;
                  if (!show) {
                    const prev = n - 1;
                    if (prev > 0 && (prev === 1 || Math.abs(prev - currentPage) <= 2 || prev === totalPages)) return null;
                    return <span key={`dot-${n}`} className="px-2">…</span>;
                  }
                  return (
                    <button
                      key={n}
                      onClick={() => goTo(n)}
                      className={`px-3 py-1 rounded ${n === currentPage ? "bg-yellow-400 text-black" : "bg-white border hover:bg-gray-50"}`}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>

              <button onClick={() => goTo(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 rounded border bg-white hover:bg-gray-50 disabled:opacity-50">
                Suiv.
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductList;