import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Pages/Login.js';
import Register from './Pages/Register.js';
import ProtectedRoute from './routes/ProtectedRoute.js';
import CustomerRoute from './routes/CustomerRoute.js';
import Dashboard from './Pages/Dashboard.js';
import Homepage from './Pages/homepage.js';
import SellerHomepage from './Pages/SellerHomepage.js';
import CreateListing from './Pages/CreateListing.js';

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
        <Route 
          path="/" 
          element={
            <CustomerRoute>
              <Homepage />
            </CustomerRoute>
          } 
        />
        <Route 
          path="/seller" 
          element={
            <ProtectedRoute>
              <SellerHomepage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/create-listing" 
          element={
            <ProtectedRoute>
              <CreateListing />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App; 