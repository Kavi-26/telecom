import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Wifi, AlertCircle, Lock, User, ChevronRight } from 'lucide-react';
import './Login.css';
import loginBg from '../assets/login-bg.png';
import logo from '../assets/logo.png';

const ROLE_REDIRECTS = {
  admin: '/dashboard',
  noc_manager: '/noc-manager',
  noc_supervisor: '/noc-supervisor',
  ran_engineer: '/ran',
  core_engineer: '/core',
  ip_engineer: '/transport',
  analyst: '/reports',
  operator: '/dashboard',
};

const NetworkBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resize);
    resize();

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.radius = Math.random() * 2 + 1;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 212, 255, 0.6)';
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(0, 212, 255, 1)';
        ctx.fill();
        ctx.shadowBlur = 0; // reset for lines
      }
    }

    const init = () => {
      particles = [];
      const particleCount = Math.floor((canvas.width * canvas.height) / 12000);
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };
    
    init();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 160) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 212, 255, ${0.2 * (1 - distance/160)})`;
            ctx.lineWidth = 1.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }} />;
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [resetToken, setResetToken] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.username, form.password);
      navigate(ROLE_REDIRECTS[user.role] || '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setForgotMsg('');
    setResetToken('');
    try {
      const { default: api } = await import('../api/axios');
      const { data } = await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotMsg(data.message);
      if (data.resetToken) setResetToken(data.resetToken);
    } catch {
      setForgotMsg('Error sending reset link.');
    }
  };


  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="grid-lines" />
        <div className="scanner-line" />
      </div>
      <NetworkBackground />

      <div className="login-container">
        <div className="login-brand">
          <div className="brand-icon">
            <img src={logo} alt="TelcoVision Logo" style={{ width: '100%', height: '100%', borderRadius: 'inherit' }} />
          </div>
          <div>
            <h1 className="brand-title">TelcoVision</h1>
            <p className="brand-subtitle">Network Element Monitoring Platform</p>
          </div>
        </div>

        <div className="login-card">
          {!forgotMode ? (
            <>
              <div className="login-card-header">
                <h2>Welcome back</h2>
                <p>Sign in to access your network dashboard</p>
              </div>

              {error && (
                <div className="alert alert-error">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="login-form">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-icon-wrapper">
                    <User size={16} className="input-icon" />
                    <input
                      type="text"
                      className="form-input with-icon"
                      placeholder="Enter your email"
                      value={form.username}
                      onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                      required
                      id="login-username"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-icon-wrapper">
                    <Lock size={16} className="input-icon" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      className="form-input with-icon with-suffix"
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      required
                      id="login-password"
                      autoComplete="current-password"
                    />
                    <button type="button" className="input-suffix" onClick={() => setShowPw(v => !v)}>
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="button" className="forgot-link" onClick={() => setForgotMode(true)}>
                  Forgot password?
                </button>

                <button
                  type="submit"
                  className="btn btn-primary login-btn"
                  disabled={loading}
                  id="login-submit"
                >
                  {loading ? <span className="spinner-sm" /> : null}
                  {loading ? 'Signing in...' : 'Sign In'}
                  {!loading && <ChevronRight size={16} />}
                </button>
              </form>

              {/* Demo section removed per user request */}
            </>
          ) : (
            <>
              <div className="login-card-header">
                <h2>Reset Password</h2>
                <p>Enter your email to receive a reset link</p>
              </div>
              {forgotMsg && (
                <div className="alert alert-info" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span>{forgotMsg}</span>
                  {resetToken && (
                    <code style={{
                      background: 'rgba(0,0,0,0.2)',
                      padding: '8px',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      wordBreak: 'break-all',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#00d2ff',
                      marginTop: '4px'
                    }}>
                      {resetToken}
                    </code>
                  )}
                </div>
              )}
              <form onSubmit={handleForgot} className="login-form">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="your@email.com"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    required
                    id="forgot-email"
                  />
                </div>
                <button type="submit" className="btn btn-primary login-btn">
                  Send Reset Link
                </button>
                <button type="button" className="forgot-link" onClick={() => setForgotMode(false)}>
                  ← Back to Login
                </button>
              </form>
            </>
          )}
        </div>

        <p className="login-footer">
          © 2026 TelcoVision · All systems monitored
        </p>
      </div>
    </div>
  );
}
