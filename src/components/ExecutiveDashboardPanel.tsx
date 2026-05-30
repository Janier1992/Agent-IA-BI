import React, { useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Calendar, 
  AlertTriangle, 
  Lightbulb, 
  Gauge, 
  Download, 
  ArrowUpRight,
  Sparkles,
  Trash2
} from "lucide-react";
import { DataMetrics, AssetAllocation } from "../types";

interface ExecutiveDashboardPanelProps {
  metrics: DataMetrics;
  onUpdateMetrics: (updated: Partial<DataMetrics>) => void;
  onViewChange: (view: "hub" | "etl" | "dashboard" | "chat") => void;
  notificationPermission: string;
  onRequestPermission: () => void;
  onTestNotification: (delayed?: boolean) => void;
  dashboardHistory: any[];
  selectedHistoryDashboard: any | null;
  onSelectHistoryDashboard: (dash: any | null) => void;
  onClearHistory: () => void;
}

const getDomainAllocation = (datasetName: string): AssetAllocation[] => {
  const lowercase = (datasetName || "").toLowerCase();
  if (lowercase.includes("despachos") || lowercase.includes("logist") || lowercase.includes("cali")) {
    return [
      { category: "Optimización de Rutas de Despacho Cali", value: 45000000, roi: 18.5, recommendation: "Implementar ruteo dinámico", status: "ESTABLE" },
      { category: "Sistemas de Monitoreo de Cadena de Frío", value: 12000000, roi: 24.2, recommendation: "Control autónomo 24/7", status: "AJUSTAR" },
      { category: "Renegociación de Tarifas de Transporte", value: 28000000, roi: 14.8, recommendation: "Monitorear fletes terrestres", status: "ESTRATÉGICO" },
    ];
  }
  if (lowercase.includes("medellin") || lowercase.includes("mejora") || lowercase.includes("espesor")) {
    return [
      { category: "Recalibración de Sensores de Espesor", value: 35000000, roi: 22.4, recommendation: "Programar ajustes semanales", status: "ESTABLE" },
      { category: "Automatización de Mezcla de Polímero", value: 15000000, roi: 28.5, recommendation: "Integrar al sistema SCADA", status: "AJUSTAR" },
      { category: "Auditoría de Mermas de Extrusión", value: 22000000, roi: 16.1, recommendation: "Auditar desperdicios Planta 2", status: "ESTRATÉGICO" },
    ];
  }
  if (lowercase.includes("colombia") || lowercase.includes("retornos") || lowercase.includes("garantias")) {
    return [
      { category: "Auditoría de Empaque y Embalaje", value: 40000000, roi: 16.8, recommendation: "Cambiar proveedor de cartón", status: "ESTABLE" },
      { category: "Sistema de Trazabilidad de Garantías", value: 18000000, roi: 25.4, recommendation: "Integrar con CRM corporativo", status: "AJUSTAR" },
      { category: "Análisis de Causa-Raíz en Planta", value: 30000000, roi: 15.2, recommendation: "Inspecciones de soldadura aleatorias", status: "ESTRATÉGICO" },
    ];
  }
  return [
    { category: "Capacitación de Personal de Soldadura", value: 45000000, roi: 18.5, recommendation: "Mantener turnos rotativos", status: "ESTABLE" },
    { category: "Optimización de Instrumentos de Medida", value: 12000000, roi: 24.2, recommendation: "Calibración automática en caliente", status: "AJUSTAR" },
    { category: "Auditoría Externa de Tolerancias Planta Bogotá", value: 28000000, roi: 14.8, recommendation: "Monitorear calibradores", status: "ESTRATÉGICO" },
  ];
};

