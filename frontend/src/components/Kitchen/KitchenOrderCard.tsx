import { AdminOrderRecord } from '../Admin/adminTypes';
import { formatShortDateTime } from '../Admin/adminUtils';

interface KitchenOrderCardProps {
  order: AdminOrderRecord;
  actionLabel: string;
  onAction: (order: AdminOrderRecord) => void;
  processing: boolean;
}

export default function KitchenOrderCard({ order, actionLabel, onAction, processing }: KitchenOrderCardProps) {
  return (
    <article className="kitchen-card">
      <div className="kitchen-card-header">
        <div className="kitchen-token">#{order.tokenNumber}</div>
        <div className="kitchen-meta">
          <span className="kitchen-time">{formatShortDateTime(order.createdAt)}</span>
          <span className="kitchen-qty">{order.items.length} items</span>
        </div>
      </div>
      
      <div className="kitchen-items">
        {order.items.map((item, idx) => (
          <div key={idx} className="kitchen-item-row">
            <span className="kitchen-item-qty">{item.quantity}×</span>
            <strong className="kitchen-item-name">{item.name}</strong>
          </div>
        ))}
      </div>

      {order.specialInstructions && (
        <div className="kitchen-notes">
          <strong>Notes:</strong> {order.specialInstructions}
        </div>
      )}

      <div className="kitchen-card-footer">
        <button 
          className="kitchen-btn" 
          disabled={processing}
          onClick={() => onAction(order)}
        >
          {processing ? 'Processing...' : actionLabel}
        </button>
      </div>
    </article>
  );
}
