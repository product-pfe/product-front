// src/components/products/ProductForm.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createProduct, getProductById, updateProduct } from "../../services/ProductService";
import type { ProductCreateRequest, ProductUpdateRequest } from "../../types/product";

const ProductForm: React.FC<{ mode?: "create" | "edit" }> = ({ mode = "create" }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<ProductCreateRequest>({
    name: "",
    description: "",
    price: "",
    currency: "EUR",
    category: "OTHER",
    imageUrls: [],
    quantity: 1,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "edit" && id) {
      setLoading(true);
      (async () => {
        try {
          const p = await getProductById(id);
          setForm({
            name: p.name,
            description: p.description ?? "",
            price: String(p.price ?? ""),
            currency: p.currency ?? "EUR",
            category: p.category ?? "OTHER",
            imageUrls: p.imageUrls ?? [],
            quantity: p.quantity ?? 1,
          });
        } catch (e:any) {
          setError("Impossible de charger le produit");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [mode, id]);

  const updateField = (k: keyof ProductCreateRequest, v: any) => setForm((s) => ({ ...s, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (mode === "create") {
        const created = await createProduct(form);
        navigate(`/products/${created.id}`);
      } else if (mode === "edit" && id) {
        const updated = await updateProduct(id, form as ProductUpdateRequest);
        navigate(`/products/${updated.id}`);
      }
    } catch (err:any) {
      setError(err?.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow border p-6">
        <h2 className="text-xl font-semibold mb-4">{mode === "create" ? "Créer un produit" : "Éditer le produit"}</h2>

        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700">Nom</label>
            <input className="mt-1 w-full rounded border px-3 py-2" value={form.name} onChange={(e) => updateField("name", e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm text-gray-700">Description</label>
            <textarea className="mt-1 w-full rounded border px-3 py-2" value={form.description} onChange={(e) => updateField("description", e.target.value)} rows={4} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-700">Prix</label>
              <input className="mt-1 w-full rounded border px-3 py-2" value={form.price} onChange={(e) => updateField("price", e.target.value)} required />
            </div>

            <div>
              <label className="block text-sm text-gray-700">Devise</label>
              <input className="mt-1 w-full rounded border px-3 py-2" value={form.currency} onChange={(e) => updateField("currency", e.target.value)} />
            </div>

            <div>
              <label className="block text-sm text-gray-700">Quantité</label>
              <input type="number" min={0} className="mt-1 w-full rounded border px-3 py-2" value={form.quantity} onChange={(e) => updateField("quantity", Number(e.target.value))} />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700">Catégorie</label>
            <select className="mt-1 rounded border px-3 py-2" value={form.category} onChange={(e) => updateField("category", e.target.value)}>
              <option value="OTHER">Autre</option>
              <option value="ELECTRONICS">Électronique</option>
              <option value="BOOKS">Livres</option>
              <option value="FASHION">Mode</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700">Image URLs (séparées par ENTER)</label>
            <textarea
              className="mt-1 w-full rounded border px-3 py-2"
              rows={3}
              value={(form.imageUrls || []).join("\n")}
              onChange={(e) => updateField("imageUrls", e.target.value.split("\n").map(s => s.trim()).filter(Boolean))}
            />
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-md bg-yellow-400 text-black">
              {saving ? "Enregistrement…" : mode === "create" ? "Créer" : "Enregistrer"}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="px-3 py-2 rounded-md border">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;