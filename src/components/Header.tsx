import React, { useState } from "react";
import { 
  Search, 
  Bell, 
  Sliders, 
  User, 
  AlertTriangle,
  Info,
  Menu
} from "lucide-react";

interface HeaderProps {
  apiConnected: boolean;
  onViewChange: (view: "hub" | "etl" | "dashboard" | "chat") => void;
  activeView: string;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  notificationPermission: string;
  onRequestPermission: () => void;
  onTestNotification: (delayed?: boolean) => void;
  onToggleSidebar?: () => void;
}

export default function Header({ 
  apiConnected, 
  onViewChange, 
  activeView,
  searchQuery,
  onSearchQueryChange,
  notificationPermission,
  onRequestPermission,
  onTestNotification,
  onToggleSidebar
}: HeaderProps) {
  const [showAlertsMenu, setShowAlertsMenu] = useState(false);

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[280px] w-full lg:w-[calc(100%-280px)] h-[72px] bg-[#0b1326]/80 backdrop-blur-xl border-b border-white/10 flex justify-between items-center px-4 sm:px-6 z-40">
      {/* Search Input Section & Branding */}
      <div className="flex items-center gap-2 sm:gap-6">
        {onToggleSidebar && (
          <button 
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-[#c3c5d7] hover:text-[#b6c4ff] hover:bg-white/5 transition-all cursor-pointer"
            title="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <span className="text-base sm:text-xl font-extrabold text-[#dae2fd] truncate">BI Autónomo</span>
        
        {/* Search tool */}
        <div className="relative w-80 hidden lg:block">
          <Search className="w-4 h-4 text-[#8d90a0] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="w-full bg-[#131b2e] border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-[#b6c4ff] focus:ring-1 focus:ring-[#b6c4ff]/30 text-[#dae2fd] placeholder:text-[#8d90a0] transition-all" 
            placeholder="Buscar conjuntos de datos, modelos o alertas..." 
            type="text"
          />
        </div>
      </div>

      {/* Navigation tabs & Tools */}
      <div className="flex items-center gap-3 sm:gap-6">
        <nav className="hidden sm:flex gap-2 sm:gap-6">
          <button 
            onClick={() => onViewChange("hub")}
            className={`text-xs sm:text-sm font-medium pb-1.5 border-b-2 transition-all ${
              activeView === "hub" 
                ? "text-[#b6c4ff] border-[#b6c4ff]" 
                : "text-[#c3c5d7] border-transparent hover:text-[#b6c4ff]"
            }`}
          >
            Datasets
          </button>
          <button 
            onClick={() => onViewChange("etl")}
            className={`text-xs sm:text-sm font-medium pb-1.5 border-b-2 transition-all ${
              activeView === "etl" 
                ? "text-[#b6c4ff] border-[#b6c4ff]" 
                : "text-[#c3c5d7] border-transparent hover:text-[#b6c4ff]"
            }`}
          >
            Modelos
          </button>
          <button 
            onClick={() => onViewChange("dashboard")}
            className={`text-xs sm:text-sm font-medium pb-1.5 border-b-2 transition-all ${
              activeView === "dashboard" 
                ? "text-[#b6c4ff] border-[#b6c4ff]" 
                : "text-[#c3c5d7] border-transparent hover:text-[#b6c4ff]"
            }`}
          >
            Alertas
          </button>
        </nav>

        <div className="h-6 w-px bg-white/10 mx-1"></div>

        {/* Dynamic Status Triggers */}
        <div className="flex items-center gap-3 relative">
          {/* Notifications Button */}
          <button 
            onClick={() => setShowAlertsMenu(!showAlertsMenu)}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-[#c3c5d7] hover:text-[#b6c4ff] hover:bg-white/5 transition-all relative"
            title="Saber más sobre el estado de la IA"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#ffb4ab] rounded-full animate-pulse"></span>
          </button>

          {/* Alerts dropdown description */}
          {showAlertsMenu && (
            <div className="absolute right-0 top-12 w-80 bg-[#171f33] border border-white/10 rounded-xl p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <h3 className="text-xs font-bold text-[#b6c4ff] tracking-wider uppercase mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#ffb4ab]" />
                Centro de Monitoreo Directo
              </h3>
              <div className="space-y-3">
                {/* Real-time Web Notification manager block */}
                <div className="p-3 bg-[#0a1226] rounded-lg border border-white/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#dae2fd] uppercase tracking-wider">Alertas del Director</span>
                    {notificationPermission === "granted" ? (
                      <span className="text-[9px] bg-green-500/15 text-[#4edea3] px-1.5 py-0.5 rounded font-extrabold uppercase font-mono">ACTIVAS</span>
                    ) : (
                      <span className="text-[9px] bg-[#dae2fd]/10 text-[#c3c5d7] px-1.5 py-0.5 rounded font-extrabold uppercase font-mono">INACTIVAS</span>
                    )}
                  </div>
                  
                  {notificationPermission === "default" && (
                    <button
                      id="btn-enable-notifications"
                      onClick={(e) => { e.stopPropagation(); onRequestPermission(); }}
                      className="w-full text-center py-1.5 bg-[#2a5ee8] hover:bg-[#2a5ee8]/90 text-white font-bold rounded text-[11px] transition-all uppercase tracking-wide cursor-pointer"
                    >
                      Activar Alertas de Navegador
                    </button>
                  )}

                  {notificationPermission === "granted" && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-[#8d90a0] leading-snug">
                        Recibe alertas críticas de KPIs cuando la pestaña esté inactiva.
                      </p>
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        <button
                          id="btn-test-notif-inst"
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onTestNotification(false); }}
                          className="text-center py-1 bg-white/5 hover:bg-white/10 text-[#dae2fd] font-bold rounded text-[9px] transition-all uppercase tracking-wider cursor-pointer"
                        >
                          Probar Visible
                        </button>
                        <button
                          id="btn-test-notif-del"
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onTestNotification(true); }}
                          title="Simular en fondo en 5s"
                          className="text-center py-1 bg-[#4edea3] hover:opacity-90 text-[#020617] font-bold rounded text-[9px] transition-all uppercase tracking-wider cursor-pointer"
                        >
                          Fondo (5s)
                        </button>
                      </div>
                    </div>
                  )}

                  {notificationPermission === "denied" && (
                    <div className="text-[10px] text-[#ffb4ab] leading-snug">
                      ⚠️ Permisos bloqueados. Habilítalos en el candado de la URL para recibir alarmas en segundo plano.
                    </div>
                  )}
                </div>

                <div className="p-2.5 bg-red-500/10 rounded border border-red-500/20 text-xs text-[#dae2fd]">
                  <p className="font-semibold text-[#ffb4ab] flex items-center gap-1.5">
                    <span>Retraso Almacén L-4</span>
                  </p>
                  <p className="opacity-80 mt-1">Impacto crítico detectado en el flujo global de EMEA.</p>
                </div>
                
                <div className="p-2.5 bg-[#4edea3]/10 rounded border border-[#4edea3]/20 text-xs text-[#dae2fd]">
                  <p className="font-semibold text-[#4edea3]">Crecimiento APAC en Alza</p>
                  <p className="opacity-80 mt-1">Súperavit del +22% compensa parcialmente la brecha local.</p>
                </div>

                {!apiConnected ? (
                  <div className="p-2.5 bg-yellow-500/10 rounded border border-yellow-500/20 text-xs text-[#dae2fd]">
                    <p className="font-semibold text-yellow-300 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5" />
                      Clave de IA Simulada
                    </p>
                    <p className="opacity-80 mt-1">
                      GEMINI_API_KEY no detectada. La IA opera en modo local simulado. Agregue su secreto en el panel de AI Studio.
                    </p>
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); onViewChange("chat"); setShowAlertsMenu(false); }}
                      className="inline-block mt-2 text-[#b6c4ff] underline hover:text-white"
                    >
                      Ver chat con IA →
                    </a>
                  </div>
                ) : (
                  <div className="p-2.5 bg-green-500/10 rounded border border-green-500/25 text-xs text-green-300">
                    <p className="font-semibold">¡Conectado a Google Gemini!</p>
                    <p className="opacity-80 mt-1 text-[#dae2fd]">El análisis se procesa de forma directa con gemini-3.5-flash en tiempo real.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Active Model System info */}
          <button 
            onClick={() => onViewChange("etl")}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-[#c3c5d7] hover:text-[#b6c4ff] hover:bg-white/5 transition-all"
            title="Configuración de conectores"
          >
            <Sliders className="w-5 h-5" />
          </button>

          {/* Profile Quick Jump */}
          <button 
            onClick={() => onViewChange("chat")}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-[#c3c5d7] hover:text-[#b6c4ff] hover:bg-white/5 transition-all"
            title="Consola del Agente Directo"
          >
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
