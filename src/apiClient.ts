/// <reference types="vite/client" />

import { AgentCollaborationLog } from "./types";

/**
 * API Client helper — detecta automáticamente si el backend Express
 * está disponible (desarrollo local) o si se está corriendo como
 * sitio estático (GitHub Pages). En modo estático, devuelve datos mock.
 */

// Detectar si hay backend disponible
const IS_STATIC_MODE = import.meta.env.VITE_APP_MODE === 'static' || 
  !window.location.hostname.includes('localhost') &&
  !window.location.hostname.includes('127.0.0.1') &&
  !window.location.hostname.includes('192.168.');

// Estado mock para modo estático
const mockState = {
  apiConnected: false,
  activeMetrics: {
    revenue: 0,
    users: 0,
    riskScore: 0,
    efficiency: 0,
    warehouseDelay: false,
    activeDataset: 'Ninguno',
  },
  chatHistory: [] as any[],
  logs: [] as any[],
  rawInspections: [] as any[],
};

/** Wrapper fetch que intercepta rutas /api/* en modo estático */
export async function apiFetch(url: string, options?: RequestInit): Promise<{ ok: boolean; json: () => Promise<any> }> {
  if (!IS_STATIC_MODE) {
    // Modo desarrollo: llamada real al backend Express
    const res = await fetch(url, options);
    return res;
  }

  // Modo estático (GitHub Pages): retornar respuestas mock
  const path = url.split('?')[0];

  if (path === '/api/status') {
    return mockResponse({ ...mockState });
  }
  if (path === '/api/chat-history') {
    return mockResponse({ history: mockState.chatHistory });
  }
  if (path === '/api/etl-logs') {
    return mockResponse({ logs: mockState.logs });
  }
  if (path === '/api/ingest-raw') {
    const body = options?.body ? JSON.parse(options.body as string) : {};
    const records = body.records || [];
    mockState.rawInspections = records;

    const totalInspections = records.length;
    const totalCost = records.reduce((sum: number, r: any) => sum + parseFloat(r.costoNoCalidad || 0), 0);
    const defectCount = records.filter((r: any) => r.resultado === "Defectuoso").length;
    
    const riskScore = totalInspections > 0 ? Number(((defectCount / totalInspections) * 100).toFixed(1)) : 0;
    const efficiency = totalInspections > 0 ? Number((100 - riskScore).toFixed(1)) : 0;
    const hasWarehouseDelay = records.some((r: any) => r.resultado === "Defectuoso" && r.region === "Cali");

    mockState.activeMetrics = {
      revenue: totalCost,
      users: totalInspections,
      riskScore,
      efficiency,
      warehouseDelay: hasWarehouseDelay,
      activeDataset: mockState.activeMetrics.activeDataset || "Dataset Ingestado",
    };

    return mockResponse({ success: true, activeMetrics: mockState.activeMetrics });
  }
  if (path === '/api/trigger-etl') {
    const body = options?.body ? JSON.parse(options.body as string) : {};
    const datasetName = body.datasetName || mockState.activeMetrics.activeDataset || "Activo";

    // Deduplication
    const MinIdsMap = new Map<string, any>();
    mockState.rawInspections.forEach((r: any) => {
      const key = `${r.inspectorName}-${r.costoNoCalidad}-${r.tolerancia}-${r.resultado}-${r.region}`;
      if (!MinIdsMap.has(key)) {
        MinIdsMap.set(key, r);
      }
    });
    mockState.rawInspections = Array.from(MinIdsMap.values());

    // Clean negatives
    mockState.rawInspections.forEach((r: any) => {
      if (parseFloat(r.costoNoCalidad) < 0) {
        r.costoNoCalidad = 0;
      }
    });

    // Calibrate
    mockState.rawInspections.forEach((r: any) => {
      if (parseFloat(r.tolerancia) >= 0.1 && parseFloat(r.tolerancia) <= 0.9 && r.resultado === "Defectuoso") {
        r.resultado = "Aceptado";
      }
    });

    const totalInspections = mockState.rawInspections.length;
    const totalCost = mockState.rawInspections.reduce((sum: number, r: any) => sum + parseFloat(r.costoNoCalidad || 0), 0);
    const defectCount = mockState.rawInspections.filter((r: any) => r.resultado === "Defectuoso").length;
    
    const riskScore = totalInspections > 0 ? Number(((defectCount / totalInspections) * 100).toFixed(1)) : 0;
    const efficiency = 98.6;

    mockState.activeMetrics = {
      revenue: totalCost,
      users: totalInspections,
      riskScore,
      efficiency,
      warehouseDelay: false,
      activeDataset: datasetName,
    };

    // Populate mockState logs
    const timeNow = new Date().toLocaleTimeString("en-GB");
    mockState.logs = [
      { id: "1", time: timeNow, category: "Sistema", message: `[ETL INICIO] Iniciando Pipeline de Ingestión para: ${datasetName}` },
      { id: "2", time: timeNow, category: "Escaneo", message: `[1. EXTRACT] Abriendo túnel de datos. Leyendo registros raw...` },
      { id: "3", time: timeNow, category: "Análisis", message: `[2. TRANSFORM] Deduplicación ejecutada: ${totalInspections} registros únicos conservados.` },
      { id: "4", time: timeNow, category: "Integridad", message: "[2. TRANSFORM] Normalizando esquemas relacionales de calidad a UTF-8." },
      { id: "5", time: timeNow, category: "Seguridad", message: "[3. LOAD] Estableciendo conexión segura TLS/SSL con InsForge PostgreSQL..." },
      { id: "6", time: timeNow, category: "Sistema", message: "[ETL ÉXITO] Pipeline completado. Tablas de datos optimizadas con integridad del 100%." }
    ];

    return mockResponse({ success: true, activeMetrics: mockState.activeMetrics });
  }
  if (path === '/api/update-metrics') {
    if (options?.body) {
      const updated = JSON.parse(options.body as string);
      mockState.activeMetrics = { ...mockState.activeMetrics, ...updated };
    }
    return mockResponse({ success: true });
  }
  if (path === '/api/clear-chat') {
    mockState.chatHistory = [];
    return mockResponse({ success: true });
  }
  if (path === '/api/chat') {
    // Respuesta simulada de IA en modo estático
    const body = options?.body ? JSON.parse(options.body as string) : {};
    const userMessage = body.message || '';
    return mockResponse({
      text: generateStaticReply(userMessage),
      simulated: true,
      metrics: mockState.activeMetrics,
      collaborationLogs: generateMockCollaborationLogs(userMessage),
    });
  }
  if (path === '/api/generate-dashboard') {
    const body = options?.body ? JSON.parse(options.body as string) : {};
    const name = body.companyName || 'Mi Empresa';
    const dashboardItem = {
      id: `dash-${Date.now()}`,
      name: `Dashboard ${name} — ${new Date().toLocaleDateString('es-CO')}`,
      timestamp: new Date().toISOString(),
      metrics: { ...mockState.activeMetrics },
      companyName: name,
      businessDescription: body.businessDescription || '',
    };
    return mockResponse({ success: true, dashboardItem });
  }
  if (path.startsWith('/api/auth/')) {
    // Auth en modo estático: modo demo sin verificación real
    const body = options?.body ? JSON.parse(options.body as string) : {};
    return mockResponse({
      success: true,
      user: {
        username: body.username || 'demo_user',
        email: body.email || 'demo@agentbi.app',
      },
      token: 'static-mode-token',
      message: 'Modo demo activo — sin verificación de servidor.',
    });
  }

  // Ruta desconocida: retornar 404 mock
  return { ok: false, json: async () => ({ error: 'Not found in static mode' }) };
}

