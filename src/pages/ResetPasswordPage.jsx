import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { C } from '../tokens';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleReset = async () => {
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Outfit, sans-serif',
      padding: '24px'
    }}>
      <div style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        padding: 40,
        width: '100%',
        maxWidth: 440
      }}>
        <h2 style={{ color: C.text, fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
          Set new password
        </h2>
        <p style={{ color: C.sub, fontSize: 14, marginBottom: 32 }}>
          Enter your new password below.
        </p>

        {success ? (
          <div style={{ color: C.teal, textAlign: 'center', fontSize: 15 }}>
            Password updated! Redirecting to login...
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: C.sub, fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>
                NEW PASSWORD
              </label>
              <div style={{ position: 'relative', marginTop: 8 }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  style={{
                    width: '100%',
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 10,
                    padding: '14px 44px 14px 16px',
                    color: C.text,
                    fontSize: 15,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: C.muted }}
                >
                  👁
                </span>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ color: C.sub, fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>
                CONFIRM PASSWORD
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat new password"
                style={{
                  width: '100%',
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  padding: '14px 16px',
                  color: C.text,
                  fontSize: 15,
                  outline: 'none',
                  marginTop: 8,
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {error && (
              <div style={{ color: C.red, fontSize: 13, marginBottom: 16 }}>{error}</div>
            )}

            <button
              onClick={handleReset}
              disabled={loading}
              style={{
                width: '100%',
                background: C.grad,
                border: 'none',
                borderRadius: 10,
                padding: '14px',
                color: '#fff',
                fontSize: 16,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Updating...' : 'Update Password →'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
