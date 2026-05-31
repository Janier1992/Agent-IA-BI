import React from "react";
import { 
  Database, 
  RefreshCw, 
  BarChart3, 
  Bot, 
  Plus, 
  Settings, 
  HelpCircle,
  UserCheck,
  LogOut
} from "lucide-react";

import { DataMetrics } from "../types";

interface SidebarProps {
  activeView: "hub" | "etl" | "dashboard" | "chat";
  onViewChange: (view: "hub" | "etl" | "dashboard" | "chat") => void;
  onNewQuery: () => void;
  onOpenConfig?: () => void;
  onOpenSupport?: () => void;
  apiConnected: boolean;
  currentUser?: { username: string; email: string } | null;
  onLogout?: () => void;
  sidebarOpen?: boolean;
  onCloseSidebar?: () => void;
  metrics?: DataMetrics;
}

export default function Sidebar({ 
  activeView, 
  onViewChange, 
  onNewQuery, 
  onOpenConfig,
  onOpenSupport,
  apiConnected,
  currentUser,
  onLogout,
  sidebarOpen,
  onCloseSidebar,
  metrics
}: SidebarProps) {
  return (
    <>
      {/* Mobile Sidebar Overlay Backdrop */}
      {sidebarOpen && (
        <div 
          onClick={onCloseSidebar}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
        ></div>
      )}

      <aside className={`fixed left-0 top-0 h-full w-[280px] bg-[#0b1326]/80 backdrop-blur-xl border-r border-white/10 flex flex-col z-50 overflow-y-auto transition-transform duration-300 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
      {/* Brand logo */}
      <div className="p-6">
        <h1 className="text-xl font-bold text-[#b6c4ff] tracking-tight hover:opacity-90 duration-150 cursor-pointer" onClick={() => { onViewChange("dashboard"); onCloseSidebar?.(); }}>
          STRATEGIST AI
        </h1>
        <p className="text-xs text-[#4edea3] mt-2 font-semibold uppercase tracking-widest flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3] animate-pulse"></span>
          Salud del Sistema: Óptima
        </p>
        <p className="text-[10px] text-[#b6c4ff] mt-1.5 font-bold uppercase tracking-widest flex items-center gap-2 bg-[#2a5ee8]/10 border border-[#2a5ee8]/20 px-2.5 py-1 rounded-full w-max select-none">
          <span className="w-2 h-2 rounded-full bg-[#2a5ee8] animate-ping"></span>
          Multi-Agent Team: ONLINE (5)
        </p>
      </div>

      {/* Main navigation links */}
      <nav className="flex-1 px-3 mt-4 space-y-1">
        <button
          onClick={() => { onViewChange("hub"); onCloseSidebar?.(); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded text-sm text-left font-medium transition-all ${
            activeView === "hub"
              ? "text-[#b6c4ff] bg-[#2d3449]/50 border-r-2 border-[#b6c4ff]"
              : "text-[#c3c5d7] hover:text-[#dae2fd] hover:bg-[#2d3449]/30"
          }`}
        >
          <Database className="w-4 h-4 text-inherit" />
          <span>Hub de Datos</span>
        </button>

        <button
          onClick={() => { onViewChange("etl"); onCloseSidebar?.(); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded text-sm text-left font-medium transition-all ${
            activeView === "etl"
              ? "text-[#b6c4ff] bg-[#2d3449]/50 border-r-2 border-[#b6c4ff]"
              : "text-[#c3c5d7] hover:text-[#dae2fd] hover:bg-[#2d3449]/30"
          }`}
        >
          <RefreshCw className="w-4 h-4 text-inherit" />
          <span>Espacio ETL</span>
        </button>

        {metrics?.businessDNA ? (
          <button
            onClick={() => { onViewChange("dashboard"); onCloseSidebar?.(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded text-sm text-left font-medium transition-all ${
              activeView === "dashboard"
                ? "text-[#b6c4ff] bg-[#2d3449]/50 border-r-2 border-[#b6c4ff]"
                : "text-[#c3c5d7] hover:text-[#dae2fd] hover:bg-[#2d3449]/30"
            }`}
          >
            <BarChart3 className="w-4 h-4 text-inherit text-[#4edea3]" />
            <span>Dashboard Ejecutivo</span>
          </button>
        ) : (
          <div
            title="Para acceder, la IA debe comprender su negocio primero (Cargue un dataset en el Hub de Datos)"
            className="w-full flex items-center justify-between px-4 py-3 rounded text-sm text-left font-medium text-[#c3c5d7]/40 cursor-not-allowed select-none bg-white/5 border border-dashed border-white/5 relative group"
          >
            <div className="flex items-center gap-3">
              <BarChart3 className="w-4 h-4 text-inherit" />
              <span>Dashboard Ejecutivo</span>
            </div>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 uppercase tracking-widest flex items-center gap-1">
              🔒 Bloqueado
            </span>
          </div>
        )}

        <button
          onClick={() => { onViewChange("chat"); onCloseSidebar?.(); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded text-sm text-left font-medium transition-all ${
            activeView === "chat"
              ? "text-[#b6c4ff] bg-[#2d3449]/50 border-r-2 border-[#b6c4ff]"
              : "text-[#c3c5d7] hover:text-[#dae2fd] hover:bg-[#2d3449]/30"
          }`}
        >
          <Bot className="w-4 h-4 text-inherit" />
          <span>Agente IA</span>
        </button>
      </nav>

      <div className="p-6 mt-auto space-y-6 border-t border-white/5">
        <button
          onClick={() => { onNewQuery(); onCloseSidebar?.(); }}
          className="w-full py-3 px-4 bg-[#2a5ee8] text-[#e7eaff] rounded-lg text-xs font-bold hover:bg-[#2a5ee8]/90 transition-all duration-150 active:scale-95 uppercase tracking-wider flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Consulta</span>
        </button>

        {/* Support & settings */}
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => { onOpenConfig?.(); onCloseSidebar?.(); }}
            className="flex items-center gap-3 px-4 py-1.5 text-sm text-[#c3c5d7] hover:text-[#dae2fd] hover:bg-[#2d3449]/20 rounded-md transition-all text-left cursor-pointer active:scale-[0.98]"
          >
            <Settings className="w-4 h-4 text-inherit" />
            <span>Configuración</span>
          </button>
          <button 
            onClick={() => { onOpenSupport?.(); onCloseSidebar?.(); }}
            className="flex items-center gap-3 px-4 py-1.5 text-sm text-[#c3c5d7] hover:text-[#dae2fd] hover:bg-[#2d3449]/20 rounded-md transition-all text-left cursor-pointer active:scale-[0.98]"
          >
            <HelpCircle className="w-4 h-4 text-inherit" />
            <span>Soporte</span>
          </button>
        </div>

        {/* Profile metadata */}
        <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 bg-[#1e293b] flex items-center justify-center">
              {/* Using the beautiful executive image link from mockup */}
              <img 
                alt="Executive Profile" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJ0oo6LAC3k1wdqfGdjXJALluC8FGBGuUYWyrWgLttQE6cEORxeSPa3BwyXjetQAKxYJis6trKyX9gf_DcOE3BVBVLWC4PRV1LTiQaDCjYBfLiqk0Sgj2a49Wj_dVOFU36DBgCKnPTM2Ked0JQcJqxfEf7kGNIj_iPNepe6wIRi-g0j1nzzxx_wMaZ0oExkAgK12gZ0PE39ku8XvDb0kThgExApQz0N9ZvfrEM2U4qxRVJ9o8O9v2InpWnyL-KXHyZFzPtMxrZzjg"
                onError={(e) => {
                  // Return a beautiful fallback avatar if network fails
                  e.currentTarget.style.display = 'none';
                }}
              />
              <UserCheck className="w-5 h-5 text-[#b6c4ff]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#dae2fd] truncate capitalize">
                {currentUser ? currentUser.username : "Director General"}
              </p>
              <p className="text-[10px] text-[#c3c5d7] truncate">
                {currentUser ? currentUser.email : "Empresa Premium"}
              </p>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full mt-1 py-2 px-4 bg-white/5 hover:bg-red-500/10 hover:text-red-300 text-xs font-semibold rounded-lg text-[#c3c5d7] transition-all flex items-center justify-center gap-2 border border-white/5 active:scale-95 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          )}
        </div>
      </div>
    </aside>
    </>
  );
}