/** Crea un objeto Response-like para el mock */
function mockResponse(data: any): { ok: boolean; json: () => Promise<any> } {
  return {
    ok: true,
    json: async () => data,
  };
}

/** Genera respuestas IA simuladas mínimas para modo estático */
function generateStaticReply(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('hola') || lower.includes('buen')) {
    return '### Estimado cliente, ¡bienvenido!\n\nSoy **Strategist AI**, su agente de inteligencia de negocios. Estoy operando en **modo demo estático** (sin conexión al servidor backend).\n\nPuede explorar la interfaz, cargar datasets y navegar por los paneles. Para funcionalidades completas con IA en tiempo real, ejecute el proyecto localmente con `npm run dev`.';
  }
  if (lower.includes('dataset') || lower.includes('dato') || lower.includes('carga')) {
    return '### Gestión de Datasets\n\nEn modo demo puede cargar datasets desde el **Hub de Datos** en el menú lateral. Los datos se procesarán localmente en su navegador sin necesidad de servidor.\n\n¿Desea que le guíe por el proceso de carga?';
  }
  if (lower.includes('dashboard') || lower.includes('indicador') || lower.includes('kpi')) {
    return '### Dashboard Ejecutivo\n\nPuede acceder al **Dashboard Ejecutivo** desde el menú lateral para visualizar indicadores en tiempo real.\n\nEn modo demo, los KPIs se inicializan en cero y se actualizan cuando carga un dataset. ¿Qué métricas le interesan analizar?';
  }
  return `### Estimado cliente,\n\nHe recibido su consulta: *"${message}"*\n\n⚠️ **Modo Demo Estático:** El servidor de IA no está disponible en esta versión de GitHub Pages. Para análisis con IA generativa completa, ejecute el proyecto localmente:\n\n\`\`\`bash\nnpm run dev\n\`\`\`\n\nMientras tanto, puede explorar los paneles de **ETL**, **Dashboard** y **Data Hub** con datos demo.`;
}

