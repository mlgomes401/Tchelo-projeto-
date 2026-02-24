import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import GestorLeads from './pages/GestorLeads';
import CrmAutomotivo from './pages/CrmAutomotivo';
import Veiculos from './pages/Cadastros/Veiculos';
import Clientes from './pages/Cadastros/Clientes';
import Financeiro from './pages/Financeiro';
import LojaVirtual from './pages/LojaVirtual';
import Configuracao from './pages/Configuracao';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';

import CrmLayout from './components/CrmLayout';

export default function CrmRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/*" element={
                <ProtectedRoute>
                    <CrmLayout>
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/leads" element={<GestorLeads />} />
                            <Route path="/funil" element={<CrmAutomotivo />} />
                            <Route path="/cadastros/veiculos" element={<Veiculos />} />
                            <Route path="/cadastros/clientes" element={<Clientes />} />
                            <Route path="/loja" element={<LojaVirtual />} />
                            <Route path="/financeiro" element={<Financeiro />} />
                            <Route path="/config" element={<Configuracao />} />
                            <Route path="*" element={<Navigate to="/crm/dashboard" replace />} />
                        </Routes>
                    </CrmLayout>
                </ProtectedRoute>
            } />
        </Routes>
    );
}
