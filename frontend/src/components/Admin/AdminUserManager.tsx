'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminBadge, AdminConfirmDialog, AdminEmptyState, AdminSearchInput, AdminSectionHeader } from './AdminUi';
import { fetchAdminUsers, updateAdminUserBlockStatus, updateAdminUserRole, deleteAdminUser } from './adminApi';
import { AdminUserRecord } from './adminTypes';
import { formatLongDate } from './adminUtils';
import styles from './Admin.module.css';

type UserAction =
  | {
      title: string;
      description: string;
      confirmLabel: string;
      apply: () => Promise<void>;
      destructive?: boolean;
    }
  | null;

export default function AdminUserManager() {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | AdminUserRecord['role']>('All');
  const [pendingAction, setPendingAction] = useState<UserAction>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetchAdminUsers();
        setUsers(response);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = [user.name, user.email, user.phone, user.role].join(' ').toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'All' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [roleFilter, search, users]);

  const roleOptions: Array<'All' | AdminUserRecord['role']> = ['All', 'admin', 'user', 'kitchen', 'delivery'];

  const scheduleAction = (action: UserAction) => setPendingAction(action);

  const replaceUser = (updatedUser: AdminUserRecord) => {
    setUsers((current) => current.map((entry) => (entry._id === updatedUser._id ? updatedUser : entry)));
  };

  const removeUser = (userId: string) => {
    setUsers((current) => current.filter((entry) => entry._id !== userId));
  };

  const actionHandlers = {
    changeRole: async (user: AdminUserRecord, newRole: AdminUserRecord['role']) => {
      setSavingId(user._id);
      try {
        const updated = await updateAdminUserRole(user._id, newRole);
        replaceUser(updated);
      } finally {
        setSavingId('');
      }
    },
    toggleBlock: async (user: AdminUserRecord) => {
      setSavingId(user._id);
      try {
        const updated = await updateAdminUserBlockStatus(user._id, !user.isBlocked);
        replaceUser(updated);
      } finally {
        setSavingId('');
      }
    },
    deleteUser: async (user: AdminUserRecord) => {
      setSavingId(user._id);
      try {
        await deleteAdminUser(user._id);
        removeUser(user._id);
      } finally {
        setSavingId('');
      }
    },
  };

  return (
    <>
      <section className={styles.panelCard}>
        <AdminSectionHeader
          eyebrow="User Management"
          title="User access and control"
          description="Search members, promote or demote access, block suspicious accounts, and remove inactive records."
        />

        <div className={styles.tableToolbar}>
          <AdminSearchInput value={search} onChange={setSearch} placeholder="Search users by name, email, phone, or role..." />
          <div className={styles.filterRow}>
            {roleOptions.map((option) => (
              <button key={option} type="button" className={roleFilter === option ? styles.primaryButton : styles.ghostButton} onClick={() => setRoleFilter(option)}>
                {option}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className={styles.emptyState}>
            <p className={styles.sectionCopy}>Loading users…</p>
          </div>
        ) : error ? (
          <AdminEmptyState icon="⚠" title="Unable to load users" description={error} />
        ) : filteredUsers.length === 0 ? (
          <AdminEmptyState icon="👤" title="No users matched" description="Adjust the search or role filter to reveal more accounts." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Registration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className={styles.orderCustomerRow}>
                        <div className={styles.avatarCell}>{user.name.charAt(0).toUpperCase()}</div>
                        <div>
                          <strong style={{ display: 'block' }}>{user.name}</strong>
                          <span className={styles.orderItemText}>{user.lastLoginAt ? `Last login ${formatLongDate(user.lastLoginAt)}` : 'No login history yet'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <span>{user.email}</span>
                        <span className={styles.orderItemText}>{user.phone || 'No phone number'}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.badgeStack}>
                        <AdminBadge tone={user.role === 'admin' ? 'promo' : user.role === 'kitchen' ? 'warning' : user.role === 'delivery' ? 'info' : 'muted'}>{user.role}</AdminBadge>
                      </div>
                    </td>
                    <td>{formatLongDate(user.createdAt)}</td>
                    <td>
                      {user.isBlocked ? <AdminBadge tone="danger">Blocked</AdminBadge> : <AdminBadge tone="success">Active</AdminBadge>}
                    </td>
                    <td>
                      <div className={styles.tableRow}>
                        {user.role !== 'admin' && (
                          <select
                            className={styles.ghostButton}
                            style={{ appearance: 'auto', paddingRight: 'var(--space-md)' }}
                            value={user.role}
                            disabled={savingId === user._id}
                            onChange={(e) => {
                              const newRole = e.target.value as AdminUserRecord['role'];
                              scheduleAction({
                                title: `Change role to ${newRole}?`,
                                description: `${user.name} will be moved to the ${newRole} role.`,
                                confirmLabel: 'Change Role',
                                apply: async () => actionHandlers.changeRole(user, newRole),
                              });
                            }}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="kitchen">Kitchen</option>
                            <option value="delivery">Delivery</option>
                          </select>
                        )}
                        <button
                          type="button"
                          className={user.isBlocked ? styles.primaryButton : styles.dangerButton}
                          disabled={savingId === user._id}
                          onClick={() =>
                            scheduleAction({
                              title: user.isBlocked ? 'Unblock user?' : 'Block user?',
                              description: user.isBlocked ? `${user.name} will regain access to the system.` : `${user.name} will lose access until unblocked.`,
                              confirmLabel: user.isBlocked ? 'Unblock' : 'Block',
                              apply: async () => actionHandlers.toggleBlock(user),
                              destructive: !user.isBlocked,
                            })
                          }
                        >
                          {user.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                        {user.role !== 'admin' && (
                          <button
                            type="button"
                            className={styles.dangerButton}
                            disabled={savingId === user._id}
                            onClick={() =>
                              scheduleAction({
                                title: 'Delete user record?',
                                description: `${user.name} will be removed from the admin system.`,
                                confirmLabel: 'Delete',
                                apply: async () => actionHandlers.deleteUser(user),
                                destructive: true,
                              })
                            }
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <AdminConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction?.title || ''}
        description={pendingAction?.description || ''}
        onCancel={() => setPendingAction(null)}
        onConfirm={async () => {
          await pendingAction?.apply();
          setPendingAction(null);
        }}
        confirmLabel={pendingAction?.confirmLabel || 'Confirm'}
        destructive={Boolean(pendingAction?.destructive)}
      />
    </>
  );
}