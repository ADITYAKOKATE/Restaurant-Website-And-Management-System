'use client';

import KitchenGuard from '@/components/Kitchen/KitchenGuard';
import KitchenShell from '@/components/Kitchen/KitchenShell';
import KitchenBoard from '@/components/Kitchen/KitchenBoard';

export default function KitchenPage() {
  return (
    <KitchenGuard>
      <KitchenShell>
        <KitchenBoard />
      </KitchenShell>
    </KitchenGuard>
  );
}
