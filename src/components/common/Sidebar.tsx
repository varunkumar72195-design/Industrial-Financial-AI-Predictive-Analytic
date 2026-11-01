import React from 'react';
import {
  LayoutDashboard,
  Activity,
  ShieldAlert,
  BarChart3,
  Award,
  Car,
  Code2,
  Cpu,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';

export type ModuleKey =
  | 'overview'
  | 'machine_health'
  | 'fraud_detection'
  | 'visual_analytics'
  | 'model_scoreboard'
  | 'car_income'
  | 'python_quiz';

interface NavItem {
  id: ModuleKey;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  badge?: string;
  moduleNum: string;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'overview',
    label: 'Dashboard Overview',
    shortLabel: 'Overview',
    icon: LayoutDashboard,
    moduleNum: '00',
    description: 'Executive KPIs, fleet status & module launchpad',
  },
  {
    id: 'machine_health',
    label: '1. Machine Health',
    shortLabel: 'Machine Health',
    icon: Activity,
    moduleNum: '01',
    description: 'Industrial sensor telemetry & failure prediction',
  },
  {
    id: 'fraud_detection',
    label: '2. Fraud Detector',
    shortLabel: 'Fraud Detector',
    icon: ShieldAlert,
    moduleNum: '02',
    description: 'Financial anomaly screening & risk scoring',
  },
  {
    id: 'visual_analytics',
    label: '3. Visual Charts',
    shortLabel: 'Visual Charts',
    icon: BarChart3,
    moduleNum: '03',
    description: 'Failure & fraud distributions & feature weights',
  },
  {
    id: 'model_scoreboard',
    label: '4. AI Scoreboard',
    shortLabel: 'AI Scoreboard',
    icon: Award,
    moduleNum: '04',
    description: 'Algorithm comparisons & empirical benchmarks',
  },
  {
    id: 'car_income',
    label: '5. Car & Income',
    shortLabel: 'Car & Income',
    icon: Car,
    moduleNum: '05',
    description: 'Vehicle depreciation regression & census income',
  },
  {
    id: 'python_quiz',
    label: '6. Python Quiz',
    shortLabel: 'Python Quiz',
    icon: Code2,
    badge: '10 Qs',
    moduleNum: '06',
    description: '10 Data science & ML questions with feedback',
  },
];

interface SidebarProps {
  activeModule: ModuleKey;
  onSelectModule: (key: ModuleKey) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onToggleMobile: () => void;
  onOpenFastApiModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onToggleMobile,
  onOpenFastApiModal,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onToggleMobile}
        />
      )}

      {/* Mobile Floating Button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={onToggleMobile}
          className="p-3.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/30 flex items-center justify-center transition"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 flex flex-col bg-[#0b101d] border-r border-slate-800/90 transition-all duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 bg-[#090d18]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-900/40 shrink-0">
              <Cpu className="w-5 h-5 text-cyan-200" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-extrabold text-white tracking-tight leading-none truncate">
                  AI PREDICTIVE
                </span>
                <span className="text-[10px] font-semibold text-cyan-400 tracking-wider uppercase mt-1 truncate">
                  Enterprise Analytics Suite
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Section Label */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="px-5 pt-4 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Navigation Modules
            </span>
          </div>
        )}

        {/* Navigation Items List */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectModule(item.id);
                  if (isMobileOpen) onToggleMobile();
                }}
                title={isCollapsed && !isMobileOpen ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition group relative text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                )}

                <div
                  className={`p-2 rounded-lg shrink-0 transition ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : 'bg-slate-800/70 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-700/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {(!isCollapsed || isMobileOpen) && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold truncate text-slate-200 group-hover:text-white">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {item.description}
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer / FastApi Guide Link */}
        <div className="p-3 border-t border-slate-800/80 bg-[#090d18]">
          <button
            onClick={onOpenFastApiModal}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/70 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            <Cpu className="w-4 h-4 text-cyan-400" />
            {(!isCollapsed || isMobileOpen) && <span>Architecture Gateway</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
