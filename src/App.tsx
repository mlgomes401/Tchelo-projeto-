import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Creator } from './components/Creator';
import { ViewPage } from './pages/ViewPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Creator />} />
        <Route path="/v/:id" element={<ViewPage />} />
      </Routes>
    </BrowserRouter>
  );
}
