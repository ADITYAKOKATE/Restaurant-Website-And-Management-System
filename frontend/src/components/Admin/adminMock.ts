import { AdminSettingsState, AdminUserRecord } from './adminTypes';

export const seedUsers: AdminUserRecord[] = [
  {
    _id: 'u1',
    name: 'Aarav Patil',
    email: 'aarav@example.com',
    role: 'user',
    isBlocked: false,
    phone: '+91 98765 43210',
    createdAt: '2026-05-01T10:15:00.000Z',
    lastLoginAt: '2026-05-05T08:35:00.000Z',
  },
  {
    _id: 'u2',
    name: 'Meera Deshmukh',
    email: 'meera@example.com',
    role: 'user',
    isBlocked: false,
    phone: '+91 90000 11111',
    createdAt: '2026-04-29T16:20:00.000Z',
    lastLoginAt: '2026-05-04T17:10:00.000Z',
  },
  {
    _id: 'u3',
    name: 'Admin Chef',
    email: 'admin@premachawada.in',
    role: 'admin',
    isBlocked: false,
    phone: '+91 88888 00000',
    createdAt: '2026-04-20T07:00:00.000Z',
    lastLoginAt: '2026-05-05T06:45:00.000Z',
  },
];

export const defaultSettings: AdminSettingsState = {
  isOpen: true,
  deliveryCharge: 40,
  taxRate: 5,
  minimumOrderAmount: 150,
  allowOnlinePayments: true,
  estimatedPrepTime: 30,
};