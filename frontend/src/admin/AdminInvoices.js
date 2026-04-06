import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

const AdminInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:8000/api/admin/invoices', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setInvoices(data);
      } else {
        // Mock data
        setInvoices([
          { id: 1, invoice_number: 'INV-001', client_name: 'Client A', company_name: 'ABC Corp', total: 5000, status: 'paid', created_at: '2026-03-15' },
          { id: 2, invoice_number: 'INV-002', client_name: 'Client B', company_name: 'XYZ Ltd', total: 3500, status: 'pending', created_at: '2026-03-18' },
          { id: 3, invoice_number: 'INV-003', client_name: 'Client C', company_name: 'Tech Solutions', total: 8500, status: 'sent', created_at: '2026-03-20' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return { bg: '#d1fae5', text: '#065f46' };
      case 'pending': return { bg: '#fed7aa', text: '#92400e' };
      case 'sent': return { bg: '#dbeafe', text: '#1e40af' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  return (
    <AdminLayout>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#1f2937' }}>All Invoices</h2>
            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>View all invoices across all companies</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <select style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }}>
              <option>All Status</option>
              <option>Paid</option>
              <option>Pending</option>
              <option>Sent</option>
            </select>
            <button style={{
              padding: '10px 20px',
              backgroundColor: '#1e3a5f',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Invoice #</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Client</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Company</th>
                <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Amount</th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center' }}>Loading...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>No invoices found</td></tr>
              ) : (
                invoices.map((inv) => {
                  const statusColors = getStatusColor(inv.status);
                  return (
                    <tr key={inv.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '16px', fontWeight: '500' }}>{inv.invoice_number || `INV-${inv.id}`}</td>
                      <td style={{ padding: '16px' }}>{inv.client_name || '-'}</td>
                      <td style={{ padding: '16px', color: '#6b7280' }}>{inv.company_name || '-'}</td>
                      <td style={{ padding: '16px', textAlign: 'right', fontWeight: '500' }}>₹{parseFloat(inv.total).toLocaleString()}</td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '500',
                          textTransform: 'capitalize',
                          backgroundColor: statusColors.bg,
                          color: statusColors.text
                        }}>
                          {inv.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px', color: '#6b7280' }}>{new Date(inv.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: '16px' }}>
                        <button onClick={() => { setSelectedInvoice(inv); setShowModal(true); }} style={{
                          padding: '6px 12px',
                          backgroundColor: '#f3f4f6',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}>View</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Invoice Detail Modal */}
        {showModal && selectedInvoice && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }} onClick={() => setShowModal(false)}>
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
                <h3 style={{ margin: 0, fontSize: '20px' }}>Invoice Details</h3>
                <button onClick={() => setShowModal(false)} style={{
                  background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer'
                }}>&times;</button>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Invoice #:</strong> {selectedInvoice.invoice_number || `INV-${selectedInvoice.id}`}
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Client:</strong> {selectedInvoice.client_name || '-'}
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Company:</strong> {selectedInvoice.company_name || '-'}
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Amount:</strong> ₹{parseFloat(selectedInvoice.total).toLocaleString()}
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Status:</strong>{' '}
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  textTransform: 'capitalize',
                  backgroundColor: getStatusColor(selectedInvoice.status).bg,
                  color: getStatusColor(selectedInvoice.status).text
                }}>{selectedInvoice.status}</span>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Date:</strong> {new Date(selectedInvoice.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminInvoices;
