import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      // Mock data for now - replace with actual API call
      setPayments([
        { id: 1, invoice_id: 1, amount: 5000, method: 'UPI', status: 'completed', date: '2026-03-16', company: 'ABC Corp' },
        { id: 2, invoice_id: 2, amount: 3500, method: 'Bank Transfer', status: 'pending', date: '2026-03-19', company: 'XYZ Ltd' },
        { id: 3, invoice_id: 3, amount: 8500, method: 'Card', status: 'completed', date: '2026-03-21', company: 'Tech Solutions' }
      ]);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return { bg: '#d1fae5', text: '#065f46' };
      case 'pending': return { bg: '#fed7aa', text: '#92400e' };
      case 'failed': return { bg: '#fee2e2', text: '#991b1b' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  return (
    <AdminLayout>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#1f2937' }}>Payment Transactions</h2>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>View all payment transactions</p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Transaction ID</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Company</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Method</th>
                <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Amount</th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center' }}>Loading...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>No payments found</td></tr>
              ) : (
                payments.map((payment) => {
                  const statusColors = getStatusColor(payment.status);
                  return (
                    <tr key={payment.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '16px', fontWeight: '500' }}>TXN-{payment.id}</td>
                      <td style={{ padding: '16px' }}>{payment.company}</td>
                      <td style={{ padding: '16px' }}>{payment.method}</td>
                      <td style={{ padding: '16px', textAlign: 'right', fontWeight: '600' }}>₹{payment.amount.toLocaleString()}</td>
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
                          {payment.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px', color: '#6b7280' }}>{new Date(payment.date).toLocaleDateString()}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPayments;
