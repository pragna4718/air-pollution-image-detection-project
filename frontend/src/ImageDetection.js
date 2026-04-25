import React, { useState } from "react";
import backgroundImage from './assets/backgroung2.jpg';

function ImageDetection() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:5000/predict-image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to process image. Please try again.");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "An error occurred while processing your image.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const cardStyle = {
    backgroundColor: "#f5f5f5",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
    marginBottom: "20px",
  };

  const containerWrapperStyle = {
    minHeight: "100vh",
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    paddingTop: '40px',
    paddingBottom: '40px',
  };

  const contentWrapperStyle = {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(5px)',
    borderRadius: '12px',
  };

  const titleStyle = {
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "24px",
    color: "#fff",
  };

  const inputContainerStyle = {
    marginBottom: "20px",
  };

  const fileInputStyle = {
    padding: "10px",
    fontSize: "14px",
    borderRadius: "6px",
    border: "2px solid #e0e0e0",
    width: "100%",
    boxSizing: "border-box",
    cursor: "pointer",
  };

  const previewStyle = {
    marginTop: "16px",
    marginBottom: "16px",
    borderRadius: "8px",
    maxWidth: "100%",
    maxHeight: "300px",
    objectFit: "contain",
  };

  const buttonStyle = {
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: "600",
    border: "none",
    borderRadius: "6px",
    cursor: loading ? "not-allowed" : "pointer",
    backgroundColor: loading ? "#bdc3c7" : "#3498db",
    color: "#ffffff",
    transition: "background-color 0.3s",
    marginRight: "10px",
    minWidth: "140px",
  };

  const resetButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#95a5a6",
    marginRight: "0",
  };

  const errorStyle = {
    backgroundColor: "#fee",
    border: "1px solid #f99",
    color: "#c33",
    padding: "12px 16px",
    borderRadius: "6px",
    marginBottom: "16px",
  };

  const resultLabelStyle = {
    fontWeight: "bold",
    color: "#34495e",
    marginTop: "12px",
    marginBottom: "4px",
    fontSize: "14px",
  };

  const resultValueStyle = {
    color: "#2c3e50",
    fontSize: "16px",
    marginBottom: "12px",
  };

  const confidenceBarStyle = {
    backgroundColor: "#ecf0f1",
    borderRadius: "4px",
    height: "8px",
    marginTop: "8px",
    overflow: "hidden",
  };

  const confidenceFillStyle = {
    backgroundColor: "#27ae60",
    height: "100%",
    width: `${result?.confidence * 100 || 0}%`,
    transition: "width 0.3s",
  };

  const loadingSpinnerStyle = {
    display: "inline-block",
    width: "20px",
    height: "20px",
    border: "3px solid #ecf0f1",
    borderRadius: "50%",
    borderTopColor: "#3498db",
    animation: "spin 0.8s linear infinite",
  };

  return (
    <div style={containerWrapperStyle}>
      <div style={contentWrapperStyle}>
        <style>
          {`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}
        </style>

        <div style={cardStyle}>
          <h1 style={titleStyle}>🖼️ Image Detection</h1>

          <div style={inputContainerStyle}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#2c3e50" }}>
              Select an image to detect air pollution:
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={fileInputStyle}
              disabled={loading}
            />
          </div>

        {preview && (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "14px", color: "#7f8c8d", marginBottom: "8px" }}>
              📸 Preview:
            </p>
            <img src={preview} alt="Preview" style={previewStyle} />
          </div>
        )}

        {error && (
          <div style={errorStyle}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            style={buttonStyle}
            onMouseEnter={(e) => {
              if (!loading && file) e.target.style.backgroundColor = "#2980b9";
            }}
            onMouseLeave={(e) => {
              if (!loading && file) e.target.style.backgroundColor = "#3498db";
            }}
          >
            {loading ? (
              <>
                <div style={loadingSpinnerStyle}></div> Processing...
              </>
            ) : (
              "Upload & Detect"
            )}
          </button>

          {result && (
            <button
              onClick={handleReset}
              style={resetButtonStyle}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#7f8c8d";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#95a5a6";
              }}
            >
              Upload Another
            </button>
          )}
        </div>
      </div>

      {result && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#2c3e50", marginBottom: "20px" }}>
            ✓ Detection Results
          </h2>

          <div style={{ backgroundColor: "#f8f9fa", padding: "16px", borderRadius: "6px", marginBottom: "16px" }}>
            <div style={resultLabelStyle}>Prediction</div>
            <div style={{ ...resultValueStyle, fontSize: "18px", fontWeight: "600", color: "#3498db" }}>
              {result.prediction}
            </div>
          </div>

          <div>
            <div style={resultLabelStyle}>Confidence Level</div>
            <div style={resultValueStyle}>
              {(result.confidence * 100).toFixed(1)}%
            </div>
            <div style={confidenceBarStyle}>
              <div style={confidenceFillStyle}></div>
            </div>
          </div>

          <div style={{ marginTop: "20px" }}>
            <div style={resultLabelStyle}>⚠️ Cause</div>
            <div style={resultValueStyle}>{result.cause}</div>
          </div>

          <div style={{ marginTop: "20px" }}>
            <div style={resultLabelStyle}>🌫️ Detected Particles</div>
            <div style={resultValueStyle}>
              {result.particles?.length > 0 ? result.particles.join(", ") : "None detected"}
            </div>
          </div>

          <div style={{ marginTop: "20px", backgroundColor: "#e8f5e9", padding: "12px", borderRadius: "6px" }}>
            <div style={resultLabelStyle}>💡 Suggestion</div>
            <div style={resultValueStyle}>{result.suggestion}</div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default ImageDetection;