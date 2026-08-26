'use client';

import React, { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

function MenuContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [dietaryPreference, setDietaryPreference] = useState<'All' | 'Veg' | 'Non-Veg'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [previewDish, setPreviewDish] = useState<MenuItem | null>(null);
  const [highlightedDishId, setHighlightedDishId] = useState<string | null>(null);

  const initialParamHandled = useRef(false);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`/api/menu`);
        if (res.ok) {
          const data: MenuItem[] = await res.json();
          setItems(data);
          
          // Extract unique categories
          const cats = Array.from(new Set(data.map((item: MenuItem) => item.category))) as string[];
          setCategories(['All', ...cats]);

          // Handle URL Query Params
          const dishParam = searchParams.get('dish');
          const searchParam = searchParams.get('search');
          const categoryParam = searchParams.get('category');

          if (dishParam || searchParam) {
            const queryVal = dishParam || searchParam || '';
            setSearchQuery(queryVal);
            setActiveCategory('All');

            const matched = data.find(
              (i) => i.name.toLowerCase() === queryVal.toLowerCase() ||
                     i.name.toLowerCase().includes(queryVal.toLowerCase())
            );
            if (matched) {
              setHighlightedDishId(matched._id);
            }
          } else if (categoryParam) {
            const catLower = categoryParam.toLowerCase();
            const matchedCat = cats.find(c => c.toLowerCase().includes(catLower) || catLower.includes(c.toLowerCase()));
            if (matchedCat) {
              setActiveCategory(matchedCat);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch menu:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMenu();
  }, [searchParams]);

  // Smooth scroll to highlighted dish when items load
  useEffect(() => {
    if (highlightedDishId && !isLoading) {
      setTimeout(() => {
        const el = document.getElementById(`dish-card-${highlightedDishId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [highlightedDishId, isLoading]);

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setHighlightedDishId(null);
    if (val.trim()) setActiveCategory('All');
  };

  const clearSearch = () => {
    setSearchQuery('');
    setHighlightedDishId(null);
  };

  const filteredItems = items.filter(item => {
    const q = searchQuery.trim().toLowerCase();
    const searchMatch = !q ||
      item.name.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q));
    const categoryMatch = activeCategory === 'All' || item.category === activeCategory;
    const dietaryMatch = dietaryPreference === 'All' || 
                         (dietaryPreference === 'Veg' && item.isVeg) || 
                         (dietaryPreference === 'Non-Veg' && !item.isVeg);
    return searchMatch && categoryMatch && dietaryMatch;
  });

  const isSearchActive = searchQuery.trim().length > 0;

  return (
    <main className="page-content section">
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            {toast.type === 'success' ? '✅' : '⚠️'} {toast.message}
          </div>
        </div>
      )}

      {/* Dish Detail / Image Zoom Modal */}
      {previewDish && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-md)'
          }}
          onClick={() => setPreviewDish(null)}
        >
          <div 
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-accent)',
              borderRadius: 'var(--radius-xl)',
              maxWidth: '540px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-xl)',
              animation: 'fadeInScale 0.25s ease'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ position: 'relative', height: '300px', width: '100%' }}>
              <img 
                src={previewDish.image} 
                alt={previewDish.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <button 
                onClick={() => setPreviewDish(null)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  fontSize: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: 'var(--space-xl)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xs)' }}>
                <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>{previewDish.name}</h2>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--secondary)' }}>₹{previewDish.price}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--space-md)' }}>
                {previewDish.isVeg ? (
                  <span className="badge badge-veg">VEG</span>
                ) : (
                  <span className="badge" style={{ background: 'rgba(255, 71, 87, 0.15)', color: '#FF4757', border: '1px solid rgba(255, 71, 87, 0.3)' }}>NON-VEG</span>
                )}
                {previewDish.isBestseller && <span className="badge badge-bestseller">BESTSELLER</span>}
                <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-secondary)' }}>{previewDish.category}</span>
              </div>
              {previewDish.description && (
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 'var(--space-lg)' }}>
                  {previewDish.description}
                </p>
              )}
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: 600 }}
                onClick={() => {
                  handleAddToCart(previewDish);
                  setPreviewDish(null);
                }}
              >
                Add to Cart • ₹{previewDish.price}
              </button>
            </div>
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

              {/* ── Search Bar ── */}
              <div className="menu-search-wrapper">
                <span className="menu-search-icon">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </span>
                <input
                  id="menu-search"
                  type="text"
                  className="menu-search-input"
                  placeholder="Search dishes, ingredients…"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  autoComplete="off"
                  aria-label="Search menu items"
                />
                {isSearchActive && (
                  <button
                    className="menu-search-clear"
                    onClick={clearSearch}
                    aria-label="Clear search"
                    title="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Search results hint */}
              {isSearchActive && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <p className="menu-search-results-hint" style={{ margin: 0 }}>
                    {filteredItems.length === 0
                      ? `No results for "${searchQuery.trim()}"`
                      : `Showing results for "${searchQuery.trim()}" (${filteredItems.length} dish${filteredItems.length !== 1 ? 'es' : ''})`}
                  </p>
                  <button 
                    onClick={clearSearch} 
                    style={{ 
                      background: 'transparent', 
                      border: '1px solid var(--border-default)', 
                      color: 'var(--primary)', 
                      borderRadius: 'var(--radius-full)', 
                      padding: '2px 10px', 
                      fontSize: '12px', 
                      cursor: 'pointer' 
                    }}
                  >
                    Show All Dishes
                  </button>
                </div>
              )}

              {/* Category Filter Pills */}
              <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', justifyContent: 'center' }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`btn ${activeCategory === cat ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ padding: '8px 16px', textTransform: 'capitalize' }}
                    onClick={() => { setActiveCategory(cat); setSearchQuery(''); setHighlightedDishId(null); }}
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
              {filteredItems.length === 0 ? (
                <div className="menu-no-results">
                  <span className="menu-no-results-emoji">🔍</span>
                  <p className="menu-no-results-title">No dishes found</p>
                  <p className="menu-no-results-sub">
                    {isSearchActive
                      ? `Try a different keyword or browse by category below.`
                      : `No items available in this category.`}
                  </p>
                  {isSearchActive && (
                    <button className="btn btn-ghost" onClick={clearSearch}>
                      Clear Search & View All
                    </button>
                  )}
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isHighlighted = highlightedDishId === item._id;
                  return (
                    <div 
                      key={item._id} 
                      id={`dish-card-${item._id}`}
                      className="card" 
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 'var(--space-md)', 
                        padding: '0', 
                        overflow: 'hidden',
                        borderColor: isHighlighted ? 'var(--primary)' : undefined,
                        boxShadow: isHighlighted ? '0 0 30px rgba(255, 107, 53, 0.45)' : undefined,
                        transform: isHighlighted ? 'scale(1.02)' : undefined,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      
                      <div 
                        style={{ position: 'relative', height: '220px', width: '100%', cursor: 'pointer' }}
                        onClick={() => setPreviewDish(item)}
                        title="Click to zoom & view details"
                      >
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }} 
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
                        <div style={{
                          position: 'absolute',
                          bottom: '10px',
                          left: '10px',
                          background: 'rgba(0, 0, 0, 0.65)',
                          backdropFilter: 'blur(6px)',
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '11px',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <span>🔍 Click image to view</span>
                        </div>
                      </div>

                      <div style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-sm)' }}>
                          <h3 style={{ fontSize: '18px', fontWeight: 600, color: isHighlighted ? 'var(--primary)' : 'inherit' }}>
                            {item.name}
                          </h3>
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
                  );
                })
              )}
            </div>

          </div>
        )}
      </div>
    </main>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={
      <main className="page-content section">
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-4xl)' }}>
          <div className="spinner"></div>
        </div>
      </main>
    }>
      <MenuContent />
    </Suspense>
  );
}
