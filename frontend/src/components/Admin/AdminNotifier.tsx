'use client';

import React, { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAdminOrders } from './adminApi';

/**
 * AdminNotifier
 * Drop this inside any persistent admin wrapper (e.g. AdminShell) and it will
 * poll for new orders, play a beep and show a slide-in toast on every admin page.
 */
export default function AdminNotifier() {
  const router = useRouter();
  const [notification, setNotification] = React.useState<{ count: number; orderType: string } | null>(null);
  const audioCtxRef = React.useRef<any>(null);
  const lastCheckTimeRef = React.useRef<Date>(new Date());

  // ── playBeep ──────────────────────────────────────────────────────────────
  const playBeep = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        return;
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.warn('[AdminNotifier] Audio playback failed:', e);
    }
  }, []);

  // ── Audio init + Polling + Visibility ─────────────────────────────────────
  useEffect(() => {
    // Create AudioContext on first click/keydown (browser autoplay policy)
    const createCtx = () => {
      if (!audioCtxRef.current) {
        try {
          const Cls = window.AudioContext || (window as any).webkitAudioContext;
          if (Cls) {
            audioCtxRef.current = new Cls();
          }
        } catch { /* ignore */ }
      } else if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    };
    window.addEventListener('click', createCtx);
    window.addEventListener('keydown', createCtx);

    // Establish baseline — do NOT beep for orders already in the DB
    fetchAdminOrders()
      .then(orders => {
        if (orders && orders.length > 0) {
          lastCheckTimeRef.current = new Date(orders[0].createdAt);
        }
      })
      .catch(() => {});

    // Core polling function
    const checkForNewOrders = async () => {
      try {
        const recent = await fetchAdminOrders();
        if (!recent || recent.length === 0) return;

        const newOrders = recent.filter(
          o => new Date(o.createdAt).getTime() > lastCheckTimeRef.current.getTime()
        );

        if (newOrders.length > 0) {
          playBeep();
          setNotification(prev => ({
            count: (prev?.count || 0) + newOrders.length,
            orderType: newOrders[0].orderType,
          }));
          lastCheckTimeRef.current = new Date(recent[0].createdAt);
        }
      } catch (err) {
        console.error('[AdminNotifier] Error checking for new orders:', err);
      }
    };

    const intervalId = setInterval(checkForNewOrders, 10000); // every 10 s

    // Instantly check when admin switches back to this tab
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        checkForNewOrders();
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('click', createCtx);
      window.removeEventListener('keydown', createCtx);
    };
  }, [playBeep]);

  // ── Toast UI ──────────────────────────────────────────────────────────────
  if (!notification) return null;

  const handleToastClick = () => {
    setNotification(null);
    router.push('/admin/orders');
  };

  return (
    <div
      onClick={handleToastClick}
      style={{
        position: 'fixed',
        bottom: '32px',
        right: '32px',
        background: 'rgba(28, 28, 30, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#ffffff',
        padding: '16px 20px',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        cursor: 'pointer',
        zIndex: 99999,
        minWidth: '320px',
        maxWidth: '400px',
        animation: 'adminNotifierSlideIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 24px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)';
      }}
    >
      <style>{`
        @keyframes adminNotifierSlideIn {
          from { transform: translateX(120%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes adminNotifierPulse {
          0% { box-shadow: 0 0 0 0 rgba(230, 126, 34, 0.6); }
          70% { box-shadow: 0 0 0 12px rgba(230, 126, 34, 0); }
          100% { box-shadow: 0 0 0 0 rgba(230, 126, 34, 0); }
        }
        @keyframes adminNotifierWobble {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(-15deg); }
          30% { transform: rotate(10deg); }
          45% { transform: rotate(-10deg); }
          60% { transform: rotate(5deg); }
          75% { transform: rotate(-5deg); }
        }
      `}</style>

      {/* Premium Icon Container */}
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 4px 12px rgba(230, 126, 34, 0.4)',
        animation: 'adminNotifierPulse 2s infinite',
      }}>
        <span style={{ 
          fontSize: '24px', 
          lineHeight: 1, 
          animation: 'adminNotifierWobble 2s ease-in-out infinite',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
        }}>
          🔔
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
        <strong style={{ 
          display: 'block', 
          fontSize: '16px', 
          fontWeight: 600, 
          letterSpacing: '-0.3px',
          marginBottom: '4px',
          color: '#ffffff'
        }}>
          New Order Alert
        </strong>
        <span style={{ 
          display: 'block',
          fontSize: '14px', 
          color: 'rgba(255, 255, 255, 0.7)', 
          lineHeight: 1.4,
          fontWeight: 400
        }}>
          <span style={{ color: '#e67e22', fontWeight: 600 }}>{notification.count}</span> new {notification.count > 1 ? 'orders' : 'order'} pending. Click to manage.
        </span>
      </div>

      {/* Subtle Dismiss Button */}
      <button
        onClick={e => { e.stopPropagation(); setNotification(null); }}
        style={{
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.8)',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '18px',
          flexShrink: 0,
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
          e.currentTarget.style.color = '#ffffff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
          e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
        }}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}
