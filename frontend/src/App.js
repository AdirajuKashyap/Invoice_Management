import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Invoices from './components/Invoices';
import Clients from './components/Clients';
import CreateInvoice from './components/CreateInvoice';
import InvoiceDetail from './components/InvoiceDetail';
import UserProfile from './components/UserProfile';
import Expenses from './components/Expenses';
import Register from './components/Register';
import Login from './components/Login';
import CompleteProfile from './components/CompleteProfile';

// Admin Components
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import AdminUsers from './admin/AdminUsers';
import AdminCompanies from './admin/AdminCompanies';
import AdminInvoices from './admin/AdminInvoices';
import AdminSettings from './admin/AdminSettings';
import AdminChat from './admin/AdminChat';
import Chat from './components/Chat';
import AdminLayout from './admin/AdminLayout';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken'));

  useEffect(() => {
    const handleStorage = () => {
      setToken(localStorage.getItem('token'));
      setAdminToken(localStorage.getItem('adminToken'));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    window.location.href = '/';
  };

  const adminLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAdminToken(null);
    window.location.href = '/admin/login';
  };

  // Check if current path is admin path
  const isAdminPath = window.location.pathname.startsWith('/admin');

  return (
  <ToastProvider>
    <NotificationProvider>
      <div className="App">
      {/* Show user navbar only for non-admin paths */}
      {!isAdminPath && (
        <div className="navbar">
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to={token ? "/dashboard" : "/"} style={{ textDecoration: 'none', color: 'white' }}>
              <h1>📄 Invoice Manager</h1>
            </Link>
            <nav>
              {token ? (
                <>
                  <Link to="/dashboard">Dashboard</Link>
                  <Link to="/invoices">Invoices</Link>
                  <Link to="/clients">Clients</Link>
                  <Link to="/expenses">Expenses</Link>
                  <Link to="/chat">Chat</Link>
                  <Link to="/invoices/create">Create</Link>
                  <Link to="/profile">Profile</Link>
                  <button onClick={logout} className="btn btn-light" style={{ marginLeft: '16px' }}>Logout</button>
                </>
              ) : (
                <>
                  <Link to="/">Home</Link>
                  <Link to="/login" className="btn btn-primary" style={{ marginLeft: '16px' }}>Login</Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={isAdminPath ? "" : "container"} style={isAdminPath ? {} : { paddingTop: '24px', paddingBottom: '24px' }}>
        <Routes>
          {/* User Routes */}
          <Route path="/" element={token ? <Navigate to="/dashboard" /> : <LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/invoices" element={token ? <Invoices /> : <Navigate to="/login" />} />
          <Route path="/invoices/:id" element={token ? <InvoiceDetail /> : <Navigate to="/login" />} />
          <Route path="/clients" element={token ? <Clients /> : <Navigate to="/login" />} />
          <Route path="/expenses" element={token ? <Expenses /> : <Navigate to="/login" />} />
          <Route path="/chat" element={token ? <Chat /> : <Navigate to="/login" />} />
          <Route path="/invoices/create" element={token ? <CreateInvoice /> : <Navigate to="/login" />} />
          <Route path="/profile" element={token ? <UserProfile /> : <Navigate to="/login" />} />
          <Route path="/complete-profile" element={token ? <CompleteProfile /> : <Navigate to="/login" />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={adminToken ? <AdminDashboard /> : <Navigate to="/admin/login" />} />
          <Route path="/admin/users" element={adminToken ? <AdminUsers /> : <Navigate to="/admin/login" />} />
          <Route path="/admin/companies" element={adminToken ? <AdminCompanies /> : <Navigate to="/admin/login" />} />
          <Route 
            path="/admin/chat" 
            element={
              adminToken ? (
                <AdminLayout>
                  <AdminChat />
                </AdminLayout>
              ) : (
                <Navigate to="/admin/login" />
              )
            } 
          />
          <Route path="/admin/invoices" element={adminToken ? <AdminInvoices /> : <Navigate to="/admin/login" />} />
          <Route path="/admin/settings" element={adminToken ? <AdminSettings /> : <Navigate to="/admin/login" />} />
        </Routes>
      </div>
      </div>
    </NotificationProvider>
  </ToastProvider>
);
}

export default App;
