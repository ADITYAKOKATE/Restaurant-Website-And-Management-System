'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subCategory?: string;
  image: string;
  isVeg: boolean;
  isBestseller: boolean;
}

export default function MenuPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();
  
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [dietaryPreference, setDietaryPreference] = useState<'All' | 'Veg' | 'Non-Veg'>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`/api/menu`);
        if (res.ok) {
          const data = await res.json();
          setItems(data);
          
          // Extract unique categories
          const cats = Array.from(new Set(data.map((item: MenuItem) => item.category))) as string[];
          setCategories(['All', ...cats]);
        }
      } catch (err) {
        console.error('Failed to fetch menu:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMenu();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddToCart = async (item: MenuItem) => {
    if (!user) {
      showToast('Please log in to add items to your cart.', 'error');
      setTimeout(() => router.push('/login'), 2000);
      return;
    }
    
    await addToCart(item._id, 1);
    showToast(`Added ${item.name} to cart!`, 'success');
  };

  const filteredItems = items.filter(item => {
    const categoryMatch = activeCategory === 'All' || item.category === activeCategory;
    const dietaryMatch = dietaryPreference === 'All' || 
                         (dietaryPreference === 'Veg' && item.isVeg) || 
                         (dietaryPreference === 'Non-Veg' && !item.isVeg);
    return categoryMatch && dietaryMatch;
  });

  return (
    <main className="page-content section">
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            {toast.type === 'success' ? '✅' : '⚠️'} {toast.message}
          </div>
        </div>
      )}

      <div className="container">
        <div className="section-header" style={{ position: 'relative' }}>
          <span className="section-tag">Our Menu</span>
          <h2>Explore Authentic Flavors</h2>
          <p>From traditional Thalis to sizzling Starters, experience the true taste of Maharashtra.</p>
          <a
            href="/premacha-wada-menu-2025.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ marginTop: 'var(--space-md)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download Menu Card (PDF)
          </a>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-4xl)' }}>
            <div className="spinner"></div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 'var(--space-xl)', flexDirection: 'column' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
              {/* Category Filter Pills */}
              <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', justifyContent: 'center' }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`btn ${activeCategory === cat ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ padding: '8px 16px', textTransform: 'capitalize' }}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Dietary Filter Toggles */}
              <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-full)', padding: '4px' }}>
                {['All', 'Veg', 'Non-Veg'].map((pref) => (
                  <button
                    key={pref}
                    onClick={() => setDietaryPreference(pref as any)}
                    style={{
                      padding: '6px 16px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: dietaryPreference === pref ? '#fff' : 'var(--text-secondary)',
                      background: dietaryPreference === pref 
                        ? (pref === 'Veg' ? '#2ecc71' : pref === 'Non-Veg' ? '#FF4757' : 'var(--border-subtle)') 
                        : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Grid */}
            <div className="grid-3">
              {filteredItems.map((item) => (
                <div key={item._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', padding: '0', overflow: 'hidden' }}>
                  
                  <div style={{ position: 'relative', height: '220px', width: '100%' }}>
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      loading="lazy"
                    />
                    <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' }}>
                      {item.isVeg ? (
                        <span className="badge badge-veg">VEG</span>
                      ) : (
                        <span className="badge" style={{ background: 'rgba(255, 71, 87, 0.15)', color: '#FF4757', border: '1px solid rgba(255, 71, 87, 0.3)' }}>NON-VEG</span>
                      )}
                      {item.isBestseller && <span className="badge badge-bestseller">BESTSELLER</span>}
                    </div>
                  </div>

                  <div style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-sm)' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{item.name}</h3>
                      <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--secondary)' }}>₹{item.price}</span>
                    </div>
                    
                    {item.description && (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: 'var(--space-xs)', marginBottom: 'var(--space-md)' }}>
                        {item.description}
                      </p>
                    )}
                    
                    <div style={{ marginTop: 'auto', paddingTop: 'var(--space-md)' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ width: '100%' }}
                        onClick={() => handleAddToCart(item)}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>
    </main>
  );
}
