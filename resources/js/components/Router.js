import React from 'react';
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Example from "./Example";
import Home from './Home';
import CrudPage from './CrudPage';
import Login from './Login';
import Signup from './Signup';
import StudentForm from './StudentForm';
import StudentView from './StudentView';
import ProtectedRoute from './ProtectedRoute';
import FacultyProfile from './FacultyProfile';
import StudentsPage from './StudentsPage';
import ChatPage from './ChatPage';
import CoursesPage from './CoursesPage';
import CalendarPage from './CalendarPage';
import ArchivePage from './ArchivePage';

export default function Routers() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login onLogin={(t) => { window.dispatchEvent(new CustomEvent('portal-login', { detail: t })); }} />} />
        <Route path="/signup" element={<Signup onLogin={(t) => { window.dispatchEvent(new CustomEvent('portal-login', { detail: t })); }} />} />

    {/* Protected routes */}
    <Route path="/" element={<ProtectedRoute><Home/></ProtectedRoute>} />
  <Route path="/home" element={<ProtectedRoute><Home/></ProtectedRoute>} />
    <Route path="/faculty/profile" element={<ProtectedRoute><FacultyProfile/></ProtectedRoute>} />
        <Route path="/students" element={<ProtectedRoute><StudentsPage/></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><ChatPage/></ProtectedRoute>} />
        <Route path="/courses" element={<ProtectedRoute><CoursesPage/></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><CalendarPage/></ProtectedRoute>} />
        <Route path="/archive" element={<ProtectedRoute><ArchivePage/></ProtectedRoute>} />
        <Route path="/crud" element={<ProtectedRoute><CrudPage/></ProtectedRoute>} />
        <Route path="/profile/new" element={<ProtectedRoute><StudentForm/></ProtectedRoute>} />
        <Route path="/profile/:id/edit" element={<ProtectedRoute><StudentForm/></ProtectedRoute>} />
        <Route path="/profile/:id" element={<ProtectedRoute><StudentView/></ProtectedRoute>} />
      </Routes>
    </Router>
  )
}

if(document.getElementById("root")) {
    createRoot(document.getElementById("root")).render(<Routers />);
}