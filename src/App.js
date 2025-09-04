import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Container from './components/Container';
import Login from './components/Login';
import Home from './components/Home';
import Admin from './components/Admin';
import Static from './components/Static';
import Rescode from './components/Rescode';
import CreateAPI from './components/CreateAPI';
import LanguageAdmin from './components/LanguageAdmin';
import Views from './components/views/Views';
import Viewid from './components/views/Viewid';
import FormLuuTru from './components/FormLuuTru';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  if (isLoading) {
    return null; 
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/home" /> : <Login setUser={setUser} t={t} user={user} />}
        />
        <Route
          path="/"
          element={user ? <Container user={user} handleLogout={handleLogout} t={t} /> : <Navigate to="/login" />}
        >
          <Route index element={<Navigate to="/home" />} />
          <Route path="home" element={<Home user={user} handleLogout={handleLogout} t={t} />} />
          <Route path="static" element={<Static user={user} t={t} />} />
          <Route path="rescode" element={<Rescode user={user} t={t} />} />
          <Route path="admin" element={<Admin user={user} t={t} />} />
          <Route path="language" element={<LanguageAdmin user={user} t={t} />} />
          <Route path="create-api" element={<CreateAPI user={user} t={t} />} />
          <Route path="views" element={<Views user={user} t={t} />} />
          <Route path="luu-tru" element={<FormLuuTru user={user} t={t} />} />
          <Route path="view/restaurant/:id" element={<Viewid user={user} t={t} />} />
        </Route>
        <Route
          path="*"
          element={<Navigate to={user ? "/home" : "/login"} />}
        />
      </Routes>
    </Router>
  );
}

export default App;