import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Welcome to MyScheme</h1>
        <p>Your one-stop portal for government and private schemes.</p>
        <div className="home-buttons">
          <Link to="/schemes" className="btn btn-primary">
            Browse All Schemes
          </Link>
          <Link to="/register" className="btn btn-secondary">
            Register Now
          </Link>
        </div>
      </header>

      <section className="home-features">
        <div className="feature-card">
          <h3>Check Eligibility</h3>
          <p>Find out which schemes you are eligible for in just a few clicks.</p>
        </div>
        <div className="feature-card">
          <h3>Apply Online</h3>
          <p>Apply for private schemes directly through our portal.</p>
        </div>
        <div className="feature-card">
          <h3>Track Status</h3>
          <p>Keep track of your application status in real-time.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;