import React, { useState, useEffect, useRef } from "react";
import { apiFetch } from "./apiClient";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DataHubPanel from "./components/DataHubPanel";
import ETLWorkspacePanel from "./components/ETLWorkspacePanel";
import ExecutiveDashboardPanel from "./components/ExecutiveDashboardPanel";
import AIAgentChatPanel from "./components/AIAgentChatPanel";
import LoginPanel from "./components/LoginPanel";
import { DataMetrics, ValidationLog, ChatMessage, AgentState } from "./types";

interface AppToast {
  id: string;
  title: string;
  body: string;
}

export default function App() {
  // Session States
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("agent_bi_is_logged_in") === "true";
    }
    return false;
  });

  const [currentUser, setCurrentUser] = useState<any | null>(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("agent_bi_current_user");
      return user ? JSON.parse(user) : null;
    }
    return null;
  });

  // Navigation State Layouts
  const [activeView, setActiveView] = useState<"hub" | "etl" | "dashboard" | "chat">(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("agent_bi_is_logged_in") === "true" ? "hub" : "chat";
    }
    return "chat";
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [apiConnected, setApiConnected] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Shared Chat Messages List State
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Fluctuating cognitive load and agent state for 24/7 simulation
  const [agents, setAgents] = useState<AgentState[]>([]);

  // Live consolidated metrics synchronized with the back-end
  const [metrics, setMetrics] = useState<DataMetrics>({
    revenue: 0,
    users: 0,
    riskScore: 0,
    efficiency: 0,
    warehouseDelay: false,
    activeDataset: "Ninguno",
  });

  const handleLoginSuccess = (user: { username: string; email: string }) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
    localStorage.setItem("agent_bi_is_logged_in", "true");
    localStorage.setItem("agent_bi_current_user", JSON.stringify(user));
    setActiveView("hub");
    handleAddLog("Sistema", `Sesión iniciada correctamente por el usuario: ${user.username}`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem("agent_bi_is_logged_in");
    localStorage.removeItem("agent_bi_current_user");
    handleAddLog("Sistema", "Sesión finalizada por el usuario. Redirigiendo a Login.");
    
    // Clear chat logs in InsForge database
    apiFetch("/api/clear-chat", { method: "POST" }).catch(err => console.error("Failed to clear chat on logout:", err));
  };

  // Browser Notification Settings State
  const [notificationPermission, setNotificationPermission] = useState<string>("default");
  const [toasts, setToasts] = useState<AppToast[]>([]);

  // Dashboard history state persistable in localStorage
  const [dashboardHistory, setDashboardHistory] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("agent_bi_dashboard_history");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Currently viewed dashboard from history
  const [selectedHistoryDashboard, setSelectedHistoryDashboard] = useState<any | null>(null);

  // Synchronize dashboardHistory to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("agent_bi_dashboard_history", JSON.stringify(dashboardHistory));
  }, [dashboardHistory]);

  const handleGenerateDashboard = async (companyName?: string, businessDescription?: string) => {
    try {
      const res = await apiFetch("/api/generate-dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, businessDescription })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.dashboardItem) {
          // Append to history list (most recent first)
          setDashboardHistory(prev => [data.dashboardItem, ...prev]);
          setSelectedHistoryDashboard(data.dashboardItem);
          setActiveView("dashboard");
          
          handleAddLog("Sistema", `Dashboard consolidado y guardado en historial: "${data.dashboardItem.name}"`);
          handleAddLog("Integridad", "Limpieza de base de datos PostgreSQL exitosa. Datos temporales purgados.");
          return data.dashboardItem;
        }
      }
    } catch (err) {
      console.error("Error generating dashboard:", err);
    }
    return null;
  };

  // Track previous metrics for drastic anomalies detecting
  const prevMetricsRef = useRef<DataMetrics>(metrics);

  // Streaming logs list initialized with system defaults
  const [logs, setLogs] = useState<ValidationLog[]>([
    { id: "log-1", time: "14:22:01", category: "Sistema", message: "Agente de Ingestión de Datos inicializado." },
    { id: "log-2", time: "14:22:05", category: "Escaneo", message: "Escaneando endpoints y conectores con clave de seguridad..." },
    { id: "log-3", time: "14:22:12", category: "Análisis", message: "Catálogo de metadatos actualizado: 42 entidades ubicadas." },
    { id: "log-4", time: "14:23:45", category: "Integridad", message: "Relación identificada: customer_id en 'Sales_Q3' coincide con uid en 'CRM_Master' de forma estable." },
    { id: "log-5", time: "14:24:10", category: "Alerta", message: "Valores nulos parciales detectados en región_code. Auto-curación del motor en progreso..." },
  ]);

  // Synchronize initial configuration states with Express server
  useEffect(() => {
    async function fetchSystemStatus() {
      try {
        const res = await apiFetch("/api/status");
        if (res.ok) {
          const data = await res.json();
          setApiConnected(data.apiConnected);
          if (data.activeMetrics) {
            setMetrics(data.activeMetrics);
            prevMetricsRef.current = data.activeMetrics;
          }
          if (data.agents) {
            setAgents(data.agents);
          }
          if (data.apiConnected) {
            handleAddLog("Sistema", "Conexión encriptada directa con el motor Google Gemini establecida con éxito.");
          } else {
            handleAddLog("Alerta", "Modo demo activo. Cargue un dataset para comenzar el análisis.");
          }
        }

        // Load persistent chat history from database
        const historyRes = await apiFetch("/api/chat-history");
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          if (historyData.history && historyData.history.length > 0) {
            setMessages(historyData.history);
          }
        }

        // Load persistent logs from database
        const logsRes = await apiFetch("/api/etl-logs");
        if (logsRes.ok) {
          const logsData = await logsRes.json();
          if (logsData.logs && logsData.logs.length > 0) {
            setLogs(logsData.logs);
          }
        }
      } catch (err) {
        console.error("Failed to query API Status & Data History:", err);
      }
    }
    fetchSystemStatus();

    // Check notification permissions in browser
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Periodically synchronize metrics with database to capture background ETL modifications
  useEffect(() => {
    async function syncMetrics() {
      try {
        const res = await apiFetch("/api/status");
        if (res.ok) {
          const data = await res.json();
          if (data.activeMetrics) {
            setMetrics(data.activeMetrics);
          }
          if (data.agents) {
            setAgents(data.agents);
          }
        }
      } catch (err) {
        console.error("Failed to dynamically sync metrics:", err);
      }
    }

    const interval = setInterval(syncMetrics, 4000);
    return () => clearInterval(interval);
  }, []);

  // Reactively monitor drastic anomalies or changes to metrics
  useEffect(() => {
    const prev = prevMetricsRef.current;
    if (!prev) return;

    let triggerAlert = false;
    let title = "";
    let body = "";

    // A. Warehouse delay toggled on (anomaly)
    if (metrics.warehouseDelay && !prev.warehouseDelay) {
      triggerAlert = true;
      title = "🚨 Anomalía Crítica Logística";
      body = "Fallo en Almacén L-4: Retraso perjudicial detectado en transporte terrestre para la Eurozona.";
    }
    // B. Risk Score spiked past 20% or grew significantly
    else if (metrics.riskScore > 20 && prev.riskScore <= 20) {
      triggerAlert = true;
      title = "⚠️ Incremento de Riesgo Crítico";
      body = `El índice general de riesgo operativo ha sobrepasado el límite de control directivo: ${metrics.riskScore}%.`;
    }
    // C. Efficiency plummeted below 90%
    else if (metrics.efficiency < 90 && prev.efficiency >= 90) {
      triggerAlert = true;
      title = "📉 Caída de Eficiencia Operativa";
      body = `La eficiencia de procesamiento se sitúa por debajo del límite admisible: ${metrics.efficiency}%.`;
    }
    // D. Active Dataset is changed to a new one
    else if (metrics.activeDataset !== prev.activeDataset) {
      triggerAlert = true;
      title = "📂 Nuevo Conjunto de Datos Ingestado";
      body = `Se ha registrado y catalogado el dataset directivo: "${metrics.activeDataset}".`;
    }

    if (triggerAlert) {
      sendBrowserNotification(title, body);
    }

    prevMetricsRef.current = metrics;
  }, [metrics]);

  // Request browser permission for direct notifications
  const requestNotificationPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        const res = await Notification.requestPermission();
        setNotificationPermission(res);
        if (res === "granted") {
          handleAddLog("Sistema", "Director General otorgó privilegios de notificación nativos del navegador.");
          sendBrowserNotification(
            "🔔 Alertas de Navegador Activadas",
            "La consola de Strategist AI ahora le alertará ante anomalías críticas o cambios drásticos en los KPIs cuando la pestaña no esté activa.",
            true
          );
        } else if (res === "denied") {
          handleAddLog("Alerta", "Permiso de notificaciones denegado. Se utilizarán alertas internas de respaldo.");
        }
      } catch (err) {
        console.error("Error requesting notifications permission:", err);
      }
    } else {
      handleAddLog("Alerta", "Su navegador no es compatible con la API de Web Notifications.");
    }
  };

  // Process and push modern native notification or fallback toast
  const sendBrowserNotification = (title: string, body: string, force = false) => {
    const isTabInactive = document.visibilityState === "hidden";
    
    // According to instructions, trigger browser notification when tab is inactive. 
    // If visible, we show a highly aesthetic in-app OS Toast component as ideal UX fallback.
    if (!isTabInactive && !force) {
      triggerAppToast(title, body);
      handleAddLog("Alerta", `Cambio detectado: ${title} — ${body}`);
      return;
    }

    // Attempt real Web Notification
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        const n = new Notification(title, {
          body: body,
          icon: "https://lh3.googleusercontent.com/aida-public/AB6AXuCzN4Z3RMHG71kaqh-dLDqRrJZ3wtBZYsxRC8ogJVXEzyX1seU6P4kfJMqne8KrMYY0LEpMRuVIa7xlDQ67BMVB-5z088b-ggj9ZG2naPbWGXpcEYJpMpn-VoOeSO3ToxjCl323RlKzr-Te1k6mV0-2QR3pi9ZHbQ1q80UsUmxwxjcm5FNdQJDVWOPoXOXp_NlZgCFqKxOjM020isENk7b8WaSB0L8XF_oFsEhS6nVcAJqidopBu6sDUWrdX3DjAp-KD89Bv8nwu6E",
          tag: "strategist-ai-anomaly",
        });
        
        n.onclick = () => {
          window.focus();
          n.close();
        };
      } catch (err) {
        console.warn("Real Web Notification blocked by browser sandbox/iframe constraints, triggering fallback Toast:", err);
        triggerAppToast(title, body);
      }
    } else {
      triggerAppToast(title, body);
    }
    
    handleAddLog("Alerta", `Alertado en segundo plano: ${title} — ${body}`);
  };

  // Helper to trigger fully styled in-app Toast alerts
  const triggerAppToast = (title: string, body: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, title, body }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 6000);
  };

  // Triggers instant test simulations to demonstrate visibilityState changes
  const triggerTestNotification = (delayed = false) => {
    const title = "🚨 Desfase Crítico Logístico [Modo Simulador]";
    const body = "Alerta del Director General: Incremento espontáneo de un +14.6% en el riesgo consolidado de EMEA.";
    
    if (delayed) {
      handleAddLog("Sistema", "Simulando anomalía en 5 segundos. ¡Cambia de pestaña o minimiza para recibir la alerta nativa!");
      triggerAppToast(
        "⏱️ Simulación de Notificación en 5s",
        "Configurado. Cambia de pestaña en tu navegador ahora mismo para verificar la alerta de fondo."
      );
      setTimeout(() => {
        sendBrowserNotification(title, body, false); // false enforces document.visibilityState === 'hidden'
      }, 5000);
    } else {
      handleAddLog("Sistema", "Simulando anomalía crítica instantánea.");
      sendBrowserNotification(title, body, true); // true forces alert even if visible
    }
  };

  // Update metrics parameters dynamically
  const handleUpdateMetrics = async (updated: Partial<DataMetrics>) => {
    setMetrics(prev => ({ ...prev, ...updated }));
    try {
      await apiFetch("/api/update-metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error("Failed to sync metrics with server state:", err);
    }
  };

  // Perform immediate dataset registration, state redirection, and welcome analytics trigger
  const handleDatasetLoaded = (newMetrics: DataMetrics, processType?: string) => {
    setMetrics(newMetrics);
    handleAddLog("Sistema", `Fijando nuevo dataset activo: ${newMetrics.activeDataset}`);
    handleAddLog("Análisis", `Registrando nuevas dimensiones: $ ${newMetrics.revenue.toLocaleString()} COP de costo de no calidad.`);
    
    // Redirect to conversation view instantly as requested
    setActiveView("chat");

    const formattedTime = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) + " PM";
    const selectedProcess = processType || "Analítica de Calidad Directiva";
    setMessages(prev => [
      ...prev,
      {
        id: `user-notif-${Date.now()}`,
        role: "user",
        text: `[Sistema] Dataset cargado correctamente: "${newMetrics.activeDataset}" para iniciar el proceso de: ${selectedProcess}`,
        timestamp: `${formattedTime} • SISTEMA`
      },
      {
        id: `welcome-${Date.now()}`,
        role: "model",
        text: `### Estimado cliente, bienvenido al módulo agéntico donde te guiaré para poder llevar a cabo todo tu proceso de tratamiento de data y gestión de indicadores de alto impacto.
 
Hemos recibido con éxito tu conjunto de datos **"${newMetrics.activeDataset}"** para iniciar el proceso de **${selectedProcess}**.
 
A continuación, te comparto un **análisis sencillo** de cómo se configuran tus métricas actualmente:
 
*   **Proceso:** \`${selectedProcess}\`
*   **Conjunto de Datos:** \`${newMetrics.activeDataset}\`
*   **Costo de No Calidad:** \`$ ${newMetrics.revenue.toLocaleString()} COP\`
*   **Muestras Totales:** \`${newMetrics.users.toLocaleString()} inspecciones\`
*   **Tasa de Conformidad:** \`${newMetrics.efficiency}%\`
*   **Alerta de Desviación:** \`${newMetrics.warehouseDelay ? "SÍ (Ajuste requerido en ETL)" : "NO (Estable)"}\`
*   **Tasa de No Conformidad:** \`${newMetrics.riskScore}%\`
 
#### 🛠️ Próximos Pasos en el Tratamiento de Datos (ETL)
Como parte del proceso, he notado que el conjunto de datos de calidad mejoraría con una rápida limpieza de IDs duplicados y calibración de tolerancias.
 
**No tienes que salirte de esta conversación**. Podemos seguir analizando y haciendo consultas aquí mismo de forma cercana y directa.
Si deseas ver cómo se realiza la limpieza y calibración en tiempo real en la consola, puedes visitar el **Espacio ETL** en el menú de navegación izquierdo y regresar al chat cuando gustes.
 
¿Qué consulta te gustaría realizar primero sobre tus datos?`,
        timestamp: `${formattedTime} • RECIBIDO`,
        hasVarianceChart: false
      }
    ]);

    // Update backend metric state asynchronously
    apiFetch("/api/update-metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMetrics),
    }).catch(err => console.error("Error updating metrics backend on load:", err));
  };

  const handleCompleteETL = () => {
    // 1. Identify dataset typology dynamically based on Quality Control Plants
    const lowercase = (metrics.activeDataset || "").toLowerCase();
    let typologyDesc = "";
    let cleanStatusText = "";

    if (lowercase.includes("bogota") || lowercase.includes("planta_q3")) {
      typologyDesc = "Aseguramiento de Calidad - Planta Bogotá";
      cleanStatusText = `*   **Deduplicación de Operadores:** Identificaciones y turnos de inspectores consolidados sin solapamientos.
*   **Calibración de Tolerancia de Soldadura:** Ajustado dentro del rango óptimo del 99.8%.
*   **Muestras Totales Inspeccionadas:** \`${metrics.users.toLocaleString()} unidades\`.
*   **Tasa de Conformidad de Ensamble:** Aumentada a \`98.6%\` (Rango Verde).
*   **Costo de No Calidad Remanente:** \`$ ${metrics.revenue.toLocaleString()} COP\`.`;
    } else if (lowercase.includes("cali") || lowercase.includes("logist") || lowercase.includes("despachos")) {
      typologyDesc = "Calidad en Distribución y Despachos - Planta Cali";
      cleanStatusText = `*   **Normalización de Registro de Despachos:** Registro de estibación y control de temperatura de contenedores saneados.
*   **Corrección de Incidencias en Embalaje:** Remoción de registros duplicados por daños en transporte.
*   **Muestras Totales Inspeccionadas:** \`${metrics.users.toLocaleString()} despachos\`.
*   **Tasa de Conformidad de Despachos:** Elevada a \`98.6%\` (Rango de Excelencia).
*   **Costo de No Calidad Logística:** \`$ ${metrics.revenue.toLocaleString()} COP\`.`;
    } else if (lowercase.includes("medellin") || lowercase.includes("planta_2") || lowercase.includes("mejora")) {
      typologyDesc = "Control Estadístico de Espesores - Planta Medellín";
      cleanStatusText = `*   **Alineación de Lecturas de Consistencia:** Corrección heurística de lecturas de espesor de película nulas.
*   **Ajuste de Desviación en Caliente:** Sensores recalibrados automáticamente a nivel de base de datos.
*   **Muestras Totales Inspeccionadas:** \`${metrics.users.toLocaleString()} muestras de planta\`.
*   **Tasa de Conformidad de Espesor:** Alcanzó el \`98.6%\` en PostgreSQL.
*   **Costo de No Calidad de Extrusión:** \`$ ${metrics.revenue.toLocaleString()} COP\`.`;
    } else {
      typologyDesc = "Auditoría de Garantías y Retornos - Cobertura Nacional Colombia";
      cleanStatusText = `*   **Resolución de Causa-Raíz:** Códigos de devolución vinculados con registros de producción históricos.
*   **Limpieza de Cuentas Directivas:** Historial de reclamos consolidados sin redundancias.
*   **Reclamaciones Totales Inspeccionadas:** \`${metrics.users.toLocaleString()} reclamaciones\`.
*   **Tasa de Conformidad de Garantías:** Consolidada en \`98.6%\` en InsForge PostgreSQL.
*   **Costo de No Calidad Nacional:** \`$ ${metrics.revenue.toLocaleString()} COP\`.`;
    }

    // 2. Add System Logs
    handleAddLog("Integridad", `[ETL ÉXITO] Saneamiento completo para tipología: ${typologyDesc}`);

    // 3. Improve Metrics State
    setMetrics(prev => ({
      ...prev,
      efficiency: 98.6,
      warehouseDelay: false,
    }));

    // 4. Append AI Agent Follow-up Message
    const formattedTime = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) + " PM";
    setMessages(prev => [
      ...prev,
      {
        id: `etl-complete-${Date.now()}`,
        role: "model",
        text: `### 🛠️ ¡Pipeline ETL de Control de Calidad Completado con Éxito en InsForge PostgreSQL!

He finalizado la ejecución de la limpieza de datos y la normalización de esquemas para tu conjunto de datos de **${typologyDesc}** (\`${metrics.activeDataset}\`). 

Los registros se encuentran completamente saneados y validados. A continuación se detalla el estado actual de calidad:

${cleanStatusText}
*   **Estado de la Base de Datos:** Los registros operacionales temporales están listos para la toma de decisiones. 

Una vez que revises esta información, **¿cuál es el siguiente paso que deseas realizar?** 
Dímelo y consolidaré el cuadro de mando en nuestro backend para optimizar el almacenamiento del servidor.

Listo, ya puedes ir al dashboard ejecutivo y mirar el indicador que hemos creado para ti con tus datos.`,
        timestamp: `${formattedTime} • RECIBIDO`
      }
    ]);
  };

  // Add new real-time log entries to validation console streams
  const handleAddLog = (logOrCategory: Omit<ValidationLog, "id"> | ValidationLog["category"], message?: string) => {
    if (typeof logOrCategory === "object" && logOrCategory !== null) {
      const newLog: ValidationLog = {
        id: `log-${Date.now()}`,
        time: logOrCategory.time || new Date().toLocaleTimeString("en-GB"),
        category: logOrCategory.category,
        message: logOrCategory.message,
      };
      setLogs(prev => [...prev, newLog]);
    } else if (typeof logOrCategory === "string" && message) {
      const newLog: ValidationLog = {
        id: `log-${Date.now()}`,
        time: new Date().toLocaleTimeString("en-GB"),
        category: logOrCategory as ValidationLog["category"],
        message: message,
      };
      setLogs(prev => [...prev, newLog]);
    }
  };

  const handleNewQuery = () => {
    setActiveView("chat");
    setMessages([]); // Make sure messages state is cleared completely!
    handleAddLog("Sistema", `${currentUser ? currentUser.username : "Director"} inició un nuevo canal de consulta estratégica.`);
    
    // Clear chat logs in InsForge database
    apiFetch("/api/clear-chat", { method: "POST" }).catch(err => console.error("Failed to clear chat on new query:", err));
  };

  if (!isLoggedIn) {
    return (
      <div className="bg-[#020617] text-[#dae2fd] font-sans min-h-screen relative overflow-x-hidden selection:bg-[#2a5ee8]/35 selection:text-white">
        <LoginPanel onLoginSuccess={handleLoginSuccess} />
        
        {/* Floating toasts for login feedback */}
        <div className="fixed top-24 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
          {toasts.map((toast) => (
            <div 
              id={`toast-${toast.id}`}
              key={toast.id}
              className="pointer-events-auto bg-[#0f1b35] border-l-4 border-[#ffb4ab] border border-white/10 rounded-r-xl p-4 shadow-2xl flex gap-3 animate-in fade-in slide-in-from-right-10 duration-200"
            >
              <div className="shrink-0 text-[#ffb4ab] mt-1 shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 id={`toast-title-${toast.id}`} className="text-xs font-extrabold text-[#dae2fd] uppercase tracking-wider">{toast.title}</h4>
                <p id={`toast-body-${toast.id}`} className="text-xs text-[#c3c5d7] mt-1 pr-6">{toast.body}</p>
              </div>
              <button 
                id={`toast-close-${toast.id}`}
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-[#8d90a0] hover:text-white shrink-0 self-start text-sm font-bold font-mono px-1 hover:bg-white/5 rounded transition-all"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#020617] text-[#dae2fd] font-sans min-h-screen relative overflow-x-hidden selection:bg-[#2a5ee8]/35 selection:text-white">
      
      {/* Sidebar navigation hub */}
      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView} 
        onNewQuery={handleNewQuery}
        apiConnected={apiConnected}
        currentUser={currentUser}
        onLogout={handleLogout}
        sidebarOpen={sidebarOpen}
        onCloseSidebar={() => setSidebarOpen(false)}
      />

      {/* Top Header tools bar */}
      <Header 
        apiConnected={apiConnected} 
        onViewChange={setActiveView} 
        activeView={activeView}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        notificationPermission={notificationPermission}
        onRequestPermission={requestNotificationPermission}
        onTestNotification={triggerTestNotification}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Responsive Workspace Grid */}
      <main className="ml-0 lg:ml-[280px] pt-[72px] h-[calc(100vh-72px)] flex flex-col overflow-hidden">
        
        {activeView === "hub" && (
          <DataHubPanel 
            metrics={metrics} 
            onUpdateMetrics={handleUpdateMetrics} 
            onDatasetLoaded={handleDatasetLoaded}
            logs={logs} 
            onAddLog={handleAddLog}
            searchFilter={searchQuery}
          />
        )}

        {activeView === "etl" && (
          <ETLWorkspacePanel 
            metrics={metrics} 
            logs={logs} 
            onAddLog={handleAddLog} 
            onViewChange={setActiveView}
            onCompleteETL={handleCompleteETL}
          />
        )}

        {activeView === "dashboard" && (
          <ExecutiveDashboardPanel 
            metrics={metrics} 
            onUpdateMetrics={handleUpdateMetrics} 
            onViewChange={setActiveView}
            notificationPermission={notificationPermission}
            onRequestPermission={requestNotificationPermission}
            onTestNotification={triggerTestNotification}
            dashboardHistory={dashboardHistory}
            selectedHistoryDashboard={selectedHistoryDashboard}
            onSelectHistoryDashboard={setSelectedHistoryDashboard}
            onClearHistory={() => {
              setDashboardHistory([]);
              setSelectedHistoryDashboard(null);
            }}
          />
        )}

        {activeView === "chat" && (
          <AIAgentChatPanel 
            metrics={metrics} 
            onUpdateMetrics={handleUpdateMetrics} 
            messages={messages}
            setMessages={setMessages}
            apiConnected={apiConnected}
            onViewChange={setActiveView}
            onGenerateDashboard={handleGenerateDashboard}
            agents={agents}
          />
        )}

      </main>

      {/* Embedded slide-in Toast alert box floating in top-right */}
      <div className="fixed top-24 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div 
            id={`toast-${toast.id}`}
            key={toast.id}
            className="pointer-events-auto bg-[#0f1b35] border-l-4 border-[#ffb4ab] border border-white/10 rounded-r-xl p-4 shadow-2xl flex gap-3 animate-in fade-in slide-in-from-right-10 duration-200"
          >
            <div className="shrink-0 text-[#ffb4ab] mt-1 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 id={`toast-title-${toast.id}`} className="text-xs font-extrabold text-[#dae2fd] uppercase tracking-wider">{toast.title}</h4>
              <p id={`toast-body-${toast.id}`} className="text-xs text-[#c3c5d7] mt-1 pr-6">{toast.body}</p>
            </div>
            <button 
              id={`toast-close-${toast.id}`}
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="text-[#8d90a0] hover:text-white shrink-0 self-start text-sm font-bold font-mono px-1 hover:bg-white/5 rounded transition-all"
            >
              ×
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
