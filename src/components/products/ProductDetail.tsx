// src/components/products/ProductDetail.tsx
import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, deleteProduct } from "../../services/ProductService";
import { AuthContext } from "../../context/authContext";
import type { ProductDto } from "../../types/product";

const StatusPill: React.FC<{ status?: string }> = ({ status }) => {
  const s = (status ?? "ACTIVE").toUpperCase();
  const base = "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold";
  if (s === "ACTIVE") return <span className={`${base} bg-green-100 text-green-800`}>Active</span>;
  if (s === "INACTIVE") return <span className={`${base} bg-gray-100 text-gray-800`}>Inactif</span>;
  return <span className={`${base} bg-yellow-100 text-yellow-800`}>{s}</span>;
};

const formatMoney = (v?: number | string) => {
  if (v == null) return "-";
  try {
    const n = Number(v);
    return n.toLocaleString(undefined, { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
  } catch {
    return String(v);
  }
};

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, hasRole } = useContext(AuthContext);

  const [product, setProduct] = useState<ProductDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [activeImage, setActiveImage] = useState<number>(0);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const p = await getProductById(id);
        setProduct(p);
        setActiveImage(0);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Impossible de charger le produit");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const canEdit = product && (user?.id === product.ownerId || hasRole("ADMIN"));

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteProduct(id);
      navigate("/products");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Erreur lors de la suppression");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  if (loading) return <div className="p-6">Chargement…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!product) return <div className="p-6">Produit introuvable</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Breadcrumb / header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <button onClick={() => navigate(-1)} className="text-sm text-gray-600 hover:underline">← Retour</button>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mt-3">{product.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <StatusPill status={product.status} />
            <span className="text-xs text-gray-500">Catégorie · {product.category ?? "-"}</span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-500">Quantité: <span className="font-medium text-gray-700">{product.quantity ?? 0}</span></span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {canEdit && (
            <>
              <button
                onClick={() => navigate(`/products/${product.id}/edit`)}
                className="px-4 py-2 rounded-md bg-yellow-400 text-black hover:bg-yellow-500 font-medium"
              >
                Éditer
              </button>
              <button
                onClick={() => setConfirmOpen(true)}
                disabled={deleting}
                className="px-4 py-2 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              >
                {deleting ? "Suppression…" : "Supprimer"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-lg shadow-md border overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          {/* Left: gallery */}
          <div className="md:col-span-1">
            <div className="rounded-lg overflow-hidden bg-gray-50 border">
              {product.imageUrls && product.imageUrls.length > 0 ? (
                <>
                  <div className="w-full h-72 md:h-64 lg:h-80 bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img
                      src={product.imageUrls[activeImage]}
                      alt={product.name}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  <div className="flex items-center gap-2 p-3 overflow-x-auto">
                    {product.imageUrls.map((u, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        className={`w-16 h-12 rounded-md overflow-hidden border ${i === activeImage ? "ring-2 ring-yellow-300" : "border-gray-100"} shrink-0`}
                      >
                        <img src={u} alt={`thumb-${i}`} className="object-cover w-full h-full" />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="w-full h-72 md:h-64 lg:h-80 flex items-center justify-center text-gray-400">
                  Pas d'image
                </div>
              )}
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm text-gray-700">
              <div>Propriétaire: <span className="font-medium">{product.ownerId ?? "-"}</span></div>
              <div className="mt-1">Réf produit: <span className="font-mono text-xs text-gray-500">{product.id}</span></div>
              <div className="mt-1 text-xs text-gray-500">Créé: {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : "-"}</div>
            </div>
          </div>

          {/* Right: details */}
          <div className="md:col-span-2">
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm text-gray-500">Prix</div>
                  <div className="text-3xl font-extrabold text-gray-900">{formatMoney(product.price)} <span className="text-base font-medium text-gray-500">/ {product.currency ?? "EUR"}</span></div>
                </div>

                <div className="hidden md:flex flex-col items-end text-sm">
                  <div className="text-gray-500">Statut</div>
                  <div className="font-medium">{product.status}</div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800">Description</h3>
                <p className="mt-2 text-gray-700 leading-relaxed">{product.description ?? "Aucune description fournie."}</p>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate("/products")}
                  className="px-4 py-2 rounded-md border bg-white text-gray-700 hover:bg-gray-50"
                >
                  Retour à la liste
                </button>

                <button
                  onClick={() => { navigator.clipboard?.writeText(window.location.href); alert("Lien copié"); }}
                  className="px-4 py-2 rounded-md border bg-white text-gray-700 hover:bg-gray-50"
                >
                  Copier le lien
                </button>

                <div className="ml-auto text-sm text-gray-500">Mis à jour: {product.updatedAt ? new Date(product.updatedAt).toLocaleString() : "-"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setConfirmOpen(false)} />
          <div className="relative max-w-md w-full bg-white rounded-lg shadow-lg p-6 z-10">
            <h3 className="text-lg font-semibold">Confirmer la suppression</h3>
            <p className="mt-2 text-sm text-gray-600">Voulez-vous vraiment supprimer ce produit ? Cette action est irréversible.</p>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button onClick={() => setConfirmOpen(false)} className="px-4 py-2 rounded-md border bg-white text-gray-700">Annuler</button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-md bg-black text-yellow-400 hover:bg-gray-900"
              >
                {deleting ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;