import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Login from "./Pages/Login.js";
import Register from "./Pages/Register.js";
import ProtectedRoute from "./routes/ProtectedRoute.js";
import CustomerRoute from "./routes/CustomerRoute.js";
import Dashboard from "./Pages/Dashboard.js";
import Homepage from "./Pages/Customer_homepage.js";
import SellerHomepage from "./Pages/SellerHomepage.js";
import CreateListing from "./Pages/CreateListing.js";
import SellerProfile from "./Pages/SellerProfile.js";
import UserProfile from "./Pages/UserProfile.js";
import ChatPage from "./Components/ChatPage.js";
import CustomerProfile from "./Pages/CustomerProfile.js";
import AboutUs from "./Pages/AboutUs.js";
import ContactUs from "./Pages/ContactUs.js";
import AdminRoute from "./routes/AdminRoute.js";
import Admin_Homepage from "./Pages/Admin_Homepage.js";
import UserManagement from "./Pages/UserManagement.js";
import ViewReports from "./Pages/ViewReports.js";

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
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
        <Route
          path="/seller/:sellerId"
          element={
            <ProtectedRoute>
              <SellerProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/:userId"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route path="/customer/:customerId" element={<CustomerProfile />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin_Homepage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <UserManagement />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <AdminRoute>
              <ViewReports />
            </AdminRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
