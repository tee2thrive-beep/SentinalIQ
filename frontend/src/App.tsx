import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { PriorityQueuePage } from './pages/PriorityQueuePage';
import { InvestigationPage } from './pages/InvestigationPage';
import { SimulationPage } from './pages/SimulationPage';
import { ReportsPage } from './pages/ReportsPage';
import { SystemStatusPage } from './pages/SystemStatusPage';
import { CompareIncidentsPage } from './pages/CompareIncidentsPage';
import { PriorityConfigPage } from './pages/PriorityConfigPage';
import { api } from './services/api';

export const App: React.FC = () => {
  React.useEffect(() => {
    // Background ping to wake Render server immediately on page load
    api.fetchHealth().catch(() => {});
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/incidents" element={<PriorityQueuePage />} />
            <Route path="/incidents/:incidentId" element={<InvestigationPage />} />
            <Route path="/compare" element={<CompareIncidentsPage />} />
            <Route path="/priority-config" element={<PriorityConfigPage />} />
            <Route path="/simulations" element={<SimulationPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/status" element={<SystemStatusPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;

