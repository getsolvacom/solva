import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { C } from '../tokens';

export default function ShopifyCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Connecting your store...');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get('shop');
    const code = params.get('code');
    const state = params.get('state');

    if (!shop || !code) {
      setStatus('Missing required parameters. Please try again.');
      return;
    }

    // Call our serverless function to exchange the code for a token
    fetch(`/api/shopify/callback?shop=${shop}&code=${code}&state=${state}`)
      .then(res => {
        if (res.redirected) {
          navigate('/dashboard');
        } else if (res.ok) {
          navigate('/dashboard');
        } else {
          return res.json().then(data => {
            setStatus('Connection failed: ' + (data.error || 'Unknown error'));
          });
        }
      })
      .catch(() => {
        setStatus('Something went wrong. Please try again.');
      });
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Outfit, sans-serif',
      color: C.text
    }}>
      <div style={{
        width: 48,
        height: 48,
        border: `3px solid ${C.violet}`,
        borderTop: `3px solid ${C.coral}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: 24
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ fontSize: 18, color: C.sub }}>{status}</p>
    </div>
  );
}
