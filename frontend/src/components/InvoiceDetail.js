import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [razorpayKey, setRazorpayKey] = useState('rzp_test_SXj61H0ORoQbYU');

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setInvoice(data);
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      const response = await fetch(`/api/invoices/${id}/status?status=${newStatus}`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        fetchInvoice();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const downloadPDF = async () => {
    try {
      const response = await fetch(`/api/invoices/${id}/pdf`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        alert('Error downloading PDF');
        return;
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice_${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF');
    }
  };

  const handlePayment = async () => {
    try {
      const response = await fetch(`/api/invoices/${id}/pay`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        alert('Error creating payment order');
        return;
      }

      const orderData = await response.json();

      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Invoice Payment',
        description: `Payment for Invoice #${id}`,
        order_id: orderData.order_id,
        handler: async function (response) {
          const verifyData = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            invoice_id: id
          };

          try {
            const verifyRes = await fetch('/api/invoices/verify-payment', {
              method: 'POST',
              headers: getAuthHeaders(),
              body: JSON.stringify(verifyData)
            });

            const verifyResult = await verifyRes.json();

            if (verifyResult.status === 'success') {
              alert('Payment successful! Invoice marked as paid.');
              fetchInvoice();
            } else {
              alert('Payment verification failed.');
            }
          } catch (error) {
            console.error('Verification error:', error);
            alert('Error verifying payment.');
          }
        },
        theme: { color: '#3399cc' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      rzp.on('payment.failed', function (response) {
        alert('Payment failed: ' + response.error.description);
      });

    } catch (error) {
      console.error('Error initiating payment:', error);
      alert('Error creating payment.');
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

  if (loading) return <div>Loading...</div>;
  if (!invoice) return <div>Invoice not found</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Invoice #{invoice.id}</h2>
        <div>
          <button className="btn btn-secondary" onClick={() => navigate('/invoices')}>
            Back to Invoices
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <p><strong>Client:</strong> {invoice.client_name || `Client #${invoice.client_id}`}</p>
            <p><strong>Status:</strong> <span className={getStatusClass(invoice.status)}>{invoice.status}</span></p>
            <p><strong>Created:</strong> {new Date(invoice.created_at).toLocaleDateString()}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p><strong>Subtotal:</strong> ${invoice.subtotal}</p>
            <p><strong>Tax:</strong> ${invoice.tax}</p>
            <p><strong>Total:</strong> ${invoice.total}</p>
          </div>
        </div>

        <h3>Items</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Tax</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items?.map(item => (
              <tr key={item.id}>
                <td>{item.product}</td>
                <td>{item.quantity}</td>
                <td>${item.price}</td>
                <td>${item.tax}</td>
                <td>${item.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Actions</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={downloadPDF}>
            Download PDF
          </button>
          
          {invoice.status === 'draft' && (
            <button className="btn btn-success" onClick={() => updateStatus('sent')}>
              Mark as Sent
            </button>
          )}
          
          {invoice.status === 'sent' && (
            <>
              <button className="btn btn-success" onClick={() => updateStatus('paid')}>
                Mark as Paid (Manual)
              </button>
              <button className="btn btn-primary" onClick={handlePayment} style={{backgroundColor: '#3399cc'}}>
                Pay with Razorpay 💳
              </button>
            </>
          )}
          
          {invoice.status === 'paid' && (
            <span style={{color: '#2ecc71', fontWeight: 'bold', fontSize: '18px'}}>✓ Paid</span>
          )}
          
          {invoice.status !== 'draft' && (
            <button className="btn btn-secondary" onClick={() => updateStatus('draft')}>
              Revert to Draft
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
