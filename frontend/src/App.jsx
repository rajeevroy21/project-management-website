import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const FacultySignup = lazy(() => import('./pages/FacultySignup'));
const SignupChoice = lazy(() => import('./pages/SignupChoice'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Upload = lazy(() => import('./pages/Upload'));
const Review = lazy(() => import('./pages/Review'));
const List = lazy(() => import('./pages/List'));
const Agreement = lazy(() => import('./pages/Agreement'));
const StudentSignup = lazy(() => import('./pages/StudentSignup'));
const Uploads = lazy(() => import('./pages/Uploads'));
const Progress = lazy(() => import('./pages/Progress'));
const BatchReview = lazy(() => import('./pages/BatchReview'));
const Marks = lazy(() => import('./pages/Marks'));
const Announcements = lazy(() => import('./pages/Announce'));
const AboutUs = lazy(() => import('./pages/Aboutus'));


export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Suspense fallback={<div className="text-center p-5">Loading...</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignupChoice />} />
                <Route path="/signup/student" element={<StudentSignup />} />
                <Route path="/signup/faculty" element={<FacultySignup />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/agreement" element={<Agreement />} />
                <Route path="/list" element={<List />} />
                <Route path="/uploads" element={<Uploads />} />
                <Route path="/review" element={<Review />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/batchreview" element={<BatchReview />} />
                <Route path="/marks" element={<Marks />} />
                <Route path="/announcements" element={<Announcements />} />
                <Route path="/about" element={<AboutUs />} />
                
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}