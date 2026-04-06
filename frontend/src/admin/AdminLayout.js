import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  const menuItems = [
    { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/admin/users', icon: '👥', label: 'Users' },
    { path: '/admin/companies', icon: '🏢', label: 'Companies' },
    { path: '/admin/invoices', icon: '📄', label: 'All Invoices' },
    { path: '/admin/chat', icon: '💬', label: 'Chat' },
    { path: '/admin/settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', backgroundColor: '#1e3a5f', color: 'white', display: 'flex', flexDirection: 'column' }}>
        {/* Logo Area */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>🔐 Admin Panel</h1>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Invoice Manager</p>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 0' }}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 20px',
                color: location.pathname === item.path ? 'white' : '#94a3b8',
                backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: location.pathname === item.path ? '500' : '400',
                transition: 'all 0.2s',
                borderLeft: location.pathname === item.path ? '3px solid #f97316' : '3px solid transparent'
              }}
            >
              <span style={{ marginRight: '12px', fontSize: '18px' }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ marginBottom: '12px', fontSize: '13px' }}>
            <p style={{ margin: 0, color: '#94a3b8' }}>Logged in as</p>
            <p style={{ margin: '4px 0 0 0', fontWeight: '500' }}>{adminUser.email || 'Admin'}</p>
          </div>
          <button
            onClick={logout}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {/* Top Header */}
        <header style={{
          backgroundColor: 'white',
          padding: '16px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#1f2937' }}>
            {menuItems.find(item => item.path === location.pathname)?.label || 'Admin Panel'}
          </h2>
          <Link to="/" style={{ color: '#6b7280', fontSize: '14px', textDecoration: 'none' }}>
            ← Back to Site
          </Link>
        </header>

        {/* Page Content */}
        <div style={{ padding: '24px' }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
