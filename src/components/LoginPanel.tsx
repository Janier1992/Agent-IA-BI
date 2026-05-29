import React, { useState, useEffect } from "react";
import { 
  User, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  BarChart3, 
  Cpu,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Terminal,
  Activity
} from "lucide-react";

interface LoginPanelProps {
  onLoginSuccess: (user: { username: string; email: string }) => void;
}

export default function LoginPanel({ onLoginSuccess }: LoginPanelProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loginIdentifier, setLoginIdentifier] = useState(""); // username or email

  // Live simulation states
  const [recordsCount, setRecordsCount] = useState(82410);
  const [liveLog, setLiveLog] = useState("Esperando inicialización...");
  
  // Dynamic logs list for simulated agent autonomous console
  const logsQueue = [
    "Descargando lote operativo...",
    "Tratamiento de nulos en región_code...",
    "Normalización de llaves en PostgreSQL...",
    "Calibrando sensores y tolerancias...",
    "Generando informe directivo consolidado...",
    "Deduplicando IDs de operadores...",
    "Proyectando Six Sigma en planta...",
    "Purgando tablas operativas temporales...",
    "Alineando desviaciones de proceso...",
    "Listo para consumo directivo."
  ];

  useEffect(() => {
    // 1. Counter animation: simulate live ingestion of Big Data
    const countInterval = setInterval(() => {
      setRecordsCount(prev => prev + Math.floor(Math.random() * 5) + 1);
    }, 1200);

    // 2. Console animation: simulate autonomous agent in action
    let logIdx = 0;
    const logInterval = setInterval(() => {
      setLiveLog(logsQueue[logIdx]);
      logIdx = (logIdx + 1) % logsQueue.length;
    }, 3000);

    return () => {
      clearInterval(countInterval);
      clearInterval(logInterval);
    };
  }, []);

  const clearMessages = () => {
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    clearMessages();
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setLoginIdentifier("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (isLogin) {
      if (!loginIdentifier || !password) {
        setErrorMsg("Por favor, ingrese sus credenciales de acceso.");
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usernameOrEmail: loginIdentifier,
            password: password
          })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setSuccessMsg("¡Acceso concedido! Redirigiendo a la consola directiva...");
          setTimeout(() => {
            onLoginSuccess(data.user);
          }, 800);
        } else {
          setErrorMsg(data.error || "Las credenciales ingresadas son incorrectas.");
        }
      } catch (err) {
        setErrorMsg("Error de conexión con el backend de autenticación.");
      } finally {
        setLoading(false);
      }
    } else {
      if (!username || !email || !password || !confirmPassword) {
        setErrorMsg("Por favor, complete todos los campos obligatorios.");
        return;
      }

      if (password !== confirmPassword) {
        setErrorMsg("Las contraseñas ingresadas no coinciden.");
        return;
      }

      if (password.length < 6) {
        setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            email,
            password
          })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setSuccessMsg("¡Registro exitoso! Ya puede iniciar sesión con sus credenciales.");
          setTimeout(() => {
            setIsLogin(true);
            clearMessages();
            setLoginIdentifier(username);
            setPassword("");
            setConfirmPassword("");
          }, 1500);
        } else {
          setErrorMsg(data.error || "Fallo en el registro. Es posible que el usuario o correo ya existan.");
        }
      } catch (err) {
        setErrorMsg("Error al conectar con el servidor de registros.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-[#dae2fd] flex items-center justify-center p-4 relative overflow-hidden select-none">
      
      {/* CSS Keyframe Animations inject for spectacular neural grid and charts */}
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
        @keyframes float-slow {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { filter: drop-shadow(0 0 2px rgba(42,94,232,0.4)); }
          50% { filter: drop-shadow(0 0 10px rgba(78,222,163,0.8)); }
        }
        @keyframes beam-travel {
          0% { stroke-dashoffset: 24; }
          100% { stroke-dashoffset: 0; }
        }
        .animate-ring { animation: pulse-ring 4s ease-in-out infinite; }
        .animate-float { animation: float-slow 6s ease-in-out infinite; }
        .animate-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .animate-beam { stroke-dasharray: 6, 18; animation: beam-travel 1.5s linear infinite; }
      `}</style>

      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#2a5ee8]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#4edea3]/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Container */}
      <div className="w-full max-w-6xl bg-[#0b1326]/80 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 min-h-[680px] animate-fade-in z-10">
        
        {/* Left Column: Premium Capabilities, SVG network and real-time console */}
        <div className="lg:col-span-6 bg-gradient-to-br from-[#0c1630] via-[#0d1838] to-[#040b21] p-8 md:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 relative overflow-hidden">
          
          {/* Radial Mesh */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
            backgroundImage: "radial-gradient(#2a5ee8 1px, transparent 1px)",
            backgroundSize: "20px 20px"
          }}></div>

          <div className="relative z-10 space-y-8">
            {/* Header / Brand */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#2a5ee8]/20 border border-[#2a5ee8]/50 rounded-xl animate-glow">
                  <Sparkles className="w-6 h-6 text-[#b6c4ff]" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#b6c4ff] to-[#4edea3] tracking-wider uppercase">
                    Agent-BI
                  </h2>
                  <p className="text-[10px] text-[#4edea3] font-bold tracking-widest uppercase">Strategist AI Enterprise</p>
                </div>
              </div>

              {/* Pulsing Active badge */}
              <div className="flex items-center gap-2 bg-[#4edea3]/10 border border-[#4edea3]/30 px-3 py-1 rounded-full text-[10px] text-[#4edea3] font-extrabold uppercase font-mono tracking-wider animate-ring">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse"></span>
                <span>Agente Autónomo Activo</span>
              </div>
            </div>

            {/* Premium Animated SVG Graph Component */}
            <div className="w-full h-40 bg-[#070e1e]/60 border border-white/5 rounded-2xl p-4 flex items-center justify-between relative overflow-hidden group">
              {/* Grid Lines */}
              <div className="absolute inset-0 opacity-[0.05]" style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                backgroundSize: "15px 15px"
              }}></div>

              {/* Dynamic SVG Node Network */}
              <svg className="w-full h-full relative z-10" viewBox="0 0 400 120">
                {/* Connecting Lines */}
                <path d="M 50,60 L 150,30 L 250,90 L 350,60" fill="none" stroke="rgba(42,94,232,0.15)" strokeWidth="3" />
                <path d="M 50,60 L 150,30 L 250,90 L 350,60" fill="none" stroke="#2a5ee8" strokeWidth="2" className="animate-beam" />

                <path d="M 50,60 L 150,90 L 250,30 L 350,60" fill="none" stroke="rgba(78,222,163,0.15)" strokeWidth="3" />
                <path d="M 50,60 L 150,90 L 250,30 L 350,60" fill="none" stroke="#4edea3" strokeWidth="2" className="animate-beam" />

                {/* Node 1: Ingestion */}
                <circle cx="50" cy="60" r="10" fill="#0c1630" stroke="#2a5ee8" strokeWidth="3" className="cursor-pointer" />
                <circle cx="50" cy="60" r="5" fill="#b6c4ff" />

                {/* Node 2: ETL Cleaning */}
                <circle cx="150" cy="30" r="12" fill="#0c1630" stroke="#4edea3" strokeWidth="3" />
                <path d="M 146,26 L 154,34 M 154,26 L 146,34" stroke="#4edea3" strokeWidth="2" />
                <circle cx="150" cy="90" r="10" fill="#0c1630" stroke="#2a5ee8" strokeWidth="2" />

                {/* Node 3: AI Chat */}
                <circle cx="250" cy="90" r="12" fill="#0c1630" stroke="#b6c4ff" strokeWidth="3" />
                <circle cx="250" cy="30" r="10" fill="#0c1630" stroke="#4edea3" strokeWidth="2" />

                {/* Node 4: Dashboard Reports */}
                <circle cx="350" cy="60" r="14" fill="#0c1630" stroke="#4edea3" strokeWidth="3" />
                <polygon points="346,55 354,60 346,65" fill="#4edea3" />

                {/* Text Badges */}
                <text x="35" y="85" fill="#8d90a0" fontSize="9" fontWeight="bold" fontFamily="monospace">INGESTA</text>
                <text x="135" y="15" fill="#4edea3" fontSize="9" fontWeight="bold" fontFamily="monospace">AUTO-ETL</text>
                <text x="235" y="112" fill="#b6c4ff" fontSize="9" fontWeight="bold" fontFamily="monospace">AGENTE IA</text>
                <text x="325" y="87" fill="#4edea3" fontSize="9" fontWeight="bold" fontFamily="monospace">DASHBOARDS</text>
              </svg>

              {/* Floating Counter Card */}
              <div className="absolute right-4 bottom-3 bg-[#0a1226]/80 backdrop-blur-md border border-white/10 rounded-xl px-3 py-1.5 text-right">
                <span className="text-[8px] text-[#8d90a0] block uppercase tracking-widest font-bold">Tratados Autónomamente</span>
                <span className="text-xs font-mono font-black text-[#4edea3]">
                  {recordsCount.toLocaleString()} Muestras
                </span>
              </div>
            </div>

            {/* Core Capability Pillars - EXTREMELY DETAILED AND PRECISE */}
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold text-[#b6c4ff] tracking-wider uppercase">
                Metodologías Integrales del Motor de Datos y Big Data
              </h3>

              {/* Card 1: Data Analysis */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-[#b6c4ff]/40 hover:bg-[#2d3449]/20 transition-all duration-300 group cursor-default">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-[#2a5ee8]/10 rounded-xl border border-white/10 group-hover:bg-[#2a5ee8]/20 group-hover:border-[#2a5ee8]/30 transition-all shrink-0">
                    <Cpu className="w-5 h-5 text-[#b6c4ff]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white group-hover:text-[#b6c4ff] transition-all">
                      Análisis de Datos Autónomo
                    </h4>
                    <p className="text-[11px] text-[#c3c5d7] mt-1 leading-relaxed">
                      Ingesta inteligente y tratamiento heurístico concurrente de flujos de información operativa. El agente autónomo audita la causa-raíz de anomalías, limpia redundancias críticas y normaliza planillas operativas para garantizar la máxima integridad en cualquier planta industrial del país.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Business Intelligence */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-[#4edea3]/40 hover:bg-[#2d3449]/20 transition-all duration-300 group cursor-default">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-[#4edea3]/10 rounded-xl border border-white/10 group-hover:bg-[#4edea3]/20 group-hover:border-[#4edea3]/30 transition-all shrink-0">
                    <BarChart3 className="w-5 h-5 text-[#4edea3]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white group-hover:text-[#4edea3] transition-all">
                      Business Intelligence (BI) Dinámico
                    </h4>
                    <p className="text-[11px] text-[#c3c5d7] mt-1 leading-relaxed">
                      Datos estructurados y listos para generar dashboards interactivos e impactantes. Impulsado por un motor de autolimpieza y un agente autónomo conectado que analiza la totalidad de la información y optimiza en caliente el almacenamiento para evitar sesgos, consolidando métricas clave ante altos volúmenes de Big Data.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3: Data Science */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-violet-500/40 hover:bg-[#2d3449]/20 transition-all duration-300 group cursor-default">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-violet-500/10 rounded-xl border border-white/10 group-hover:bg-violet-500/20 group-hover:border-violet-500/30 transition-all shrink-0">
                    <TrendingUp className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white group-hover:text-violet-400 transition-all">
                      Ciencia de Datos & Proyecciones Six Sigma
                    </h4>
                    <p className="text-[11px] text-[#c3c5d7] mt-1 leading-relaxed">
                      Predicción inteligente de tendencias y modelado avanzado de variables operativas. Implementación de algoritmos de Machine Learning y metodologías Six Sigma para anticipar fallos, optimizar la capacidad de los procesos y generar reportes ejecutivos vectoriales de alto nivel directivo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Agent Autonomous Console View */}
          <div className="mt-8 bg-[#040914] border border-white/5 rounded-xl p-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#ffb4ab]">
                <Terminal className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[8px] uppercase tracking-wider text-[#8d90a0] font-bold block">Consola en Vivo del Agente</span>
                <span className="text-[11px] font-mono text-[#c3c5d7] truncate block">
                  $ strategist-ai --mode=auto &gt; <strong className="text-[#4edea3]">{liveLog}</strong>
                </span>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#4edea3] animate-pulse" />
              <span className="text-[10px] font-mono font-semibold text-[#4edea3] uppercase tracking-wider">LIVE RUN</span>
            </div>
          </div>

        </div>

        {/* Right Column: Sliding Authentication Form */}
        <div className="lg:col-span-6 p-8 md:p-12 flex flex-col justify-center relative">
          
          <div className="max-w-md w-full mx-auto space-y-8">
            
            {/* Form Toggle Tabs */}
            <div className="flex bg-[#131b2e] p-1 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => isLogin || handleToggleMode()}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  isLogin 
                    ? "bg-[#2a5ee8] text-white shadow-lg" 
                    : "text-[#8d90a0] hover:text-[#dae2fd]"
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => !isLogin || handleToggleMode()}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  !isLogin 
                    ? "bg-[#2a5ee8] text-white shadow-lg" 
                    : "text-[#8d90a0] hover:text-[#dae2fd]"
                }`}
              >
                Crear Cuenta
              </button>
            </div>

            {/* Title / Description */}
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                {isLogin ? "Acceso Directivo Autorizado" : "Formulario de Registro Corporativo"}
              </h1>
              <p className="text-xs text-[#c3c5d7] mt-1">
                {isLogin 
                  ? "Ingrese su usuario o correo electrónico y contraseña para acceder a la consola." 
                  : "Complete los campos para registrar sus credenciales en la base de datos de control."}
              </p>
            </div>

            {/* Alerts */}
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                <span className="leading-snug">{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                <span className="leading-snug">{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* For LOGIN: Username or Email identifier */}
              {isLogin && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#b6c4ff]">Usuario o Correo</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#8d90a0] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="login-id"
                      type="text"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="director o director@planta.co"
                      disabled={loading}
                      className="w-full bg-[#131b2e] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-[#b6c4ff] text-white transition-all placeholder:text-[#8d90a0]/60"
                      required
                    />
                  </div>
                </div>
              )}

              {/* For REGISTER: Username */}
              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#b6c4ff]">Nombre de Usuario</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#8d90a0] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="register-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Ej. inspectordatos"
                      disabled={loading}
                      className="w-full bg-[#131b2e] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-[#b6c4ff] text-white transition-all placeholder:text-[#8d90a0]/60"
                      required
                    />
                  </div>
                </div>
              )}

              {/* For REGISTER: Email */}
              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#b6c4ff]">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8d90a0] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="register-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Ej. inspector@planta.co"
                      disabled={loading}
                      className="w-full bg-[#131b2e] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-[#b6c4ff] text-white transition-all placeholder:text-[#8d90a0]/60"
                      required
                    />
                  </div>
                </div>
              )}

              {/* For BOTH: Password */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#b6c4ff]">Contraseña</label>
                  {isLogin && (
                    <a href="#" onClick={(e) => { e.preventDefault(); setErrorMsg("Acción temporalmente deshabilitada. Use la credencial semilla por defecto (director123)."); }} className="text-[10px] text-[#2a5ee8] hover:underline">
                      ¿Olvidó su contraseña?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8d90a0] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-[#b6c4ff] text-white transition-all placeholder:text-[#8d90a0]/60"
                    required
                  />
                </div>
              </div>

              {/* For REGISTER: Confirm Password */}
              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#b6c4ff]">Confirmar Contraseña</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8d90a0] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={loading}
                      className="w-full bg-[#131b2e] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-[#b6c4ff] text-white transition-all placeholder:text-[#8d90a0]/60"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                id="submit-auth-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-6 bg-gradient-to-r from-[#2a5ee8] to-[#1e4cd8] text-white text-xs font-extrabold uppercase tracking-widest rounded-xl hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>{isLogin ? "Acceder a Consola" : "Crear Registro"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Login Seed Tip */}
            {isLogin && (
              <div className="p-3.5 bg-yellow-500/5 border border-yellow-500/10 rounded-xl text-[11px] text-yellow-200/80 leading-relaxed">
                💡 <strong>Acceso Rápido de Prueba:</strong> Ingrese el usuario semilla <code className="bg-yellow-500/15 text-yellow-300 px-1 py-0.5 rounded font-mono">director</code> con la contraseña <code className="bg-yellow-500/15 text-yellow-300 px-1 py-0.5 rounded font-mono">director123</code> para conectarse al instante sin registros.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
