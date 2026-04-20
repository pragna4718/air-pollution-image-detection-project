import React from 'react';
import { useNavigate } from 'react-router-dom';

function DataAnalysis() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', padding: '40px', textAlign: 'center' }}>
      <h1>Data Analysis</h1>
      <p style={{ maxWidth: '700px', margin: '20px auto', lineHeight: '1.7', color: '#ccc' }}>
        This section will provide deeper analysis of air quality and pollution trends. Click below to return to the dashboard.
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

export default DataAnalysis;
