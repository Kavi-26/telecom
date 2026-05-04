import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Wifi, Lock, Eye, EyeOff, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import './Login.css'; // Reuse login styles

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="login-card">
            <div className="alert alert-error">
              <AlertCircle size={20} />
              <span>Invalid or missing reset token.</span>
            </div>
            <Link to="/login" className="forgot-link" style={{ textAlign: 'center', marginTop: '20px' }}>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="grid-lines" />
      </div>

      <div className="login-container">
        <div className="login-brand">
          <div className="brand-icon">
            <Wifi size={28} />
          </div>
          <div>
            <h1 className="brand-title">Interactive</h1>
            <p className="brand-subtitle">Network Element Monitoring Platform</p>
          </div>
        </div>

        <div className="login-card">
          {success ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ color: '#00ff88', marginBottom: '16px' }}>
                <CheckCircle size={48} style={{ margin: '0 auto' }} />
              </div>
              <h2 style={{ color: 'white', marginBottom: '8px' }}>Password Reset!</h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '24px' }}>
                Your password has been successfully updated. Redirecting to login...
              </p>
              <Link to="/login" className="btn btn-primary">
                Login Now
              </Link>
            </div>
          ) : (
            <>
              <div className="login-card-header">
                <h2>New Password</h2>
                <p>Please enter your new secure password</p>
              </div>

              {error && (
                <div className="alert alert-error">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div className="input-icon-wrapper">
                    <Lock size={16} className="input-icon" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      className="form-input with-icon with-suffix"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                    <button type="button" className="input-suffix" onClick={() => setShowPw(v => !v)}>
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <div className="input-icon-wrapper">
                    <Lock size={16} className="input-icon" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      className="form-input with-icon"
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary login-btn"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Reset Password'}
                  {!loading && <ChevronRight size={16} />}
                </button>

                <Link to="/login" className="forgot-link" style={{ textAlign: 'center', display: 'block', marginTop: '16px' }}>
                  Cancel
                </Link>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
