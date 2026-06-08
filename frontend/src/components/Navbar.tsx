'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (loading) return;

    const isLandingPage = pathname === '/';
    if (!user) {
      if (!isLandingPage) {
        router.push('/');
      }
    } else {
      if (user.role === 'requester' && pathname.startsWith('/handler')) {
        router.push('/requester/requests');
      } else if (user.role === 'handler' && pathname.startsWith('/requester')) {
        router.push('/handler/dashboard');
      }
    }
  }, [user, pathname, loading, router]);

  const handleSignOut = async () => {
    await logout();
  };

  // If loading or not logged in, or on the login landing page, customize header
  const isLandingPage = pathname === '/';

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <div style={styles.brand} onClick={() => router.push('/')}>
          <span style={styles.logoText}>The Calling</span>
          <span style={styles.logoDot}>.</span>
        </div>

        {user && (
          <nav style={styles.nav}>
            {user.role === 'requester' && (
              <>
                <button
                  style={pathname === '/requester/requests' ? styles.activeNavLink : styles.navLink}
                  onClick={() => router.push('/requester/requests')}
                >
                  My Requests
                </button>
                <button
                  style={pathname === '/requester/requests/new' ? styles.activeNavLink : styles.navLink}
                  onClick={() => router.push('/requester/requests/new')}
                >
                  + New Request
                </button>
              </>
            )}
            {user.role === 'handler' && (
              <button
                style={pathname === '/handler/dashboard' ? styles.activeNavLink : styles.navLink}
                onClick={() => router.push('/handler/dashboard')}
              >
                Dashboard
              </button>
            )}
          </nav>
        )}

        <div style={styles.userSection}>
          {user ? (
            <div style={styles.profileBox}>
              <div style={styles.userInfo}>
                <span style={styles.userName}>{user.name || user.email}</span>
                <span style={styles.userRole}>{user.role}</span>
              </div>
              <button style={styles.signOutButton} onClick={handleSignOut}>
                Sign Out
              </button>
            </div>
          ) : (
            !loading && !isLandingPage && (
              <button style={styles.signInButton} onClick={() => router.push('/')}>
                Sign In
              </button>
            )
          )}
        </div>
      </div>
    </header>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '70px',
    background: 'rgba(15, 23, 42, 0.4)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    fontFamily: '"Outfit", "Inter", -apple-system, sans-serif',
  },
  container: {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  logoText: {
    fontSize: '1.4rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #a5b4fc 0%, #6366f1 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.02em',
  },
  logoDot: {
    fontSize: '1.4rem',
    fontWeight: 800,
    color: '#6366f1',
    marginLeft: '1px',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  navLink: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    fontSize: '0.95rem',
    fontWeight: 500,
    padding: '0.5rem 1rem',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  activeNavLink: {
    background: 'rgba(99, 102, 241, 0.1)',
    border: 'none',
    color: '#f8fafc',
    fontSize: '0.95rem',
    fontWeight: 600,
    padding: '0.5rem 1rem',
    borderRadius: '12px',
    cursor: 'pointer',
    borderBottom: '1px solid rgba(99, 102, 241, 0.3)',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
  },
  profileBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  userName: {
    color: '#f8fafc',
    fontSize: '0.9rem',
    fontWeight: 600,
  },
  userRole: {
    color: '#818cf8',
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  signOutButton: {
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#f1f5f9',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    padding: '0.5rem 1rem',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  signInButton: {
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '0.5rem 1.25rem',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
  },
};
