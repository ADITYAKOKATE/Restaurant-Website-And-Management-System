export default function HomePage() {
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: '16px',
      padding: '32px',
      paddingTop: '112px',
    }}>
      <div style={{ fontSize: '80px' }}>🍛</div>
      <h1 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '3rem',
        background: 'var(--gradient-brand)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        Premacha Vada
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '18px', maxWidth: '500px' }}>
        The home page is coming up in Day 2! For now, check out the Login and Register pages.
      </p>
      <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
        <a href="/register" className="btn btn-primary">Sign Up</a>
        <a href="/login" className="btn btn-secondary">Login</a>
        <a href="/menu" className="btn btn-ghost">View Menu</a>
      </div>
    </div>
  );
}
