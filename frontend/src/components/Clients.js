import React, { useState, useEffect, useCallback } from 'react';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    gst_number: '',
    pan_number: ''
  });

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  });

  const fetchClients = useCallback(async () => {
    try {
      const response = await fetch('/api/clients/', {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/clients/', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newClient),
      });
      if (response.ok) {
        const created = await response.json();
        setClients([...clients, created]);
        setNewClient({
          name: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India',
          gst_number: '',
          pan_number: ''
        });
        setShowForm(false);
        setSelectedClient(null);
      }
    } catch (error) {
      console.error('Error creating client:', error);
    }
  };

  const deleteClient = async (id) => {
    if (!window.confirm('Delete this client?')) return;
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        setClients(clients.filter((c) => c.id !== id));
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to delete client');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Network error while deleting client');
    }
  };

  const uploadLogo = async (clientId, file) => {
    setUploadLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch(`/api/clients/${clientId}/logo`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        alert('Logo uploaded successfully!');
        fetchClients();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to upload logo');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Network error while uploading logo');
    } finally {
      setUploadLoading(false);
    }
  };

  const uploadSignature = async (clientId, file) => {
    setUploadLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch(`/api/clients/${clientId}/signature`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        alert('Signature uploaded successfully!');
        fetchClients();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to upload signature');
      }
    } catch (error) {
      console.error('Error uploading signature:', error);
      alert('Network error while uploading signature');
    } finally {
      setUploadLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Clients</h1>
          <p style={{ color: 'var(--gray-500)', marginTop: 'var(--space-2)' }}>
            Manage your client directory
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <span>{showForm ? '✕' : '+'}</span> {showForm ? 'Cancel' : 'Add Client'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Add New Client</h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                placeholder="Enter client name"
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                placeholder="Enter client email"
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={newClient.phone}
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea
                value={newClient.address}
                onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                placeholder="Enter street address"
                rows="2"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  value={newClient.city}
                  onChange={(e) => setNewClient({ ...newClient, city: e.target.value })}
                  placeholder="City"
                />
              </div>
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  value={newClient.state}
                  onChange={(e) => setNewClient({ ...newClient, state: e.target.value })}
                  placeholder="State"
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Pincode</label>
                <input
                  type="text"
                  value={newClient.pincode}
                  onChange={(e) => setNewClient({ ...newClient, pincode: e.target.value })}
                  placeholder="Pincode"
                />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  value={newClient.country}
                  onChange={(e) => setNewClient({ ...newClient, country: e.target.value })}
                  placeholder="Country"
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>GST Number</label>
                <input
                  type="text"
                  value={newClient.gst_number}
                  onChange={(e) => setNewClient({ ...newClient, gst_number: e.target.value })}
                  placeholder="GST Number"
                />
              </div>
              <div className="form-group">
                <label>PAN Number</label>
                <input
                  type="text"
                  value={newClient.pan_number}
                  onChange={(e) => setNewClient({ ...newClient, pan_number: e.target.value })}
                  placeholder="PAN Number"
                />
              </div>
            </div>
            <button type="submit" className="btn btn-success">Save Client</button>
          </form>
        </div>
      )}

      {/* Clients List */}
      <div className="card">
        {clients.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <h3>No clients yet</h3>
            <p>Start by adding one</p>
            <button 
              onClick={() => setShowForm(true)} 
              className="btn btn-primary btn-sm"
            >
              Add First Client
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {client.logo_path ? (
                          <img 
                            src={`http://localhost:8000/${client.logo_path}`} 
                            alt="" 
                            style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #e5e7eb' }}
                          />
                        ) : (
                          <div style={{ width: '40px', height: '40px', background: '#f3f4f6', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                            🏢
                          </div>
                        )}
                        <div>
                          <strong>{client.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                            ID: #{client.id} | {client.city}{client.city && client.state ? ', ' : ''}{client.state}
                          </div>
                          {client.phone && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                              📞 {client.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      {client.email || <span style={{ color: 'var(--gray-400)' }}>No email</span>}
                      {client.gst_number && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                          GST: {client.gst_number}
                        </div>
                      )}
                    </td>
                    <td>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => setSelectedClient(client)}
                        style={{ marginRight: '0.5rem' }}
                      >
                        View Bank
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteClient(client.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Bank Details Modal */}
      {selectedClient && (
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
        }} onClick={() => setSelectedClient(null)}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '700' }}>
              🏦 Bank Details - {selectedClient.name}
            </h3>
            
            {/* Logo Display */}
            {selectedClient.logo_path && (
              <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <label style={{ fontWeight: '600', color: 'var(--gray-600)', display: 'block', marginBottom: '0.5rem' }}>
                  Client Logo
                </label>
                <img 
                  src={`http://localhost:8000/${selectedClient.logo_path}`} 
                  alt="Client Logo" 
                  style={{ maxWidth: '150px', maxHeight: '100px', objectFit: 'contain', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
              </div>
            )}

            {/* Signature Display */}
            {selectedClient.signature_path && (
              <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <label style={{ fontWeight: '600', color: 'var(--gray-600)', display: 'block', marginBottom: '0.5rem' }}>
                  Client Signature
                </label>
                <img 
                  src={`http://localhost:8000/${selectedClient.signature_path}`} 
                  alt="Client Signature" 
                  style={{ maxWidth: '200px', maxHeight: '80px', objectFit: 'contain', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
              </div>
            )}
            
            {/* Logo Upload */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontWeight: '600', color: 'var(--gray-600)', display: 'block', marginBottom: '0.5rem' }}>
                Upload Logo
              </label>
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.gif,.bmp,.webp"
                onChange={(e) => e.target.files[0] && uploadLogo(selectedClient.id, e.target.files[0])}
                disabled={uploadLoading}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                Allowed: PNG, JPG, JPEG, GIF, BMP, WEBP (Max 5MB)
              </p>
            </div>

            {/* Signature Upload */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: '600', color: 'var(--gray-600)', display: 'block', marginBottom: '0.5rem' }}>
                Upload Signature
              </label>
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.gif,.bmp,.webp"
                onChange={(e) => e.target.files[0] && uploadSignature(selectedClient.id, e.target.files[0])}
                disabled={uploadLoading}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                Allowed: PNG, JPG, JPEG, GIF, BMP, WEBP (Max 5MB)
              </p>
            </div>

            <hr style={{ margin: '1.5rem 0', borderColor: '#e5e7eb' }} />
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontWeight: '600', color: 'var(--gray-600)' }}>Bank Name</label>
              <p style={{ fontSize: '1.1rem', marginTop: '0.25rem' }}>
                {selectedClient.bank_name || 'N/A'}
              </p>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontWeight: '600', color: 'var(--gray-600)' }}>Account Number</label>
              <p style={{ fontSize: '1.1rem', marginTop: '0.25rem', fontFamily: 'monospace' }}>
                {selectedClient.bank_account_number || 'N/A'}
              </p>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontWeight: '600', color: 'var(--gray-600)' }}>IFSC Code</label>
              <p style={{ fontSize: '1.1rem', marginTop: '0.25rem', fontFamily: 'monospace' }}>
                {selectedClient.bank_ifsc || 'N/A'}
              </p>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontWeight: '600', color: 'var(--gray-600)' }}>Branch</label>
              <p style={{ fontSize: '1.1rem', marginTop: '0.25rem' }}>
                {selectedClient.bank_branch || 'N/A'}
              </p>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: '600', color: 'var(--gray-600)' }}>UPI ID</label>
              <p style={{ fontSize: '1.1rem', marginTop: '0.25rem', fontFamily: 'monospace', color: 'var(--primary-600)' }}>
                {selectedClient.upi_id || 'N/A'}
              </p>
            </div>
            
            <button 
              className="btn btn-primary" 
              onClick={() => setSelectedClient(null)}
              style={{ width: '100%' }}
              disabled={uploadLoading}
            >
              {uploadLoading ? 'Uploading...' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
