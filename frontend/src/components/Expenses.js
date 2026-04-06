import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState({
    total_amount: 0,
    expense_count: 0,
    category_breakdown: []
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newExpense, setNewExpense] = useState({
    title: '',
    description: '',
    amount: '',
    category: 'Office',
    expense_date: new Date().toISOString().split('T')[0]
  });

  const categories = ['Office', 'Travel', 'Meals', 'Software', 'Hardware', 'Marketing', 'Other'];

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    fetchExpenses();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/expenses/', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/expenses/stats', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching expense stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/expenses/', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...newExpense,
          amount: parseFloat(newExpense.amount),
          expense_date: new Date(newExpense.expense_date).toISOString()
        })
      });
      if (response.ok) {
        const created = await response.json();
        setExpenses([created, ...expenses]);
        setNewExpense({
          title: '',
          description: '',
          amount: '',
          category: 'Office',
          expense_date: new Date().toISOString().split('T')[0]
        });
        setShowForm(false);
        fetchStats();
      }
    } catch (error) {
      console.error('Error creating expense:', error);
    }
  };

  const deleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        setExpenses(expenses.filter(e => e.id !== id));
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Office': 'var(--primary-600)',
      'Travel': 'var(--warning-600)',
      'Meals': 'var(--success-600)',
      'Software': 'var(--danger-600)',
      'Hardware': 'var(--gray-600)',
      'Marketing': 'var(--primary-700)',
      'Other': 'var(--gray-500)'
    };
    return colors[category] || 'var(--gray-500)';
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Expense Tracker</h1>
          <p style={{ color: 'var(--gray-500)', marginTop: 'var(--space-2)' }}>
            Track and manage your business expenses
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <span>{showForm ? '✕' : '+'}</span> {showForm ? 'Cancel' : 'Add Expense'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Expenses</span>
            <div className="stat-card-icon red">💸</div>
          </div>
          <div className="stat-card-value">${stats.total_amount.toFixed(2)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Expense Count</span>
            <div className="stat-card-icon blue">📊</div>
          </div>
          <div className="stat-card-value">{stats.expense_count}</div>
        </div>

        {stats.category_breakdown.slice(0, 2).map((cat) => (
          <div className="stat-card" key={cat.category}>
            <div className="stat-card-header">
              <span className="stat-card-title">{cat.category}</span>
              <div className="stat-card-icon orange">🏷️</div>
            </div>
            <div className="stat-card-value">${cat.total.toFixed(2)}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
              {cat.count} expenses
            </div>
          </div>
        ))}
      </div>

      {/* Add Expense Form */}
      {showForm && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Add New Expense</h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({...newExpense, title: e.target.value})}
                  placeholder="e.g., Office Supplies"
                  required
                />
              </div>
              <div className="form-group">
                <label>Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={newExpense.expense_date}
                  onChange={(e) => setNewExpense({...newExpense, expense_date: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea
                value={newExpense.description}
                onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                placeholder="Add details about this expense..."
                rows="2"
              />
            </div>
            <button type="submit" className="btn btn-success">Save Expense</button>
          </form>
        </div>
      )}

      {/* Category Breakdown */}
      {stats.category_breakdown.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Expenses by Category</h2>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: 'var(--space-4)'
          }}>
            {stats.category_breakdown.map((cat) => (
              <div 
                key={cat.category} 
                style={{ 
                  textAlign: 'center', 
                  padding: 'var(--space-4)', 
                  background: 'var(--gray-50)', 
                  borderRadius: 'var(--radius-lg)',
                  borderLeft: `4px solid ${getCategoryColor(cat.category)}`
                }}
              >
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-600)' }}>
                  {cat.category}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: getCategoryColor(cat.category) }}>
                  ${cat.total.toFixed(2)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                  {cat.count} expenses
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expenses List */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="card-title">Recent Expenses</h2>
          <span style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
            {expenses.length} total
          </span>
        </div>
        
        {expenses.length > 0 ? (
          <div style={{ marginTop: 'var(--space-4)' }}>
            {expenses.map((expense, index) => (
              <div 
                key={expense.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: 'var(--space-3) 0',
                  borderBottom: index < expenses.length - 1 ? '1px solid var(--gray-100)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    background: 'var(--gray-100)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem'
                  }}>
                    💸
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--gray-900)' }}>
                      {expense.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                      {expense.category} • {new Date(expense.expense_date).toLocaleDateString()}
                      {expense.description && ` • ${expense.description}`}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '700', color: 'var(--danger-600)', fontSize: '1.125rem' }}>
                      -${parseFloat(expense.amount).toFixed(2)}
                    </div>
                  </div>
                  <button 
                    className="btn btn-danger btn-sm" 
                    onClick={() => deleteExpense(expense.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
            <div className="empty-state-icon">💸</div>
            <h3>No expenses yet</h3>
            <p>Start tracking your business expenses</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              Add First Expense
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Expenses;
