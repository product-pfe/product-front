// src/pages/Home.tsx
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/authContext";

type ProductPreview = {
  id: string;
  name: string;
  description?: string;
  price?: string; // formatted price e.g. "29.99 €"
  imageUrl?: string | null;
};

const MOCK_PRODUCTS: ProductPreview[] = [
  { id: "1", name: "Classic Lamp", description: "Minimalist design", price: "29.99 €", imageUrl: null },
  { id: "2", name: "Wireless Headset", description: "Long battery life", price: "79.00 €", imageUrl: null },
  { id: "3", name: "Organic Notebook", description: "Recycled paper", price: "7.50 €", imageUrl: null },
  { id: "4", name: "Smart Mug", description: "Temperature control", price: "49.00 €", imageUrl: null },
  { id: "5", name: "Desk Plant", description: "Air-purifying", price: "12.00 €", imageUrl: null },
  { id: "6", name: "Phone Stand", description: "Adjustable angle", price: "9.99 €", imageUrl: null },
];

const ProductCard: React.FC<{ p: ProductPreview }> = ({ p }) => {
  return (
    <article className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="h-40 bg-gradient-to-br from-yellow-200 to-yellow-400 flex items-center justify-center">
        {/* simple placeholder; replace with <img> when you have imageUrl */}
        {p.imageUrl ? (
          // eslint-disable-next-line jsx-a11y/img-redundant-alt
          <img src={p.imageUrl} alt={`Image of ${p.name}`} className="object-cover w-full h-full" />
        ) : (
          <div className="text-center px-4">
            <div className="text-lg font-semibold text-gray-900">{p.name}</div>
            <div className="text-xs text-gray-700 mt-1">{p.description}</div>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{p.name}</h3>
          {p.price && <span className="text-sm font-semibold text-gray-800">{p.price}</span>}
        </div>
        <p className="text-xs text-gray-600 line-clamp-2">{p.description}</p>
        <div className="mt-auto">
          <Link
            to={`/products/${p.id}`}
            className="inline-block w-full text-center py-2 px-3 rounded-md bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
            aria-label={`Voir ${p.name}`}
          >
            Voir
          </Link>
        </div>
      </div>
    </article>
  );
};

const Home: React.FC = () => {
  const { accessToken, user } = useContext(AuthContext);
  const [products, setProducts] = useState<ProductPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        // API expected to support a small preview endpoint
        const res = await fetch("/api/products?limit=6");
        if (!res.ok) throw new Error("no remote products");
        const body = await res.json();
        // assume body is array of products with id,name,description,price,imageUrls
        const mapped: ProductPreview[] = (body || []).slice(0, 6).map((x: any) => ({
          id: x.id ?? x._id ?? String(x.id),
          name: x.name ?? "Untitled",
          description: x.description ?? "",
          price:
            x.price != null
              ? // simple formatting if price is numeric
                (typeof x.price === "number" ? `${x.price.toFixed(2)} ${x.currency ?? "€"}` : String(x.price))
              : undefined,
          imageUrl: Array.isArray(x.imageUrls) && x.imageUrls.length ? x.imageUrls[0] : null,
        }));
        if (mounted) {
          setProducts(mapped.length ? mapped : MOCK_PRODUCTS);
        }
      } catch (e) {
        if (mounted) {
          setProducts(MOCK_PRODUCTS);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="w-full">
      {/* HERO */}
      <section className="bg-gradient-to-br from-white via-yellow-50 to-white py-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
              Gère tes produits. <span className="text-yellow-500">Simplement</span>, rapidement.
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Une plateforme légère pour ajouter, suivre et analyser tes produits. Crée ton compte, publie des produits, et
              consulte des métriques claires pour piloter ton inventaire.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-black font-semibold shadow"
              >
                Voir les produits
              </Link>

              {!accessToken ? (
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-800"
                >
                  Créer un compte
                </Link>
              ) : (
                <Link
                  to="/student"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-800"
                >
                  Mon espace
                </Link>
              )}
            </div>

            <div className="mt-6 flex items-center gap-4 text-sm text-gray-600">
              <span>Recommandé pour les freelances & petites boutiques</span>
              <span className="h-1 w-px bg-gray-300 inline-block" />
              <span>{user?.email ? `Connecté comme ${user.email}` : "Accès gratuit 14 jours"}</span>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="rounded-2xl bg-gradient-to-br from-yellow-200 to-yellow-400 p-8 shadow-lg">
              <div className="h-72 rounded-lg bg-white/70 p-6 flex flex-col justify-between">
                <div>
                  <h4 className="text-gray-900 font-bold text-xl">Boost ta boutique</h4>
                  <p className="mt-2 text-sm text-gray-700">
                    Visualise tes ventes, stock, et performance produit avec des rapports simples.
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-sm text-gray-700">Produits</div>
                    <div className="text-lg font-semibold text-gray-900">120</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-sm text-gray-700">Valeur stock</div>
                    <div className="text-lg font-semibold text-gray-900">5 400 €</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS PREVIEW */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Nouveautés</h2>
          <Link to="/products" className="text-sm text-yellow-600 hover:underline">
            Voir tout
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-52 bg-gray-100 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </section>

      {/* FEATURES */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Rapide & léger</h3>
            <p className="mt-2 text-sm text-gray-600">Démarre en quelques minutes, interface fluide et réactive.</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Sécurisé</h3>
            <p className="mt-2 text-sm text-gray-600">JWT, rôles et vérifications côté serveur pour protéger tes données.</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Statistiques</h3>
            <p className="mt-2 text-sm text-gray-600">Tableaux et métriques pour suivre l’évolution de ton catalogue.</p>
          </div>
        </div>
      </section>

      {/* CTA + FOOTER */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-block bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-gray-900">Prêt à lancer ?</h4>
            <p className="text-sm text-gray-700 mt-2">Crée un compte et commence à ajouter tes produits aujourd'hui.</p>
            <div className="mt-4 flex items-center justify-center gap-3">
              {!accessToken ? (
                <>
                  <Link to="/register" className="px-5 py-3 rounded-md bg-yellow-400 hover:bg-yellow-500 text-black font-semibold">
                    Créer un compte
                  </Link>
                  <Link to="/products" className="px-5 py-3 rounded-md border border-gray-200 text-gray-800">
                    Explorer
                  </Link>
                </>
              ) : (
                <Link to="/student" className="px-5 py-3 rounded-md bg-yellow-400 hover:bg-yellow-500 text-black font-semibold">
                  Mon espace
                </Link>
              )}
            </div>
          </div>

          <footer className="mt-8 text-sm text-gray-500">
            <div>© {new Date().getFullYear()} MyApp — Built with ❤️</div>
          </footer>
        </div>
      </section>
    </div>
  );
};

export default Home;