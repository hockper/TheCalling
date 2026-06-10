import React from 'react';
import Navbar from '../components/Navbar';
import { AuthProvider } from '../context/AuthContext';
import '../services/api';

export const metadata = {
  title: 'The Calling Dashboard',
  description: 'System Status and Health Verification',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        padding: 0,
        minHeight: '100vh',
        background: 'radial-gradient(circle at center, #1b2030 0%, #0c0f17 100%)',
        color: '#e2e8f0',
        fontFamily: '"Outfit", "Inter", -apple-system, sans-serif',
      }}>
        <AuthProvider>
          <Navbar />
          <div style={{ minHeight: 'calc(100vh - 70px)' }}>
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
