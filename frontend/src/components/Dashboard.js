import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalClients: 0,
    paidInvoices: 0,
    pendingAmount: 0,
    totalRevenue: 0,
    draftInvoices: 0,
    sentInvoices: 0
  });
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [recentClients, setRecentClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    fetchDashboardData();
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, invoicesRes, clientsRes] = await Promise.all([
        fetch('/api/stats', { headers: getAuthHeaders() }),
        fetch('/api/invoices/', { headers: getAuthHeaders() }),
        fetch('/api/clients/', { headers: getAuthHeaders() })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(prev => ({
          ...prev,
          ...statsData,
          totalRevenue: statsData.totalRevenue || 0,
          draftInvoices: statsData.draftInvoices || 0,
          sentInvoices: statsData.sentInvoices || 0
        }));
      }

      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json();
        setRecentInvoices(invoicesData.slice(0, 5));
        
        const paid = invoicesData.filter(i => i.status === 'paid').length;
        const draft = invoicesData.filter(i => i.status === 'draft').length;
        const sent = invoicesData.filter(i => i.status === 'sent').length;
        const revenue = invoicesData
          .filter(i => i.status === 'paid')
          .reduce((sum, i) => sum + (parseFloat(i.total) || 0), 0);
        
        setStats(prev => ({
          ...prev,
          paidInvoices: paid,
          draftInvoices: draft,
          sentInvoices: sent,
          totalRevenue: revenue
        }));
      }

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        setRecentClients(clientsData.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me', { headers: getAuthHeaders() });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'draft': return 'status status-draft';
      case 'sent': return 'status status-sent';
      case 'paid': return 'status status-paid';
      default: return 'status';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft': return '✏️';
      case 'sent': return '📤';
      case 'paid': return '✅';
      default: return '📄';
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const unpaidAmount = stats.pendingAmount;
  const collectionRate = stats.totalInvoices > 0 
    ? ((stats.paidInvoices / stats.totalInvoices) * 100).toFixed(1) 
    : 0;

  return (
    <div className="fade-in">
      {/* Header with User Profile */}
      <div className="page-header" style={{ flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p style={{ color: 'var(--gray-500)', marginTop: 'var(--space-2)' }}>
            Here's what's happening with your business today
          </p>
        </div>
        
        {/* User Profile Card */}
        {user && (
          <div 
            onClick={() => navigate('/profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 20px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              border: '1px solid var(--gray-100)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
            }}
          >
            {user.profile_picture ? (
              <img 
                src={`http://localhost:8000/${user.profile_picture}`}
                alt="Profile" 
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #3498db'
                }}
              />
            ) : (
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#3498db',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px',
                fontWeight: 'bold'
              }}>
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div>
              <div style={{ fontWeight: '600', color: '#000000', fontSize: '14px' }}>
                {user.email}
              </div>
              <div style={{ fontSize: '12px', color: '#666', textTransform: 'capitalize' }}>
                {user.role || 'User'} | ID: #{user.id}
              </div>
              {user.bank_name && (
                <div style={{ fontSize: '11px', color: '#3498db', marginTop: '2px' }}>
                  🏦 {user.bank_name}
                </div>
              )}
            </div>
            <span style={{ marginLeft: '8px', color: '#999' }}>→</span>
          </div>
        )}
        
        <Link to="/invoices/create" className="btn btn-primary">
          <span>+</span> New Invoice
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Revenue</span>
            <div className="stat-card-icon green">�</div>
          </div>
          <div className="stat-card-value">${stats.totalRevenue.toFixed(2)}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--success-600)', marginTop: 'var(--space-2)' }}>
            From {stats.paidInvoices} paid invoices
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Outstanding</span>
            <div className="stat-card-icon red">⏳</div>
          </div>
          <div className="stat-card-value">${unpaidAmount.toFixed(2)}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--danger-600)', marginTop: 'var(--space-2)' }}>
            Pending payment
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Collection Rate</span>
            <div className="stat-card-icon blue">📊</div>
          </div>
          <div className="stat-card-value">{collectionRate}%</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--primary-600)', marginTop: 'var(--space-2)' }}>
            Invoices paid vs total
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Clients</span>
            <div className="stat-card-icon orange">�</div>
          </div>
          <div className="stat-card-value">{stats.totalClients}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--warning-600)', marginTop: 'var(--space-2)' }}>
            Active clients
          </div>
        </div>
      </div>

      {/* Invoice Status Overview */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-header">
          <h2 className="card-title">Invoice Overview</h2>
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: 'var(--space-4)',
          marginTop: 'var(--space-4)'
        }}>
          <div style={{ 
            textAlign: 'center', 
            padding: 'var(--space-4)', 
            background: 'var(--gray-50)', 
            borderRadius: 'var(--radius-lg)' 
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#000000' }}>
              {stats.draftInvoices}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#525252', marginTop: 'var(--space-1)' }}>
              Draft
            </div>
          </div>
          <div style={{ 
            textAlign: 'center', 
            padding: 'var(--space-4)', 
            background: 'var(--warning-50)', 
            borderRadius: 'var(--radius-lg)' 
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#000000' }}>
              {stats.sentInvoices}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#525252', marginTop: 'var(--space-1)' }}>
              Sent
            </div>
          </div>
          <div style={{ 
            textAlign: 'center', 
            padding: 'var(--space-4)', 
            background: 'var(--success-50)', 
            borderRadius: 'var(--radius-lg)' 
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#000000' }}>
              {stats.paidInvoices}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#525252', marginTop: 'var(--space-1)' }}>
              Paid
            </div>
          </div>
          <div style={{ 
            textAlign: 'center', 
            padding: 'var(--space-4)', 
            background: 'var(--primary-50)', 
            borderRadius: 'var(--radius-lg)' 
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#000000' }}>
              {stats.totalInvoices}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#525252', marginTop: 'var(--space-1)' }}>
              Total
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: 'var(--space-6)',
        marginBottom: 'var(--space-6)'
      }}>
        {/* Recent Invoices */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="card-title">Recent Invoices</h2>
            <Link to="/invoices" className="btn btn-sm btn-secondary">View All</Link>
          </div>
          
          {recentInvoices.length > 0 ? (
            <div style={{ marginTop: 'var(--space-4)' }}>
              {recentInvoices.map((invoice, index) => (
                <div 
                  key={invoice.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: 'var(--space-3) 0',
                    borderBottom: index < recentInvoices.length - 1 ? '1px solid var(--gray-100)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <span style={{ fontSize: '1.25rem' }}>{getStatusIcon(invoice.status)}</span>
                    <div>
                      <div style={{ fontWeight: '600', color: '#000000' }}>
                        #{invoice.id} - {invoice.client_name || `Client ${invoice.client_id}`}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#525252' }}>
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '700', color: '#000000' }}>
                      ${parseFloat(invoice.total).toFixed(2)}
                    </div>
                    <span className={getStatusClass(invoice.status)} style={{ fontSize: '0.625rem' }}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 'var(--space-6)' }}>
              <div className="empty-state-icon">📄</div>
              <h3>No invoices yet</h3>
              <Link to="/invoices/create" className="btn btn-primary btn-sm">Create First Invoice</Link>
            </div>
          )}
        </div>

        {/* Recent Clients */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="card-title">Recent Clients</h2>
            <Link to="/clients" className="btn btn-sm btn-secondary">View All</Link>
          </div>
          
          {recentClients.length > 0 ? (
            <div style={{ marginTop: 'var(--space-4)' }}>
              {recentClients.map((client, index) => (
                <div 
                  key={client.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 'var(--space-3)',
                    padding: 'var(--space-3) 0',
                    borderBottom: index < recentClients.length - 1 ? '1px solid var(--gray-100)' : 'none'
                  }}
                >
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    background: 'var(--primary-100)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600',
                    color: 'var(--primary-600)'
                  }}>
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: '#000000' }}>
                      {client.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#525252' }}>
                      {client.email || 'No email'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 'var(--space-6)' }}>
              <div className="empty-state-icon">👥</div>
              <h3>No clients yet</h3>
              <Link to="/clients" className="btn btn-primary btn-sm">Add First Client</Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Quick Actions</h2>
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: 'var(--space-4)',
          marginTop: 'var(--space-4)'
        }}>
          <Link to="/invoices/create" style={{ 
            textDecoration: 'none',
            padding: 'var(--space-4)',
            background: 'var(--primary-50)',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
            transition: 'all 0.2s'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>📄</div>
            <div style={{ fontWeight: '600', color: '#000000' }}>Create Invoice</div>
            <div style={{ fontSize: '0.75rem', color: '#525252' }}>Bill your clients</div>
          </Link>
          
          <Link to="/clients" style={{ 
            textDecoration: 'none',
            padding: 'var(--space-4)',
            background: 'var(--success-50)',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
            transition: 'all 0.2s'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>👥</div>
            <div style={{ fontWeight: '600', color: '#000000' }}>Add Client</div>
            <div style={{ fontSize: '0.75rem', color: '#525252' }}>Manage contacts</div>
          </Link>
          
          <Link to="/invoices" style={{ 
            textDecoration: 'none',
            padding: 'var(--space-4)',
            background: 'var(--warning-50)',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
            transition: 'all 0.2s'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>📊</div>
            <div style={{ fontWeight: '600', color: '#000000' }}>View Reports</div>
            <div style={{ fontSize: '0.75rem', color: '#525252' }}>See all invoices</div>
          </Link>
          
          <button 
            style={{ 
              textDecoration: 'none',
              padding: 'var(--space-4)',
              background: 'var(--gray-50)',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center',
              transition: 'all 0.2s',
              cursor: 'pointer',
              border: 'none',
              fontFamily: 'inherit'
            }} 
            onClick={() => window.print()}
          >
            <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>🖨️</div>
            <div style={{ fontWeight: '600', color: '#000000' }}>Print Summary</div>
            <div style={{ fontSize: '0.75rem', color: '#525252' }}>Export report</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
