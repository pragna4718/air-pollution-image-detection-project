import React from 'react';

const AQIChart = ({ data }) => {
  if (!data || typeof data !== 'object') {
    return <p>No data available for visualization.</p>;
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
      <h3>AQI Visualization</h3>
      <pre style={{ fontSize: '12px', overflow: 'auto', maxHeight: '300px' }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

export default AQIChart;
