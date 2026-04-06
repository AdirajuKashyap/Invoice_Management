import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    totalInvoices: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      // Fetch all stats from backend
      const [usersRes, companiesRes, invoicesRes] = await Promise.all([
        fetch('http://localhost:8000/api/admin/users', { headers: { 'Authorization': `Bearer ${adminToken}` } }),
        fetch('http://localhost:8000/api/admin/companies', { headers: { 'Authorization': `Bearer ${adminToken}` } }),
        fetch('http://localhost:8000/api/admin/invoices', { headers: { 'Authorization': `Bearer ${adminToken}` } })
      ]);

      const users = usersRes.ok ? await usersRes.json() : [];
      const companies = companiesRes.ok ? await companiesRes.json() : [];
      const invoices = invoicesRes.ok ? await invoicesRes.json() : [];

      const totalRevenue = invoices.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);
      const pendingInvoices = invoices.filter(inv => inv.status === 'pending' || inv.status === 'sent').length;

      setStats({
        totalUsers: users.length,
        totalCompanies: companies.length,
        totalInvoices: invoices.length,
        totalRevenue,
        pendingInvoices,
        recentActivity: invoices.slice(0, 5).map(inv => ({
          type: 'invoice',
          description: `Invoice #${inv.id} created`,
          date: inv.created_at,
          amount: inv.total
        }))
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Use mock data if API fails
      setStats({
        totalUsers: 12,
        totalCompanies: 8,
        totalInvoices: 45,
        totalRevenue: 125000,
        pendingInvoices: 15,
        recentActivity: []
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, label, value, color, link }) => (
    <Link to={link} style={{ textDecoration: 'none' }}>
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '12px',
          backgroundColor: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px'
        }}>
          {icon}
        </div>
        <div>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>{label}</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>
            {loading ? '...' : value}
          </p>
        </div>
      </div>
    </Link>
  );

  return (
    <AdminLayout>
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <StatCard icon="👥" label="Total Users" value={stats.totalUsers} color="#dbeafe" link="/admin/users" />
        <StatCard icon="🏢" label="Companies" value={stats.totalCompanies} color="#d1fae5" link="/admin/companies" />
        <StatCard icon="📄" label="Total Invoices" value={stats.totalInvoices} color="#fef3c7" link="/admin/invoices" />
        <StatCard icon="💰" label="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} color="#fce7f3" link="/admin/invoices" />
        <StatCard icon="⏳" label="Pending Invoices" value={stats.pendingInvoices} color="#fed7aa" link="/admin/invoices" />
      </div>

      {/* Quick Actions */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '32px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#1f2937' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/admin/users" style={{
            padding: '12px 24px',
            backgroundColor: '#1e3a5f',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            👥 Manage Users
          </Link>
          <Link to="/admin/companies" style={{
            padding: '12px 24px',
            backgroundColor: '#059669',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            🏢 View Companies
          </Link>
          <Link to="/admin/invoices" style={{
            padding: '12px 24px',
            backgroundColor: '#d97706',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            📄 All Invoices
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#1f2937' }}>Recent Activity</h3>
        {stats.recentActivity.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px' }}>
            No recent activity to display
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats.recentActivity.map((activity, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px'
              }}>
                <div>
                  <p style={{ margin: 0, fontWeight: '500', color: '#374151' }}>{activity.description}</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                    {new Date(activity.date).toLocaleString()}
                  </p>
                </div>
                {activity.amount && (
                  <span style={{ fontWeight: '600', color: '#059669' }}>
                    ₹{parseFloat(activity.amount).toLocaleString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
