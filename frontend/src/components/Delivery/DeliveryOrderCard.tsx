import { AdminOrderRecord } from '../Admin/adminTypes';
import { formatCurrency, formatShortDateTime } from '../Admin/adminUtils';

interface DeliveryOrderCardProps {
  order: AdminOrderRecord;
  actionLabel: string;
  onAction: (order: AdminOrderRecord) => void;
  processing: boolean;
}

export default function DeliveryOrderCard({ order, actionLabel, onAction, processing }: DeliveryOrderCardProps) {
  const isOnline = order.paymentMethod === 'online';

  return (
    <article className="delivery-card">
      <div className="delivery-card-header">
        <div className="delivery-token">#{order.tokenNumber}</div>
        <div className="delivery-meta">
          <span className="delivery-time">{formatShortDateTime(order.createdAt)}</span>
          <span className={`delivery-badge ${isOnline ? 'badge-success' : 'badge-warning'}`}>
            {isOnline ? 'Paid' : 'COD'}
          </span>
        </div>
      </div>

      <div className="delivery-customer-info">
        <p className="delivery-customer-name"><strong>{order.user?.name || 'Guest'}</strong></p>
        <p className="delivery-phone">📞 <a href={`tel:${order.user?.phone || order.phone}`}>{order.user?.phone || order.phone || 'No phone'}</a></p>
        <div className="delivery-address">
          📍 {order.deliveryAddress}
        </div>
      </div>

      <div className="delivery-order-summary">
        <p><strong>{order.items.length} items</strong> — Total: <strong>{formatCurrency(order.totalAmount)}</strong></p>
      </div>

      <div className="delivery-card-footer">
        <button 
          className="delivery-btn delivery-btn-primary" 
          disabled={processing}
          onClick={() => onAction(order)}
        >
          {processing ? 'Processing...' : actionLabel}
        </button>
      </div>
    </article>
  );
}
