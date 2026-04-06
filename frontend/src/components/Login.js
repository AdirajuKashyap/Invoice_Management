import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [firebaseLoading, setFirebaseLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        window.location.href = '/';
      } else {
        setError(data.detail || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  const handleFirebaseLogin = async () => {
    setError("");
    setFirebaseLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // 🔥 Get real Firebase ID token
      const idToken = await user.getIdToken();

      // Send to backend
      const response = await fetch('/api/auth/firebase-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: idToken })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.access_token);

        if (!data.profile_complete) {
          window.location.href = '/complete-profile';
        } else {
          window.location.href = '/dashboard';
        }
      }

    } catch (err) {
      setError(err.message || 'Firebase login error');
    } finally {
      setFirebaseLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left Side - Information */}
      <div style={{
        flex: '1',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '3rem',
        color: 'white'
      }}>
        <div style={{ maxWidth: '480px' }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '800',
            marginBottom: '1.5rem',
            letterSpacing: '-0.025em'
          }}>
            InvoicePro
          </h1>
          <p style={{
            fontSize: '1.25rem',
            marginBottom: '2rem',
            opacity: '0.9',
            lineHeight: '1.6'
          }}>
            Professional invoicing made simple. Create, manage, and track invoices effortlessly.
          </p>

          <div style={{ marginTop: '3rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem' }}>
              Key Features:
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>📄</span>
                <span>Professional Invoice Creation</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>👥</span>
                <span>Client Management</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>💰</span>
                <span>Payment Tracking</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>📊</span>
                <span>Financial Reports & Analytics</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🔒</span>
                <span>Secure & Encrypted Data</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '4rem', padding: '1.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>
            <p style={{ fontStyle: 'italic', opacity: '0.9' }}>
              "The best invoicing solution for small businesses. Saves me hours every week!"
            </p>
            <p style={{ marginTop: '0.75rem', fontWeight: '600' }}>
              — Sarah Johnson, Business Owner
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div style={{
        flex: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        background: '#f8fafc'
      }}>
        <div className="card" style={{
          width: '100%',
          maxWidth: '420px',
          padding: '2.5rem'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: '2rem'
            }}>
              📄
            </div>
            <h2 style={{
              fontSize: '1.875rem',
              fontWeight: '800',
              color: '#1e293b',
              marginBottom: '0.5rem'
            }}>
              Welcome Back
            </h2>
            <p style={{ color: '#64748b' }}>
              Sign in to manage your invoices
            </p>
          </div>
        
          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#dc2626',
              marginBottom: '1.5rem',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '500',
                color: '#374151'
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Enter your email"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '500',
                color: '#374151'
              }}>
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Enter your password"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.875rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginBottom: '1rem'
              }}
            >
              Sign In
            </button>
          </form>

          <div style={{ margin: '1.5rem 0', textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #e5e7eb', position: 'relative' }}>
              <span style={{
                backgroundColor: 'white',
                padding: '0 1rem',
                position: 'absolute',
                top: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: '#9ca3af',
                fontSize: '0.875rem'
              }}>
                OR
              </span>
            </div>
          </div>

          <button
            onClick={handleFirebaseLogin}
            disabled={firebaseLoading}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: firebaseLoading ? 'not-allowed' : 'pointer',
              opacity: firebaseLoading ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <span>🔥</span>
            {firebaseLoading ? 'Loading...' : 'Sign in with Firebase'}
          </button>

          <p style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            color: '#64748b',
            fontSize: '0.875rem'
          }}>
            Don't have an account?{' '}
            <Link to="/register" style={{
              color: '#667eea',
              fontWeight: '600',
              textDecoration: 'none'
            }}>
              Create account
            </Link>
          </p>

          <p style={{
            textAlign: 'center',
            marginTop: '1rem',
            color: '#94a3b8',
            fontSize: '0.875rem'
          }}>
            <Link to="/admin/login" style={{ color: '#64748b', textDecoration: 'none' }}>
              🔐 Admin Login
            </Link>
          </p>

          <p style={{
            textAlign: 'center',
            marginTop: '1rem',
            color: '#94a3b8',
            fontSize: '0.75rem'
          }}>
            By signing in, you agree to our{' '}
            <a href="#" style={{ color: '#64748b' }}>Terms of Service</a>
            {' '}and{' '}
            <a href="#" style={{ color: '#64748b' }}>Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