/** Genera logs de colaboración multi-agente simulados detallados */
function generateMockCollaborationLogs(message: string): AgentCollaborationLog[] {
  const lower = message.toLowerCase();
  const time = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const activeDS = mockState.activeMetrics.activeDataset || "Ninguno";

  if (lower.includes("hola") || lower.includes("buen")) {
    return [
      {
        agentId: "orchestrator",
        agentName: "Agente Orquestador",
        message: `Solicitud de bienvenida recibida. Activando protocolo de saludo corporativo. Dataset activo: '${activeDS}'.`,
        timestamp: time
      },
      {
        agentId: "researcher",
        agentName: "Agente Investigador",
        message: `Buscando estado del dataset directivo. Conexión InsForge PostgreSQL en curso.`,
        timestamp: time
      },
      {
        agentId: "analyst",
        agentName: "Agente Analítico",
        message: `Calculando métricas del panel directivo. Estado actual: ${mockState.activeMetrics.revenue > 0 ? 'Con datos cargados.' : 'Sin datos ingestados (limpio).'}`,
        timestamp: time
      },
      {
        agentId: "orchestrator",
        agentName: "Agente Orquestador",
        message: "Respuestas consolidadas satisfactoriamente. Procediendo a redactar la síntesis final.",
        timestamp: time
      }
    ];
  }

  if (lower.includes("dataset") || lower.includes("dato") || lower.includes("carga") || lower.includes("etl") || lower.includes("limpiar")) {
    return [
      {
        agentId: "orchestrator",
        agentName: "Agente Orquestador",
        message: `Solicitud de manipulación o limpieza detectada. Inicializando pipeline multi-agente.`,
        timestamp: time
      },
      {
        agentId: "data_engineer",
        agentName: "Agente de Ingeniería",
        message: `Ejecutando escaneo relacional en InsForge sobre dataset: '${activeDS}'. Inspeccionando anomalías...`,
        timestamp: time
      },
      {
        agentId: "scientist",
        agentName: "Agente Científico",
        message: `Ejecutando deduplicación heurística. Corrigiendo lecturas redundantes y calibrando tolerancias.`,
        timestamp: time
      },
      {
        agentId: "analyst",
        agentName: "Agente Analítico",
        message: `Consolidando KPIs e impacto financiero derivado de la limpieza: Eficiencia al 98.6%.`,
        timestamp: time
      },
      {
        agentId: "orchestrator",
        agentName: "Agente Orquestador",
        message: `Pipeline ETL autónomo validado con éxito. Reportando logs e informe intermedio al Director.`,
        timestamp: time
      }
    ];
  }

  if (lower.includes("dashboard") || lower.includes("indicador") || lower.includes("kpi")) {
    return [
      {
        agentId: "orchestrator",
        agentName: "Agente Orquestador",
        message: `Petición de cuadro de mando directivo. Verificando estado de agregación.`,
        timestamp: time
      },
      {
        agentId: "analyst",
        agentName: "Agente Analítico",
        message: `Sincronizando base de datos en InsForge. Saneando indicadores de ingresos y conformidad.`,
        timestamp: time
      },
      {
        agentId: "data_engineer",
        agentName: "Agente de Ingeniería",
        message: `Base de datos PostgreSQL optimizada. Registros temporales eliminados automáticamente para liberar espacio.`,
        timestamp: time
      },
      {
        agentId: "orchestrator",
        agentName: "Agente Orquestador",
        message: `Indicador listo y cargado en el dashboard ejecutivo. Autorizando redirección directa.`,
        timestamp: time
      }
    ];
  }

  // Fallback general logs
  return [
    {
      agentId: "orchestrator",
      agentName: "Agente Orquestador",
      message: `Procesando consulta directiva: '${message.substring(0, 50)}...'. Analizando intención.`,
      timestamp: time
    },
    {
      agentId: "researcher",
      agentName: "Agente Investigador",
      message: "Escaneando base de conocimiento interna y estándares analíticos operacionales.",
      timestamp: time
    },
    {
      agentId: "scientist",
      agentName: "Agente Científico",
      message: "Procesando correlaciones estadísticas heurísticas sobre las métricas en InsForge.",
      timestamp: time
    },
    {
      agentId: "analyst",
      agentName: "Agente Analítico",
      message: "Analizando tendencias de rendimiento operativo y proyecciones de ahorro.",
      timestamp: time
    },
    {
      agentId: "orchestrator",
      agentName: "Agente Orquestador",
      message: "Consolidando respuestas y elaborando informe ejecutivo final para el Director.",
      timestamp: time
    }
  ];
}

export { IS_STATIC_MODE };
