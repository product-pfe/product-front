// src/components/products/ProductDetail.tsx
import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, deleteProduct } from "../../services/ProductService";
import { AuthContext } from "../../context/authContext";
import type { ProductDto } from "../../types/product";

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, hasRole } = useContext(AuthContext);

  const [product, setProduct] = useState<ProductDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const p = await getProductById(id);
        setProduct(p);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Impossible de charger le produit");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const canEdit = product && (user?.id === product.ownerId || hasRole("ADMIN"));

  const handleDelete = async () => {
    if (!id || !product) return;
    if (!confirm("Supprimer ce produit ?")) return;
    setDeleting(true);
    try {
      await deleteProduct(id);
      navigate("/products");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Erreur lors de la suppression");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="p-6">Chargement…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!product) return <div className="p-6">Produit introuvable</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-start gap-6 mb-6">
        <button onClick={() => navigate(-1)} className="px-3 py-2 rounded-md border bg-white">← Retour</button>

        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-sm text-gray-500">{product.category}</p>
        </div>

        <div className="flex-shrink-0 flex items-center gap-2">
          {canEdit && (
            <>
              <button onClick={() => navigate(`/products/${product.id}/edit`)} className="px-4 py-2 rounded-md bg-yellow-400 text-black">Éditer</button>
              <button onClick={handleDelete} disabled={deleting} className="px-3 py-2 rounded-md border">
                {deleting ? "Suppression…" : "Supprimer"}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="w-full h-56 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
              {product.imageUrls?.[0] ? (
                <img src={product.imageUrls[0]} alt={product.name} className="object-cover w-full h-full" />
              ) : (
                <div className="text-sm text-gray-400">Pas d'image</div>
              )}
            </div>
            <div className="mt-4 text-sm text-gray-500">Quantité: <span className="font-medium">{product.quantity ?? 0}</span></div>
            <div className="text-sm text-gray-500 mt-1">Statut: <span className="font-medium">{product.status}</span></div>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold">Description</h3>
            <p className="mt-2 text-gray-700">{product.description ?? "Aucune description"}</p>

            <div className="mt-6">
              <div className="text-sm text-gray-500">Prix</div>
              <div className="text-xl font-bold">{product.price} {product.currency}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;