'use client';

import { useEffect, useState } from 'react';
import { fetchAdminSettings, saveAdminSettings } from './adminApi';
import { defaultSettings } from './adminMock';
import { AdminBadge, AdminSectionHeader, AdminToggle } from './AdminUi';
import { AdminSettingsState } from './adminTypes';
import styles from './Admin.module.css';

export default function AdminSettingsPanel() {
  const [settings, setSettings] = useState<AdminSettingsState>(defaultSettings);
  const [savedAt, setSavedAt] = useState<string>('');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetchAdminSettings();
        setSettings(response);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load settings');
        setSettings(defaultSettings);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const saveSettings = async () => {
    try {
      setSaving(true);
      setError('');
      setSaveSuccessMessage('');
      const response = await saveAdminSettings(settings);
      setSettings(response);
      setSavedAt(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
      setSaveSuccessMessage('Admin settings saved');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={styles.panelCard}>
      <AdminSectionHeader
        eyebrow="System Settings"
        title="Store operations and policy controls"
        description="Keep business rules, tax, and fulfillment defaults in one admin screen."
        action={loading ? <AdminBadge tone="info">Loading</AdminBadge> : error ? <AdminBadge tone="danger">Needs attention</AdminBadge> : savedAt ? <AdminBadge tone="success">Saved {savedAt}</AdminBadge> : <AdminBadge tone="info">Live settings</AdminBadge>}
      />

      {error && <div className={styles.boardDropHint}>{error}</div>}
      {!error && saveSuccessMessage && <div className={styles.boardDropHint}>{saveSuccessMessage}</div>}

      <div className={styles.settingsGrid} aria-busy={loading || saving}>
        <article className={`${styles.settingsCard} ${styles.settingsCardHighlight}`}>
          <div className={styles.switchRow}>
            <div className={styles.switchCopy}>
              <p className={styles.settingsEyebrow}>Store Status</p>
              <h3 className={styles.settingsTitle}>{settings.isOpen ? 'Restaurant open' : 'Restaurant closed'}</h3>
              <p className={styles.settingsCopy}>Toggle ordering availability when the store is closed or under maintenance.</p>
            </div>
            <AdminToggle checked={settings.isOpen} onChange={(checked) => setSettings((current) => ({ ...current, isOpen: checked }))} />
          </div>
        </article>

        <article className={styles.settingsCard}>
          <p className={styles.settingsEyebrow}>Preparation Time</p>
          <h3 className={styles.settingsTitle}>{settings.estimatedPrepTime} mins</h3>
          <input className={styles.textInput} type="number" min="5" max="120" value={settings.estimatedPrepTime} onChange={(event) => setSettings((current) => ({ ...current, estimatedPrepTime: Number(event.target.value) }))} />
        </article>

        <article className={styles.settingsCard}>
          <p className={styles.settingsEyebrow}>Delivery Charge</p>
          <h3 className={styles.settingsTitle}>₹{settings.deliveryCharge}</h3>
          <input className={styles.textInput} type="range" min="0" max="150" value={settings.deliveryCharge} onChange={(event) => setSettings((current) => ({ ...current, deliveryCharge: Number(event.target.value) }))} />
        </article>

        <article className={styles.settingsCard}>
          <p className={styles.settingsEyebrow}>Minimum Order</p>
          <h3 className={styles.settingsTitle}>₹{settings.minimumOrderAmount}</h3>
          <input className={styles.textInput} type="number" min="0" value={settings.minimumOrderAmount} onChange={(event) => setSettings((current) => ({ ...current, minimumOrderAmount: Number(event.target.value) }))} />
        </article>

        <article className={styles.settingsCard}>
          <p className={styles.settingsEyebrow}>Tax Rate</p>
          <h3 className={styles.settingsTitle}>{settings.taxRate}% GST</h3>
          <input className={styles.textInput} type="number" min="0" max="30" value={settings.taxRate} onChange={(event) => setSettings((current) => ({ ...current, taxRate: Number(event.target.value) }))} />
        </article>

        <article className={styles.settingsCard}>
          <p className={styles.settingsEyebrow}>Online Payments</p>
          <h3 className={styles.settingsTitle}>{settings.allowOnlinePayments ? 'Enabled' : 'Disabled'}</h3>
          <AdminToggle checked={settings.allowOnlinePayments} onChange={(checked) => setSettings((current) => ({ ...current, allowOnlinePayments: checked }))} />
        </article>
      </div>

      <div className={styles.formActions} style={{ justifyContent: 'flex-end' }}>
        <button type="button" className={styles.primaryButton} onClick={saveSettings} disabled={loading || saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </section>
  );
}