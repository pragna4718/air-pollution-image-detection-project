import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import backgroundImage from './assets/backgroung2.jpg';
import {
  FaRunning,
  FaBicycle,
  FaSwimmer,
  FaBasketballBall,
  FaTree,
  FaSpa,
  FaHiking,
  FaCampground,
  FaLeaf,
  FaUmbrellaBeach,
  FaMask,
  FaHome,
  FaSeedling,
  FaBroom,
  FaShower,
  FaAppleAlt,
  FaTint,
  FaBed,
  FaHeartbeat,
  FaWind,
  FaShieldAlt,
  FaWindowClose,
  FaFilter,
  FaSoap,
  FaCarrot,
  FaGlassWhiskey,
  FaMoon,
  FaLungs,
  FaGamepad
} from 'react-icons/fa';
import './RecommendationsPage.css';

const getRecommendations = (level) => {
  const recommendations = {
    Low: [
      { icon: FaRunning, title: 'Morning Jogging', description: 'Perfect for early morning runs in parks and fresh air' },
      { icon: FaBicycle, title: 'Cycling Adventures', description: 'Explore scenic routes and enjoy cycling without respiratory concerns' },
      { icon: FaSwimmer, title: 'Outdoor Swimming', description: 'Swim in open pools or natural water bodies safely' },
      { icon: FaBasketballBall, title: 'Sports Activities', description: 'Play tennis, basketball, or any outdoor sport you enjoy' },
      { icon: FaTree, title: 'Park Picnics', description: 'Organize family picnics and outdoor gatherings' },
      { icon: FaSpa, title: 'Outdoor Yoga', description: 'Practice yoga in gardens or open spaces for maximum benefit' },
      { icon: FaHiking, title: 'Nature Walks', description: 'Take leisurely walks through forests and nature trails' },
      { icon: FaCampground, title: 'Camping Trips', description: 'Plan short camping adventures in clean air environments' },
      { icon: FaLeaf, title: 'Gardening Therapy', description: 'Spend time nurturing plants and enjoying therapeutic gardening' },
      { icon: FaUmbrellaBeach, title: 'Beach Activities', description: 'Visit beaches for swimming, volleyball, and relaxation' }
    ],
    Moderate: [
      { icon: FaMask, title: 'Smart Mask Usage', description: 'Wear N95 masks during peak traffic hours or near construction' },
      { icon: FaRunning, title: 'Short Exercise Sessions', description: 'Limit outdoor exercise to 30-45 minutes in morning hours' },
      { icon: FaWind, title: 'HEPA Air Purifiers', description: 'Install HEPA-filter air purifiers in living and sleeping areas' },
      { icon: FaSeedling, title: 'Indoor Plant Therapy', description: 'Add air-purifying plants like snake plants and peace lilies indoors' },
      { icon: FaBroom, title: 'Regular Cleaning', description: 'Clean surfaces and floors daily to reduce indoor pollutants' },
      { icon: FaShower, title: 'Shower After Outdoors', description: 'Shower immediately after returning from outdoor activities' },
      { icon: FaAppleAlt, title: 'Anti-Inflammatory Diet', description: 'Focus on foods rich in antioxidants like berries and leafy greens' },
      { icon: FaTint, title: 'Hydration Focus', description: 'Drink 8-10 glasses of water daily to flush out toxins' },
      { icon: FaBed, title: 'Sleep Environment', description: 'Use allergen-proof bedding and keep bedroom windows closed at night' },
      { icon: FaHeartbeat, title: 'Nasal Irrigation', description: 'Use saline nasal sprays or neti pots to clear nasal passages' }
    ],
    High: [
      { icon: FaShieldAlt, title: 'N95 Respirator Masks', description: 'Wear properly fitted N95 masks for any outdoor exposure' },
      { icon: FaHome, title: 'Indoor Sanctuary', description: 'Create a clean indoor environment as your primary living space' },
      { icon: FaWindowClose, title: 'Sealed Environment', description: 'Keep all windows, doors, and vents sealed with weather stripping' },
      { icon: FaFilter, title: 'Advanced Air Purification', description: 'Use medical-grade HEPA filters with activated carbon' },
      { icon: FaSoap, title: 'Immediate Showers', description: 'Shower within 10 minutes of returning indoors to remove pollutants' },
      { icon: FaCarrot, title: 'Respiratory Diet', description: 'Eat foods rich in vitamin C, omega-3s, and magnesium for lung health' },
      { icon: FaGlassWhiskey, title: 'Enhanced Hydration', description: 'Drink warm fluids like herbal teas and broths throughout the day' },
      { icon: FaMoon, title: 'Sleep Optimization', description: 'Use air purifiers in bedroom and maintain 40-60% humidity' },
      { icon: FaLungs, title: 'Respiratory Hygiene', description: 'Use steam inhalation and saline nasal rinses twice daily' },
      { icon: FaGamepad, title: 'Indoor Entertainment', description: 'Focus on indoor hobbies like reading, gaming, or virtual activities' }
    ]
  };
  return recommendations[level] || [];
};