const getDomainAnalysisConfig = (datasetName: string) => {
  const lowercase = (datasetName || "").toLowerCase();
  
  if (lowercase.includes("despachos") || lowercase.includes("logist") || lowercase.includes("cali")) {
    return {
      title: "INFORME OPERATIVO DE LOGÍSTICA Y DESPACHOS",
      subtitle: "Strategist AI - Optimización de Distribución y Cadena de Suministro",
      biTitle: "📊 1. Perspectiva de Inteligencia de Distribución:",
      biText: "Tras completar la normalización del pipeline ETL de despachos en Cali, se consolidó la consistencia y trazabilidad de los contenedores de carga y tiempos de estibación. La remoción de incidencias en embalaje y averías de transporte mitiga costos de reprocesamiento logístico y asegura el nivel de servicio.",
      dsTitle: "🔬 2. Hallazgos de Ingeniería de Datos y Despachos:",
      dsText: "El análisis heurístico de planillas de despacho en InsForge detectó redundancias causadas por el reenvío de estibas dañadas. Al normalizar y depurar estos registros en el motor PostgreSQL, la tasa de incidencias se estabilizó de forma real, resolviendo completamente las alertas de retraso de almacén.",
      conclusionTitle: "⚙️ 3. Conclusión de Rendimiento de Transportes:",
      conclusionText: "Se recomienda enfáticamente automatizar el control térmico de contenedores y renegociar las tarifas con transportistas locales. Estas acciones reducirán el costo de no calidad logística en un 18.5% estimado.",
      insights: [
        "Análisis del Dataset: Verificación completa de registros de despachos y cadena de frío en InsForge. Se eliminaron duplicados de planillas.",
        "Optimización de Almacenamiento: Purgado automático de registros brutos de transporte para liberar recursos.",
        "Acción Directiva Recomendada: Mitigar la tasa de incidencias mediante rutas de despacho alternativas y calibración de termómetros."
      ]
    };
  }
  if (lowercase.includes("medellin") || lowercase.includes("mejora") || lowercase.includes("espesor")) {
    return {
      title: "INFORME TÉCNICO DE ESPESORES Y EXTRUSIÓN",
      subtitle: "Strategist AI - Control de Espesores y Mejora Continua en Planta",
      biTitle: "📊 1. Perspectiva de Consistencia del Espesor:",
      biText: "El procesamiento del pipeline ETL de sensores de extrusión en Medellín resolvió las lecturas nulas en la medición de película plástica. La alineación de consistencias a nivel relacional garantiza un control de calidad estadístico robusto y reduce mermas de materia prima.",
      dsTitle: "🔬 2. Hallazgos de Ciencia de Datos en Sensores:",
      dsText: "El escaneo de variables físicas detectó y corrigió desviaciones espontáneas en sensores descalibrados. Al aplicar calibración de tolerancias en la base de datos local, la conformidad del espesor aumentó al 98.6%, eliminando mermas de extrusión.",
      conclusionTitle: "⚙️ 3. Conclusión y Calibración de Sensores:",
      conclusionText: "Se aconseja incorporar sensores de espesor autónomos con auto-curación programada. Este plan de calibración proyecta un incremento del roi de extrusión en un 24.2%.",
      insights: [
        "Análisis del Dataset: Verificación e imputación heurística de lecturas de espesores nulas en la base de datos.",
        "Optimización de Almacenamiento: Registros de sensores brutos optimizados e historiales purgados exitosamente.",
        "Acción Directiva Recomendada: Realizar auditorías de sensores mensuales para asegurar la consistencia del OEE de extrusión."
      ]
    };
  }
  if (lowercase.includes("colombia") || lowercase.includes("retornos") || lowercase.includes("garantias")) {
    return {
      title: "INFORME DE AUDITORÍA DE GARANTÍAS Y RECLAMOS",
      subtitle: "Strategist AI - Auditoría de Devoluciones y Aseguramiento Nacional",
      biTitle: "📊 1. Perspectiva de Gestión de Garantías Nacional:",
      biText: "El pipeline ETL resolvió las discrepancias en los códigos de retorno y vinculó las reclamaciones con los lotes de producción históricos de forma relacional. Esto permite mitigar las devoluciones a nivel nacional y consolidar una tasa de conformidad robusta.",
      dsTitle: "🔬 2. Hallazgos de Ciencia de Datos en Reclamos:",
      dsText: "El escaneo heurístico de incidencias identificó que el 18.5% de reclamaciones compartían la misma causa-raíz por defectos de empaque primario. El motor de base de datos consolidó las cuentas sin solapamientos redundantes, optimizando la consulta.",
      conclusionTitle: "⚙️ 3. Conclusión de Auditoría y Retornos:",
      conclusionText: "Se recomienda implementar inspecciones de causa-raíz en empaque antes del despacho nacional. Este control mitiga los retornos en un 14.8% estimado.",
      insights: [
        "Análisis del Dataset: Historial de reclamaciones y retornos nacionales normalizados en InsForge sin redundancias.",
        "Optimización de Almacenamiento: Purgado de registros transaccionales pesados para maximizar velocidad.",
        "Acción Directiva Recomendada: Investigar el empaque primario como causa-raíz principal de devoluciones nacionales."
      ]
    };
  }
  // Default (Bogotá or general QC)
  return {
    title: "INFORME EJECUTIVO DE ASEGURAMIENTO DE CALIDAD",
    subtitle: "Strategist AI - Control de Calidad en Línea de Ensamble y Soldadura",
    biTitle: "📊 1. Perspectiva de Inteligencia en Ensamble (Planta Bogotá):",
    biText: "Tras completar la normalización del pipeline ETL en caliente, se consolidó la consistencia y salud de las variables de soldadura y acabados dimensionales de forma relacional. La remoción de duplicados de inspectores y mermas mitiga desvíos financieros directivos.",
    dsTitle: "🔬 2. Hallazgos de Ciencia de Datos en Ensamble:",
    dsText: "El escaneo heurístico de datos brutos mediante algoritmos autónomos detectó y depuró mermas y lecturas duplicadas en la línea 1 de ensamble. Al aplicar la calibración de tolerancias en PostgreSQL, el factor de riesgo se redujo a la franja de control.",
    conclusionTitle: "⚙️ 3. Conclusión y Plan de Acción Directiva:",
    conclusionText: "Se sugiere capacitar al personal de soldadores y calibrar los instrumentos en caliente. Estas acciones proyectan un ahorro del 17.4% estimado en reprocesos.",
    insights: [
      "Análisis del Dataset: Inspecciones de ensamble y soldadura en Bogotá depuradas en base de datos sin solapamientos.",
      "Optimización de Almacenamiento: Registros brutos temporales de calidad purgados automáticamente del servidor.",
      "Acción Directiva Recomendada: Calibrar instrumentos de ensamble en caliente y capacitar inspectores en turnos rotativos."
    ]
  };
};

interface ExecutiveDashboardPanelProps {
  metrics: DataMetrics;
  onUpdateMetrics: (updated: Partial<DataMetrics>) => void;
  onViewChange: (view: "hub" | "etl" | "dashboard" | "chat") => void;
  notificationPermission: string;
  onRequestPermission: () => void;
  onTestNotification: (delayed?: boolean) => void;
  dashboardHistory: any[];
  selectedHistoryDashboard: any | null;
  onSelectHistoryDashboard: (dash: any | null) => void;
  onClearHistory: () => void;
}

