import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCompany, setEditingCompany] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [viewingCompany, setViewingCompany] = useState(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:8000/api/admin/companies', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      } else {
        setCompanies([]);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (company) => {
    setEditingCompany(company);
    setEditForm({ ...company });
  };

  const closeEditModal = () => {
    setEditingCompany(null);
    setEditForm({});
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const saveCompany = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:8000/api/admin/companies/${editingCompany.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(editForm)
      });
      
      if (response.ok) {
        setCompanies(companies.map(c => c.id === editingCompany.id ? { ...c, ...editForm } : c));
        closeEditModal();
      } else {
        alert('Failed to update company');
      }
    } catch (error) {
      console.error('Error updating company:', error);
      alert('Error updating company');
    }
  };

  return (
    <AdminLayout>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#1f2937' }}>Companies</h2>
            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>Manage all registered companies</p>
          </div>
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
            + Add Company
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Company</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Contact</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Location</th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Invoices</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center' }}>Loading...</td></tr>
              ) : companies.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>No companies found</td></tr>
              ) : (
                companies.map((company) => (
                  <tr key={company.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {company.logo_path ? (
                          <img 
                            src={`http://localhost:8000${company.logo_path}`} 
                            alt={company.name}
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '8px',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            backgroundColor: '#059669',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                            fontWeight: '600'
                          }}>
                            {company.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span style={{ fontWeight: '500', color: '#1f2937' }}>{company.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <p style={{ margin: 0, color: '#374151' }}>{company.email || '-'}</p>
                      <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '13px' }}>{company.phone || '-'}</p>
                    </td>
                    <td style={{ padding: '16px', color: '#6b7280' }}>{company.address || '-'}</td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{ padding: '4px 12px', backgroundColor: '#fef3c7', color: '#92400e', borderRadius: '20px', fontSize: '13px', fontWeight: '500' }}>
                        {company.invoices_count || 0}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => openEditModal(company)} style={{
                          padding: '6px 12px',
                          backgroundColor: '#f3f4f6',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Edit
                        </button>
                        <button onClick={() => setViewingCompany(company)} style={{
                          padding: '6px 12px',
                          backgroundColor: '#f3f4f6',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}>View</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Company Modal */}
      {viewingCompany && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setViewingCompany(null)}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px' }}>Company Details</h3>
              <button onClick={() => setViewingCompany(null)} style={{
                background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer'
              }}>&times;</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              {viewingCompany.logo_path ? (
                <img src={`http://localhost:8000${viewingCompany.logo_path}`} alt={viewingCompany.name}
                  style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '60px', height: '60px', borderRadius: '8px', backgroundColor: '#059669',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px', fontWeight: '600'
                }}>
                  {viewingCompany.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h4 style={{ margin: 0, fontSize: '18px' }}>{viewingCompany.name}</h4>
                <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>{viewingCompany.plan || 'Free'} Plan</p>
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>Email:</strong> {viewingCompany.email || '-'}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>Phone:</strong> {viewingCompany.phone || '-'}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>Address:</strong> {viewingCompany.address || '-'}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>Location:</strong> {viewingCompany.city || '-'}, {viewingCompany.state || '-'}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>Invoices:</strong> {viewingCompany.invoices_count || 0}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>Bank:</strong> {viewingCompany.bank_name || '-'}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>UPI ID:</strong> {viewingCompany.upi_id || '-'}
            </div>
          </div>
        </div>
      )}

      {editingCompany && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{ margin: '0 0 20px 0' }}>Edit Company</h3>
            {editingCompany.logo_path && (
              <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <img 
                  src={`http://localhost:8000${editingCompany.logo_path}`} 
                  alt={editingCompany.name}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '8px',
                    objectFit: 'cover'
                  }}
                />
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '13px', color: '#6b7280' }}>Company Name</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name || ''}
                  onChange={handleEditChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    marginTop: '4px'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', color: '#6b7280' }}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email || ''}
                  onChange={handleEditChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    marginTop: '4px'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', color: '#6b7280' }}>Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={editForm.phone || ''}
                  onChange={handleEditChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    marginTop: '4px'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', color: '#6b7280' }}>Address</label>
                <input
                  type="text"
                  name="address"
                  value={editForm.address || ''}
                  onChange={handleEditChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    marginTop: '4px'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', color: '#6b7280' }}>City</label>
                  <input
                    type="text"
                    name="city"
                    value={editForm.city || ''}
                    onChange={handleEditChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '14px',
                      marginTop: '4px'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', color: '#6b7280' }}>State</label>
                  <input
                    type="text"
                    name="state"
                    value={editForm.state || ''}
                    onChange={handleEditChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '14px',
                      marginTop: '4px'
                    }}
                  />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button onClick={closeEditModal} style={{
                padding: '10px 20px',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}>
                Cancel
              </button>
              <button onClick={saveCompany} style={{
                padding: '10px 20px',
                backgroundColor: '#1e3a5f',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCompanies;
