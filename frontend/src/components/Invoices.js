import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices/', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setInvoices(data);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteInvoice = async (id) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    
    try {
      const response = await fetch(`/api/invoices/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        setInvoices(invoices.filter(inv => inv.id !== id));
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
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

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p style={{ color: 'var(--gray-500)', marginTop: 'var(--space-2)' }}>
            Manage and track all your invoices
          </p>
        </div>
        <a href="/invoices/create" className="btn btn-primary">
          <span>+</span> Create Invoice
        </a>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Client</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(invoice => (
                <tr key={invoice.id}>
                  <td><strong>#{invoice.id}</strong></td>
                  <td>{invoice.client_name || `Client ${invoice.client_id}`}</td>
                  <td><span className={getStatusClass(invoice.status)}>{invoice.status}</span></td>
                  <td><strong>${invoice.total?.toFixed(2)}</strong></td>
                  <td>
                    <Link to={`/invoices/${invoice.id}`} className="btn btn-primary btn-sm" style={{ marginRight: 'var(--space-2)' }}>
                      View
                    </Link>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteInvoice(invoice.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {invoices.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📄</div>
            <h3>No invoices yet</h3>
            <p>Create your first invoice to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Invoices;
