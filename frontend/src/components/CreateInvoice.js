import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

const CreateInvoice = () => {
  const [clients, setClients] = useState([]);
  const [invoice, setInvoice] = useState({
    client_id: '',
    items: [{ product: '', quantity: 1, price: 0 }]
  });

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  const fetchClients = useCallback(async () => {
    try {
      const response = await fetch('/api/clients/', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const addItem = () => {
    setInvoice({
      ...invoice,
      items: [...invoice.items, { product: '', quantity: 1, price: 0 }]
    });
  };

  const removeItem = (index) => {
    const items = invoice.items.filter((_, i) => i !== index);
    setInvoice({ ...invoice, items });
  };

  const updateItem = (index, field, value) => {
    const items = [...invoice.items];
    items[index] = { ...items[index], [field]: value };
    setInvoice({ ...invoice, items });
  };

  const calculateTotal = () =>
    invoice.items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/invoices/', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(invoice)
      });
      if (response.ok) window.location.href = '/invoices';
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Create Invoice</h1>
          <p style={{ color: 'var(--gray-500)', marginTop: 'var(--space-2)' }}>
            Create a new invoice for your client
          </p>
        </div>
        <Link to="/invoices" className="btn btn-secondary">Back to Invoices</Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Client Select */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Select Client</h2>
          </div>
          <div className="form-group">
            <label>Client</label>
            <select
              value={invoice.client_id}
              onChange={(e) => setInvoice({ ...invoice, client_id: e.target.value })}
              required
            >
              <option value="">Select a client</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Items */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Invoice Items</h2>
            <button
              type="button"
              onClick={addItem}
              className="btn btn-secondary btn-sm"
            >
              + Add Item
            </button>
          </div>

          <div className="space-y-4">
            {invoice.items.map((item, index) => (
              <div key={index} className="grid grid-cols-5 gap-3 items-end">

                <div className="form-group">
                  <label>Product/Service</label>
                  <input
                    type="text"
                    value={item.product}
                    onChange={(e) => updateItem(index, 'product', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Amount</label>
                  <input type="text" value={`$${(item.quantity * item.price).toFixed(2)}`} readOnly />
                </div>

                {invoice.items.length > 1 && (
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => removeItem(index)}>
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Invoice Total</h2>
          </div>
          <div style={{ 
            fontSize: '1.5rem',
            fontWeight: '700',
            color: 'var(--gray-900)',
            textAlign: 'center',
            padding: 'var(--space-4)'
          }}>
            ${calculateTotal().toFixed(2)}
          </div>
        </div>

        {/* Actions */}
        <div style={{ 
          display: 'flex',
          gap: 'var(--space-4)',
          marginTop: 'var(--space-6)'
        }}>
          <button type="submit" className="btn btn-success">
            Create Invoice
          </button>
          <a href="/invoices" className="btn btn-secondary">
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoice;