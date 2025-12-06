import React from "react";
import { AppView } from "../types";
import {
  BookOpen,
  MessageCircle,
  GraduationCap,
  Languages,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface LayoutProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
  currentView,
  setCurrentView,
  children,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const NavItem = ({
    view,
    icon: Icon,
    label,
  }: {
    view: AppView;
    icon: any;
    label: string;
  }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setIsMobileMenuOpen(false);
      }}
      title={isCollapsed ? label : undefined}
      className={`flex items-center ${
        isCollapsed ? "justify-center" : "space-x-3"
      } w-full p-3 rounded-lg transition-all duration-200 ${
        currentView === view
          ? "bg-sweden-blue text-white shadow-lg"
          : "text-gray-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon size={20} className="shrink-0" />
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
        }`}
      >
        <span className="font-medium whitespace-nowrap">{label}</span>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-900 text-white overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-800 p-4 flex justify-between items-center border-b border-slate-700 z-50">
        <div className="flex items-center space-x-2">
          <img
            src="/logo.svg"
            alt="SvenskaAi Logo"
            className="w-8 h-8 object-contain"
          />
          <span className="text-xl font-bold tracking-tight">
            Svenska<span className="text-sweden-blue">Ai</span>
          </span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div
        className={`
        fixed inset-0 z-40 bg-slate-900/95 backdrop-blur-sm transition-all duration-300 ease-in-out
        md:relative md:translate-x-0 md:bg-slate-800 md:border-r md:border-slate-700 md:flex md:flex-col
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        ${isCollapsed ? "md:w-20" : "md:w-64"}
      `}
      >
        <div className="px-5 py-6 hidden md:flex items-center mb-6 relative overflow-hidden whitespace-nowrap">
          <img
            src="/logo.svg"
            alt="SvenskaAi Logo"
            className="w-10 h-10 shrink-0 transition-all duration-300 object-contain"
          />
          <div
            className={`transition-all duration-300 ease-in-out origin-left ${
              isCollapsed
                ? "w-0 opacity-0 scale-95 ml-0"
                : "w-auto opacity-100 scale-100 ml-2"
            }`}
          >
            <span className="text-2xl font-bold tracking-tight whitespace-nowrap">
              Svenska<span className="text-sweden-blue">Ai</span>
            </span>
          </div>
        </div>

        {/* Toggle Button (Desktop only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3 top-9 bg-slate-700 text-slate-300 hover:text-white rounded-full p-1 border border-slate-600 shadow-lg z-50 hover:bg-slate-600 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <nav className="flex-1 px-4 space-y-2 pt-4 md:pt-0">
          <NavItem
            view={AppView.DASHBOARD}
            icon={BookOpen}
            label="Daglig Dos"
          />
          <NavItem
            view={AppView.CHAT}
            icon={MessageCircle}
            label="Tutor Sven"
          />
          <NavItem
            view={AppView.QUIZ}
            icon={GraduationCap}
            label="Quiz Arena"
          />
          <NavItem
            view={AppView.TRANSLATE}
            icon={Languages}
            label="Översättare"
          />
        </nav>

        <div
          className={`p-6 border-t border-slate-700 text-xs text-slate-500 overflow-hidden whitespace-nowrap transition-all duration-300 ${
            isCollapsed ? "opacity-0 h-0 p-0" : "opacity-100 h-auto"
          }`}
        >
          <p>Powered by Google Gemini</p>
          <p className="mt-1">© 2024 SvenskaAi</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 relative">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sweden-blue/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-sweden-yellow/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
