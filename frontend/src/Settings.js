import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import backgroundImage from './assets/backgroung2.jpg';
import './Settings.css';

const Settings = () => {
  const { user, updateUser, theme, updateTheme, logout, preferences, updatePreferences } = useContext(AuthContext);
  const isDark = theme !== 'light';
  const panelBackground = isDark ? 'rgba(0, 0, 0, 0.78)' : 'rgba(255, 255, 255, 0.95)';
  const titleColor = isDark ? '#fff' : '#111';
  const bodyTextColor = isDark ? '#ccc' : '#444';

  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [preferencesState, setPreferencesState] = useState({
    notifications: true,
    dataSharing: false,
    autoRefresh: false,
    privacyMode: false,
    locationAlerts: true,
    units: 'AQI'
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (preferences) {
      setPreferencesState(prev => ({ ...prev, ...preferences }));
    }
  }, [preferences]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePreferenceToggle = (key, value) => {
    setPreferencesState(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveProfile = () => {
    updateUser(formData);
    updatePreferences(preferencesState);
    setEditMode(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleThemeChange = (newTheme) => {
    updateTheme(newTheme);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
        padding: '20px',
        backgroundColor: isDark ? '#070b16' : '#eff3fb'
      }}
    >
      <div style={{
        backgroundColor: panelBackground,
        backdropFilter: 'blur(4px)',
        minHeight: '100vh',
        padding: '40px 20px'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '40px',
            borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
            paddingBottom: '20px'
          }}>
            <h1 style={{ color: titleColor, margin: 0, fontSize: '36px', fontWeight: 'bold' }}>⚙️ Settings</h1>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '10px 20px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              ← Back to Dashboard
            </button>
          </div>

          {/* Success Message */}
          {saveSuccess && (
            <div style={{
              backgroundColor: '#27ae60',
              color: '#fff',
              padding: '15px 20px',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center',
              animation: 'slideDown 0.3s ease'
            }}>
              ✓ Changes saved successfully!
            </div>
          )}

          {/* Profile Section */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '30px',
            marginBottom: '30px'
          }}>
            <h2 style={{ color: titleColor, marginTop: 0, marginBottom: '25px', fontSize: '24px' }}>👤 Profile Information</h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '25px'
            }}>
              {/* Profile Display Card */}
              {!editMode && (
                <div style={{
                  gridColumn: '1 / -1',
                  backgroundColor: 'rgba(46, 204, 113, 0.1)',
                  border: '1px solid rgba(46, 204, 113, 0.3)',
                  borderRadius: '8px',
                  padding: '20px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{
                      fontSize: '48px',
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(46, 204, 113, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid rgba(46, 204, 113, 0.5)'
                    }}>
                      {user?.profilePic}
                    </div>
                    <div>
                      <h3 style={{ color: '#2ecc71', margin: 0, fontSize: '20px' }}>{user?.name}</h3>
                      <p style={{ color: '#bbb', margin: '5px 0 0 0', fontSize: '14px' }}>{user?.email}</p>
                      <p style={{ color: '#bbb', margin: '5px 0 0 0', fontSize: '14px' }}>📱 {user?.phone}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Form */}
              {editMode && (
                <>
                  <div>
                    <label style={{ color: '#aaa', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        color: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ color: '#aaa', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        color: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ color: '#aaa', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        color: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Edit/Save Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#3498db',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#2980b9'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#3498db'}
                >
                  ✏️ Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSaveProfile}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#27ae60',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#229954'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#27ae60'}
                  >
                    ✓ Save Changes
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                  >
                    ✗ Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Preferences Section */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '30px',
            marginBottom: '30px'
          }}>
            <h2 style={{ color: '#fff', marginTop: 0, marginBottom: '25px', fontSize: '24px' }}>🎨 Preferences</h2>

            {/* Theme Selection */}
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ color: bodyTextColor, marginTop: 0, fontSize: '16px', marginBottom: '15px' }}>Theme</h3>
              <div style={{ display: 'flex', gap: '15px' }}>
                {['dark', 'light'].map(themeOption => (
                  <button
                    key={themeOption}
                    onClick={() => handleThemeChange(themeOption)}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: theme === themeOption ? '#3498db' : 'rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      border: theme === themeOption ? '2px solid #3498db' : '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.3s',
                      textTransform: 'capitalize'
                    }}
                    onMouseEnter={(e) => {
                      if (theme !== themeOption) {
                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (theme !== themeOption) {
                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                      }
                    }}
                  >
                    {themeOption === 'dark' ? '🌙' : '☀️'} {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gap: '20px', marginBottom: '25px' }}>
              {[
                {
                  key: 'notifications',
                  label: '🔔 Notifications',
                  description: 'Receive alerts about air quality changes',
                },
                {
                  key: 'dataSharing',
                  label: '📊 Data Sharing',
                  description: 'Help improve our service with usage analytics',
                },
                {
                  key: 'autoRefresh',
                  label: '⏱️ Auto Refresh',
                  description: 'Keep the dashboard updated automatically',
                },
                {
                  key: 'privacyMode',
                  label: '🕶️ Privacy Mode',
                  description: 'Hide sensitive location information on the dashboard',
                },
                {
                  key: 'locationAlerts',
                  label: '📍 Location Alerts',
                  description: 'Receive local pollution alerts for your current area',
                }
              ].map((option) => (
                <div key={option.key} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '20px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div>
                    <h3 style={{ color: '#ccc', margin: 0, fontSize: '16px' }}>{option.label}</h3>
                    <p style={{ color: '#999', margin: '5px 0 0 0', fontSize: '14px' }}>{option.description}</p>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
                    <input
                      type="checkbox"
                      checked={preferencesState[option.key]}
                      onChange={(e) => handlePreferenceToggle(option.key, e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: preferencesState[option.key] ? '#27ae60' : '#555',
                      transition: '0.3s',
                      borderRadius: '24px'
                    }}></span>
                    <span style={{
                      position: 'absolute',
                      height: '18px',
                      width: '18px',
                      left: preferencesState[option.key] ? '26px' : '3px',
                      bottom: '3px',
                      backgroundColor: '#fff',
                      transition: '0.3s',
                      borderRadius: '50%'
                    }}></span>
                  </label>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ color: '#ccc', marginTop: 0, fontSize: '16px', marginBottom: '15px' }}>Units</h3>
              <select
                value={preferencesState.units}
                onChange={(e) => handlePreferenceToggle('units', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#fff',
                  fontSize: '14px'
                }}
              >
                <option value="AQI">AQI</option>
                <option value="µg/m3">µg/m³</option>
              </select>
            </div>

            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '10px', fontSize: '18px' }}>Active Settings</h3>
              <p style={{ color: '#bbb', margin: '0 0 8px 0' }}>Theme: <strong style={{ color: '#fff' }}>{theme === 'dark' ? 'Dark' : 'Light'}</strong></p>
              <p style={{ color: '#bbb', margin: '0 0 8px 0' }}>Auto Refresh: <strong style={{ color: '#fff' }}>{preferencesState.autoRefresh ? 'Enabled' : 'Disabled'}</strong></p>
              <p style={{ color: '#bbb', margin: '0 0 8px 0' }}>Privacy Mode: <strong style={{ color: '#fff' }}>{preferencesState.privacyMode ? 'On' : 'Off'}</strong></p>
              <p style={{ color: '#bbb', margin: 0 }}>Unit System: <strong style={{ color: '#fff' }}>{preferencesState.units}</strong></p>
            </div>
          </div>

          {/* About & Logout Section */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '30px',
            marginBottom: '30px'
          }}>
            <h2 style={{ color: '#fff', marginTop: 0, marginBottom: '25px', fontSize: '24px' }}>ℹ️ About</h2>
            <div style={{ marginBottom: '20px' }}>
              <p style={{ color: '#ccc', margin: 0 }}>Air Pollution Detection System</p>
              <p style={{ color: '#999', margin: '5px 0 0 0', fontSize: '14px' }}>Version 1.0.0</p>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '12px 24px',
                backgroundColor: '#e74c3c',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#c0392b'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#e74c3c'}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Settings;
