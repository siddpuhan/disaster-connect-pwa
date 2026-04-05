import React from 'react';
import './LandingPage.css';
import Navbar from './components/landing/Navbar';
import Hero from './components/landing/Hero';
import Problem from './components/landing/Problem';
import Solution from './components/landing/Solution';
import HowItWorks from './components/landing/HowItWorks';
import UseCases from './components/landing/UseCases';
import Tech from './components/landing/Tech';
import Footer from './components/landing/Footer';

const LandingPage = ({ onEnterChat, onEnterResources }) => {
  return (
    <div className="lp-container">
      <div className="scanline-overlay"></div>
      <Navbar onEnterChat={onEnterChat} onEnterResources={onEnterResources} />
      <main className="lp-main">
        <Hero onEnterChat={onEnterChat} onEnterResources={onEnterResources} />
        <Problem />
        <Solution />
        <HowItWorks />
        <UseCases />
        <Tech />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
