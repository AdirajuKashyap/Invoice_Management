import React, { useState } from 'react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    company_name: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Registration successful! Please login.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(data.detail || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="fade-in" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: 'var(--gray-900)', marginBottom: 'var(--space-2)' }}>
            Create Account
          </h1>
          <p style={{ color: 'var(--gray-500)' }}>
            Start managing your invoices today
          </p>
        </div>
      
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
            {error}
          </div>
        )}
        
        {success && (
          <div className="alert alert-success" style={{ marginBottom: 'var(--space-4)' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="Create a password (min 6 characters)"
              required
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label>Company Name</label>
            <input
              type="text"
              value={formData.company_name}
              onChange={(e) => setFormData({...formData, company_name: e.target.value})}
              placeholder="Enter your company name"
              required
            />
          </div>

          <div className="form-group">
            <label>Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--space-2)' }}>
            Create Account
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 'var(--space-6)', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: 'var(--primary-600)', fontWeight: '600', textDecoration: 'none' }}>
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
