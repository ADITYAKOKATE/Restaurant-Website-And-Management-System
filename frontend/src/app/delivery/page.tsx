'use client';

import DeliveryGuard from '@/components/Delivery/DeliveryGuard';
import DeliveryShell from '@/components/Delivery/DeliveryShell';
import DeliveryBoard from '@/components/Delivery/DeliveryBoard';

export default function DeliveryPage() {
  return (
    <DeliveryGuard>
      <DeliveryShell>
        <DeliveryBoard />
      </DeliveryShell>
    </DeliveryGuard>
  );
}
