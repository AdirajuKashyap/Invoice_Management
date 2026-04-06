import React from 'react';
import AdminLayout from './AdminLayout';

const AdminSettings = () => {
  return (
    <AdminLayout>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '32px' }}>
        <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', color: '#1f2937' }}>Admin Settings</h2>
        
        <div style={{ display: 'grid', gap: '24px' }}>
          <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>General Settings</h3>
            <p style={{ margin: 0, color: '#6b7280' }}>Configure general admin panel settings here.</p>
          </div>
          
          <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Email Notifications</h3>
            <p style={{ margin: 0, color: '#6b7280' }}>Configure email notification settings for admin alerts.</p>
          </div>
          
          <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>System Status</h3>
            <p style={{ margin: 0, color: '#6b7280' }}>View system health and status information.</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
