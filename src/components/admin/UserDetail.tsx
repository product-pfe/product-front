// src/components/admin/UserDetail.tsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserById, updateUserStatus, UserDetailDto } from "../../services/UserService";

type ActionType = "ACCEPTED" | "REJECTED" | "DELETED" | null;

/* ---------- Helpers / Small presentational components ---------- */

const extractStatus = (u?: any): string => {
  if (!u) return "PENDING";
  // Accept several possible JSON shapes from backend
  const s = u.status ?? u.Status ?? u.userStatus ?? u.user_status ?? null;
  return (s ?? "PENDING").toString().toUpperCase();
};

const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  const s = (status ?? "PENDING").toUpperCase();
  const base = "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold";
  if (s === "ACCEPTED") return <span className={`${base} bg-green-100 text-green-800`}>✓ Accepté</span>;
  if (s === "REJECTED") return <span className={`${base} bg-red-100 text-red-800`}>⨯ Rejeté</span>;
  if (s === "DELETED") return <span className={`${base} bg-gray-100 text-gray-800`}>⨯ Supprimé</span>;
  return <span className={`${base} bg-yellow-100 text-yellow-800`}>⏳ En attente</span>;
};

const FieldRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div>
    <div className="text-sm text-gray-500">{label}</div>
    <div className="mt-1 text-sm text-gray-900">{value ?? "-"}</div>
  </div>
);

const formatDate = (iso?: string) => {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString();
  } catch {
    return iso;
  }
};

