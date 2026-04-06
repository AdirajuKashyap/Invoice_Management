import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [bankForm, setBankForm] = useState({
    bank_name: '',
    bank_account_number: '',
    bank_ifsc: '',
    bank_branch: '',
    upi_id: ''
  });
  const [savingBank, setSavingBank] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: ''
  });
  const [savingCompany, setSavingCompany] = useState(false);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    fetchUserProfile();
    fetchCompany();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setBankForm({
          bank_name: data.bank_name || '',
          bank_account_number: data.bank_account_number || '',
          bank_ifsc: data.bank_ifsc || '',
          bank_branch: data.bank_branch || '',
          upi_id: data.upi_id || ''
        });
      } else {
        setError('Failed to load user profile');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompany = async () => {
    try {
      const response = await fetch('/api/companies/me', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setCompany(data);
        setCompanyForm({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || ''
        });
      }
    } catch (err) {
      console.error('Error fetching company:', err);
    }
  };

  const handleCompanyLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/companies/me/logo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setCompany({...company, logo_path: data.logo_path});
      } else {
        setError('Failed to upload company logo');
      }
    } catch (err) {
      setError('Network error during upload');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleCompanySignatureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/companies/me/signature', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setCompany({...company, signature_path: data.signature_path});
      } else {
        setError('Failed to upload company signature');
      }
    } catch (err) {
      setError('Network error during upload');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/auth/me/profile-picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        setError('Failed to upload profile picture');
      }
    } catch (err) {
      setError('Network error during upload');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleBankUpdate = async (e) => {
    e.preventDefault();
    setSavingBank(true);

    try {
      const response = await fetch('/api/auth/me/bank-details', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(bankForm)
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        alert('Bank details updated successfully!');
      } else {
        setError('Failed to update bank details');
      }
    } catch (err) {
      setError('Network error during update');
    } finally {
      setSavingBank(false);
    }
  };

  const handleCompanyUpdate = async (e) => {
    e.preventDefault();
    setSavingCompany(true);

    try {
      const response = await fetch('/api/companies/me', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(companyForm)
      });

      if (response.ok) {
        const data = await response.json();
        setCompany(data);
        alert('Company details updated successfully!');
      } else {
        setError('Failed to update company details');
      }
    } catch (err) {
      setError('Network error during update');
    } finally {
      setSavingCompany(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  if (error) return <div style={{ padding: '40px', color: '#c62828' }}>{error}</div>;

  const getProfilePictureUrl = () => {
    if (user?.profile_picture) {
      return `http://localhost:8000/${user.profile_picture}`;
    }
    return null;
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ marginBottom: '30px' }}>User Profile</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Profile Card */}
        <div style={{ 
          background: 'white', 
          padding: '30px', 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              {getProfilePictureUrl() ? (
                <img 
                  src={getProfilePictureUrl()} 
                  alt="Profile" 
                  style={{ 
                    width: '120px', 
                    height: '120px', 
                    borderRadius: '50%', 
                    objectFit: 'cover',
                    border: '3px solid #3498db'
                  }} 
                />
              ) : (
                <div style={{ 
                  width: '120px', 
                  height: '120px', 
                  borderRadius: '50%', 
                  backgroundColor: '#3498db',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '48px',
                  fontWeight: 'bold',
                  margin: '0 auto'
                }}>
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              
              <label style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                background: '#3498db',
                color: 'white',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '18px'
              }}>
                📷
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleProfilePictureUpload}
                  style={{ display: 'none' }}
                  disabled={uploadLoading}
                />
              </label>
            </div>
            
            {uploadLoading && (
              <p style={{ color: '#3498db', marginTop: '10px' }}>Uploading...</p>
            )}
            
            <h3 style={{ marginTop: '20px', marginBottom: '5px' }}>{user?.email}</h3>
            <p style={{ color: '#7f8c8d', textTransform: 'capitalize' }}>Role: {user?.role || 'Not set'}</p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '10px 0', fontWeight: 'bold', color: '#555' }}>User ID</td>
                <td style={{ padding: '10px 0', color: '#333' }}>#{user?.id}</td>
              </tr>
              <tr style={{ borderTop: '1px solid #eee' }}>
                <td style={{ padding: '10px 0', fontWeight: 'bold', color: '#555' }}>Email</td>
                <td style={{ padding: '10px 0', color: '#333' }}>{user?.email}</td>
              </tr>
              <tr style={{ borderTop: '1px solid #eee' }}>
                <td style={{ padding: '10px 0', fontWeight: 'bold', color: '#555' }}>Role</td>
                <td style={{ padding: '10px 0' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    fontWeight: 'bold',
                    background: user?.role === 'admin' ? '#e8f5e9' : '#e3f2fd',
                    color: user?.role === 'admin' ? '#2e7d32' : '#1565c0'
                  }}>
                    {user?.role || 'Not set'}
                  </span>
                </td>
              </tr>
              <tr style={{ borderTop: '1px solid #eee' }}>
                <td style={{ padding: '10px 0', fontWeight: 'bold', color: '#555' }}>Company ID</td>
                <td style={{ padding: '10px 0', color: '#333' }}>#{user?.company_id}</td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
            <button 
              onClick={handleLogout}
              style={{
                flex: 1,
                padding: '12px 20px',
                background: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Logout
            </button>
            <button 
              onClick={() => navigate('/')}
              style={{
                flex: 1,
                padding: '12px 20px',
                background: '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Bank Details Card */}
        <div style={{ 
          background: 'white', 
          padding: '30px', 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
        }}>
          <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>
            🏦 Bank Account Details
          </h3>
          
          <form onSubmit={handleBankUpdate}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
                Bank Name
              </label>
              <input
                type="text"
                value={bankForm.bank_name}
                onChange={(e) => setBankForm({...bankForm, bank_name: e.target.value})}
                placeholder="e.g., HDFC Bank"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
                Account Number
              </label>
              <input
                type="text"
                value={bankForm.bank_account_number}
                onChange={(e) => setBankForm({...bankForm, bank_account_number: e.target.value})}
                placeholder="e.g., 123456789012"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
                IFSC Code
              </label>
              <input
                type="text"
                value={bankForm.bank_ifsc}
                onChange={(e) => setBankForm({...bankForm, bank_ifsc: e.target.value})}
                placeholder="e.g., HDFC0001234"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
                Branch
              </label>
              <input
                type="text"
                value={bankForm.bank_branch}
                onChange={(e) => setBankForm({...bankForm, bank_branch: e.target.value})}
                placeholder="e.g., Main Branch"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
                UPI ID
              </label>
              <input
                type="text"
                value={bankForm.upi_id}
                onChange={(e) => setBankForm({...bankForm, upi_id: e.target.value})}
                placeholder="e.g., username@upi"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={savingBank}
              style={{
                width: '100%',
                padding: '12px',
                background: savingBank ? '#95a5a6' : '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: savingBank ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {savingBank ? 'Saving...' : '💾 Save Bank Details'}
            </button>
          </form>
        </div>

        {/* Company Contact Details Card */}
        <div style={{ 
          background: 'white', 
          padding: '30px', 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>
            🏢 Company Details
          </h3>
          
          <form onSubmit={handleCompanyUpdate}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
                Company Name
              </label>
              <input
                type="text"
                value={companyForm.name}
                onChange={(e) => setCompanyForm({...companyForm, name: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
                Email
              </label>
              <input
                type="email"
                value={companyForm.email}
                onChange={(e) => setCompanyForm({...companyForm, email: e.target.value})}
                placeholder="company@example.com"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
                Phone
              </label>
              <input
                type="text"
                value={companyForm.phone}
                onChange={(e) => setCompanyForm({...companyForm, phone: e.target.value})}
                placeholder="+91 98765 43210"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
                Address
              </label>
              <input
                type="text"
                value={companyForm.address}
                onChange={(e) => setCompanyForm({...companyForm, address: e.target.value})}
                placeholder="123 Main Street"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
                  City
                </label>
                <input
                  type="text"
                  value={companyForm.city}
                  onChange={(e) => setCompanyForm({...companyForm, city: e.target.value})}
                  placeholder="Mumbai"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
                  State
                </label>
                <input
                  type="text"
                  value={companyForm.state}
                  onChange={(e) => setCompanyForm({...companyForm, state: e.target.value})}
                  placeholder="Maharashtra"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingCompany}
              style={{
                width: '100%',
                padding: '12px',
                background: savingCompany ? '#95a5a6' : '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: savingCompany ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {savingCompany ? 'Saving...' : '💾 Save Company Details'}
            </button>
          </form>
        </div>

        {/* Company Branding Card */}
        <div style={{ 
          background: 'white', 
          padding: '30px', 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>
            🏢 Company Branding (For PDF)
          </h3>
          
          {/* Company Logo */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#555' }}>
              Company Logo
            </label>
            {company?.logo_path ? (
              <img 
                src={`http://localhost:8000/${company.logo_path}`}
                alt="Company Logo" 
                style={{ 
                  maxWidth: '120px', 
                  maxHeight: '80px', 
                  objectFit: 'contain',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '5px',
                  marginBottom: '10px'
                }} 
              />
            ) : (
              <div style={{
                width: '120px',
                height: '80px',
                background: '#f5f5f5',
                border: '2px dashed #ddd',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999',
                fontSize: '12px',
                marginBottom: '10px'
              }}>
                No Logo
              </div>
            )}
            <label style={{
              display: 'inline-block',
              padding: '8px 16px',
              background: '#3498db',
              color: 'white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px'
            }}>
              📁 Upload Logo
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleCompanyLogoUpload}
                style={{ display: 'none' }}
                disabled={uploadLoading}
              />
            </label>
          </div>

          {/* Company Signature */}
          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#555' }}>
              Company Signature (for PDF)
            </label>
            {company?.signature_path ? (
              <img 
                src={`http://localhost:8000/${company.signature_path}`}
                alt="Company Signature" 
                style={{ 
                  maxWidth: '150px', 
                  maxHeight: '60px', 
                  objectFit: 'contain',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '5px',
                  marginBottom: '10px',
                  background: 'white'
                }} 
              />
            ) : (
              <div style={{
                width: '150px',
                height: '60px',
                background: '#f5f5f5',
                border: '2px dashed #ddd',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999',
                fontSize: '12px',
                marginBottom: '10px'
              }}>
                No Signature
              </div>
            )}
            <label style={{
              display: 'inline-block',
              padding: '8px 16px',
              background: '#27ae60',
              color: 'white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px'
            }}>
              ✍️ Upload Signature
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleCompanySignatureUpload}
                style={{ display: 'none' }}
                disabled={uploadLoading}
              />
            </label>
          </div>
          
          {uploadLoading && (
            <p style={{ color: '#3498db', marginTop: '15px', fontSize: '13px' }}>
              Uploading...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
