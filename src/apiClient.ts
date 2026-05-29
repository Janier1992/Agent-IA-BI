/// <reference types="vite/client" />

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

export { IS_STATIC_MODE };
