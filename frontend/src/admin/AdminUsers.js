import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:8000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        // Mock data for development
        setUsers([
          { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', company: 'ABC Corp', created_at: '2026-03-15' },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', company: 'XYZ Ltd', created_at: '2026-03-20' },
          { id: 3, name: 'Admin User', email: 'admin@invoicemanager.com', role: 'admin', company: '-', created_at: '2026-01-01' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  return (
    <AdminLayout>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#1f2937' }}>User Management</h2>
            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>View and manage all registered users</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder="Search users..."
              style={{
                padding: '10px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                width: '250px'
              }}
            />
            <button style={{
              padding: '10px 20px',
              backgroundColor: '#1e3a5f',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              + Add User
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>User</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Company</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Joined</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: '#1e3a5f',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px',
                          fontWeight: '600'
                        }}>
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: '500', color: '#1f2937' }}>{user.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: '#6b7280' }}>{user.email}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: user.role === 'admin' ? '#fef3c7' : '#dbeafe',
                        color: user.role === 'admin' ? '#92400e' : '#1e40af'
                      }}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: '#6b7280' }}>{user.company || '-'}</td>
                    <td style={{ padding: '16px', color: '#6b7280', fontSize: '14px' }}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <button
                        onClick={() => viewUserDetails(user)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#f3f4f6',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          color: '#374151'
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '20px' }}>User Details</h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#1e3a5f',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: '600'
              }}>
                {selectedUser.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '18px' }}>{selectedUser.name}</h4>
                <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>{selectedUser.email}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Role</label>
                <p style={{ margin: '4px 0 0 0', fontWeight: '500' }}>{selectedUser.role || 'user'}</p>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Company</label>
                <p style={{ margin: '4px 0 0 0', fontWeight: '500' }}>{selectedUser.company || 'Not assigned'}</p>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Joined Date</label>
                <p style={{ margin: '4px 0 0 0', fontWeight: '500' }}>{new Date(selectedUser.created_at).toLocaleString()}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#1e3a5f',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}>
                Edit User
              </button>
              <button style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}>
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsers;
