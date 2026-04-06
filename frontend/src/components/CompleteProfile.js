import React, { useState } from 'react';

const CompleteProfile = () => {
  const [formData, setFormData] = useState({
    company_name: '',
    role: 'user'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        window.location.href = '/dashboard';
      } else {
        setError(data.detail || 'Failed to update profile');
      }

    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-6)'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '480px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: '800',
            marginBottom: '0.5rem'
          }}>
            Complete Your Profile
          </h1>
          <p style={{ color: 'var(--gray-500)' }}>
            Just a few more details to get started
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* Company */}
          <div className="form-group">
            <label>Company Name</label>
            <input
              type="text"
              value={formData.company_name}
              onChange={(e) =>
                setFormData({ ...formData, company_name: e.target.value })
              }
              placeholder="Enter your company name"
              required
            />
          </div>

          {/* Role */}
          <div className="form-group">
            <label>Role</label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 'var(--space-2)' }}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;