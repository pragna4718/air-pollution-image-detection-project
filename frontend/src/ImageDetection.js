import React from 'react';
import { useNavigate } from 'react-router-dom';

function ImageDetection() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', padding: '40px', textAlign: 'center' }}>
      <h1>Image Detection</h1>
      <p style={{ maxWidth: '700px', margin: '20px auto', lineHeight: '1.7', color: '#ccc' }}>
        This section will display air pollution image detection tools and results. Click below to return to the dashboard.
      </p>
      <button
        onClick={() => navigate('/')}
        style={{ padding: '12px 24px', fontSize: '16px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#2ecc71', color: '#000' }}
      >
        Back to Dashboard
      </button>
    </div>
  );
}

export default ImageDetection;
