import api from '../api';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { createContext, useContext, useEffect, useState } from 'react';

import Navbar from './Navbar'
import Index from './project/Index'
import ProjectsList from './project/ProjectsList';
import AdminPanel from './admin/AdminPanel';
import Profile from './profile/Profile';
import Landing from './landing/Landing';

export const GlobalContext = createContext()

const AdminRoute = ({ children }) => {
  const user = useContext(GlobalContext);
  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
};

const Home = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLanding, setShowLanding] = useState(false);

  const navigateTo = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      getUser();
    } else if (location.pathname === "/" || location.pathname === "") {
      // Public landing page for unauthenticated visitors at root
      setShowLanding(true);
      setLoading(false);
    } else {
      navigateTo("/login");
    }
  }, []);

  useEffect(() => {
    if (user) {
      setLoading(false)
    }
  }, [user]);


  const getUser = async () => {
    try {
      const { data } = await api.get("/api/user/mydata");
      setUser(data)
    } catch {
      localStorage.removeItem('token')
      navigateTo('/login')
    }
  };


  if (showLanding) {
    return <Landing />;
  }

  return (
    <div className="min-h-screen">
      <GlobalContext.Provider value={user}>
        {!loading ? (
          <>
            <Navbar />
            <div className="pt-14 md:pt-16">
              <Routes>
                <Route path="/" element={
                  <ProjectsList />
                } />
                <Route path="/admin" element={
                  <AdminRoute><AdminPanel /></AdminRoute>
                } />
                <Route path="/profile" element={<Profile />} />
                <Route path="/project/*" element={<Index />} />
              </Routes>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center animate-fade-in">
              <h1 className='text-5xl font-extrabold mb-4'>
                <span className='text-amber-400'>
                  Uni
                </span>
                <span className='text-white/80'>
                  Flow
                </span>
              </h1>
              <div className="flex justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin"></div>
              </div>
              <p className="text-white/50 text-sm mt-4">Загрузка...</p>
            </div>
          </div>
        )}
      </GlobalContext.Provider>
    </div>
  )
}

export default Home
