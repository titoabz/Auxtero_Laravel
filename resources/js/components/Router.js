import React from 'react';
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Example from "./Example";
import Home from './Homes';
import CrudPage from './CrudPage';

export default function Routers() {
  return (
    <Router>
    <Routes>
      <Route path="/" element={<Example/>} />
      <Route path="/home" element={<Home/>} />
      <Route path="/crud" element={<CrudPage/>} />
    </Routes>
    </Router>
  )
}

if(document.getElementById("root")) {
    createRoot(document.getElementById("root")).render(<Routers />);
}