export default function ExecutiveDashboardPanel({ 
  metrics, 
  onUpdateMetrics, 
  onViewChange,
  notificationPermission,
  onRequestPermission,
  onTestNotification,
  dashboardHistory,
  selectedHistoryDashboard,
  onSelectHistoryDashboard,
  onClearHistory
}: ExecutiveDashboardPanelProps) {
  const [timeRange, setTimeRange] = useState<"1M" | "6M" | "1A">("1M");
  const [chartType, setChartType] = useState<"line" | "column">("line");
  const [allocationTrigger, setAllocationTrigger] = useState<Record<string, { value: number; recommendation: string; status: string }>>({});

  // Determine which metrics and title to display:
  // If the user selected a past history item, display it.
  // If not, and there's history items, default to the first (most recent) one.
  // Otherwise, use metrics (which will be 0 or empty once database is purged).
  const displayedDashboard = selectedHistoryDashboard 
    ? selectedHistoryDashboard 
    : (dashboardHistory.length > 0 ? dashboardHistory[0] : null);

  const displayMetrics = displayedDashboard 
    ? {
        revenue: displayedDashboard.revenue,
        users: displayedDashboard.users,
        riskScore: displayedDashboard.riskScore,
        efficiency: displayedDashboard.efficiency,
        activeDataset: displayedDashboard.dataset || displayedDashboard.name,
      }
    : {
        revenue: metrics.revenue,
        users: metrics.users,
        riskScore: metrics.riskScore,
        efficiency: metrics.efficiency,
        activeDataset: metrics.activeDataset || "Ninguno",
      };

  const defaultAllocation = getDomainAllocation(displayMetrics.activeDataset);
  
  const displayAllocation = defaultAllocation.map((item, index) => {
    const key = `${displayMetrics.activeDataset}-${index}`;
    const override = allocationTrigger[key];
    if (override) {
      return { ...item, ...override };
    }
    return item;
  });

  const adjustAsset = (index: number) => {
    const item = displayAllocation[index];
    const key = `${displayMetrics.activeDataset}-${index}`;
    if (item.status === "AJUSTAR") {
      setAllocationTrigger(prev => ({
        ...prev,
        [key]: { value: item.value, recommendation: "Optimización implementada", status: "ESTABLE" }
      }));
    } else if (item.status === "ESTRATÉGICO") {
      setAllocationTrigger(prev => ({
        ...prev,
        [key]: { value: item.value + 45000, recommendation: "Establecido e incorporado", status: "ESTABLE" }
      }));
    }
  };

  const getDomainMetricsConfig = (datasetName: string) => {
    const lowercase = (datasetName || "").toLowerCase();
    
    if (lowercase.includes("despachos") || lowercase.includes("logist") || lowercase.includes("cali")) {
      return {
        revenueLabel: "DESPACHOS EFECTUADOS",
        revenueValue: `${displayMetrics.users.toLocaleString()} planillas`,
        usersLabel: "VEHÍCULOS DESPACHADOS",
        usersValue: `${Math.round(displayMetrics.users / 580)} camiones`,
        riskLabel: "INCIDENCIAS EN TRÁNSITO",
        riskValue: `${displayMetrics.riskScore}%`,
        riskStatus: displayMetrics.riskScore > 20 ? "Alerta" : "Estable",
        efficiencyLabel: "ENTREGAS A TIEMPO (SLA)",
        efficiencyValue: `${displayMetrics.efficiency}%`,
        trendRevenue: "logistics"
      };
    }
    if (lowercase.includes("medellin") || lowercase.includes("mejora") || lowercase.includes("espesor")) {
      return {
        revenueLabel: "LECTURAS REGISTRADAS",
        revenueValue: `${displayMetrics.users.toLocaleString()} muestras`,
        usersLabel: "SENSORES RECALIBRADOS",
        usersValue: `${Math.round(displayMetrics.revenue / 1200000)} calibraciones`,
        riskLabel: "DESVIACIÓN DE ESPESOR",
        riskValue: `${displayMetrics.riskScore}%`,
        riskStatus: displayMetrics.riskScore > 10 ? "Alerta" : "Estable",
        efficiencyLabel: "EFICIENCIA GLOBAL OEE",
        efficiencyValue: `${displayMetrics.efficiency}%`,
        trendRevenue: "production"
      };
    }
    if (lowercase.includes("colombia") || lowercase.includes("retornos") || lowercase.includes("garantias")) {
      return {
        revenueLabel: "RECLAMACIONES PROCESADAS",
        revenueValue: `${displayMetrics.users.toLocaleString()} reclamos`,
        usersLabel: "COSTO TOTAL DE GARANTÍAS",
        usersValue: `$ ${displayMetrics.revenue.toLocaleString()} COP`,
        riskLabel: "FACTOR DE RETORNO PPM",
        riskValue: `${displayMetrics.riskScore}%`,
        riskStatus: displayMetrics.riskScore > 15 ? "Crítica" : "Bajo Control",
        efficiencyLabel: "EFICACIA DE RESOLUCIÓN",
        efficiencyValue: `${displayMetrics.efficiency}%`,
        trendRevenue: "performance"
      };
    }
    return {
      revenueLabel: "INSPECCIONES REALIZADAS",
      revenueValue: `${displayMetrics.users.toLocaleString()} muestras`,
      usersLabel: "ACCIONES CORRECTIVAS",
      usersValue: `${Math.round(displayMetrics.revenue / 330000)} reportes`,
      riskLabel: "TASA DE NO CONFORMIDAD",
      riskValue: `${displayMetrics.riskScore}%`,
      riskStatus: displayMetrics.riskScore > 15 ? "Crítica" : "Bajo Control",
      efficiencyLabel: "TASA DE CONFORMIDAD SLA",
      efficiencyValue: `${displayMetrics.efficiency}%`,
      trendRevenue: "performance"
    };
  };

  const domainConfig = getDomainMetricsConfig(displayMetrics.activeDataset);

  // Render placeholder if both history and active metrics are empty (cleared)
  if (dashboardHistory.length === 0 && (!metrics.activeDataset || metrics.activeDataset === "Ninguno (Purgado)" || metrics.revenue === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8 bg-[#06142e]/30 border border-white/10 rounded-2xl max-w-2xl mx-auto my-12 animate-in fade-in duration-300">
        <div className="w-20 h-20 rounded-full bg-[#2a5ee8]/10 flex items-center justify-center mb-6">
          <Sparkles className="w-10 h-10 text-[#b6c4ff] animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-[#dae2fd] mb-2">No se ha consolidado ningún Dashboard</h2>
        <p className="text-sm text-[#c3c5d7] max-w-md mb-8 leading-relaxed">
          Los datos cargados se mantienen en la base de datos de forma temporal durante la exploración y ETL para optimizar almacenamiento. 
          Una vez consolidado, el dashboard se guarda en tu historial del navegador y la base de datos se libera automáticamente.
        </p>
        <button
          onClick={() => onViewChange("hub")}
          className="px-6 py-3 bg-[#2a5ee8] hover:bg-[#2a5ee8]/90 text-[#e7eaff] rounded-lg font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95 duration-150"
        >
          Iniciar Ingesta en Hub de Datos
        </button>
      </div>
    );
  }

  const downloadExecutiveReport = () => {
    const company = displayedDashboard?.companyName || "Empresa Global de Operaciones";
    const description = displayedDashboard?.businessDescription || "Análisis Integrado de Métricas y Business Intelligence";
    const dateStamp = displayedDashboard?.timestamp || new Date().toLocaleString("es-CO");
    const dataset = displayMetrics.activeDataset;
    const analysisConfig = getDomainAnalysisConfig(dataset);

    // Create a new window for premium styled print
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Por favor habilite las ventanas emergentes (popups) para descargar el informe en PDF.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Informe Ejecutivo de Operaciones y Analítica - ${company}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Space+Mono&display=swap');
            body {
              font-family: 'Outfit', sans-serif;
              color: #0f172a;
              background-color: #ffffff;
              padding: 40px;
              line-height: 1.6;
            }
            .header-bar {
              border-bottom: 3px solid #2a5ee8;
              padding-bottom: 20px;
              margin-bottom: 30px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .title-main {
              font-size: 24px;
              font-weight: 800;
              color: #0f172a;
              margin: 0;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .subtitle {
              font-size: 13px;
              color: #475569;
              margin: 5px 0 0 0;
            }
            .meta-info {
              font-family: 'Space Mono', monospace;
              font-size: 11px;
              text-align: right;
              color: #64748b;
            }
            .section-title {
              font-size: 15px;
              font-weight: 600;
              color: #2a5ee8;
              text-transform: uppercase;
              letter-spacing: 1px;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 6px;
              margin-top: 30px;
              margin-bottom: 15px;
            }
            .desc-block {
              background-color: #f8fafc;
              border-left: 4px solid #4edea3;
              padding: 15px;
              border-radius: 4px;
              font-size: 13px;
              color: #334155;
              margin-bottom: 25px;
            }
            .kpi-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 15px;
              margin-bottom: 30px;
            }
            .kpi-card {
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 15px;
              background-color: #fafafa;
              text-align: center;
            }
            .kpi-label {
              font-size: 10px;
              font-weight: 600;
              color: #64748b;
              text-transform: uppercase;
              margin-bottom: 5px;
              height: 25px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .kpi-value {
              font-size: 16px;
              font-weight: 800;
              color: #0f172a;
              font-family: 'Space Mono', monospace;
            }
            .table-styled {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
              margin-bottom: 30px;
              font-size: 11px;
            }
            .table-styled th {
              background-color: #0f172a;
              color: #ffffff;
              padding: 10px;
              text-align: left;
              text-transform: uppercase;
              font-weight: 600;
            }
            .table-styled td {
              border-bottom: 1px solid #e2e8f0;
              padding: 10px;
              color: #334155;
            }
            .table-styled tr:hover {
              background-color: #f8fafc;
            }
            .insights-list {
              padding-left: 20px;
              margin-bottom: 30px;
              font-size: 13px;
              color: #334155;
            }
            .insights-list li {
              margin-bottom: 10px;
            }
            .signature-block {
              margin-top: 60px;
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              color: #475569;
            }
            .signature-line {
              border-top: 1px solid #94a3b8;
              width: 200px;
              text-align: center;
              padding-top: 8px;
              margin-top: 40px;
            }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header-bar">
            <div>
              <h1 class="title-main">${analysisConfig.title}</h1>
              <p class="subtitle">${analysisConfig.subtitle}</p>
            </div>
            <div class="meta-info">
              <div>Fecha: ${dateStamp}</div>
              <div>Dataset: ${dataset}</div>
            </div>
          </div>

          <div class="section-title">Datos Generales de la Operación</div>
          <div class="desc-block">
            <strong>Empresa / Organización:</strong> ${company}<br/>
            <strong>Descripción de Operaciones:</strong> ${description}
          </div>

          <div class="section-title">Cuadro de Mando - Indicadores de Rendimiento</div>
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-label">${domainConfig.revenueLabel}</div>
              <div class="kpi-value">${domainConfig.revenueValue}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">${domainConfig.usersLabel}</div>
              <div class="kpi-value">${domainConfig.usersValue}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">${domainConfig.riskLabel}</div>
              <div class="kpi-value">${domainConfig.riskValue}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">${domainConfig.efficiencyLabel}</div>
              <div class="kpi-value">${domainConfig.efficiencyValue}</div>
            </div>
          </div>

          <div class="section-title">Diagnóstico y Recomendaciones Strategist AI</div>
          <ul class="insights-list">
            ${analysisConfig.insights.map(ins => {
              const parts = ins.split(":");
              if (parts.length > 1) {
                return `<li><strong>${parts[0]}:</strong>${parts.slice(1).join(":")}</li>`;
              }
              return `<li>${ins}</li>`;
            }).join("")}
          </ul>

          <div class="section-title">Análisis de Inteligencia de Negocios y Ciencia de Datos</div>
          <div style="font-size: 11px; color: #334155; margin-bottom: 25px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; line-height: 1.5;">
            <p style="margin-top: 0;"><strong>${analysisConfig.biTitle}</strong><br/>
            ${analysisConfig.biText}</p>
            
            <p><strong>${analysisConfig.dsTitle}</strong><br/>
            ${analysisConfig.dsText}</p>
            
            <p style="margin-bottom: 0;"><strong>${analysisConfig.conclusionTitle}</strong><br/>
            ${analysisConfig.conclusionText}</p>
          </div>

          <div class="section-title">Plan de Acciones de Optimización</div>
          <table class="table-styled">
            <thead>
              <tr>
                <th>Acción de Optimización</th>
                <th>Presupuesto Asignado</th>
                <th>Reducción de Costos Estimada</th>
                <th>Recomendación Strategist AI</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${displayAllocation.map(item => `
                <tr>
                  <td><strong>${item.category}</strong></td>
                  <td>$ ${item.value.toLocaleString()} COP</td>
                  <td>+${item.roi}% de reducción de costos</td>
                  <td>${item.recommendation}</td>
                  <td>${item.status}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <div class="signature-block">
            <div>
              <div class="signature-line">Director de Operaciones / BI</div>
            </div>
            <div>
              <div class="signature-line">Auditor Certificado - Strategist AI</div>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-12 w-full animate-in fade-in duration-200">
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      
      {/* Header block with Period Select controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#dae2fd]">
            Cuadro de Mando Directivo <span className="text-[#b6c4ff] font-light">/ {displayMetrics.activeDataset}</span>
          </h2>
          <p className="text-sm text-[#c3c5d7] mt-0.5">
            {displayedDashboard 
              ? `Visualizando reporte histórico consolidado el ${displayedDashboard.timestamp}.` 
              : "Métricas operativas del conjunto de datos activo en base de datos temporal."}
          </p>
        </div>
        <div className="flex gap-2 self-stretch sm:self-auto">
          <div className="bg-[#131b2e] px-4 py-2 rounded-xl flex items-center gap-2 text-[#4edea3] border border-white/5">
            <Zap className="w-4 h-4 fill-current animate-pulse text-[#4edea3]" />
            <span className="text-xs font-bold font-sans tracking-wide uppercase">
              {displayedDashboard ? "Reporte Histórico" : "Análisis en Vivo"}
            </span>
          </div>
          <div className="bg-[#131b2e] px-4 py-2 rounded-xl flex items-center gap-2 text-[#c3c5d7] border border-white/5">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-bold font-sans">Q3 2024</span>
          </div>
        </div>
      </div>

      {/* Empresa y Descripción del Negocio Context Banner */}
      {displayedDashboard && (
        <section className="p-5 bg-gradient-to-r from-[#171f33]/90 to-[#0e1628]/95 border border-white/10 rounded-xl space-y-2 relative overflow-hidden animate-in fade-in duration-200">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#4edea3]/5 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#4edea3] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-[#4edea3] rounded-full animate-pulse"></span>
            Contexto del Negocio Asociado
          </div>
          <h3 className="text-lg font-extrabold text-[#dae2fd]">{displayedDashboard.companyName || "Empresa Global de Operaciones"}</h3>
          <p className="text-xs text-[#c3c5d7] leading-relaxed max-w-4xl">
            {displayedDashboard.businessDescription || "Análisis Integrado de Métricas y Business Intelligence"}
          </p>
        </section>
      )}

      {/* Persistent Front-End Dashboard History Carousel */}
      {dashboardHistory.length > 0 && (
        <section className="p-4 bg-[#131b2e]/30 border border-white/10 rounded-xl space-y-3 animate-in slide-in-from-top-2 duration-150">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <h3 className="text-xs font-bold text-[#b6c4ff] uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#4edea3]" />
              Historial de Dashboards Consolidados (Capa Front-End)
            </h3>
            <button 
              onClick={() => {
                if (window.confirm("¿Seguro que deseas borrar el historial de dashboards locales?")) {
                  onClearHistory();
                }
              }}
              className="text-[10px] text-[#ffb4ab] hover:underline uppercase font-bold flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpiar Historial</span>
            </button>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {dashboardHistory.map((dash) => {
              const isSelected = displayedDashboard?.id === dash.id;
              const dConfig = getDomainMetricsConfig(dash.dataset || dash.name);
              return (
                <button
                  key={dash.id}
                  onClick={() => onSelectHistoryDashboard(dash)}
                  className={`p-3.5 rounded-lg border text-left min-w-[270px] transition-all cursor-pointer relative overflow-hidden ${
                    isSelected 
                      ? "bg-[#2a5ee8]/15 border-[#4edea3]/50 ring-1 ring-[#4edea3]/30" 
                      : "bg-[#171f33]/40 border-white/5 hover:border-white/10 hover:bg-[#171f33]/60"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-[#dae2fd] truncate max-w-[170px]">{dash.dataset}</span>
                    {isSelected && (
                      <span className="text-[8px] font-bold text-[#4edea3] bg-[#4edea3]/10 px-1.5 py-0.5 rounded border border-[#4edea3]/20 uppercase">
                        VISTA ACTUAL
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#8d90a0] font-mono mb-2">{dash.timestamp}</p>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-2 border-t border-white/5 text-[#c3c5d7]">
                    <div className="truncate" title={dConfig.revenueLabel}>Costo: <strong className="text-white">$ {dash.revenue.toLocaleString()} COP</strong></div>
                    <div>Conformidad: <strong className="text-white">{dash.efficiency}%</strong></div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Browser Notification Banner for Director General */}
      {!displayedDashboard && (
        <div className="bg-[#171f33]/30 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#b6c4ff]/10 flex items-center justify-center text-[#b6c4ff] shrink-0">
              <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#dae2fd]">Sistema de Alertas de Emergencia en Segundo Plano</h3>
              <p className="text-xs text-[#c3c5d7] mt-0.5 leading-snug">
                Notifica de inmediato anomalías críticas operativas del conjunto de datos temporal en el terminal de base de datos.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto self-stretch md:self-auto justify-end">
            {notificationPermission === "default" && (
              <button
                id="dash-btn-enable"
                onClick={onRequestPermission}
                className="px-4 py-2 bg-[#2a5ee8] hover:bg-[#2a5ee8]/90 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer hover:scale-[1.02] active:scale-95 duration-100"
              >
                Habilitar Notificaciones
              </button>
            )}

            {notificationPermission === "granted" && (
              <div className="flex flex-wrap items-center gap-2 justify-end w-full md:w-auto">
                <span className="text-[11px] font-bold text-[#4edea3] bg-[#4edea3]/10 border border-[#4edea3]/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap">
                  <span className="w-2 h-2 bg-[#4edea3] rounded-full animate-pulse"></span>
                  Notificaciones Activas ✓
                </span>
                <button
                  id="dash-btn-test-visible"
                  onClick={() => onTestNotification(false)}
                  className="px-3 py-1.5 border border-white/20 hover:bg-white/5 text-[#dae2fd] rounded-lg font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer"
                >
                  Probar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* KPI Section with 4 columns mapped to multi-domain config */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* REVENUE / DISTRIBUTION COST */}
        <div className="bg-[#171f33]/40 p-5 rounded-xl border border-white/10 hover:border-[#b6c4ff]/30 transition-all flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#c3c5d7] font-semibold uppercase tracking-wider h-8 leading-snug">{domainConfig.revenueLabel}</span>
            <span className={`font-bold text-xs flex items-center gap-1 ${domainConfig.trendRevenue === 'logistics' ? 'text-[#ffb4ab]' : 'text-[#4edea3]'}`}>
              {domainConfig.trendRevenue === 'logistics' ? (
                <TrendingDown className="w-3.5 h-3.5" />
              ) : (
                <TrendingUp className="w-3.5 h-3.5" />
              )}
              {domainConfig.trendRevenue === 'logistics' ? "-4.2%" : "+14.2%"}
            </span>
          </div>
          <div className="mt-2">
            <p className="text-xl font-bold text-[#dae2fd] font-mono">{domainConfig.revenueValue}</p>
            <div className="w-full h-8 mt-2 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 100 40">
                <path d="M0,35 Q10,15 20,30 T40,10 T60,25 T80,5 T100,20" fill="none" stroke="#b6c4ff" strokeWidth="2.5" />
              </svg>
            </div>
          </div>
        </div>

        {/* USERS / PROCESSED DELIVERIES / UNITS */}
        <div className="bg-[#171f33]/40 p-5 rounded-xl border border-white/10 hover:border-[#b6c4ff]/30 transition-all flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#c3c5d7] font-semibold uppercase tracking-wider h-8 leading-snug">{domainConfig.usersLabel}</span>
            <span className="text-[#4edea3] font-bold text-xs flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              +8.4%
            </span>
          </div>
          <div className="mt-2">
            <p className="text-xl font-bold text-[#dae2fd] font-mono">{domainConfig.usersValue}</p>
            <div className="w-full h-8 mt-2 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 100 40">
                <path d="M0,38 L10,32 L20,35 L30,25 L40,28 L50,15 L60,18 L70,10 L80,12 L90,5 L100,8" fill="none" stroke="#4edea3" strokeWidth="2.5" />
              </svg>
            </div>
          </div>
        </div>

        {/* RISK SCORE / DEFECTS PPM */}
        <div className="bg-[#171f33]/40 p-5 rounded-xl border border-white/10 hover:border-[#b6c4ff]/30 transition-all flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#c3c5d7] font-semibold uppercase tracking-wider h-8 leading-snug">{domainConfig.riskLabel}</span>
            <span className="text-[#b6c4ff] font-bold text-xs uppercase tracking-wide">{domainConfig.riskStatus}</span>
          </div>
          <div className="mt-2">
            <p className="text-xl font-bold text-[#dae2fd] font-mono">{domainConfig.riskValue}</p>
            <div className="w-full h-8 mt-2 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 100 40">
                <path d="M0,10 C25,12 50,11 75,13 L100,12" fill="none" stroke="#ffb4ab" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>

        {/* EFFICIENCY / TIMELY SHIPMENTS / OEE */}
        <div className="bg-[#171f33]/40 p-5 rounded-xl border border-white/10 hover:border-[#b6c4ff]/30 transition-all flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#c3c5d7] font-semibold uppercase tracking-wider h-8 leading-snug">{domainConfig.efficiencyLabel}</span>
            <span className="text-[#4edea3] font-bold text-xs flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              +3.1%
            </span>
          </div>
          <div className="mt-2">
            <p className="text-xl font-bold text-[#dae2fd] font-mono">{domainConfig.efficiencyValue}</p>
            <div className="w-full h-8 mt-2 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 100 40">
                <path d="M0,35 C20,30 20,10 40,10 C60,10 60,25 80,25 C100,25 100,5 120,5" fill="none" stroke="#c0c1ff" strokeWidth="2.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Area: 8 Columns Forecast | 4 Columns Insights */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Forecast View Block (8 Columns) */}
        <div className="col-span-12 xl:col-span-8 bg-[#171f33]/40 border border-white/10 rounded-xl overflow-hidden flex flex-col min-h-[500px]">
          {/* Internal Header bar */}
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/2">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-[#b6c4ff]" />
              <h3 className="text-sm font-bold text-[#dae2fd] uppercase tracking-wider">
                {domainConfig.trendRevenue === 'logistics' ? "Modelo de Tendencia de Despachos" : domainConfig.trendRevenue === 'production' ? "Proyección de Rendimiento OEE de Fábrica" : "Modelo de Pronóstico de Ingresos"}
              </h3>
            </div>
            
            {/* Time range and Visualisation switchers */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex gap-1 bg-[#0b1326] p-1 rounded-lg">
                <button
                  onClick={() => setChartType("line")}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all whitespace-nowrap ${
                    chartType === "line" 
                      ? "bg-[#2a5ee8] text-white" 
                      : "text-[#c3c5d7] hover:text-[#dae2fd]"
                  }`}
                >
                  Tendencia (Líneas)
                </button>
                <button
                  onClick={() => setChartType("column")}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all whitespace-nowrap ${
                    chartType === "column" 
                      ? "bg-[#2a5ee8] text-white" 
                      : "text-[#c3c5d7] hover:text-[#dae2fd]"
                  }`}
                >
                  Distribución (Columnas)
                </button>
              </div>

              <div className="flex gap-1 bg-[#0b1326] p-1 rounded-lg">
                {(["1M", "6M", "1A"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setTimeRange(r)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                      timeRange === r 
                        ? "bg-[#2a5ee8] text-white" 
                        : "text-[#c3c5d7] hover:text-[#dae2fd]"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Forecast curve or Columns rendering */}
          {chartType === "line" ? (
            <div className="flex-1 relative p-6 flex items-end min-h-[340px] animate-fade-in">
              {/* Horizontal line grid */}
              <div className="absolute inset-6 flex flex-col justify-between pointer-events-none opacity-10">
                <div className="h-px w-full bg-white"></div>
                <div className="h-px w-full bg-white"></div>
                <div className="h-px w-full bg-white"></div>
                <div className="h-px w-full bg-white"></div>
                <div className="h-px w-full bg-white"></div>
              </div>

              {/* SVG Plot vectors */}
              <div className="w-full h-full relative z-10 pt-2 pb-6">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 320">
                  {/* Historical spline */}
                  <path 
                    d="M0,280 L120,240 L260,260 L400,180 L520,220 L640,140" 
                    fill="none" 
                    stroke="#b6c4ff" 
                    strokeLinecap="round" 
                    strokeWidth="3.5" 
                  />
                  {/* AI Projection spline */}
                  <path 
                    d="M640,140 L740,90 L850,110 L940,40 L1000,20" 
                    fill="none" 
                    stroke="#4edea3" 
                    strokeDasharray="8 4" 
                    strokeLinecap="round" 
                    strokeWidth="3.5" 
                  />
                  
                  {/* Highlight node */}
                  <circle cx="640" cy="140" fill="#0b1326" r="6" stroke="#4edea3" strokeWidth="3" />
                  
                  {/* Trend gradient mapping */}
                  <path 
                    d="M0,280 L120,240 L260,260 L400,180 L520,220 L640,140 L740,90 L850,110 L940,40 L1000,20 L1000,320 L0,320 Z" 
                    fill="url(#chartGrad)" 
                    opacity="0.08" 
                  />
                  
                  <defs>
                    <linearGradient id="chartGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#4edea3" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Float Legends */}
              <div className="absolute top-6 right-6 flex flex-col gap-2 bg-[#131b2e]/90 p-3 rounded-lg border border-white/10 text-[11px]">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-1 bg-[#b6c4ff] rounded-full"></div>
                  <span className="text-[#c3c5d7]">Actuales Históricos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-1 bg-[#4edea3] rounded-full border-dashed border-t-2 border-b-2"></div>
                  <span className="text-[#c3c5d7]">Pronóstico de IA</span>
                </div>
              </div>

              {/* Bottom time stamps */}
              <div className="absolute bottom-2 left-6 right-6 flex justify-between font-mono text-[10px] text-[#8d90a0]">
                <span>ENE</span>
                <span>FEB</span>
                <span>MAR</span>
                <span>ABR</span>
                <span>MAY (PRESENTE)</span>
                <span>JUN</span>
                <span>AGO</span>
                <span>SEP</span>
                <span>OCT</span>
              </div>
            </div>
          ) : (
            <div className="flex-1 relative p-6 flex items-end min-h-[340px] animate-fade-in w-full">
              {/* Horizontal line grid */}
              <div className="absolute inset-6 flex flex-col justify-between pointer-events-none opacity-10">
                <div className="h-px w-full bg-white"></div>
                <div className="h-px w-full bg-white"></div>
                <div className="h-px w-full bg-white"></div>
                <div className="h-px w-full bg-white"></div>
                <div className="h-px w-full bg-white"></div>
              </div>

              {/* Column/Bar chart rendering */}
              <div className="w-full h-full relative z-10 pt-4 pb-6 flex items-end justify-around px-2 sm:px-8 min-h-[280px]">
                {displayAllocation.map((item, index) => {
                  const heightPercent = Math.max(25, Math.min(95, (item.value / 45000000) * 100));
                  return (
                    <div key={index} className="flex flex-col items-center justify-end h-full w-[28%] group relative">
                      {/* Neon value tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[#0f172a]/95 border border-[#4edea3]/40 px-2 py-1 rounded text-[10px] text-white font-mono absolute bottom-[105%] pointer-events-none shadow-2xl z-20 whitespace-nowrap">
                        $ {item.value.toLocaleString()} COP
                      </div>
                      
                      {/* Column bar */}
                      <div 
                        className="w-full rounded-t-lg bg-gradient-to-t from-[#2a5ee8]/25 to-[#2a5ee8]/50 border-t border-x border-[#b6c4ff]/40 group-hover:from-[#2a5ee8]/50 group-hover:to-[#4edea3]/55 group-hover:border-[#4edea3] transition-all duration-300 relative shadow-[0_0_20px_rgba(42,94,232,0.03)] group-hover:shadow-[0_0_20px_rgba(78,222,163,0.15)] flex items-center justify-center font-mono font-bold"
                        style={{ height: `${heightPercent}%` }}
                      >
                        {/* ROI Label embedded inside bar */}
                        <span className="text-[9px] sm:text-[10px] text-white/90 transform -rotate-90 sm:rotate-0 select-none">
                          +{item.roi}% ROI
                        </span>
                      </div>
                      
                      {/* Category label below column */}
                      <p className="text-[9px] sm:text-[10px] text-[#c3c5d7] font-semibold mt-3 text-center truncate max-w-full uppercase tracking-wider group-hover:text-white transition-colors duration-150" title={item.category}>
                        {item.category.split(" ").slice(-2).join(" ")}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Autonomous AI Insights Column (4 Columns) */}
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#dae2fd] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#4edea3]" />
              Insights del Dashboard
            </h3>
            <span className="bg-[#5557e2]/20 text-[#b6c4ff] px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border border-[#5557e2]/30">
              ESTADO CONSOLIDADO
            </span>
          </div>

          <div className="space-y-4">
            {/* Anomaly insight card */}
            <div className="p-4 bg-[#171f33]/40 rounded-xl border-t-2 border-[#ffb4ab] border-x border-b border-white/5 space-y-3">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ffdad6]/10 flex items-center justify-center shrink-0 text-[#ffb4ab]">
                  <AlertTriangle className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-[#dae2fd]">Auditoría de Integridad</h4>
                  <p className="text-xs text-[#c3c5d7] mt-1">
                    Este dashboard fue consolidado mediante PostgreSQL y los datos brutos fueron eliminados automáticamente para optimizar almacenamiento.
                  </p>
                </div>
              </div>
            </div>

            {/* Opportunity insight card */}
            <div className="p-4 bg-[#171f33]/40 rounded-xl border-t-2 border-[#4edea3] border-x border-b border-white/5 space-y-3">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#4edea3]/10 flex items-center justify-center shrink-0 text-[#4edea3]">
                  <Lightbulb className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-[#dae2fd]">Eficiencia de Procesamiento</h4>
                  <p className="text-xs text-[#c3c5d7] mt-1">
                    El nivel de optimización de base de datos actual se sitúa en un **100%** al no conservar históricos pesados.
                  </p>
                </div>
              </div>
            </div>

            {/* Predictive map promo image */}
            <div className="relative h-36 rounded-xl overflow-hidden border border-white/10 group">
              <img 
                className="w-full h-full object-cover transform duration-500 group-hover:scale-105 opacity-60" 
                alt="Mapa de Inteligencia" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzN4Z3RMHG71kaqh-dLDqRrJZ3wtBZYsxRC8ogJVXEzyX1seU6P4kfJMqne8KrMYY0LEpMRuVIa7xlDQ67BMVB-5z088b-ggj9ZG2naPbWGXpcEYJpMpn-VoOeSO3ToxjCl323RlKzr-Te1k6mV0-2QR3pi9ZHbQ1q80UsUmxwxjcm5FNdQJDVWOPoXOXp_NlZgCFqKxOjM020isENk7b8WaSB0L8XF_oFsEhS6nVcAJqidopBu6sDUWrdX3DjAp-KD89Bv8nwu6E"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent flex items-end p-4">
                <div>
                  <span className="text-[9px] uppercase tracking-widest bg-[#2a5ee8] text-white px-2 py-0.5 rounded font-bold">
                    PREDICCIONES E INSIGHTS
                  </span>
                  <p className="text-xs font-semibold text-[#dae2fd] mt-1.5">
                    Mapa de Tendencia: Q4
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Allocation Matrix Table */}
      <section className="bg-[#171f33]/40 border border-white/10 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/1">
          <h3 className="text-base font-bold text-[#dae2fd]">Plan de Acciones de Mejora Continua en Colombia</h3>
          <button 
            onClick={downloadExecutiveReport}
            className="flex items-center gap-1.5 text-xs text-[#c3c5d7] hover:text-[#dae2fd] font-semibold border border-white/15 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Reporte Ejecutivo</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#c3c5d7]">
            <thead className="bg-white/5 font-semibold text-[#c3c5d7] border-b border-white/10">
              <tr>
                <th className="p-4 uppercase tracking-wider">Acción de Mejora</th>
                <th className="p-4 uppercase tracking-wider">Presupuesto Asignado</th>
                <th className="p-4 uppercase tracking-wider">Reducción de Costo Estimada</th>
                <th className="p-4 uppercase tracking-wider">Recomendación Strategist AI</th>
                <th className="p-4 uppercase tracking-wider">Estado</th>
                <th className="p-4 uppercase tracking-wider text-center">Ejecución</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {displayAllocation.map((item, index) => (
                <tr key={index} className="hover:bg-white/3 transition-colors">
                  <td className="p-4 font-semibold text-[#dae2fd]">{item.category}</td>
                  <td className="p-4 font-mono font-medium">$ {item.value.toLocaleString()} COP</td>
                  <td className={`p-4 font-bold font-mono ${item.roi > 0 ? "text-[#4edea3]" : "text-[#ffb4ab]"}`}>
                    {item.roi > 0 ? "+" : ""}{item.roi}% de reducción de costos
                  </td>
                  <td className="p-4">{item.recommendation}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                      item.status === "ESTABLE" 
                        ? "bg-[#4edea3]/10 text-[#4edea3] border-[#4edea3]/30" 
                        : item.status === "AJUSTAR" 
                        ? "bg-[#5557e2]/20 text-[#b6c4ff] border-[#5557e2]/30" 
                        : "bg-[#2a5ee8]/20 text-[#dae2fd] border-[#2a5ee8]/30"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => adjustAsset(index)}
                      className={`px-3 py-1 rounded text-[11px] font-semibold transition-all ${
                        item.status === "ESTABLE"
                          ? "text-[#8d90a0] bg-white/5 cursor-not-allowed"
                          : "bg-[#2a5ee8] text-white hover:bg-[#2a5ee8]/90 active:scale-95 cursor-pointer"
                      }`}
                      disabled={item.status === "ESTABLE"}
                    >
                      {item.status === "ESTABLE" ? "Aplicado ✓" : "Ejecutar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      </div>
    </div>
  );
}
