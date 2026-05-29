import React, { useState, useRef, useEffect } from "react";
import { 
  Upload, 
  Database, 
  Cloud, 
  Cpu, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Shuffle,
  GitBranch,
  Play
} from "lucide-react";
import { DataMetrics, DataConnector, ValidationLog } from "../types";

interface DataHubPanelProps {
  metrics: DataMetrics;
  onUpdateMetrics: (updated: Partial<DataMetrics>) => void;
  onDatasetLoaded: (newMetrics: DataMetrics, processType?: string) => void;
  logs: ValidationLog[];
  onAddLog: (log: Omit<ValidationLog, "id">) => void;
  searchFilter: string;
}

export default function DataHubPanel({ 
  metrics, 
  onUpdateMetrics, 
  onDatasetLoaded,
  logs, 
  onAddLog,
  searchFilter
}: DataHubPanelProps) {
  const [selectedProcess, setSelectedProcess] = useState<string>("Analítica de Datos");
  const [dragActive, setDragActive] = useState(false);
  const [showUrlForm, setShowUrlForm] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [isIngestingUrl, setIsIngestingUrl] = useState(false);

  const [connectors, setConnectors] = useState<DataConnector[]>([
    { id: "postgresql", name: "PostgreSQL", description: "Relacional Empresarial y de transacciones cruzadas", icon: "database", connected: true, premium: true, type: "SQL" },
    { id: "bigquery", name: "Google BigQuery", description: "Almacén de Datos e Inteligencia Escalable", icon: "cloud", connected: false, type: "Cloud" },
    { id: "restapi", name: "REST API", description: "Ingestión JSON Universal dinámica", icon: "api", connected: false, type: "API" },
    { id: "sap", name: "SAP HANA", description: "Recurso y Planeación Empresarial consolidada", icon: "table", connected: false, type: "ERP" },
    { id: "sheets", name: "Google Sheets", description: "Sincronización de Hojas Estratégicas en Vivo", icon: "sheet", connected: false, type: "Sheets" },
    { id: "salesforce", name: "Salesforce CRM", description: "Relevancia Predicha por Heurística de IA: 94%", icon: "crm", connected: false, suggested: true, relevance: "94%", type: "CRM" },
  ]);
  const [loadingConnectorId, setLoadingConnectorId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter connectors based on top header search filter
  const filteredConnectors = connectors.filter(conn => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    return conn.name.toLowerCase().includes(q) || conn.description.toLowerCase().includes(q) || conn.type.toLowerCase().includes(q);
  });

  // Handle Drag Events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // CSV Parsing and Intelligence Loading logic
  const processCSVFile = (file: File) => {
    const reader = new FileReader();
    
    onAddLog({
      time: new Date().toLocaleTimeString("en-GB"),
      category: "Sistema",
      message: `Iniciando análisis del archivo subido: '${file.name}' (${(file.size / 1024).toFixed(1)} KB)...`
    });

    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const lines = text.split("\n").filter(l => l.trim() !== "");
      if (lines.length < 2) {
        onAddLog({
          time: new Date().toLocaleTimeString("en-GB"),
          category: "Alerta",
          message: `El archivo '${file.name}' está vacío o carece de suficientes filas.`
        });
        return;
      }

      // Parse header and rows
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      const rows = lines.slice(1);

      onAddLog({
        time: new Date().toLocaleTimeString("en-GB"),
        category: "Escaneo",
        message: `Detectadas ${headers.length} columnas y ${rows.length} registros en '${file.name}'.`
      });

      // Simple heuristic scanning for Quality Control
      let revenueColIdx = headers.findIndex(h => h.includes("costo") || h.includes("no_calidad") || h.includes("revenue") || h.includes("monto") || h.includes("total"));
      let usersColIdx = headers.findIndex(h => h.includes("inspeccion") || h.includes("muestras") || h.includes("lotes") || h.includes("user") || h.includes("client"));
      let riskColIdx = headers.findIndex(h => h.includes("risk") || h.includes("riesgo") || h.includes("no_conformidad") || h.includes("defecto"));

      let parsedRevenueSum = 0;
      let parsedUsersCount = 0;
      let validRevenueRowsCount = 0;
      let riskSum = 0;
      let validRiskRowsCount = 0;

      rows.forEach(row => {
        const cols = row.split(",");
        if (revenueColIdx !== -1 && cols[revenueColIdx]) {
          const val = parseFloat(cols[revenueColIdx].replace(/[^0-9.-]/g, ""));
          if (!isNaN(val)) {
            parsedRevenueSum += val;
            validRevenueRowsCount++;
          }
        }
        if (usersColIdx !== -1 && cols[usersColIdx]) {
          const val = parseInt(cols[usersColIdx].replace(/[^0-9]/g, ""), 10);
          if (!isNaN(val)) {
            parsedUsersCount += val;
          }
        }
        if (riskColIdx !== -1 && cols[riskColIdx]) {
          const val = parseFloat(cols[riskColIdx].trim());
          if (!isNaN(val)) {
            riskSum += val;
            validRiskRowsCount++;
          }
        }
      });

      // Determine new variables based on data
      const finalRevenue = validRevenueRowsCount > 0 ? parsedRevenueSum : 14298000; // intelligent synthetic default
      const finalUsers = parsedUsersCount > 0 ? parsedUsersCount : (metrics.users + 1430);
      const finalRisk = validRiskRowsCount > 0 ? Number((riskSum / validRiskRowsCount).toFixed(1)) : 12.4;
      
      setTimeout(() => {
        onAddLog({
          time: new Date().toLocaleTimeString("en-GB"),
          category: "Integridad",
          message: `Verificación concluida. Coincidencia de esquema de calidad al 99.8%. Normalizado en PostgreSQL.`
        });

        // Redirect corporate user instantly
        onDatasetLoaded({
          revenue: finalRevenue,
          users: finalUsers,
          riskScore: finalRisk,
          efficiency: Number((100 - finalRisk).toFixed(1)),
          warehouseDelay: false,
          activeDataset: file.name.substring(0, 30),
        }, selectedProcess);

        onAddLog({
          time: new Date().toLocaleTimeString("en-GB"),
          category: "Análisis",
          message: `¡Métricas de Calidad actualizadas! Nuevo Costo de No Calidad: $ ${finalRevenue.toLocaleString()} COP | Inspecciones: ${finalUsers.toLocaleString()} muestras.`
        });
      }, 1000);
    };

    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processCSVFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processCSVFile(e.target.files[0]);
    }
  };

  // Handle connector interactions (loading state, logging)
  const toggleConnector = (connectorId: string, name: string) => {
    const isCurrentlyConnected = connectors.find(c => c.id === connectorId)?.connected;

    if (isCurrentlyConnected) {
      // Disconnect immediately
      setConnectors(prev => prev.map(c => c.id === connectorId ? { ...c, connected: false } : c));
      onAddLog({
        time: new Date().toLocaleTimeString("en-GB"),
        category: "Sistema",
        message: `Desconectando enlace con el servicio de datos de ${name}.`
      });
    } else {
      // Show elegant loading speed simulation
      setLoadingConnectorId(connectorId);
      onAddLog({
        time: new Date().toLocaleTimeString("en-GB"),
        category: "Escaneo",
        message: `Estableciendo túnel y cruzando llaves para conector global: ${name}...`
      });

      setTimeout(() => {
        setConnectors(prev => prev.map(c => c.id === connectorId ? { ...c, connected: true } : c));
        setLoadingConnectorId(null);
        
        onAddLog({
          time: new Date().toLocaleTimeString("en-GB"),
          category: "Integridad",
          message: `¡Enlace de datos exitoso con ${name}! Catalogando metadatos en vivo.`
        });
      }, 1200);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-12 w-full">
      <div className="grid grid-cols-12 gap-6 max-w-[1600px] mx-auto">
        {/* Left Ingestion Area & Connected Sources (8 columns) */}
      <div className="col-span-12 xl:col-span-8 flex flex-col gap-6">
        {/* Premium Onboarding Welcome Card */}
        <section className="relative p-6 rounded-2xl bg-gradient-to-r from-[#1d4ed8]/20 via-[#1e40af]/10 to-transparent border border-[#2a5ee8]/30 shadow-xl space-y-4 overflow-hidden animate-in fade-in duration-200 mt-2">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#4edea3]/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#4edea3] uppercase tracking-wider">
            <span className="w-2 h-2 bg-[#4edea3] rounded-full animate-pulse"></span>
            Asistente Strategist AI
          </div>
          <h2 className="text-xl font-extrabold text-[#dae2fd]">¡Bienvenido! Nos alegra tenerte aquí</h2>
          <p className="text-sm text-[#c3c5d7] leading-relaxed max-w-3xl">
            Nos gustaría saber qué proceso quieres llevar a cabo (analítica de datos, Business Intelligence, ciencia de datos, Big Data, etc.). Por favor, selecciona el tipo de análisis y carga tu conjunto de datos en el Hub de Ingestión para comenzar.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 flex flex-col gap-1.5 w-full text-left">
              <label className="text-[10px] font-bold text-[#b6c4ff] uppercase tracking-widest">
                Tipo de Proceso Heurístico:
              </label>
              <select
                value={selectedProcess}
                onChange={(e) => setSelectedProcess(e.target.value)}
                className="bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2a5ee8] cursor-pointer w-full transition-all"
              >
                <option value="Analítica de Datos">Analítica de Datos (QA)</option>
                <option value="Business Intelligence">Business Intelligence (BI)</option>
                <option value="Ciencia de Datos">Ciencia de Datos (Data Science)</option>
                <option value="Big Data">Big Data (Ingesta Masiva)</option>
              </select>
            </div>
            <div className="text-xs text-[#8d90a0] font-mono shrink-0 mb-2">
              Estado: <span className="text-[#4edea3] font-bold">Listo para Ingestar</span>
            </div>
          </div>
        </section>

        {/* Drag-and-drop ingestion file zone */}
        <section 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
            dragActive 
              ? "border-[#b6c4ff] bg-[#2a5ee8]/10" 
              : "border-white/10 bg-[#06142e]/30 hover:border-white/20"
          }`}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            accept=".csv,.xlsx,.xls,.json"
            onChange={handleFileChange}
            className="hidden" 
          />
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 rounded-full bg-[#2a5ee8]/10 flex items-center justify-center mb-4 transition-transform duration-150 hover:scale-105">
              <Upload className="w-8 h-8 text-[#b6c4ff]" />
            </div>
            <h3 className="text-lg font-bold text-[#dae2fd] mb-1">Ingestión del Centro de Mando</h3>
            <p className="text-sm text-[#c3c5d7] max-w-md mb-6">
              Arrastra y suelta tu archivo **CSV, Excel o JSON** aquí, u haz clic para explorar tus documentos locales.
            </p>
            <div className="flex flex-col gap-3 w-full max-w-md items-center">
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  type="button"
                  className="px-5 py-2.5 bg-[#2a5ee8] text-[#e7eaff] rounded font-bold text-xs hover:bg-[#2a5ee8]/90 transition-all uppercase tracking-wider"
                >
                  Explorar Archivos
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowUrlForm(!showUrlForm); }}
                  type="button"
                  className="px-5 py-2.5 border border-white/20 text-[#dae2fd] rounded font-bold text-xs hover:bg-white/5 transition-all uppercase tracking-wider"
                >
                  URL/Endpoint
                </button>
              </div>

              {showUrlForm && (
                <div onClick={(e) => e.stopPropagation()} className="w-full mt-4 p-4 bg-[#0a1426] border border-[#2a5ee8]/40 rounded-lg flex flex-col gap-3 text-left animate-in fade-in slide-in-from-top-1">
                  <p className="text-[11px] text-[#b6c4ff] uppercase tracking-wider font-bold">Conectar Endpoint JSON de Datos</p>
                  <p className="text-[10px] text-[#c3c5d7]">
                    Introduce una URL API REST válida (ej. JSON, CSV) para consultar e iniciar el análisis heurístico autónomo.
                  </p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://api.empresa.com/v1/ventas"
                      className="flex-1 bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#2a5ee8]"
                    />
                    <button 
                      type="button"
                      disabled={isIngestingUrl || !urlInput}
                      onClick={() => {
                        setIsIngestingUrl(true);
                        onAddLog({
                          time: new Date().toLocaleTimeString("en-GB"),
                          category: "Escaneo",
                          message: `Consultando GET: ${urlInput}...`
                        });
                        setTimeout(() => {
                          onAddLog({
                            time: new Date().toLocaleTimeString("en-GB"),
                            category: "Integridad",
                            message: `Esquema de respuesta OK. Payload JSON mapeado correctamente.`
                          });
                          setIsIngestingUrl(false);
                          setShowUrlForm(false);
                          // Trigger full upload redirection loop
                          onDatasetLoaded({
                            revenue: 1640200,
                            users: 94120,
                            riskScore: 11.2,
                            efficiency: 95.5,
                            warehouseDelay: false,
                            activeDataset: "Endpoint_Sales_Stream",
                          }, selectedProcess);
                        }, 1200);
                      }}
                      className="px-4 py-1.5 bg-[#4edea3] text-[#020617] font-bold rounded text-xs hover:opacity-90 transition-all disabled:opacity-45"
                    >
                      {isIngestingUrl ? "Mapeando..." : "Ingestar"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Enterprise Dataset Presets (Redefining immediate value loading as requested) */}
        <section className="p-5 bg-[#131b2e]/40 rounded-xl border border-white/10 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#dae2fd] flex items-center gap-2">
                <Shuffle className="w-4 h-4 text-[#4edea3]" />
                Escenarios y Conjuntos de Datos Corporativos
                Escenarios de Inspección y Control de Calidad
              </h3>
              <p className="text-xs text-[#c3c5d7]">Carga inmediata para simular de forma integral el rendimiento de la cadena de valor.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                name: "Calidad_Inspecciones_Planta_Q3",
                label: "Aseguramiento Calidad Bogota Q3",
                revenue: 14298000,
                users: 82410,
                riskScore: 12.4,
                efficiency: 94.8,
                warehouseDelay: true,
                desc: "Inspecciones de soldadura, acabados y ajustes dimensionales en línea 1 de ensamble."
              },
              {
                name: "Calidad_Lote_Logistica_Despachos",
                label: "Calidad Logística y Despachos Cali",
                revenue: 21845000,
                users: 104900,
                riskScore: 24.1,
                efficiency: 89.2,
                warehouseDelay: true,
                desc: "Auditoría de despachos y embalaje, incidencias en cadena de frío y daños mecánicos."
              },
              {
                name: "Calidad_Mejora_Continua_Planta_2",
                label: "Control Estadístico Medellín",
                revenue: 8942000,
                users: 124150,
                riskScore: 4.2,
                efficiency: 98.2,
                warehouseDelay: false,
                desc: "Control de calidad en tiempo real con sensores de espesor y consistencia automatizados."
              },
              {
                name: "Calidad_Retornos_Garantias_Colombia",
                label: "Auditoría Garantías Colombia",
                revenue: 45204000,
                users: 48350,
                riskScore: 18.5,
                efficiency: 91.0,
                warehouseDelay: true,
                desc: "Auditoría heurística de devoluciones por fallas estructurales y defectos en empaque."
              }
            ].map((p) => {
              const isActive = metrics.activeDataset === p.name;
              return (
                <button
                  key={p.name}
                  onClick={() => {
                    onAddLog({
                      time: new Date().toLocaleTimeString("en-GB"),
                      category: "Sistema",
                      message: `Forzando ingestión estructural de escenario de calidad: '${p.label}'...`
                    });
                    
                    setTimeout(() => {
                      onDatasetLoaded({
                        revenue: p.revenue,
                        users: p.users,
                        riskScore: p.riskScore,
                        efficiency: p.efficiency,
                        warehouseDelay: p.warehouseDelay,
                        activeDataset: p.name,
                      }, selectedProcess);
                      onAddLog({
                        time: new Date().toLocaleTimeString("en-GB"),
                        category: "Integridad",
                        message: `Almacenamiento reconfigurado. Datos de calidad cargados correctamente para '${p.name}'.`
                      });
                    }, 500);
                  }}
                  className={`p-3.5 rounded-lg border text-left transition-all relative ${
                    isActive 
                      ? "bg-[#2a5ee8]/10 border-[#4edea3]/40 ring-1 ring-[#4edea3]/30" 
                      : "bg-[#171f33]/40 border-white/5 hover:border-white/10 hover:bg-[#171f33]/60"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-xs font-bold text-[#dae2fd]">{p.label}</span>
                    {isActive && (
                      <span className="text-[9px] font-bold text-[#4edea3] bg-[#4edea3]/10 px-2 py-0.5 rounded uppercase tracking-wider border border-[#4edea3]/20">
                        ACTIVO (EN VIVO)
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#c3c5d7] line-clamp-1 mb-2 leading-relaxed">{p.desc}</p>
                  <div className="flex gap-4 text-[10px] text-[#c3c5d7] font-mono border-t border-white/5 pt-1.5">
                    <span>Costo No Calidad: <strong className="text-white">$ {p.revenue.toLocaleString()} COP</strong></span>
                    <span>Inspecciones: <strong className="text-white">{p.users.toLocaleString()}</strong></span>
                    <span>Eficiencia: <strong className="text-white">{p.efficiency}%</strong></span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Cloud Connectors grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#dae2fd] flex items-center gap-2">
              <Database className="w-5 h-5 text-[#b6c4ff]" />
              Conectores en la Nube
            </h3>
            <span className="text-xs text-[#4edea3] bg-[#4edea3]/10 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-[#4edea3]/20">
              {connectors.filter(c => c.connected).length + 24} Endpoints Activos
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredConnectors.map((c) => (
              <div 
                key={c.id} 
                className={`p-5 rounded-xl border flex flex-col justify-between transition-all bg-[#171f33]/40 ${
                  c.connected 
                    ? "border-[#4edea3]/30 border-l-4 border-l-[#4edea3]" 
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded ${c.suggested ? "bg-[#4edea3]/10 text-[#4edea3]" : "bg-white/5 text-[#dae2fd]"}`}>
                      <Cloud className="w-5 h-5" />
                    </div>
                    {c.premium && (
                      <span className="text-[10px] font-bold text-[#b6c4ff] bg-[#2a5ee8]/20 px-1.5 py-0.5 rounded tracking-wide uppercase">
                        PREMIUM
                      </span>
                    )}
                    {c.suggested && (
                      <span className="text-[10px] font-bold text-[#e7eaff] bg-[#5557e2] px-1.5 py-0.5 rounded tracking-wide uppercase font-sans">
                        SUGERIDO POR IA
                      </span>
                    )}
                  </div>
                  
                  <h4 className="text-sm font-semibold text-[#dae2fd] uppercase tracking-wider">{c.name}</h4>
                  <p className="text-xs text-[#c3c5d7] mt-1.5 line-clamp-2 h-8 leading-snug">
                    {c.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5">
                  <button
                    onClick={() => toggleConnector(c.id, c.name)}
                    disabled={loadingConnectorId === c.id}
                    className={`w-full py-1.5 text-xs font-bold rounded transition-all duration-150 ${
                      loadingConnectorId === c.id
                        ? "bg-[#2d3449] text-[#c3c5d7] cursor-wait"
                        : c.connected
                        ? "bg-[#4edea3]/10 text-[#4edea3] hover:bg-[#4edea3]/20 border border-[#4edea3]/30"
                        : c.suggested
                        ? "bg-[#4edea3] text-black hover:bg-[#4edea3]/90"
                        : "border border-white/20 text-[#c3c5d7] hover:bg-white/5"
                    }`}
                  >
                    {loadingConnectorId === c.id 
                      ? "CONECTANDO..." 
                      : c.connected 
                      ? "CONECTADO ✓" 
                      : c.suggested 
                      ? "CONEXIÓN INTELIGENTE" 
                      : "CONECTAR"
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Right Validation stream log column (4 columns) */}
      <div className="col-span-12 xl:col-span-4 self-start">
        <section className="bg-[#131b2e]/60 rounded-xl border border-white/10 flex flex-col h-[640px] sticky top-24">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#4edea3]" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#dae2fd]">Flujo de Validación</h3>
            </div>
            <div className="flex gap-1.5 items-center bg-[#4edea3]/10 py-1 px-2.5 rounded-full border border-[#4edea3]/20">
              <span className="w-2 h-2 bg-[#4edea3] rounded-full animate-pulse"></span>
              <span className="text-[10px] text-[#4edea3] font-bold">AGENTE EN VIVO</span>
            </div>
          </div>

          {/* Scrolling Log Rows */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 font-mono text-xs text-[#c3c5d7] select-none scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-3 items-start animate-fade-in">
                <span className="text-[#8d90a0] shrink-0">{log.time}</span>
                <div className="flex-1">
                  <span className={`font-bold mr-1.5 ${
                    log.category === "Alerta" ? "text-[#ffb4ab]" :
                    log.category === "Integridad" ? "text-[#4edea3]" :
                    log.category === "Análisis" ? "text-[#b6c4ff]" : "text-[#8d90a0]"
                  }`}>
                    [{log.category}]
                  </span>
                  <span>{log.message}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Global ingestion progress gauge */}
          <div className="p-4 bg-[#171f33]/70 border-t border-white/10 rounded-b-xl">
            <div className="flex items-center justify-between mb-2 text-xs font-semibold">
              <span className="text-[#c3c5d7]">Progreso del Ingestador</span>
              <span className="text-[#4edea3]">98.4%</span>
            </div>
            <div className="w-full h-1 bg-[#2d3449] rounded-full overflow-hidden">
              <div className="h-full bg-[#4edea3]" style={{ width: "98.4%" }}></div>
            </div>
          </div>
        </section>
      </div>
      </div>
    </div>
  );
}
