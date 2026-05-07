"use client";

import { useEffect, useState } from "react";
import {
  fetchAdminOffers,
  createAdminOffer,
  updateAdminOffer,
  deleteAdminOffer,
} from "./adminApi";
import { AdminOfferRecord } from "./adminTypes";
import {
  AdminBadge,
  AdminConfirmDialog,
  AdminEmptyState,
  AdminModal,
  AdminSectionHeader,
  AdminToggle,
} from "./AdminUi";
import styles from "./Admin.module.css";

const emptyOffer: AdminOfferRecord = {
  _id: "",
  title: "",
  description: "",
  tag: "",
  image: "",
  isActive: true,
  discountCode: "",
  discountType: "percentage",
  discountValue: 0,
  minimumOrderValue: 0,
};

export default function AdminOffersManager() {
  const [offers, setOffers] = useState<AdminOfferRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<AdminOfferRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminOfferRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminOffers();
      setOffers(data || []);
    } catch (error) {
      console.error("Failed to load offers:", error);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const startCreate = () => {
    setEditingOffer({ ...emptyOffer, _id: `local-${Date.now()}` });
    setIsModalOpen(true);
  };

  const startEdit = (offer: AdminOfferRecord) => {
    setEditingOffer({ ...offer });
    setIsModalOpen(true);
  };

  const saveOffer = async () => {
    if (!editingOffer) return;

    try {
      setSaving(true);
      const isNew = editingOffer._id.startsWith("local-");

      if (isNew) {
        const { _id, ...offerData } = editingOffer;
        const created = await createAdminOffer(offerData);
        setOffers((current) => [
          created,
          ...current.filter((o) => o._id !== editingOffer._id),
        ]);
      } else {
        const updated = await updateAdminOffer(editingOffer._id, editingOffer);
        setOffers((current) =>
          current.map((entry) => (entry._id === editingOffer._id ? updated : entry))
        );
      }

      setIsModalOpen(false);
      setEditingOffer(null);
    } catch (error) {
      console.error("Failed to save offer:", error);
      alert("Failed to save offer. Please check if the promo code is unique.");
    } finally {
      setSaving(false);
    }
  };

  const removeOffer = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      await deleteAdminOffer(deleteTarget._id);
      setOffers((current) => current.filter((o) => o._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (error) {
      console.error("Failed to delete offer:", error);
      alert("Failed to delete offer. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <section className={styles.panelCard}>
        <AdminSectionHeader
          eyebrow="Offer Management"
          title="Promotions & Discount Codes"
          description="Create special offers, combos, and manage promo codes displayed to customers."
          action={
            <button className={styles.primaryButton} onClick={startCreate}>
              Add Offer
            </button>
          }
        />

        {loading ? (
          <div style={{ minHeight: 240, display: "grid", placeItems: "center" }}>
            <div className="spinner" />
          </div>
        ) : offers.length === 0 ? (
          <AdminEmptyState
            icon="🎉"
            title="No active offers"
            description="Create your first special offer to display on the landing page."
          />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Promotion</th>
                  <th>Tag</th>
                  <th>Discount Rule</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer) => (
                  <tr key={offer._id}>
                    <td>
                      <div>
                        <strong style={{ display: "block" }}>{offer.title}</strong>
                        <span className={styles.orderItemText}>
                          {offer.description}
                        </span>
                      </div>
                    </td>
                    <td>
                      {offer.tag ? <AdminBadge tone="promo">{offer.tag}</AdminBadge> : "-"}
                    </td>
                    <td>
                      {offer.discountCode ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <AdminBadge tone="info">Code: {offer.discountCode}</AdminBadge>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`}
                            {offer.minimumOrderValue > 0 ? ` (Min ₹${offer.minimumOrderValue})` : ''}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                          Display Only
                        </span>
                      )}
                    </td>
                    <td>
                      <AdminToggle
                        checked={offer.isActive}
                        onChange={(checked) =>
                          setOffers((current) =>
                            current.map((entry) =>
                              entry._id === offer._id ? { ...entry, isActive: checked } : entry
                            )
                          )
                        }
                      />
                    </td>
                    <td>
                      <div className={styles.tableRow}>
                        <button
                          className={styles.ghostButton}
                          onClick={() => startEdit(offer)}
                        >
                          Edit
                        </button>
                        <button
                          className={styles.dangerButton}
                          onClick={() => setDeleteTarget(offer)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <AdminModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingOffer?._id?.startsWith("local-") ? "Create Offer" : "Edit Offer"}
        description="Configure banner details and optional promo code logic."
        wide
      >
        {editingOffer && (
          <div className={styles.formGrid}>
            <label className={styles.fieldRow}>
              <span className={styles.sectionEyebrow}>Title *</span>
              <input
                className={styles.textInput}
                value={editingOffer.title}
                onChange={(e) => setEditingOffer({ ...editingOffer, title: e.target.value })}
                placeholder="e.g. Weekend Family Combo"
              />
            </label>
            <label className={styles.fieldRow}>
              <span className={styles.sectionEyebrow}>Tag</span>
              <input
                className={styles.textInput}
                value={editingOffer.tag || ""}
                onChange={(e) => setEditingOffer({ ...editingOffer, tag: e.target.value })}
                placeholder="e.g. Popular, Hot Deal"
              />
            </label>
            
            <label className={styles.fullSpan}>
              <span className={styles.sectionEyebrow}>Description *</span>
              <textarea
                className={styles.textareaInput}
                value={editingOffer.description}
                onChange={(e) => setEditingOffer({ ...editingOffer, description: e.target.value })}
                placeholder="e.g. Perfect for family dinners. Get 20% off when you order above ₹500!"
              />
            </label>

            <div className={styles.fullSpan} style={{ borderTop: '1px solid var(--border-subtle)', margin: 'var(--space-md) 0' }} />

            <h4 className={styles.fullSpan} style={{ margin: 0 }}>Discount Configuration (Optional)</h4>

            <label className={styles.fieldRow}>
              <span className={styles.sectionEyebrow}>Promo Code</span>
              <input
                className={styles.textInput}
                value={editingOffer.discountCode || ""}
                onChange={(e) => setEditingOffer({ ...editingOffer, discountCode: e.target.value.toUpperCase() })}
                placeholder="e.g. WEEKEND20"
              />
            </label>

            <label className={styles.fieldRow}>
              <span className={styles.sectionEyebrow}>Discount Type</span>
              <select
                className={styles.textInput}
                value={editingOffer.discountType}
                onChange={(e) => setEditingOffer({ ...editingOffer, discountType: e.target.value as 'percentage' | 'fixed' })}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </label>

            <label className={styles.fieldRow}>
              <span className={styles.sectionEyebrow}>Discount Value</span>
              <input
                type="number"
                className={styles.textInput}
                value={editingOffer.discountValue}
                onChange={(e) => setEditingOffer({ ...editingOffer, discountValue: Number(e.target.value) })}
              />
            </label>

            <label className={styles.fieldRow}>
              <span className={styles.sectionEyebrow}>Minimum Order Value (₹)</span>
              <input
                type="number"
                className={styles.textInput}
                value={editingOffer.minimumOrderValue}
                onChange={(e) => setEditingOffer({ ...editingOffer, minimumOrderValue: Number(e.target.value) })}
              />
            </label>

            <label className={styles.fieldRow} style={{ marginTop: 'var(--space-md)' }}>
              <span className={styles.sectionEyebrow}>Active</span>
              <AdminToggle
                checked={editingOffer.isActive}
                onChange={(checked) => setEditingOffer({ ...editingOffer, isActive: checked })}
              />
            </label>

            <div className={styles.modalActions} style={{ gridColumn: "1 / -1", justifyContent: "flex-end", marginTop: 'var(--space-lg)' }}>
              <button
                className={styles.ghostButton}
                onClick={() => setIsModalOpen(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className={styles.primaryButton}
                onClick={saveOffer}
                disabled={saving || !editingOffer.title || !editingOffer.description}
              >
                {saving ? "Saving..." : "Save Offer"}
              </button>
            </div>
          </div>
        )}
      </AdminModal>

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Offer?"
        description={deleteTarget ? `This will permanently remove "${deleteTarget.title}".` : ""}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={removeOffer}
        confirmLabel={deleting ? "Deleting..." : "Delete Offer"}
        destructive
      />
    </>
  );
}
