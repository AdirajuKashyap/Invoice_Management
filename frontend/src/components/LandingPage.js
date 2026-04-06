import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="fade-in">
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%)',
        color: 'white',
        padding: 'var(--space-12) var(--space-6)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '800',
            marginBottom: 'var(--space-4)',
            letterSpacing: '-0.025em'
          }}>
            Invoice Management Made Simple
          </h1>
          <p style={{
            fontSize: '1.25rem',
            opacity: '0.9',
            marginBottom: 'var(--space-8)',
            lineHeight: '1.6'
          }}>
            Create professional invoices, track payments, and manage your business finances all in one place.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login" className="btn" style={{
              background: 'white',
              color: 'var(--primary-600)',
              fontSize: '1rem',
              padding: 'var(--space-4) var(--space-8)'
            }}>
              Get Started
            </Link>
            <Link to="/login" className="btn" style={{
              background: 'transparent',
              color: 'white',
              border: '2px solid white',
              fontSize: '1rem',
              padding: 'var(--space-4) var(--space-8)'
            }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ padding: 'var(--space-12) var(--space-6)', background: 'var(--gray-50)' }}>
        <div className="container">
          <h2 style={{
            textAlign: 'center',
            fontSize: '2rem',
            fontWeight: '700',
            color: 'var(--gray-900)',
            marginBottom: 'var(--space-10)'
          }}>
            Everything You Need to Manage Invoices
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--space-6)'
          }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: 'var(--radius-xl)',
                background: 'var(--primary-100)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--space-4)',
                fontSize: '1.5rem'
              }}>
                📄
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: 'var(--space-2)' }}>
                Create Invoices
              </h3>
              <p style={{ color: 'var(--gray-500)' }}>
                Generate professional invoices with your branding in seconds.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: 'var(--radius-xl)',
                background: 'var(--success-100)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--space-4)',
                fontSize: '1.5rem'
              }}>
                👥
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: 'var(--space-2)' }}>
                Manage Clients
              </h3>
              <p style={{ color: 'var(--gray-500)' }}>
                Keep track of all your clients and their payment history.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: 'var(--radius-xl)',
                background: 'var(--warning-100)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--space-4)',
                fontSize: '1.5rem'
              }}>
                💳
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: 'var(--space-2)' }}>
                Online Payments
              </h3>
              <p style={{ color: 'var(--gray-500)' }}>
                Accept payments online with Razorpay integration.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: 'var(--radius-xl)',
                background: 'var(--danger-100)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--space-4)',
                fontSize: '1.5rem'
              }}>
                📊
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: 'var(--space-2)' }}>
                Track Finances
              </h3>
              <p style={{ color: 'var(--gray-500)' }}>
                Get insights into your business with real-time dashboards.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: 'var(--radius-xl)',
                background: 'var(--primary-50)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--space-4)',
                fontSize: '1.5rem'
              }}>
                📱
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: 'var(--space-2)' }}>
                PDF Downloads
              </h3>
              <p style={{ color: 'var(--gray-500)' }}>
                Download and share professional PDF invoices instantly.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: 'var(--radius-xl)',
                background: 'var(--success-50)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--space-4)',
                fontSize: '1.5rem'
              }}>
                🔒
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: 'var(--space-2)' }}>
                Secure & Private
              </h3>
              <p style={{ color: 'var(--gray-500)' }}>
                Your data is protected with enterprise-grade security.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={{
        padding: 'var(--space-12) var(--space-6)',
        textAlign: 'center',
        background: 'white'
      }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: 'var(--gray-900)',
          marginBottom: 'var(--space-4)'
        }}>
          Ready to Get Started?
        </h2>
        <p style={{
          fontSize: '1.125rem',
          color: 'var(--gray-500)',
          marginBottom: 'var(--space-8)',
          maxWidth: '600px',
          margin: '0 auto var(--space-8)'
        }}>
          Join thousands of businesses managing their invoices efficiently.
        </p>
        <Link to="/login" className="btn btn-primary" style={{
          fontSize: '1rem',
          padding: 'var(--space-4) var(--space-8)'
        }}>
          Start Free Trial
        </Link>
      </div>

      {/* Footer */}
      <footer style={{
        background: 'var(--gray-900)',
        color: 'var(--gray-400)',
        padding: 'var(--space-8) var(--space-6)',
        textAlign: 'center'
      }}>
        <p>&copy; 2024 Invoice Manager. All rights reserved.</p>
        <div style={{ marginTop: '16px' }}>
          <Link to="/admin/login" style={{ color: '#6b7280', fontSize: '14px', textDecoration: 'none' }}>
            🔐 Admin Login
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
