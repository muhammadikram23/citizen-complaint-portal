import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { Sidebar } from './components/Sidebar';
import { ErrorBoundary } from './components/ErrorBoundary';
import logo from './assets/logo.png';

// Pages
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import CitizenDashboard from './pages/CitizenDashboard';
import ReportComplaint from './pages/ReportComplaint';
import MyComplaints from './pages/MyComplaints';
import BrowseComplaints from './pages/BrowseComplaints';
import ComplaintDetail from './pages/ComplaintDetail';
import OfficerDashboard from './pages/OfficerDashboard';
import OfficerComplaintReview from './pages/OfficerComplaintReview';

export function App() {
  return (
    <AuthProvider>
      <Router>
        <Sidebar>
          <div className="min-h-screen flex flex-col justify-between">
            <div className="flex-1">
              <ErrorBoundary>
                <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/complaints" element={<BrowseComplaints />} />
                <Route path="/complaints/:id" element={<ComplaintDetail />} />

                {/* Citizen Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute requireRole="citizen">
                      <CitizenDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/complaints/new"
                  element={
                    <ProtectedRoute requireRole="citizen">
                      <ReportComplaint />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/complaints/mine"
                  element={
                    <ProtectedRoute requireRole="citizen">
                      <MyComplaints />
                    </ProtectedRoute>
                  }
                />

                {/* Officer Protected Routes */}
                <Route
                  path="/officer/dashboard"
                  element={
                    <ProtectedRoute requireRole="officer">
                      <OfficerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/officer/complaints/:id"
                  element={
                    <ProtectedRoute requireRole="officer">
                      <OfficerComplaintReview />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ErrorBoundary>
          </div>

            {/* Institutional Portal Footer */}
            <footer className="border-t border-emerald-900/10 bg-white/90 backdrop-blur-sm py-4 px-4 sm:px-6 text-xs text-slate-500 mt-12 shadow-soft">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2">
                <div className="flex items-center gap-2.5">
                  <img src={logo} alt="Logo" className="h-7 w-auto object-contain shrink-0 opacity-90" />
                  <span className="font-medium text-slate-600">Municipal Citizen Complaint & Operations Management System</span>
                </div>
                {/* <div className="text-slate-400 font-medium">
                  Connected to Live Production API & MongoDB Atlas
                </div> */}
              </div>
            </footer>
          </div>
        </Sidebar>
      </Router>
    </AuthProvider>
  );
}

export default App;