/* Confirmation modal component */
const ConfirmationModal: React.FC<{
  open: boolean;
  action: ActionType;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
}> = ({ open, action, onConfirm, onCancel, busy }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLButtonElement>('button[data-autofocus]')?.focus();
    return () => prev?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open || !action) return null;

  const title =
    action === "ACCEPTED" ? "Confirmer l'acceptation" : action === "REJECTED" ? "Confirmer le rejet" : "Confirmer la suppression";

  const hint =
    action === "ACCEPTED"
      ? "L'utilisateur sera marqué comme accepté et pourra utiliser pleinement le service."
      : action === "REJECTED"
      ? "Le compte sera rejeté. L'utilisateur ne pourra pas accéder au service."
      : "Le compte sera marqué comme supprimé (soft-delete). Cette action peut être irréversible.";

  const confirmBtnClass =
    action === "ACCEPTED"
      ? "px-4 py-2 rounded-md bg-yellow-400 text-black hover:bg-yellow-500 disabled:opacity-60"
      : action === "REJECTED"
      ? "px-4 py-2 rounded-md bg-black text-yellow-400 hover:bg-gray-900 disabled:opacity-60"
      : "px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-800 disabled:opacity-60";

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black/40" onClick={onCancel} />

      <div ref={ref} className="relative max-w-lg w-full bg-white rounded-lg shadow-lg ring-1 ring-black/5">
        <div className="p-6">
          <h3 id="confirm-title" className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
          <p className="mt-2 text-sm text-gray-600">{hint}</p>

          <div className="mt-4 flex gap-3 justify-end">
            <button onClick={onCancel} className="px-4 py-2 rounded-md border bg-white text-gray-700 hover:bg-gray-50" disabled={busy}>
              Annuler
            </button>
            <button data-autofocus onClick={onConfirm} className={`${confirmBtnClass}`} disabled={busy}>
              {busy ? "Traitement…" : action === "ACCEPTED" ? "Accepter" : action === "REJECTED" ? "Rejeter" : "Supprimer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- Main component ---------- */

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [pendingAction, setPendingAction] = useState<ActionType>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // initial fetch
  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const data = await getUserById(id);
        console.log("GET user:", data);
        setUser(data);
      } catch (err: any) {
        console.error(err);
        setError(err?.response?.data?.message || "Impossible de charger l'utilisateur");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const openConfirm = (action: ActionType) => {
    setPendingAction(action);
    setModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!id || !pendingAction) return;
    setSubmitting(true);

    try {
      // call backend
      await updateUserStatus(id, { status: pendingAction });

      // optimistic UI update
      setUser((prev) => {
        if (!prev) return prev;
        return { ...prev, status: pendingAction } as UserDetailDto;
      });

      // close modal
      setModalOpen(false);

      // re-fetch in background to guarantee consistency with backend
      (async () => {
        try {
          const refreshed = await getUserById(id);
          console.log("REFRESHED user:", refreshed);
          setUser(refreshed);
        } catch (err) {
          console.warn("Failed to re-fetch user after update:", err);
        }
      })();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Erreur lors de la mise à jour");
      setModalOpen(false);
    } finally {
      setSubmitting(false);
      setPendingAction(null);
    }
  };

  if (loading) return <div className="p-6">Chargement…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!user) return <div className="p-6">Utilisateur introuvable</div>;

  const status = extractStatus(user);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-start gap-6 mb-6">
        <button onClick={() => navigate(-1)} className="px-3 py-2 rounded-md border bg-white text-gray-700 hover:bg-gray-50">
          ← Retour
        </button>

        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{user.firstName} {user.lastName}</h1>
          <div className="mt-2 flex items-center gap-3">
            <StatusBadge status={status} />
            <div className="text-sm text-gray-500">Membre — {formatDate(user.dateOfBirth as unknown as string)}</div>
          </div>
        </div>

        <div className="flex-shrink-0 flex items-center gap-2">
          <button
            onClick={() => openConfirm("ACCEPTED")}
            disabled={submitting}
            className="px-4 py-2 rounded-md bg-yellow-400 text-black hover:bg-yellow-500 disabled:opacity-60"
          >
            Accepter
          </button>

          <button
            onClick={() => openConfirm("REJECTED")}
            disabled={submitting}
            className="px-4 py-2 rounded-md bg-black text-yellow-400 hover:bg-gray-900 disabled:opacity-60"
          >
            Rejeter
          </button>

          <button
            onClick={() => openConfirm("DELETED")}
            disabled={submitting}
            className="px-3 py-2 rounded-md border bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            Supprimer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* left profile */}
        <div className="md:col-span-1 bg-white rounded-lg shadow border p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-yellow-200 flex items-center justify-center text-xl font-bold text-yellow-800">
              {user.firstName?.[0] ?? "U"}
            </div>
            <div>
              <div className="text-sm text-gray-500">Email</div>
              <div className="font-medium">{user.email}</div>

              <div className="mt-3 text-sm text-gray-500">Rôle</div>
              <div className="font-medium">{(user as any).role ?? "-"}</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-sm text-gray-500">Statut</div>
            <div className="mt-1"><StatusBadge status={status} /></div>
          </div>
        </div>

        {/* right details */}
        <div className="md:col-span-2 bg-white rounded-lg shadow border p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldRow label="Nom complet" value={`${user.firstName} ${user.lastName}`} />
            <FieldRow label="Email" value={user.email} />
            <FieldRow label="Genre" value={user.gender ?? "-"} />
            <FieldRow label="Date de naissance" value={formatDate(user.dateOfBirth as unknown as string)} />

            <div className="sm:col-span-2">
              <div className="text-sm text-gray-500">Adresse</div>
              <div className="mt-1 text-sm text-gray-900">
                {user.address ? (
                  <>
                    <div>{user.address.street} {user.address.number}</div>
                    <div>{user.address.zipcode} {user.address.city}</div>
                    <div>{user.address.country}</div>
                  </>
                ) : (
                  "-"
                )}
              </div>
            </div>

            <div className="sm:col-span-2">
              <div className="text-sm text-gray-500">Historique</div>
              <div className="mt-2 text-sm text-gray-700">Aucun historique disponible pour le moment.</div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        open={modalOpen}
        action={pendingAction}
        onConfirm={handleConfirm}
        onCancel={() => {
          setModalOpen(false);
          setPendingAction(null);
        }}
        busy={submitting}
      />
    </div>
  );
};

export default UserDetail;