const RecommendationsPage = () => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const navigate = useNavigate();

  const handleLevelClick = (level) => {
    setSelectedLevel(level);
  };

  const recommendations = selectedLevel ? getRecommendations(selectedLevel) : [];

  const getGlowColor = (level) => {
    switch (level) {
      case 'Low': return '#00ff88';
      case 'Moderate': return '#ffa500';
      case 'High': return '#ff4444';
      default: return '#00ff88';
    }
  };

  return (
    <div className="recommendations-page" style={{
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      backgroundColor: 'rgba(0, 0, 0, 0.85)'
    }}>
      {/* Semi-transparent overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        zIndex: 1
      }}></div>

      {/* Animated Background */}
      <div className="animated-bg" style={{ zIndex: 2 }}>
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
      </div>

      {/* Header */}
      <motion.header
        className="page-header"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div className="header-content">
          <motion.button
            className="back-btn"
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ← Back to Dashboard
          </motion.button>
          <motion.h1
            className="page-title"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Health Recommendations
          </motion.h1>
          <motion.p
            className="page-subtitle"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Personalized health guidance based on air quality levels
          </motion.p>
        </div>
      </motion.header>

      {/* Pollution Level Selector */}
      <motion.section
        className="level-selector-section"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <div className="level-selector-container">
          <h2>Select Pollution Level</h2>
          <div className="pollution-selector">
            {['Low', 'Moderate', 'High'].map((level, index) => (
              <motion.button
                key={level}
                className={`pollution-btn ${selectedLevel === level ? 'active' : ''}`}
                onClick={() => handleLevelClick(level)}
                style={{
                  '--glow-color': getGlowColor(level)
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <div className="level-icon">
                  {level === 'Low' ? '🟢' : level === 'Moderate' ? '🟡' : '🔴'}
                </div>
                <div className="level-text">{level}</div>
                <div className="level-desc">
                  {level === 'Low' ? 'Safe outdoor activities' :
                   level === 'Moderate' ? 'Limited outdoor exposure' :
                   'Stay indoors'}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Recommended Activities Section */}
      <AnimatePresence mode="wait">
        {selectedLevel && (
          <motion.section
            key={selectedLevel}
            className="activities-section"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="activities-container">
              <motion.h2
                className="activities-title"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                style={{
                  background: `linear-gradient(45deg, ${getGlowColor(selectedLevel)}, ${getGlowColor(selectedLevel)}80)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                Recommended Activities
              </motion.h2>

              <motion.div
                className="activities-grid"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 0.3
                    }
                  }
                }}
              >
                {recommendations.map((rec, index) => {
                  const IconComponent = rec.icon;
                  return (
                    <motion.div
                      key={`${selectedLevel}-${index}`}
                      className="activity-card"
                      variants={{
                        hidden: { y: 20, opacity: 0, scale: 0.8 },
                        visible: {
                          y: 0,
                          opacity: 1,
                          scale: 1,
                          transition: {
                            type: 'spring',
                            stiffness: 300,
                            damping: 20
                          }
                        }
                      }}
                      whileHover={{
                        scale: 1.05,
                        boxShadow: `0 20px 40px rgba(0,0,0,0.3), 0 0 20px ${getGlowColor(selectedLevel)}40`,
                        y: -5
                      }}
                      style={{
                        '--glow-color': getGlowColor(selectedLevel)
                      }}
                    >
                      <div className="card-icon">
                        <IconComponent />
                      </div>
                      <h3>{rec.title}</h3>
                      <p>{rec.description}</p>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecommendationsPage;