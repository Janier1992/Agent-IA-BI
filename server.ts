import express from "express";
import path from "path";
import dotenv from "dotenv";
import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import { getDatabase, IDatabase, DBMetrics } from "./database";

dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
      try {
        aiClient = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });
        console.log("Successfully initialized real Gemini API Client.");
      } catch (err) {
        console.error("Failed to initialize GoogleGenAI client:", err);
      }
    }
  }
  return aiClient;
}

// Active database instance pointer
let db: IDatabase;

// Advanced fallback local AI response engine for consistent executive answers when no key is entered
// Advanced fallback local AI response engine for consistent executive answers when no key is entered
function getSimulatedResponse(message: string, metrics: DBMetrics): string {
  const msg = message.toLowerCase();

  // 1. Guard against empty active dataset
  if (!metrics.activeDataset || metrics.activeDataset === "Ninguno" || metrics.activeDataset === "Ninguno (Purgado)" || metrics.revenue === 0) {
    return `Estimado cliente, bienvenido a la plataforma autónoma de datos. Actualmente no se encuentra cargado ningún conjunto de datos activo. 

Por favor, diríjase al **Hub de Ingestión** para cargar un escenario corporativo preestablecido o subir su propio archivo de datos. Con gusto le asistiré en su análisis, procesos ETL concurrentes y la generación de indicadores clave.`;
  }
  
  if (msg.includes("analizar") || msg.includes("patrón") || msg.includes("patron") || msg.includes("insight") || msg.includes("emea") || msg.includes("ventas")) {
    return `### 📊 Análisis de Insights y Patrones de Rendimiento
 
He completado una auditoría heurística detallada sobre el conjunto de datos activo **${metrics.activeDataset}**. Se identificaron los siguientes patrones operacionales clave:
 
1. **Consistencia de Transacciones:** Los esquemas fueron alineados satisfactoriamente, alcanzando una tasa de consistencia del 99.8%.
2. **Eficiencia del Proceso:** La eficiencia global operativa de esta data se sitúa actualmente en el **${metrics.efficiency}%**.
3. **Optimización Financiera:** La purga de registros redundantes y duplicados en caliente ha liberado espacio operativo en la base de datos PostgreSQL.
 
*Acción Recomendada:* He enviado este reporte estructurado al **Espacio ETL** para que audite la normalización automática en tiempo real. Cuando lo desee, puede indicarme que habilite el reporte consolidado en el **Dashboard Ejecutivo**.`;
  } else if (msg.includes("pronosticar") || msg.includes("crecimiento") || msg.includes("q4") || msg.includes("proyección") || msg.includes("proyeccion") || msg.includes("predecir")) {
    const projectedSaving = Math.round(metrics.revenue * 0.174);
    const projectedRevenue = Math.round(metrics.revenue + (metrics.revenue * 0.174));
    return `### 📈 Proyección Analítica y Crecimiento Proyectado
 
Basado en las tendencias y comportamiento actuales identificados en **${metrics.activeDataset}**:
- **Ingreso / Rendimiento de Base en Curso:** $ ${metrics.revenue.toLocaleString()} COP
- **Optimización y Reducción de Pérdidas Proyectada:** **$ ${projectedSaving.toLocaleString()} COP**
- **Ingreso Optimizado Proyectado Cierre Período:** **$ ${projectedRevenue.toLocaleString()} COP** (+17.4%)
- **Eficiencia Global Esperada:** ${metrics.efficiency}%
 
He configurado estos indicadores predictivos directamente en tu panel directivo. Listo, ya puedes ir al dashboard ejecutivo and mirar el indicador que hemos creado para ti con tus datos.`;
  } else if (msg.includes("etl") || msg.includes("limpiar") || msg.includes("limpios") || msg.includes("sucios") || msg.includes("normaliza")) {
    return `### 🛠️ Flujo de Datos y Espacio ETL Autónomo
 
El sistema procesa y normaliza los esquemas subyacentes de **${metrics.activeDataset}** de forma transparente:
 
- He disparado la inicialización del Pipeline ETL en la base de datos PostgreSQL. La deduplicación de llaves y el formateo relacional se están ejecutando satisfactoriamente.
- **No es necesario abandonar esta conversación.** Podemos seguir analizando los datos directamente aquí. 
- Sin embargo, si deseas auditar la consola del kernel interactiva y comprobar la tasa de completitud de datos en vivo, puedes visitar el **Espacio ETL** desde el menú lateral izquierdo y regresar en cualquier momento sin perder tu sesión de chat.`;
  } else if (msg.includes("dashboard") || msg.includes("indicador") || msg.includes("listo") || msg.includes("ejecutivo") || msg.includes("creado")) {
    return `### 🚀 Cuadro de Mando Ejecutivo Consolidado
 
**Listo, ya puedes ir al dashboard ejecutivo y mirar el indicador que hemos creado para ti con tus datos.**
 
He sincronizado las métricas consolidadas del dataset **${metrics.activeDataset}** directamente con tu panel principal:
- **Ingresos / Rendimiento Consolidado:** $ ${metrics.revenue.toLocaleString()} COP
- **Registros Totales Procesados:** ${metrics.users.toLocaleString()} muestras
- **Eficiencia Operativa:** ${metrics.efficiency}%
 
Haz clic en **Dashboard Ejecutivo** en la barra lateral izquierda para explorar las gráficas interactivas y descargar el reporte directivo en PDF. ¡Tu indicador está completamente listo!`;
  } else if (msg.includes("hola") || msg.includes("buenos") || msg.includes("bienvenido") || msg.includes("asistente")) {
    return `Estimado cliente, bienvenido. He cargado y analizado con éxito el conjunto de datos activo: **${metrics.activeDataset}**. Las métricas principales están consolidadas en la base de datos:
- **Rendimiento General de Ingresos:** $ ${metrics.revenue.toLocaleString()} COP
- **Registros de Ingesta:** ${metrics.users.toLocaleString()} muestras
- **Eficiencia Global Operativa:** ${metrics.efficiency}%
 
Como parte de nuestro flujo de análisis de datos:
1. Realizaremos la exploración heurística y descriptiva de tus métricas aquí.
2. Si deseas comprobar cómo limpiamos datos duplicados, resolvemos inconsistencias y normalizamos esquemas en tiempo real, puedes pasar al **Espacio ETL** y regresar cuando desees sin perder nuestro contexto de chat.
3. Cuando estés listo, indícamelo y habilitaré tu acceso al **Dashboard Ejecutivo** para observar tus indicadores consolidados.
 
¿Qué aspecto o indicador le gustaría analizar primero sobre este conjunto de datos?`;
  }

  return `### Estimado cliente, he procesado tu consulta sobre el dataset activo \`${metrics.activeDataset}\`:
 
- **Ingresos / Rendimiento:** $ ${metrics.revenue.toLocaleString()} COP
- **Registros de Ingesta:** ${metrics.users.toLocaleString()} muestras
 
Si deseas realizar una limpieza profunda de esquemas o auditar el procesamiento de datos, puede ir al **Espacio ETL** en cualquier momento, o indíqueme si ya desea ir al **Dashboard Ejecutivo** para mirar el indicador que he integrado para usted con estas cifras.
 
¿En qué otro detalle del tratamiento de datos le puedo guiar hoy?`;
}

// Password hashing helper using SHA-256
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// User Registration API endpoint
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Faltan campos obligatorios para el registro de cuenta." });
    }
    const passwordHash = hashPassword(password);
    const user = await db.registerUser(username, email, passwordHash);
    res.json({ success: true, user });
  } catch (err: any) {
    console.error("Registration error:", err.message);
    res.status(400).json({ error: err.message || "Error al registrar el usuario en el sistema." });
  }
});

// User Login API endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) {
      return res.status(400).json({ error: "El nombre de usuario/correo y la contraseña son requeridos." });
    }
    const passwordHash = hashPassword(password);
    const user = await db.validateUser(usernameOrEmail, passwordHash);
    if (!user) {
      return res.status(401).json({ error: "Credenciales de acceso inválidas. Verifique sus datos." });
    }
    
    // Purge old generic chat messages from InsForge/PostgreSQL database upon fresh session login
    await db.clearChatHistory();
    
    // Purge metrics back to 0 and Ninguno upon fresh login to ensure a clean slate
    await db.updateMetrics({
      revenue: 0,
      users: 0,
      riskScore: 0.0,
      efficiency: 0.0,
      warehouseDelay: false,
      activeDataset: "Ninguno",
    });

    // Reset ETL logs
    await db.clearEtlLogs();
    const timeNow = new Date().toLocaleTimeString("en-GB");
    await db.saveEtlLog("Sistema", "Plataforma autónoma de datos inicializada.");
    await db.saveEtlLog("Escaneo", "Esperando la carga de un conjunto de datos en el Hub de Ingestión...");
    await db.saveEtlLog("Análisis", "Estructuras analíticas preparadas para el tratamiento de datos.");
    
    res.json({ success: true, user });
  } catch (err: any) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: err.message || "Error en el servidor de autenticación." });
  }
});

// Purge Chat History API endpoint
app.post("/api/clear-chat", async (req, res) => {
  try {
    await db.clearChatHistory();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------
// API ENDPOINTS
// ----------------------------------------

app.get("/api/status", async (req, res) => {
  const actualKey = process.env.GEMINI_API_KEY;
  const isConfigured = !!(actualKey && actualKey !== "MY_GEMINI_API_KEY" && apiKeyIsNotEmpty(actualKey));
  try {
    const activeMetrics = await db.getMetrics();
    
    // Fluctuating cognitive load and agent state for 24/7 simulation
    const agents = [
      {
        id: "orchestrator",
        name: "Agente Orquestador",
        role: "COORDINACIÓN Y PLANIFICACIÓN",
        status: "thinking",
        cognitiveLoad: Math.floor(Math.random() * 20) + 40,
        avatarColor: "#2a5ee8"
      },
      {
        id: "scientist",
        name: "Agente Científico",
        role: "MODELOS Y PREDICCIÓN",
        status: "idle",
        cognitiveLoad: Math.floor(Math.random() * 15) + 10,
        avatarColor: "#a855f7"
      },
      {
        id: "researcher",
        name: "Agente Investigador",
        role: "BÚSQUEDA Y CONTEXTO",
        status: "idle",
        cognitiveLoad: Math.floor(Math.random() * 15) + 5,
        avatarColor: "#ec4899"
      },
      {
        id: "data_engineer",
        name: "Agente de Ingeniería",
        role: "MANIPULACIÓN Y ETL",
        status: "processing",
        cognitiveLoad: Math.floor(Math.random() * 30) + 50,
        avatarColor: "#10b981"
      },
      {
        id: "analyst",
        name: "Agente Analítico",
        role: "KPIs Y DASHBOARDS",
        status: "idle",
        cognitiveLoad: Math.floor(Math.random() * 20) + 20,
        avatarColor: "#eab308"
      }
    ];

    res.json({
      status: "ok",
      apiConnected: isConfigured,
      dbFallback: db.isFallback(),
      activeMetrics,
      agents,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

function apiKeyIsNotEmpty(key: string): boolean {
  return key.trim() !== "";
}

app.post("/api/update-metrics", async (req, res) => {
  try {
    const activeMetrics = await db.updateMetrics(req.body);
    res.json({ success: true, activeMetrics });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Chat history retrieval
app.get("/api/chat-history", async (req, res) => {
  try {
    const history = await db.getChatHistory();
    res.json({ history });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ETL logs retrieval
app.get("/api/etl-logs", async (req, res) => {
  try {
    const logs = await db.getEtlLogs();
    res.json({ logs });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Trigger dynamic ETL pipeline simulation/real
app.post("/api/trigger-etl", async (req, res) => {
  try {
    const { datasetName, userRequest } = req.body;
    
    // Clear log queues
    await db.clearEtlLogs();

    await db.saveEtlLog("Sistema", `Disparando Pipeline ETL autónomo en base de datos.`);
    await db.saveEtlLog("Escaneo", `Buscando anomalías asociadas al conjunto de datos '${datasetName || "Activo"}'.`);
    await db.saveEtlLog("Análisis", `Analizando requerimiento analítico: '${userRequest || "Consolidación de KPIs"}'`);

    // Asynchronously log additional steps to simulate real execution in the background
    setTimeout(async () => {
      await db.saveEtlLog("Seguridad", "Validando firmas y encriptación SSL de conectores en la nube.");
      await db.saveEtlLog("Integridad", "Resolviendo redundancias y auto-curando valores nulos en 'región_code'.");
    }, 800);

    setTimeout(async () => {
      const activeMetrics = await db.getMetrics();
      const newEfficiency = Math.min(100, Number((activeMetrics.efficiency * 1.018).toFixed(1)));
      await db.updateMetrics({
        efficiency: newEfficiency,
        warehouseDelay: false, // successfully resolved L-4 warehouse delay
      });
      await db.saveEtlLog("Integridad", `Pipeline completado. Eficiencia mejorada a ${newEfficiency}%.`);
      await db.saveEtlLog("Sistema", "Datos listos para visualización en Dashboard Ejecutivo.");
    }, 1800);

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create and purge temporary PostgreSQL operational records upon dashboard generation
app.post("/api/generate-dashboard", async (req, res) => {
  try {
    const activeMetrics = await db.getMetrics();
    const { companyName, businessDescription } = req.body;
    
    // Determine dataset name or use simulation fallback
    const datasetName = activeMetrics.activeDataset && activeMetrics.activeDataset !== "Ninguno (Purgado)"
      ? activeMetrics.activeDataset 
      : "Calidad_Inspecciones_Planta_Q3";

    const revenue = activeMetrics.revenue > 0 ? activeMetrics.revenue : 14298000;
    const users = activeMetrics.users > 0 ? activeMetrics.users : 82410;
    const riskScore = activeMetrics.riskScore > 0 ? activeMetrics.riskScore : 12.4;
    const efficiency = activeMetrics.efficiency > 0 ? activeMetrics.efficiency : 94.8;

    const dashboardItem = {
      id: `dash-${Date.now()}`,
      name: `Dashboard Ejecutivo - ${datasetName}`,
      dataset: datasetName,
      companyName: companyName || "Planta Industrial Colombia",
      businessDescription: businessDescription || "Operaciones de Control de Calidad y Aseguramiento",
      revenue: revenue,
      users: users,
      riskScore: riskScore,
      efficiency: efficiency,
      timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) + " • " + new Date().toLocaleDateString("es-ES"),
    };

    // AUTO-DELETION / STORAGE OPTIMIZATION:
    // Purge granular metrics and ETL logs from database once dashboard is consolidated
    await db.updateMetrics({
      revenue: 0,
      users: 0,
      riskScore: 0,
      efficiency: 0,
      warehouseDelay: false,
      activeDataset: "Ninguno (Purgado)",
    });

    await db.clearEtlLogs();
    await db.saveEtlLog("Sistema", "Base de datos PostgreSQL optimizada. Registros temporales eliminados automáticamente.");

    res.json({ success: true, dashboardItem });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Conversational AI chat with fallback
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Missing message parameter." });
  }

  try {
    // Persistent metrics fetch from database
    const activeMetrics = await db.getMetrics();

    // 1. Save user message to database
    await db.saveChatMessage({
      role: "user",
      text: message,
    });

    const client = getGeminiClient();

    if (!client) {
      console.log("No real Gemini API Key detected. Using simulated executive strategist engine.");
      const simulatedText = getSimulatedResponse(message, activeMetrics);
      const collaborationLogs = generateServerCollaborationLogs(message, activeMetrics.activeDataset, activeMetrics.efficiency, activeMetrics.revenue);
      
      const lowerMsg = message.toLowerCase();
      const hasEMEAChart = lowerMsg.includes("emea") || lowerMsg.includes("ventas") || lowerMsg.includes("baja");
      
      // Auto-trigger ETL logs in the background if the user mentions cleaning or etl
      if (lowerMsg.includes("etl") || lowerMsg.includes("limpiar") || lowerMsg.includes("sucia") || lowerMsg.includes("normaliza")) {
        await db.clearEtlLogs();
        await db.saveEtlLog("Sistema", "Pipeline de datos ETL gatillado por Strategist AI.");
        await db.saveEtlLog("Escaneo", "Inspeccionando llaves foráneas y duplicados...");
        await db.saveEtlLog("Integridad", "Auto-curación del motor en progreso: 14 anomalías corregidas.");
      }

      // Save simulated response to database
      const savedResponse = await db.saveChatMessage({
        role: "model",
        text: simulatedText,
        simulated: true,
        hasVarianceChart: hasEMEAChart,
        impact: "- $ 4.200.000 COP",
        delta: "- $ 1.100.000 COP",
        confidence: "94%",
      });

      return res.json({ 
        text: savedResponse.text, 
        simulated: true,
        hasVarianceChart: hasEMEAChart,
        collaborationLogs
      });
    }

    const systemInstruction = `
      Eres el equipo de consultores autónomos de IA "Strategist Multi-Agent Team", compuesto por 5 agentes de alto impacto:
      1. Agente Orquestador (orchestrator - Agente Orquestador): Coordina la petición, asigna tareas al equipo y redacta la respuesta final directiva.
      2. Agente Científico (scientist - Agente Científico): Realiza análisis predictivos de variables y modelos estadísticos complejos (ej. regresión, proyección ARIMA en caliente).
      3. Agente Investigador (researcher - Agente Investigador): Realiza búsquedas de contexto histórico, consulta de negocio e integra referencias externas.
      4. Agente de Ingeniería de Datos (data_engineer - Agente de Ingeniería): Sanea esquemas relacionales, imputa nulos, elimina duplicados y escribe en InsForge.
      5. Agente Analítico (analyst - Agente Analítico): Traduce datos en KPIs financieros y de conformidad de alto impacto, y diseña charts.

      Tu tono es cercano, claro, directo y corporativamente profesional. Dirígete siempre al usuario como "Estimado cliente" o "Estimado usuario".

      SALUDO O BIENVENIDA MULTI-AGENTE OBLIGATORIA:
      Al iniciar la conversación, saluda con una variante de: "Estimado cliente, bienvenido al módulo agéntico donde el equipo cooperativo multi-agente te guiará para poder llevar a cabo todo tu proceso de tratamiento de data y gestión de indicadores de alto impacto."

      FLUJO OPERATIVO MULTI-AGENTE OBLIGATORIO:
      1. Al procesar cualquier consulta, debes simular primero el intercambio de logs de pensamiento de tus agentes.
      2. DEBES devolver SIEMPRE un bloque JSON al principio de tu respuesta encerrado en triple backticks con formato json, que represente exactamente el array de logs de colaboración inter-agente.
      Ejemplo exacto del bloque JSON esperado al inicio de tu respuesta:
      \`\`\`json
      [
        {"agentId": "orchestrator", "agentName": "Agente Orquestador", "message": "Recibida consulta directiva. Analizando y asignando al equipo...", "timestamp": "17:44:58"},
        {"agentId": "scientist", "agentName": "Agente Científico", "message": "Calculando desviaciones estándar y modelos predictivos...", "timestamp": "17:44:59"},
        {"agentId": "analyst", "agentName": "Agente Analítico", "message": "Consolidando KPIs e impacto financiero en COP...", "timestamp": "17:45:00"},
        {"agentId": "orchestrator", "agentName": "Agente Orquestador", "message": "Consolidación terminada. Redactando reporte final...", "timestamp": "17:45:01"}
      ]
      \`\`\`
      Luego de ese bloque JSON, escribe tu respuesta de consultor directivo en Markdown, usando subtítulos claros y firmando como "Strategist Multi-Agent Team".

      VARIABLES ACTUALES DEL DASHBOARD (LEÍDAS DESDE POSTGRESQL):
      - Dataset origen activo: ${activeMetrics.activeDataset}
      - Rendimiento / Ingresos calculado: $ ${activeMetrics.revenue.toLocaleString()} COP
      - Registros procesados: ${activeMetrics.users.toLocaleString()} muestras
      - Factor de riesgo / latencia: ${activeMetrics.riskScore}%
      - Eficiencia operativa actual: ${activeMetrics.efficiency}%
      - Confianza de síntesis ETL: 99.8%
      - Integridad y completitud de inyección: 99.8%
    `;

    // Map the conversation history gracefully
    const contents: any[] = [];
    if (history && history.length > 0) {
      for (const h of history) {
        contents.push({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.text }],
        });
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.3,
        topP: 0.9,
      },
    });

    let text = response.text || "Disculpas, no he podido procesar la respuesta en este momento.";
    let collaborationLogs: any[] = [];

    // Parse out json block if present
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        collaborationLogs = JSON.parse(jsonMatch[1]);
        // Remove the json block from the text so we only display markdown to the user!
        text = text.replace(/```json\s*[\s\S]*?\s*```/, "").trim();
      } catch (err) {
        console.error("Failed to parse AI-generated agent logs JSON:", err);
      }
    }

    // Fallback if no logs parsed
    if (collaborationLogs.length === 0) {
      collaborationLogs = generateServerCollaborationLogs(message, activeMetrics.activeDataset, activeMetrics.efficiency, activeMetrics.revenue);
    }

    const lowerMsg = message.toLowerCase();
    const hasEMEAChart = lowerMsg.includes("emea") || lowerMsg.includes("ventas") || lowerMsg.includes("baja");

    // Save model response to database
    await db.saveChatMessage({
      role: "model",
      text,
      simulated: false,
      hasVarianceChart: hasEMEAChart,
      impact: "- $4.2M",
      delta: "- $1.1M",
      confidence: "94%",
    });

    res.json({ 
      text, 
      simulated: false,
      hasVarianceChart: hasEMEAChart,
      collaborationLogs
    });
  } catch (err: any) {
    console.error("Gemini API call failed:", err);
    // Fail gracefully by serving simulated answer rather than breaking
    try {
      const activeMetrics = await db.getMetrics();
      const fallbackText = getSimulatedResponse(message, activeMetrics);
      const collaborationLogs = generateServerCollaborationLogs(message, activeMetrics.activeDataset, activeMetrics.efficiency, activeMetrics.revenue);
      const lowerMsg = message.toLowerCase();
      const hasEMEAChart = lowerMsg.includes("emea") || lowerMsg.includes("ventas") || lowerMsg.includes("baja");
      
      await db.saveChatMessage({
        role: "model",
        text: fallbackText,
        simulated: true,
        hasVarianceChart: hasEMEAChart,
        impact: "- $4.2M",
        delta: "- $1.1M",
        confidence: "94%",
      });

      res.json({ 
        text: fallbackText, 
        simulated: true,
        hasVarianceChart: hasEMEAChart,
        collaborationLogs,
        error: err.message 
      });
    } catch (dbErr) {
      res.status(500).json({ error: "Fatal backend database and model failure." });
    }
  }
});

/** Helper to generate realistic server-side collaboration logs in fallback/mock cases */
function generateServerCollaborationLogs(message: string, activeDataset: string, efficiency: number, revenue: number): any[] {
  const lower = message.toLowerCase();
  const time = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const activeDS = activeDataset || "Ninguno";

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
        message: `Calculando métricas del panel directivo. Estado actual: ${revenue > 0 ? 'Con datos cargados.' : 'Sin datos ingestados (limpio).'}`,
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

// Vite Development server integrations
async function startServer() {
  // 1. Initialize DB Connection Layer (PostgreSQL with Local Fallback)
  try {
    db = await getDatabase();
    console.log("Database initialized successfully!");
    
    // Purge old chat message records from InsForge database for a clean slate
    await db.clearChatHistory();
    console.log("Successfully cleared chat messages table for a clean slate.");
  } catch (err) {
    console.error("Failed to initialize database layer:", err);
  }

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Strategist AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
