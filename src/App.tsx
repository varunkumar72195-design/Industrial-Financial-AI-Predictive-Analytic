/**
 * Industrial & Financial AI Predictive Analytics Suite
 * Root Application Component
 */
import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Sidebar, ModuleKey, NAV_ITEMS } from './components/common/Sidebar';
import { FastApiModal } from './components/common/FastApiModal';
import { DashboardOverview } from './components/modules/DashboardOverview';
import { MachineHealthModule } from './components/modules/MachineHealthModule';
import { FraudDetectionModule } from './components/modules/FraudDetectionModule';
import { VisualAnalyticsModule } from './components/modules/VisualAnalyticsModule';
import { ModelScoreboardModule } from './components/modules/ModelScoreboardModule';
import { CarIncomeModule } from './components/modules/CarIncomeModule';
import { PythonQuizModule } from './components/modules/PythonQuizModule';
import { FastApiConfig } from './types';
import { getStoredFastApiConfig, checkFastApiHealth } from './services/api';

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleKey>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isFastApiModalOpen, setIsFastApiModalOpen] = useState(false);
  const [fastApiConfig, setFastApiConfig] = useState<FastApiConfig>(getStoredFastApiConfig());

  // Background ping to check if external FastAPI server is already online
  useEffect(() => {
    let isMounted = true;
    checkFastApiHealth(fastApiConfig.baseUrl).then((res) => {
      if (isMounted && res.ok) {
        setFastApiConfig((prev) => ({
          ...prev,
          isConnected: true,
          latencyMs: res.latencyMs,
          mode: 'live',
        }));
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const activeNav = NAV_ITEMS.find((n) => n.id === activeModule);

  return (
    <div className="flex min-h-screen bg-[#080d1a] text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileNavOpen}
        onToggleMobile={() => setIsMobileNavOpen(!isMobileNavOpen)}
        onOpenFastApiModal={() => setIsFastApiModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <Header
          config={fastApiConfig}
          onOpenFastApiModal={() => setIsFastApiModalOpen(true)}
          activeModuleTitle={activeNav?.label || 'Dashboard Overview'}
        />

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeModule === 'overview' && (
            <DashboardOverview
              onNavigate={(mod) => setActiveModule(mod)}
              onOpenFastApiModal={() => setIsFastApiModalOpen(true)}
            />
          )}
          {activeModule === 'machine_health' && (
            <MachineHealthModule config={fastApiConfig} />
          )}
          {activeModule === 'fraud_detection' && (
            <FraudDetectionModule config={fastApiConfig} />
          )}
          {activeModule === 'visual_analytics' && (
            <VisualAnalyticsModule />
          )}
          {activeModule === 'model_scoreboard' && (
            <ModelScoreboardModule config={fastApiConfig} />
          )}
          {activeModule === 'car_income' && (
            <CarIncomeModule config={fastApiConfig} />
          )}
          {activeModule === 'python_quiz' && (
            <PythonQuizModule />
          )}
        </main>
      </div>

      {/* Python FastAPI & Architecture Gateway Modal */}
      <FastApiModal
        isOpen={isFastApiModalOpen}
        onClose={() => setIsFastApiModalOpen(false)}
        config={fastApiConfig}
        onConfigChange={setFastApiConfig}
      />
    </div>
  );
}
