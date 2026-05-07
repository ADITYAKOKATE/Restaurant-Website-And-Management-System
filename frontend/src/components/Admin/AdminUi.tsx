'use client';

import styles from './Admin.module.css';

export function AdminSectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={styles.sectionHeader}>
      <div>
        {eyebrow && <p className={styles.sectionEyebrow}>{eyebrow}</p>}
        <h2 className={styles.sectionTitle}>{title}</h2>
        {description && <p className={styles.sectionCopy}>{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function AdminMetricCard({ icon, label, value, hint, tone }: { icon: string; label: string; value: string; hint: string; tone?: 'success' | 'warning' | 'danger' | 'info' | 'default'; }) {
  const toneClass =
    tone === 'success'
      ? styles.successPill
      : tone === 'warning'
        ? styles.warningPill
        : tone === 'danger'
          ? styles.dangerPill
          : tone === 'info'
            ? styles.infoPill
            : styles.subtlePill;

  return (
    <article className={styles.statCard}>
      <div className={styles.statCardHead}>
        <div className={styles.statIcon}>{icon}</div>
        <span className={toneClass}>{label}</span>
      </div>
      <div>
        <div className={styles.statValue}>{value}</div>
        <p className={styles.statHint}>{hint}</p>
      </div>
    </article>
  );
}

export function AdminBadge({ children, tone = 'muted' }: { children: React.ReactNode; tone?: 'muted' | 'success' | 'warning' | 'danger' | 'info' | 'promo'; }) {
  const className =
    tone === 'success'
      ? styles.successPill
      : tone === 'warning'
        ? styles.warningPill
        : tone === 'danger'
          ? styles.dangerPill
          : tone === 'info'
            ? styles.infoPill
            : tone === 'promo'
              ? styles.promoPill
              : styles.subtlePill;

  return <span className={className}>{children}</span>;
}

export function AdminToggle({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void; }) {
  return (
    <button type="button" className={`${styles.toggleButton} ${checked ? styles.toggleButtonOn : ''}`} onClick={() => onChange(!checked)} aria-pressed={checked} aria-label={checked ? 'Disable' : 'Enable'}>
      <span className={styles.toggleKnob} />
    </button>
  );
}

export function AdminSearchInput({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string; }) {
  return <input className={styles.searchInput} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />;
}

export function AdminEmptyState({ icon, title, description, action }: { icon: string; title: string; description: string; action?: React.ReactNode; }) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>{icon}</div>
      <h3 className={styles.sectionTitle} style={{ fontSize: 22 }}>
        {title}
      </h3>
      <p className={styles.sectionCopy} style={{ maxWidth: 560, margin: '8px auto 0' }}>
        {description}
      </p>
      {action && <div style={{ marginTop: 18 }}>{action}</div>}
    </div>
  );
}

export function AdminModal({ title, description, open, onClose, children, wide = false }: { title: string; description?: string; open: boolean; onClose: () => void; children: React.ReactNode; wide?: boolean; }) {
  if (!open) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose} role="presentation">
      <div className={`${styles.modal} ${wide ? styles.modalWide : ''}`} onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <div className={styles.modalHeader}>
          <div>
            <p className={styles.modalCopy}>Restaurant Admin</p>
            <h3 className={styles.modalTitle}>{title}</h3>
            {description && <p className={styles.modalCopy}>{description}</p>}
          </div>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>
        <div style={{ marginTop: 18 }}>{children}</div>
      </div>
    </div>
  );
}

export function AdminConfirmDialog({ title, description, open, onCancel, onConfirm, confirmLabel = 'Confirm', destructive = false }: { title: string; description: string; open: boolean; onCancel: () => void; onConfirm: () => void; confirmLabel?: string; destructive?: boolean; }) {
  return (
    <AdminModal title={title} description={description} open={open} onClose={onCancel}>
      <div className={styles.modalActions} style={{ justifyContent: 'flex-end' }}>
        <button className={styles.ghostButton} onClick={onCancel}>
          Cancel
        </button>
        <button className={destructive ? styles.dangerButton : styles.primaryButton} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </AdminModal>
  );
}

export function AdminPillRow({ items }: { items: Array<{ label: string; tone?: 'muted' | 'success' | 'warning' | 'danger' | 'info' | 'promo' }> }) {
  return (
    <div className={styles.badgeStack}>
      {items.map((item) => (
        <AdminBadge key={item.label} tone={item.tone}>
          {item.label}
        </AdminBadge>
      ))}
    </div>
  );
}