import React, { useState, useEffect, useRef } from "react";
import { apiFetch } from "../apiClient";
import { 
  GitBranch, 
  Terminal, 
  Settings, 
  Zap, 
  CheckCircle,
  Clock, 
  Cpu, 
  Layers, 
  Play, 
  FileText,
  Loader2,
  Database,
  ArrowRight
} from "lucide-react";
import { DataMetrics, ValidationLog } from "../types";

interface ETLWorkspacePanelProps {
  metrics: DataMetrics;
  logs: ValidationLog[];
  onAddLog: (log: Omit<ValidationLog, "id">) => void;
  onViewChange: (view: "hub" | "etl" | "dashboard" | "chat") => void;
  onCompleteETL: () => void;
}

export default function ETLWorkspacePanel({ 
  metrics, 
  logs, 
  onAddLog, 
  onViewChange,
  onCompleteETL 
}: ETLWorkspacePanelProps) {
  const [etlEngineActive, setEtlEngineActive] = useState(true);
  const [cpuUsage, setCpuUsage] = useState(68);
  const [memoryUsage, setMemoryUsage] = useState(2.4);
  const [localLogs, setLocalLogs] = useState<ValidationLog[]>(logs);

  // ETL Status states: 'idle' (ready to run), 'extracting', 'transforming', 'loading', 'completed'
  const [etlStatus, setEtlStatus] = useState<'idle' | 'extracting' | 'transforming' | 'loading' | 'completed'>('idle');
  const [etlProgress, setEtlProgress] = useState(0);

  // Domain Typology Heuristics Detection
  const detectTypology = (name: string): "bogota" | "cali" | "medellin" | "colombia" => {
    const lowercase = (name || "").toLowerCase();
    if (lowercase.includes("bogota") || lowercase.includes("planta_q3")) {
      return "bogota";
    }
    if (lowercase.includes("cali") || lowercase.includes("despachos") || lowercase.includes("logist")) {
      return "cali";
    }
    if (lowercase.includes("medellin") || lowercase.includes("planta_2") || lowercase.includes("mejora")) {
      return "medellin";
    }
    return "colombia";
  };

  const typology = detectTypology(metrics.activeDataset);

  const getTypologyConfig = () => {
    switch (typology) {
      case "bogota":
        return {
          title: "Pipeline de Aseguramiento Planta Bogotá",
          desc: "Mapeando registros de soldadura, acabados dimensionales, tolerancias de ensamble y deduplicación de inspectores.",
          recordsLabel: "Registros de Ensamble",
          rawLabel: "RAW BOGOTÁ"
        };
      case "cali":
        return {
          title: "Pipeline de Calidad de Despachos Cali",
          desc: "Mapeando tiempos de estibación, control térmico de contenedores y averías de transporte en la distribución.",
          recordsLabel: "Planillas de Despacho",
          rawLabel: "RAW CALI"
        };
      case "medellin":
        return {
          title: "Pipeline de Espesores Medellín",
          desc: "Alineando sensores de espesor de película plástica, corrigiendo lecturas nulas y optimizando la extrusión.",
          recordsLabel: "Lecturas de Sensores",
          rawLabel: "RAW MEDELLÍN"
        };
      default:
        return {
          title: "Pipeline de Garantías Nacional",
          desc: "Resolución de causa-raíz vinculando el historial de reclamaciones a lotes de producción nacionales.",
          recordsLabel: "Historial de Reclamos",
          rawLabel: "RAW COLOMBIA"
        };
    }
  };

  const typologyConfig = getTypologyConfig();

  useEffect(() => {
    setLocalLogs(logs);
  }, [logs]);

  // Poll real-time ETL logs from DB
  useEffect(() => {
    let active = true;
    async function fetchLogs() {
      try {
        const res = await apiFetch("/api/etl-logs");
        if (res.ok && active) {
          const data = await res.json();
          if (data.logs && data.logs.length > 0) {
            setLocalLogs(data.logs);
          }
        }
      } catch (err) {
        console.error("Failed to poll ETL logs:", err);
      }
    }

    fetchLogs();
    const interval = setInterval(fetchLogs, 1500);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Fluctuating simulation metrics for CPU/RAM to bring the view to life
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(prev => {
        const offset = Math.floor(Math.random() * 7) - 3;
        const next = prev + offset;
        return next > 90 ? 88 : next < 40 ? 45 : next;
      });
      setMemoryUsage(prev => {
        const offset = Number((Math.random() * 0.2 - 0.1).toFixed(2));
        const next = Number((prev + offset).toFixed(2));
        return next > 3.0 ? 2.8 : next < 1.5 ? 1.8 : next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Execution flow of ETL Pipeline with detailed steps and redirecting
  const runEtlPipeline = async () => {
    if (etlStatus !== 'idle') return;

    setEtlStatus('extracting');
    setEtlProgress(15);
    
    // 1. EXTRACT PHASE
    onAddLog({ time: new Date().toLocaleTimeString("en-GB"), category: "Sistema", message: `[ETL INICIO] Iniciando Pipeline de Ingestión para: ${metrics.activeDataset}` });
    onAddLog({ time: new Date().toLocaleTimeString("en-GB"), category: "Escaneo", message: `[1. EXTRACT] Abriendo túnel de datos. Leyendo registros raw de ${typologyConfig.recordsLabel}...` });

    try {
      // Trigger database initialization on backend
      await apiFetch("/api/trigger-etl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datasetName: metrics.activeDataset, userRequest: typologyConfig.title })
      });
    } catch (err) {
      console.error("Failed to trigger backend ETL logs:", err);
    }

    // 2. TRANSFORM PHASE (after 1.5 seconds)
    setTimeout(() => {
      setEtlStatus('transforming');
      setEtlProgress(55);
      onAddLog({ time: new Date().toLocaleTimeString("en-GB"), category: "Análisis", message: `[2. TRANSFORM] Filtrando valores huérfanos. Auto-curando anomalías de operadores y calibrando tolerancias.` });
      onAddLog({ time: new Date().toLocaleTimeString("en-GB"), category: "Integridad", message: "[2. TRANSFORM] Normalizando esquemas relacionales de calidad a UTF-8." });
    }, 1500);

    // 3. LOAD PHASE (after 3 seconds)
    setTimeout(() => {
      setEtlStatus('loading');
      setEtlProgress(85);
      onAddLog({ time: new Date().toLocaleTimeString("en-GB"), category: "Seguridad", message: "[3. LOAD] Estableciendo conexión segura TLS/SSL con InsForge PostgreSQL..." });
      onAddLog({ time: new Date().toLocaleTimeString("en-GB"), category: "Integridad", message: "[3. LOAD] Grabando transacciones consolidadas y KPIs en base de datos PostgreSQL." });
    }, 3000);

    // 4. COMPLETED PHASE (after 4.2 seconds)
    setTimeout(() => {
      setEtlStatus('completed');
      setEtlProgress(100);
      onAddLog({ time: new Date().toLocaleTimeString("en-GB"), category: "Sistema", message: "[ETL ÉXITO] Pipeline completado. Tablas de datos optimizadas con integridad del 100%." });
      
      // Auto-trigger the completion callback to parent (App.tsx)
      onCompleteETL();
      
      // Redirection loop after a satisfying short pause to let the user see the success checkmark
      setTimeout(() => {
        onViewChange('chat');
        setEtlStatus('idle');
        setEtlProgress(0);
      }, 1500);
    }, 4200);
  };

  return (
    <div className="flex flex-col flex-1 h-full overflow-y-auto p-4 sm:p-6 space-y-6 w-full scrollbar-thin">
      
      {/* Visual Step-by-Step ETL Progress Bar Card */}
      <section className="bg-[#131b2e]/60 border border-white/10 rounded-xl p-5 shadow-2xl relative overflow-hidden shrink-0 animate-in fade-in duration-200">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #4edea3 1.5px, transparent 1.5px)", backgroundSize: "24px 24px" }}></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#dae2fd] flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-[#4edea3]" />
              {typologyConfig.title}
            </h2>
            <p className="text-xs text-[#c3c5d7] mt-0.5 max-w-2xl leading-relaxed">
              {typologyConfig.desc}
            </p>
          </div>

          <div className="shrink-0">
            {etlStatus === 'idle' ? (
              <button
                onClick={runEtlPipeline}
                className="px-5 py-2.5 bg-[#4edea3] hover:opacity-95 active:scale-95 text-[#020617] rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg duration-150"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Ejecutar Limpieza ETL</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#171f33] rounded-lg border border-[#4edea3]/30 text-xs font-mono font-bold text-[#4edea3]">
                {etlStatus === 'completed' ? (
                  <CheckCircle className="w-4.5 h-4.5 text-[#4edea3] animate-bounce" />
                ) : (
                  <Loader2 className="w-4.5 h-4.5 animate-spin text-[#4edea3]" />
                )}
                <span className="uppercase">{etlStatus === 'extracting' ? "EXTRAYENDO..." : etlStatus === 'transforming' ? "TRANSFORMANDO..." : etlStatus === 'loading' ? "CARGANDO EN INSFORGE..." : "¡PROCESO COMPLETADO!"}</span>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Progression steps visually */}
        <div className="space-y-3.5 pt-2">
          {/* Progress gauge */}
          <div className="w-full h-2 bg-[#171f33] rounded-full overflow-hidden border border-white/5 relative">
            <div 
              className="h-full bg-gradient-to-r from-[#2a5ee8] to-[#4edea3] transition-all duration-500 rounded-full" 
              style={{ width: `${etlProgress}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-3 text-center text-[10px] font-mono text-[#c3c5d7]">
            <div className={`space-y-1 ${etlStatus === 'extracting' ? 'text-[#b6c4ff] font-bold' : etlProgress >= 30 ? 'text-[#4edea3]' : ''}`}>
              <p className="uppercase">1. Extracción (Extract)</p>
              <div className="flex justify-center items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${etlStatus === 'extracting' ? 'bg-[#b6c4ff] animate-ping' : etlProgress >= 30 ? 'bg-[#4edea3]' : 'bg-white/10'}`}></span>
                <span>{etlProgress >= 30 ? "Completo" : etlStatus === 'extracting' ? "En Curso" : "En Espera"}</span>
              </div>
            </div>
            <div className={`space-y-1 ${etlStatus === 'transforming' ? 'text-[#b6c4ff] font-bold' : etlProgress >= 75 ? 'text-[#4edea3]' : ''}`}>
              <p className="uppercase">2. Transformación (Transform)</p>
              <div className="flex justify-center items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${etlStatus === 'transforming' ? 'bg-[#b6c4ff] animate-ping' : etlProgress >= 75 ? 'bg-[#4edea3]' : 'bg-white/10'}`}></span>
                <span>{etlProgress >= 75 ? "Completo" : etlStatus === 'transforming' ? "En Curso" : "En Espera"}</span>
              </div>
            </div>
            <div className={`space-y-1 ${etlStatus === 'loading' ? 'text-[#b6c4ff] font-bold' : etlProgress === 100 ? 'text-[#4edea3]' : ''}`}>
              <p className="uppercase">3. Carga (Load)</p>
              <div className="flex justify-center items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${etlStatus === 'loading' ? 'bg-[#b6c4ff] animate-ping' : etlProgress === 100 ? 'bg-[#4edea3]' : 'bg-white/10'}`}></span>
                <span>{etlProgress === 100 ? "Saneado ✓" : etlStatus === 'loading' ? "Cargando..." : "En Espera"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Central Content Area (Workspace map & active agents side list) */}
      <div className="flex-shrink-0 flex flex-col xl:flex-row gap-6">
        {/* Flow visual editor representation */}
        <section className="flex-1 relative bg-[#060e20] border border-white/10 rounded-xl overflow-x-auto p-6 flex flex-col justify-between shadow-2xl min-h-[380px] scrollbar-thin">
          <div className="min-w-[750px] h-full flex flex-col justify-between relative flex-1">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #b6c4ff 1.5px, transparent 1.5px)", backgroundSize: "32px 32px" }}></div>
            
            {/* Header metadata */}
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold text-[#dae2fd] uppercase tracking-wider">Flujo Neuronal de Limpieza</h3>
                <p className="text-[11px] text-[#c3c5d7] mt-0.5">Catálogo activo: {metrics.activeDataset}</p>
              </div>
            <div>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#4edea3]/10 text-[#4edea3] border border-[#4edea3]/25 text-[10px] font-bold font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse"></span>
                MODO AUTÓNOMO EN LINUX/POSTGRES
              </span>
            </div>
          </div>

          {/* SVG Diagram Connections and Animated Nodes */}
          <div className="relative flex-1 w-full h-full min-h-[220px]">
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <linearGradient id="lineGrad" x1="0%" x2="100%" y1="0%" y2="0%">
                  <stop offset="0%" stopColor="#b6c4ff" stopOpacity="0" />
                  <stop offset="50%" stopColor="#b6c4ff" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#b6c4ff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path className={`stroke-current text-[#b6c4ff] fill-none ${etlStatus !== 'idle' ? 'animate-dash' : 'opacity-25'}`} strokeWidth="2.5" strokeDasharray="6,4" d="M 120 80 Q 280 40 440 110" />
              <path className="stroke-current text-[#b6c4ff] fill-none opacity-20" strokeWidth="2.5" strokeDasharray="6,4" d="M 120 220 Q 300 240 440 160" />
              <path className={`stroke-current text-[#4edea3] fill-none ${etlStatus === 'loading' || etlStatus === 'completed' ? 'animate-dash' : 'opacity-25'}`} strokeWidth="2.5" strokeDasharray="8,5" d="M 440 130 Q 560 70 680 50" />
            </svg>

            {/* Input Node 1: Raw dataset */}
            <div className="absolute left-[3%] top-[5%] w-52 bg-[#171f33]/95 border border-[#b6c4ff]/30 p-3 rounded-lg backdrop-blur-md shadow-2xl z-20">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-[#b6c4ff] uppercase tracking-wider truncate" title={metrics.activeDataset}>
                  {metrics.activeDataset}
                </span>
                <span className="text-[8px] text-[#ffb4ab] bg-[#ffdad6]/10 px-1 py-0.5 rounded font-bold uppercase">
                  {typologyConfig.rawLabel}
                </span>
              </div>
              <div className="space-y-1 text-[10px] font-mono text-[#c3c5d7]">
                <p>Estructura: Registros Brutos</p>
                <p>Integridad inicial: 84.1%</p>
              </div>
            </div>
 
            {/* Input Node 2: CRM data alignment */}
            <div className="absolute left-[3%] bottom-[5%] w-52 bg-[#171f33]/95 border border-white/5 p-3 rounded-lg backdrop-blur-md shadow-2xl z-20">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-semibold text-[#b6c4ff] uppercase tracking-wider">Historico_Tolerancias</span>
                <span className="text-[9px] text-[#4edea3] font-mono font-bold">
                  {metrics.efficiency}%
                </span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-1">
                <div className="h-full bg-[#b6c4ff]" style={{ width: `${metrics.efficiency}%` }}></div>
              </div>
              <p className="text-[9px] text-[#c3c5d7] font-mono">Consistencia de llaves ok</p>
            </div>
  
            {/* Intelligence Aggregator Center Synthesis Node */}
            <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-60 bg-[#1e293b] border-t-2 p-3.5 rounded-xl shadow-2xl z-30 transition-all ${
              etlStatus === 'transforming' ? 'border-[#b6c4ff] scale-[1.03] ring-1 ring-[#b6c4ff]/30' : 'border-[#4edea3]'
            }`}>
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-8.5 h-8.5 rounded-full bg-[#5557e2] flex items-center justify-center shrink-0">
                  {etlStatus === 'transforming' ? (
                    <Loader2 className="w-4.5 h-4.5 text-white animate-spin" />
                  ) : (
                    <GitBranch className="w-4.5 h-4.5 text-white" />
                  )}
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-[#dae2fd] uppercase tracking-wider">Motor Consistencia QC</h4>
                  <span className="text-[8px] bg-[#5557e2]/20 text-[#b6c4ff] px-1.5 py-0.5 rounded font-bold font-mono uppercase">
                    Calibrador de Tolerancia
                  </span>
                </div>
              </div>
              <div className="space-y-1.5 border-t border-white/5 pt-2 font-mono text-[9.5px] text-[#c3c5d7]">
                <div className="flex justify-between">
                  <span>Deduplicación activa:</span>
                  <span className={etlStatus !== 'idle' ? 'text-[#4edea3] font-bold' : ''}>{etlStatus !== 'idle' ? "99.8%" : "Espera"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Valores nulos corregidos:</span>
                  <span className={etlProgress >= 55 ? 'text-[#4edea3] font-bold' : ''}>{etlProgress >= 55 ? "100%" : "Espera"}</span>
                </div>
              </div>
            </div>
  
            {/* Target Executive KPI Node */}
            <div className={`absolute right-[3%] top-[8%] w-52 bg-[#0c1322] border p-3 rounded-lg backdrop-blur-md shadow-2xl transition-all z-20 ${
              etlStatus === 'completed' ? 'border-[#4edea3] ring-1 ring-[#4edea3]/20 shadow-[#4edea3]/5' : 'border-white/10'
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-[#4edea3] uppercase tracking-wider">MÉTRICAS_QC</span>
                <span className="text-[8px] text-[#4edea3] bg-[#4edea3]/10 px-1.5 py-0.5 rounded font-bold font-mono">
                  {etlStatus === 'completed' ? "LISTO ✓" : "ESPERA"}
                </span>
              </div>
              <div className="space-y-1 text-[10px] font-mono text-[#c3c5d7]">
                <p>Integridad: <strong className="text-white">{etlProgress === 100 ? "99.8%" : "Verificando..."}</strong></p>
                <p>Ubicación: <strong className="text-[#b6c4ff]">InsForge DB</strong></p>
              </div>
            </div>
          </div>
          </div>
        </section>

        {/* Computing resource metrics (320px) */}
        <aside className="hidden xl:flex w-[320px] bg-[#131b2e]/60 border border-white/10 rounded-xl overflow-y-auto p-4 flex flex-col justify-between shrink-0">
          <div>
            <h3 className="text-sm font-bold text-[#dae2fd] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#b6c4ff]" />
              Agentes Activos
            </h3>

            <div className="space-y-3.5">
              {/* Orchestrator Agent */}
              <div className="bg-[#171f33] border-t-2 border-[#2a5ee8] p-3.5 rounded-lg space-y-1.5 shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-[#dae2fd] uppercase tracking-wider">Agente Orquestador</h4>
                    <p className="text-[9px] text-[#c3c5d7] font-mono">COORDINACIÓN Y PLANIFICACIÓN</p>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border transition-all ${
                    etlStatus !== 'idle' && etlStatus !== 'completed'
                      ? 'bg-[#2a5ee8]/10 text-[#b6c4ff] border-[#2a5ee8]/30 animate-pulse'
                      : 'bg-white/5 text-[#8d90a0] border-white/5'
                  }`}>
                    {etlStatus !== 'idle' && etlStatus !== 'completed' ? "PLANIFICANDO" : "INACTIVO"}
                  </span>
                </div>
              </div>

              {/* Data Engineer Agent (ETL) */}
              <div className="bg-[#171f33] border-t-2 border-[#10b981] p-3.5 rounded-lg space-y-2.5 shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-[#dae2fd] uppercase tracking-wider">Agente Ingeniero (ETL)</h4>
                    <p className="text-[9px] text-[#c3c5d7] font-mono">LIMPIEZA Y ESQUEMAS</p>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border transition-all ${
                    etlStatus !== 'idle' && etlStatus !== 'completed'
                      ? 'bg-[#10b981]/10 text-[#4edea3] border-[#10b981]/30 animate-pulse'
                      : 'bg-white/5 text-[#8d90a0] border-white/5'
                  }`}>
                    {etlStatus !== 'idle' && etlStatus !== 'completed' ? "TRABAJANDO" : "INACTIVO"}
                  </span>
                </div>
                {etlStatus !== 'idle' && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] text-[#c3c5d7]">
                      <span>Deduplicación & Limpieza</span>
                      <span className="text-white font-mono">{etlProgress >= 55 ? "100%" : etlStatus === 'extracting' ? "45%" : "0%"}</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[#10b981] transition-all duration-300" style={{ width: etlProgress >= 55 ? "100%" : etlStatus === 'extracting' ? "45%" : "0%" }}></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Scientist Agent */}
              <div className="bg-[#171f33] border-t-2 border-[#a855f7] p-3.5 rounded-lg space-y-1.5 shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-[#dae2fd] uppercase tracking-wider">Agente Científico</h4>
                    <p className="text-[9px] text-[#c3c5d7] font-mono">MODELOS Y ANOMALÍAS</p>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border transition-all ${
                    etlStatus === 'transforming'
                      ? 'bg-[#a855f7]/10 text-[#c084fc] border-[#a855f7]/30 animate-pulse'
                      : 'bg-white/5 text-[#8d90a0] border-white/5'
                  }`}>
                    {etlStatus === 'transforming' ? "TRANSFORMANDO" : "INACTIVO"}
                  </span>
                </div>
              </div>

              {/* Researcher Agent */}
              <div className="bg-[#171f33] border-t-2 border-[#ec4899] p-3.5 rounded-lg space-y-1.5 shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-[#dae2fd] uppercase tracking-wider">Agente Investigador</h4>
                    <p className="text-[9px] text-[#c3c5d7] font-mono">BÚSQUEDA Y REFERENCIAS</p>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border transition-all ${
                    etlStatus === 'extracting'
                      ? 'bg-[#ec4899]/10 text-[#f472b6] border-[#ec4899]/30 animate-pulse'
                      : 'bg-white/5 text-[#8d90a0] border-white/5'
                  }`}>
                    {etlStatus === 'extracting' ? "EXTRAYENDO" : "INACTIVO"}
                  </span>
                </div>
              </div>

              {/* Business Analyst Agent */}
              <div className="bg-[#171f33] border-t-2 border-[#eab308] p-3.5 rounded-lg space-y-2 shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-[#dae2fd] uppercase tracking-wider">Agente Analítico</h4>
                    <p className="text-[9px] text-[#c3c5d7] font-mono">DASHBOARDS Y KPIs</p>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border transition-all ${
                    etlStatus === 'loading' || etlStatus === 'completed'
                      ? 'bg-[#eab308]/10 text-[#facc15] border-[#eab308]/30 animate-pulse'
                      : 'bg-white/5 text-[#8d90a0] border-white/5'
                  }`}>
                    {etlStatus === 'loading' ? "INTEGRANDO KPIs" : etlStatus === 'completed' ? "COMPLETADO ✓" : "INACTIVO"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CPU / MEM Resource Meters */}
          <div className="mt-6 pt-4 border-t border-white/5">
            <h5 className="text-[10px] font-bold text-[#c3c5d7] uppercase tracking-wider mb-2">Consumo de Cómputo del Kernel</h5>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-[#171f33] p-2 rounded border border-white/5">
                <p className="text-[9px] text-[#c3c5d7] uppercase">CARGA CPU</p>
                <p className="text-base font-bold text-[#b6c4ff] font-mono">{cpuUsage}%</p>
              </div>
              <div className="bg-[#171f33] p-2 rounded border border-white/5">
                <p className="text-[9px] text-[#c3c5d7] uppercase">MEMORIA RAM</p>
                <p className="text-base font-bold text-[#4edea3] font-mono">{memoryUsage} TB</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* System interactive Kernel Console section (Bottom 200px) */}
      <section className="h-52 bg-[#020617] border border-white/10 rounded-xl overflow-hidden flex flex-col shrink-0">
        {/* Console Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#171f33]/60 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#b6c4ff]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#dae2fd] font-mono">Consola del Kernel Strategist</span>
          </div>
          <div className="flex gap-4 font-mono text-[10px] text-[#c3c5d7]">
            <span>TIEMPO DE ACTIVIDAD: 142:12:05</span>
            <span className="text-[#4edea3]">CONEXIÓN SEGURA POSTGRES</span>
          </div>
        </div>

        {/* Live system streaming log values */}
        <div className="flex-1 p-4 font-mono text-[11px] overflow-y-auto space-y-1.5 text-[#c3c5d7] select-none scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {localLogs.slice(-10).map((log, index) => (
            <p key={index} className="transition-all hover:text-white duration-100">
              <span className="text-[#4edea3] mr-2">[{log.time}]</span>
              <span className="text-[#8d90a0] mr-1">PROCESS_TICK:</span>
              <span className="text-[#b6c4ff] mr-2">[{log.category}]</span>
              <span>{log.message}</span>
            </p>
          ))}
          {etlStatus !== 'idle' ? (
            <p className="text-[#4edea3] font-bold animate-pulse">⚡ Pipeline en curso. Procesando y normalizando campos...</p>
          ) : (
            <p className="text-[#4edea3] font-bold animate-pulse">✓ Kernel de base de datos listo y esperando ejecución del pipeline ETL.</p>
          )}
        </div>
      </section>

    </div>
  );
}
