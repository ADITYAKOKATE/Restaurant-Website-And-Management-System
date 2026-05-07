"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchAdminMenu,
  createAdminMenuItem,
  updateAdminMenuItem,
  deleteAdminMenuItem,
} from "./adminApi";
import { AdminMenuItemRecord } from "./adminTypes";
import {
  AdminBadge,
  AdminConfirmDialog,
  AdminEmptyState,
  AdminModal,
  AdminSearchInput,
  AdminSectionHeader,
  AdminToggle,
} from "./AdminUi";
import styles from "./Admin.module.css";

const emptyItem: AdminMenuItemRecord = {
  _id: "",
  name: "",
  description: "",
  price: 0,
  category: "",
  subCategory: "",
  image: "",
  isAvailable: true,
  isVeg: true,
  isBestseller: false,
  promotionLabel: "",
  comboGroup: "",
};

export default function AdminMenuManager() {
  const [items, setItems] = useState<AdminMenuItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminMenuItemRecord | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<AdminMenuItemRecord | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadMenu = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminMenu();
      setItems(data || []);
    } catch (error) {
      console.error("Failed to load menu:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(new Set(items.map((item) => item.category))).sort(),
    ],
    [items],
  );

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = [
        item.name,
        item.description,
        item.category,
        item.subCategory,
        item.promotionLabel,
        item.comboGroup,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = category === "All" || item.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [category, items, search]);

  const startCreate = () => {
    setEditingItem({ ...emptyItem, _id: `local-${Date.now()}` });
    setIsModalOpen(true);
  };

  const startEdit = (item: AdminMenuItemRecord) => {
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const saveItem = async () => {
    if (!editingItem) return;

    try {
      setSaving(true);
      const isNew = editingItem._id.startsWith("local-");

      if (isNew) {
        const created = await createAdminMenuItem(editingItem);
        setItems((current) => [
          created,
          ...current.filter((item) => item._id !== editingItem._id),
        ]);
      } else {
        const updated = await updateAdminMenuItem(editingItem._id, editingItem);
        setItems((current) =>
          current.map((entry) =>
            entry._id === editingItem._id ? updated : entry,
          ),
        );
      }

      setIsModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Failed to save item:", error);
      alert("Failed to save item. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const removeItem = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      await deleteAdminMenuItem(deleteTarget._id);
      setItems((current) =>
        current.filter((item) => item._id !== deleteTarget._id),
      );
      setDeleteTarget(null);
    } catch (error) {
      console.error("Failed to delete item:", error);
      alert("Failed to delete item. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const preview =
    editingItem?.image ||
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900";

  return (
    <>
      <section className={styles.panelCard}>
        <AdminSectionHeader
          eyebrow="Menu Management"
          title="Menu inventory and offer control"
          description="Search, edit availability, maintain promotional combos, and keep menu pricing consistent."
          action={
            <button className={styles.primaryButton} onClick={startCreate}>
              Add Item
            </button>
          }
        />

        <div className={styles.tableToolbar}>
          <AdminSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search menu items, categories, combos..."
          />
          <div className={styles.filterRow}>
            {categories.map((entry) => (
              <button
                key={entry}
                className={
                  category === entry ? styles.primaryButton : styles.ghostButton
                }
                onClick={() => setCategory(entry)}
              >
                {entry}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div
            style={{ minHeight: 240, display: "grid", placeItems: "center" }}
          >
            <div className="spinner" />
          </div>
        ) : filteredItems.length === 0 ? (
          <AdminEmptyState
            icon="🍲"
            title="No menu items found"
            description="Try widening the search or category filter. New items can be added from the button above."
          />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Flags</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className={styles.orderCustomerRow}>
                        <img
                          src={item.image || preview}
                          alt={item.name}
                          className={styles.miniThumb}
                        />
                        <div>
                          <strong style={{ display: "block" }}>
                            {item.name}
                          </strong>
                          <span className={styles.orderItemText}>
                            {item.description || "No description added yet."}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.badgeStack}>
                        <AdminBadge tone="info">{item.category}</AdminBadge>
                        {item.subCategory && (
                          <AdminBadge tone="muted">
                            {item.subCategory}
                          </AdminBadge>
                        )}
                      </div>
                    </td>
                    <td>
                      <strong>₹{item.price}</strong>
                    </td>
                    <td>
                      <AdminToggle
                        checked={item.isAvailable}
                        onChange={(checked) =>
                          setItems((current) =>
                            current.map((entry) =>
                              entry._id === item._id
                                ? { ...entry, isAvailable: checked }
                                : entry,
                            ),
                          )
                        }
                      />
                    </td>
                    <td>
                      <div className={styles.badgeStack}>
                        {item.isVeg ? (
                          <AdminBadge tone="success">Veg</AdminBadge>
                        ) : (
                          <AdminBadge tone="danger">Non-Veg</AdminBadge>
                        )}
                        {item.isBestseller && (
                          <AdminBadge tone="promo">Bestseller</AdminBadge>
                        )}
                        {item.promotionLabel && (
                          <AdminBadge tone="warning">
                            {item.promotionLabel}
                          </AdminBadge>
                        )}
                        {item.comboGroup && (
                          <AdminBadge tone="info">
                            Combo: {item.comboGroup}
                          </AdminBadge>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className={styles.tableRow}>
                        <button
                          className={styles.ghostButton}
                          onClick={() => startEdit(item)}
                        >
                          Edit
                        </button>
                        <button
                          className={styles.dangerButton}
                          onClick={() => setDeleteTarget(item)}
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
        title={editingItem?._id ? "Menu Item Editor" : "Add Menu Item"}
        description="Create or update a menu item and preview the image before saving."
        wide
      >
        {editingItem && (
          <div className={styles.formGrid}>
            <div className={styles.fullSpan}>
              <div className={styles.previewBox}>
                <img
                  src={preview}
                  alt={editingItem.name || "Preview"}
                  className={styles.previewImage}
                />
              </div>
            </div>
            <label className={styles.fieldRow}>
              <span className={styles.sectionEyebrow}>Name</span>
              <input
                className={styles.textInput}
                value={editingItem.name}
                onChange={(event) =>
                  setEditingItem({ ...editingItem, name: event.target.value })
                }
              />
            </label>
            <label className={styles.fieldRow}>
              <span className={styles.sectionEyebrow}>Price</span>
              <input
                className={styles.textInput}
                type="number"
                value={editingItem.price}
                onChange={(event) =>
                  setEditingItem({
                    ...editingItem,
                    price: Number(event.target.value),
                  })
                }
              />
            </label>
            <label className={styles.fieldRow}>
              <span className={styles.sectionEyebrow}>Category</span>
              <input
                className={styles.textInput}
                value={editingItem.category}
                onChange={(event) =>
                  setEditingItem({
                    ...editingItem,
                    category: event.target.value,
                  })
                }
              />
            </label>
            <label className={styles.fieldRow}>
              <span className={styles.sectionEyebrow}>Sub-category</span>
              <input
                className={styles.textInput}
                value={editingItem.subCategory || ""}
                onChange={(event) =>
                  setEditingItem({
                    ...editingItem,
                    subCategory: event.target.value,
                  })
                }
              />
            </label>
            <label className={styles.fullSpan}>
              <span className={styles.sectionEyebrow}>Description</span>
              <textarea
                className={styles.textareaInput}
                value={editingItem.description}
                onChange={(event) =>
                  setEditingItem({
                    ...editingItem,
                    description: event.target.value,
                  })
                }
              />
            </label>
            <label className={styles.fullSpan}>
              <span className={styles.sectionEyebrow}>Image URL</span>
              <input
                className={styles.textInput}
                value={editingItem.image}
                onChange={(event) =>
                  setEditingItem({ ...editingItem, image: event.target.value })
                }
              />
            </label>
            <label className={styles.fieldRow}>
              <span className={styles.sectionEyebrow}>Promotion Label</span>
              <input
                className={styles.textInput}
                value={editingItem.promotionLabel || ""}
                onChange={(event) =>
                  setEditingItem({
                    ...editingItem,
                    promotionLabel: event.target.value,
                  })
                }
                placeholder="Lunch combo, festive deal..."
              />
            </label>
            <label className={styles.fieldRow}>
              <span className={styles.sectionEyebrow}>Combo Group</span>
              <input
                className={styles.textInput}
                value={editingItem.comboGroup || ""}
                onChange={(event) =>
                  setEditingItem({
                    ...editingItem,
                    comboGroup: event.target.value,
                  })
                }
                placeholder="Vada Pav Pair, Thali Combo..."
              />
            </label>
            <label className={styles.fieldRow}>
              <span className={styles.sectionEyebrow}>Vegetarian</span>
              <AdminToggle
                checked={editingItem.isVeg}
                onChange={(checked) =>
                  setEditingItem({ ...editingItem, isVeg: checked })
                }
              />
            </label>
            <label className={styles.fieldRow}>
              <span className={styles.sectionEyebrow}>Available</span>
              <AdminToggle
                checked={editingItem.isAvailable}
                onChange={(checked) =>
                  setEditingItem({ ...editingItem, isAvailable: checked })
                }
              />
            </label>
            <label className={styles.fieldRow}>
              <span className={styles.sectionEyebrow}>Bestseller</span>
              <AdminToggle
                checked={editingItem.isBestseller}
                onChange={(checked) =>
                  setEditingItem({ ...editingItem, isBestseller: checked })
                }
              />
            </label>
            <div
              className={styles.modalActions}
              style={{ gridColumn: "1 / -1", justifyContent: "flex-end" }}
            >
              <button
                className={styles.ghostButton}
                onClick={() => setIsModalOpen(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className={styles.primaryButton}
                onClick={saveItem}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Item"}
              </button>
            </div>
          </div>
        )}
      </AdminModal>

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete menu item?"
        description={
          deleteTarget
            ? `This will permanently remove ${deleteTarget.name} from the menu.`
            : ""
        }
        onCancel={() => setDeleteTarget(null)}
        onConfirm={removeItem}
        confirmLabel={deleting ? "Deleting..." : "Delete Item"}
        destructive
      />
    </>
  );
}
