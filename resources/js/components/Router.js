import React from 'react';
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Example from "./Example";
import Home from './Homes';
import CrudPage from './CrudPage';
import Login from './Login';
import Signup from './Signup';
import ProtectedRoute from './ProtectedRoute';

export default function Routers() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login onLogin={(t) => { window.dispatchEvent(new CustomEvent('portal-login', { detail: t })); }} />} />
        <Route path="/signup" element={<Signup onLogin={(t) => { window.dispatchEvent(new CustomEvent('portal-login', { detail: t })); }} />} />

        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><Example/></ProtectedRoute>} />
        <Route path="/home" element={<ProtectedRoute><Home/></ProtectedRoute>} />
        <Route path="/crud" element={<ProtectedRoute><CrudPage/></ProtectedRoute>} />
      </Routes>
    </Router>
  )
}

if(document.getElementById("root")) {
    createRoot(document.getElementById("root")).render(<Routers />);
}