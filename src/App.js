import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Pages/Login.js';
import Register from './Pages/Register.js';
import ProtectedRoute from './routes/ProtectedRoute.js';
import Dashboard from './Pages/Dashboard.js';
import Homepage from './Pages/homepage.js';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Homepage />} />
      </Routes>
      
    </Router>
  );
}

export default App; 