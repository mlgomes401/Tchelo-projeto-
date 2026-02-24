import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SplashPage from './pages/SplashPage';
import ViewPage from './pages/ViewPage';
import Showcase from './pages/Showcase';
import CrmRoutes from './crm/routes';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/v/:id" element={<ViewPage />} />
        <Route path="/loja" element={<Showcase />} />
        <Route path="/crm/*" element={<CrmRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}
