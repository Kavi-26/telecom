import React from 'react';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-center" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '4rem',
      gap: '1rem',
      color: 'var(--text-dim)'
    }}>
      <div className="spinner" style={{
        width: '40px',
        height: '40px',
        border: '3px solid var(--bg-secondary)',
        borderTop: '3px solid var(--brand-primary)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <p>{message}</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loading;
