import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Home from './pages/Home/Home';
import NewsList from './pages/Home/NewsList';
import NewsDetail from './pages/Home/NewsDetail';
import ContestList from './pages/Home/ContestList';
import ContestDetail from './pages/Home/ContestDetail';

import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

import ContestantDashboard from './pages/Contestant/Dashboard';
import SubmitWork from './pages/Contestant/SubmitWork';
import MySubmissions from './pages/Contestant/MySubmissions';

import JudgeDashboard from './pages/Judge/Dashboard';
import ReviewWork from './pages/Judge/ReviewWork';

const App = () => {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          {/* 公开页面 */}
          <Route path="/" element={<Home />} />
          <Route path="/news" element={<NewsList />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/contests" element={<ContestList />} />
          <Route path="/contests/:id" element={<ContestDetail />} />

          {/* 认证页面 */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 选手中心 */}
          <Route
            path="/contestant"
            element={
              <PrivateRoute requiredRole="contestant">
                <ContestantDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/contestant/submit"
            element={
              <PrivateRoute requiredRole="contestant">
                <SubmitWork />
              </PrivateRoute>
            }
          />
          <Route
            path="/contestant/submissions"
            element={
              <PrivateRoute requiredRole="contestant">
                <MySubmissions />
              </PrivateRoute>
            }
          />

          {/* 评委中心 */}
          <Route
            path="/judge"
            element={
              <PrivateRoute requiredRole="judge">
                <JudgeDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/judge/review/:assignmentId"
            element={
              <PrivateRoute requiredRole="judge">
                <ReviewWork />
              </PrivateRoute>
            }
          />
        </Routes>
      </Layout>
    </AuthProvider>
  );
};

export default App;
