// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import WeatherDashboard from "./components/WeatherDashboard";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css"; // global styles with design system + background CSS
import MonumentPhotoAndSky from "./MonumentPhotoAndSky";

const Navigation: React.FC = () => {
  return (
    <nav className="bg-slate-800 p-4 relative z-10">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-emerald-400 text-xl font-bold">
          Green AI Climate Hub
        </h1>
        <div className="space-x-4">
          <Link
            to="/"
            className="text-white hover:text-emerald-400 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/login"
            className="text-white hover:text-emerald-400 transition-colors"
          >
            Login
          </Link>
          <Link
            to="/dashboard"
            className="text-white hover:text-emerald-400 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/weather"
            className="text-white hover:text-emerald-400 transition-colors"
          >
            Weather
          </Link>
        </div>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      {/* === Global decorative responsive background (site-wide) === */}
      <div className="site-bg" aria-hidden>
        <div className="bg-gradient" />
        <div className="bg-radial" />
        <svg className="bg-wave" aria-hidden>
          <defs>
            <linearGradient id="g1" x1="0" x2="1">
              <stop offset="0" stopColor="#052017" stopOpacity="0.14" />
              <stop offset="1" stopColor="#08302a" stopOpacity="0.06" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#g1)" />
        </svg>
        <div className="bg-noise" />
        <span className="leaf leaf-1" />
        <span className="leaf leaf-2" />
        <span className="leaf leaf-3" />
      </div>

      {/* === Foreground app content === */}
      <div className="App relative z-10">
        <Navigation />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route 
            path="/weather" 
            element={
              <ErrorBoundary>
                <WeatherDashboard />
              </ErrorBoundary>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;