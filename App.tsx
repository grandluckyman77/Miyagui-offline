import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Brain, Shield, Zap, Terminal, Radio, Activity, MapPin, 
  Camera, Mic, Lock, FileText, Users, ChevronRight, 
  Send, X, Plus, Save, Download, Upload, Trash2, 
  Wifi, WifiOff, Database, Settings, Eye, EyeOff,
  Cpu, HardDrive, Clock, AlertTriangle, CheckCircle,
  MessageSquare, FolderOpen, Code, Globe, Smartphone,
  Battery, Signal, Compass, BarChart3, RefreshCw,
  Copy, Share2, Edit3, Search, Filter, Star,
  TrendingUp, DollarSign, Briefcase, Target,
  Hash, Key, Fingerprint, Layers, Box,
  Command, Play, Pause, Square, Volume2,
  VolumeX, Maximize, Minimize, HelpCircle,
  Info, LogOut, Menu, ChevronDown, ChevronUp,
  ArrowLeft, ArrowRight, RotateCcw, Download as DownloadIcon,
  Upload as UploadIcon, Trash as TrashIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MiyaguiEngine } from "./MiyaguiEngine";
import { db } from "./Database";
import type { 
  PersonProfile, AutonomousProject, ChatMessage, 
  SavedSession, HardwareTelemetry
} from "./MiyaguiTypes";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [activeTab, setActiveTab] = useState("chat");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [engine, setEngine] = useState<MiyaguiEngine | null>(null);
  const [engineStatus, setEngineStatus] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const initEngine = async () => {
      const geminiKey = localStorage.getItem("gemini_api_key") || "";
      const groqKey = localStorage.getItem("groq_api_key") || "";
      const eng = new MiyaguiEngine(geminiKey, groqKey);
      setEngine(eng);
      setEngineStatus(eng.getStatus());
      await db.init();
    };
    initEngine();

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!engine) return;
    const interval = setInterval(() => setEngineStatus(engine.getStatus()), 5000);
    return () => clearInterval(interval);
  }, [engine]);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-mono antialiased overflow-hidden flex">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-r border-white/5 bg-zinc-950/80 backdrop-blur-xl flex flex-col z-20"
          >
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-amber-400 tracking-wider">MIYAGUI</h1>
                  <p className="text-[9px] text-zinc-500 uppercase tracking-widest">
                    {isOffline ? "OFFLINE MODE" : "ONLINE MODE"}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-4 py-2 border-b border-white/5">
              <div className="flex items-center gap-2 text-[10px]">
                <div className={cn("w-2 h-2 rounded-full animate-pulse", isOffline ? "bg-red-500" : "bg-emerald-500")} />
                <span className={isOffline ? "text-red-400" : "text-emerald-400"}>
                  {isOffline ? "SIN CONEXION" : "CONECTADO"}
                </span>
                <span className="text-zinc-600 ml-auto">{engineStatus?.mode?.toUpperCase() || "AUTO"}</span>
              </div>
            </div>

            <nav className="flex-1 p-2 space-y-1">
              <NavButton icon={MessageSquare} label="Chat Tactico" active={activeTab === "chat"} onClick={() => setActiveTab("chat")} />
              <NavButton icon={Users} label="Perfiles" active={activeTab === "profiles"} onClick={() => setActiveTab("profiles")} />
              <NavButton icon={Code} label="Proyectos" active={activeTab === "lab"} onClick={() => setActiveTab("lab")} />
              <NavButton icon={Terminal} label="Terminal" active={activeTab === "terminal"} onClick={() => setActiveTab("terminal")} />
              <NavButton icon={Activity} label="Telemetria" active={activeTab === "telemetry"} onClick={() => setActiveTab("telemetry")} />
              <NavButton icon={Database} label="Base de Datos" active={activeTab === "database"} onClick={() => setActiveTab("database")} />
              <NavButton icon={Settings} label="Configuracion" active={activeTab === "settings"} onClick={() => setActiveTab("settings")} />
            </nav>

            <div className="p-3 border-t border-white/5 text-[9px] text-zinc-600">
              <div className="flex justify-between">
                <span>v2.0.0-OFFLINE</span>
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-12 border-b border-white/5 flex items-center px-4 justify-between bg-zinc-950/50">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-white/5 rounded transition-colors">
            <Menu className="w-4 h-4 text-zinc-400" />
          </button>
          <div className="flex items-center gap-4">
            {isOffline && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-400">
                <WifiOff className="w-3 h-3" /> MODO OFFLINE
              </div>
            )}
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
              <Cpu className="w-3 h-3" />
              <span>CPU: {Math.round(Math.random() * 30 + 10)}%</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
              <HardDrive className="w-3 h-3" />
              <span>MEM: {Math.round(Math.random() * 40 + 20)}%</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          {activeTab === "chat" && <ChatTab engine={engine} isOffline={isOffline} />}
          {activeTab === "profiles" && <ProfilesTab />}
          {activeTab === "lab" && <LabTab />}
          {activeTab === "terminal" && <TerminalTab />}
          {activeTab === "telemetry" && <TelemetryTab isOffline={isOffline} />}
          {activeTab === "database" && <DatabaseTab />}
          {activeTab === "settings" && <SettingsTab engine={engine} setEngineStatus={setEngineStatus} />}
        </div>
      </main>
    </div>
  );
}

function NavButton({ icon: Icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded text-[11px] transition-all duration-200",
        active ? "bg-amber-500/10 text-amber-400 border-l-2 border-amber-500" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
      )}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}

function ChatTab({ engine, isOffline }: { engine: MiyaguiEngine | null; isOffline: boolean }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [showSessions, setShowSessions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { loadSessions(); }, []);

  const loadSessions = async () => {
    const saved = await db.getSessions();
    setSessions(saved.reverse());
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !engine) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", text: input.trim(), timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const history = messages.map(m => ({ role: m.role as "user" | "model", parts: [{ text: m.text }] }));
      history.push({ role: "user", parts: [{ text: userMsg.text }] });
      const response = await engine.generateResponse(history);
      const botMsg: ChatMessage = { id: crypto.randomUUID(), role: "model", text: response.text, timestamp: Date.now(), mode: response.mode };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = { id: crypto.randomUUID(), role: "model", text: "[ERROR] Fallo en procesamiento neural. Modo fallback activado.", timestamp: Date.now(), mode: "error" };
      setMessages(prev => [...prev, errorMsg]);
    } finally { setIsTyping(false); }
  };

  const saveCurrentSession = async () => {
    if (messages.length === 0) return;
    const session: SavedSession = { id: currentSession || crypto.randomUUID(), title: messages[0].text.slice(0, 50) + "...", messages: [...messages], createdAt: Date.now(), updatedAt: Date.now() };
    await db.saveSession(session);
    setCurrentSession(session.id);
    await loadSessions();
  };

  const loadSession = async (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) { setMessages(session.messages); setCurrentSession(sessionId); }
    setShowSessions(false);
  };

  const newSession = () => { setMessages([]); setCurrentSession(null); setShowSessions(false); };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  return (
    <div className="h-full flex flex-col">
      <div className="h-10 border-b border-white/5 flex items-center px-4 justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowSessions(!showSessions)} className="text-[10px] text-zinc-400 hover:text-amber-400 flex items-center gap-1">
            <FolderOpen className="w-3 h-3" /> Sesiones ({sessions.length})
          </button>
          {currentSession && <span className="text-[10px] text-zinc-600">ID: {currentSession.slice(0, 8)}</span>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={saveCurrentSession} className="p-1.5 hover:bg-white/5 rounded text-zinc-400 hover:text-emerald-400 transition-colors" title="Guardar sesion">
            <Save className="w-3.5 h-3.5" />
          </button>
          <button onClick={newSession} className="p-1.5 hover:bg-white/5 rounded text-zinc-400 hover:text-amber-400 transition-colors" title="Nueva sesion">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showSessions && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-b border-white/5 bg-zinc-950/50 overflow-hidden">
            <div className="p-2 max-h-40 overflow-y-auto">
              {sessions.length === 0 ? (
                <p className="text-[10px] text-zinc-600 text-center py-2">No hay sesiones guardadas</p>
              ) : (
                sessions.map(s => (
                  <button key={s.id} onClick={() => loadSession(s.id)} className="w-full text-left px-3 py-2 rounded hover:bg-white/5 text-[10px] text-zinc-400 hover:text-zinc-200 transition-colors flex justify-between">
                    <span className="truncate">{s.title}</span>
                    <span className="text-zinc-600 ml-2">{new Date(s.updatedAt).toLocaleDateString()}</span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center">
                <Brain className="w-8 h-8 text-amber-500/50" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-zinc-400">Miyagui esta operativo</h3>
                <p className="text-[10px] text-zinc-600 mt-1">
                  {isOffline ? "Modo offline activo. Motor heuristico cargado." : "Conexion establecida. APIs disponibles."}
                </p>
              </div>
              <div className="flex gap-2 justify-center">
                {["Analiza un negocio", "Estrategia de seguridad", "Codigo para MVP", "OSINT basico"].map(s => (
                  <button key={s} onClick={() => { setInput(s); inputRef.current?.focus(); }} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-[10px] text-zinc-400 hover:text-amber-400 hover:border-amber-500/30 transition-all">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
            {msg.role === "model" && (
              <div className="w-6 h-6 rounded bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <Brain className="w-3.5 h-3.5 text-amber-500" />
              </div>
            )}
            <div className={cn("max-w-[80%] rounded-lg px-3 py-2 text-[11px] leading-relaxed", msg.role === "user" ? "bg-amber-500/10 border border-amber-500/20 text-amber-100" : "bg-zinc-900/80 border border-white/5 text-zinc-300")}>
              {msg.role === "model" ? (
                <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{msg.text}</ReactMarkdown></div>
              ) : (<p>{msg.text}</p>)}
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5">
                <span className="text-[9px] text-zinc-600">{new Date(msg.timestamp).toLocaleTimeString()}{msg.mode && ` • ${msg.mode.toUpperCase()}`}</span>
                <button onClick={() => copyToClipboard(msg.text)} className="text-zinc-600 hover:text-zinc-400 transition-colors"><Copy className="w-3 h-3" /></button>
              </div>
            </div>
            {msg.role === "user" && (
              <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-[9px] font-bold text-zinc-400">U</span>
              </div>
            )}
          </motion.div>
        ))}

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-[10px] text-zinc-500">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            Procesando inteligencia...
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-white/5">
        <div className="flex items-end gap-2">
          <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder={isOffline ? "Modo offline: Preguntas tacticas basicas..." : "Pregunta a Miyagui..."}
            className="flex-1 bg-zinc-900/50 border border-white/10 rounded-lg px-3 py-2 text-[11px] text-zinc-300 placeholder-zinc-600 focus:border-amber-500/30 focus:outline-none resize-none min-h-[40px] max-h-32"
            rows={1}
          />
          <button onClick={sendMessage} disabled={!input.trim() || isTyping}
            className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 hover:bg-amber-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-1 px-1">
          <span className="text-[9px] text-zinc-600">{isOffline ? "Motor heuristico activo • Sin APIs" : "APIs disponibles • Gemini/Groq"}</span>
          <span className="text-[9px] text-zinc-600">{messages.length} mensajes</span>
        </div>
      </div>
    </div>
  );
}

function ProfilesTab() {
  const [profiles, setProfiles] = useState<PersonProfile[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<PersonProfile | null>(null);

  useEffect(() => { loadProfiles(); }, []);

  const loadProfiles = async () => {
    const data = await db.getProfiles();
    setProfiles(data);
  };

  const saveProfile = async (profile: PersonProfile) => {
    await db.saveProfile(profile);
    await loadProfiles();
    setShowForm(false);
    setEditingProfile(null);
  };

  const deleteProfile = async (id: string) => {
    await db.deleteProfile(id);
    await loadProfiles();
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-500" /> Perfiles Tacticos
        </h2>
        <button onClick={() => { setShowForm(true); setEditingProfile(null); }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded text-[10px] text-amber-400 hover:bg-amber-500/20 transition-all">
          <Plus className="w-3 h-3" /> Nuevo Perfil
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {profiles.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
            <p className="text-[11px] text-zinc-500">No hay perfiles registrados</p>
            <p className="text-[10px] text-zinc-600 mt-1">Crea perfiles para analisis tactico</p>
          </div>
        ) : (
          profiles.map(profile => (
            <motion.div key={profile.id} layout className="bg-zinc-900/50 border border-white/5 rounded-lg p-3 hover:border-white/10 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                    profile.category === "amenaza" ? "bg-red-500/20 text-red-400" :
                    profile.category === "aliado" ? "bg-emerald-500/20 text-emerald-400" :
                    profile.category === "objetivo" ? "bg-amber-500/20 text-amber-400" : "bg-zinc-800 text-zinc-400")}>
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-[12px] font-medium text-zinc-300">{profile.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn("text-[9px] px-1.5 py-0.5 rounded uppercase",
                        profile.category === "amenaza" ? "bg-red-500/10 text-red-400" :
                        profile.category === "aliado" ? "bg-emerald-500/10 text-emerald-400" :
                        profile.category === "objetivo" ? "bg-amber-500/10 text-amber-400" : "bg-zinc-800 text-zinc-500")}>
                        {profile.category}
                      </span>
                      <span className="text-[9px] text-zinc-600">Utilidad: {profile.utilityScore}% | Toxicidad: {profile.toxicityIndex}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditingProfile(profile); setShowForm(true); }} className="p-1 hover:bg-white/5 rounded text-zinc-500 hover:text-zinc-300">
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button onClick={() => deleteProfile(profile.id)} className="p-1 hover:bg-red-500/10 rounded text-zinc-500 hover:text-red-400">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="bg-zinc-950/50 rounded p-2">
                  <p className="text-[9px] text-zinc-500 uppercase mb-1">Perfil Psicologico</p>
                  <p className="text-[10px] text-zinc-400 line-clamp-2">{profile.psychProfile}</p>
                </div>
                <div className="bg-zinc-950/50 rounded p-2">
                  <p className="text-[9px] text-zinc-500 uppercase mb-1">Debilidades</p>
                  <p className="text-[10px] text-zinc-400">{profile.weaknesses.join(", ")}</p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showForm && <ProfileForm onSave={saveProfile} onCancel={() => setShowForm(false)} initialData={editingProfile} />}
      </AnimatePresence>
    </div>
  );
}

function ProfileForm({ onSave, onCancel, initialData }: { onSave: (p: PersonProfile) => void; onCancel: () => void; initialData: PersonProfile | null }) {
  const [form, setForm] = useState<Partial<PersonProfile>>(initialData || {
    id: crypto.randomUUID(), name: "", category: "neutral", psychProfile: "", weaknesses: [], skills: [],
    patternRecognition: "", utilityScore: 50, toxicityIndex: 50, opportunityPotential: "", history: "", lastSeen: new Date().toISOString()
  });

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(form as PersonProfile); };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-zinc-900 border border-white/10 rounded-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-300">{initialData ? "Editar Perfil" : "Nuevo Perfil"}</h3>
          <button onClick={onCancel} className="text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="text-[10px] text-zinc-500 uppercase">Nombre</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full bg-zinc-950 border border-white/10 rounded px-3 py-2 text-[11px] text-zinc-300 focus:border-amber-500/30 outline-none" required />
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 uppercase">Categoria</label>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value as any})}
              className="w-full bg-zinc-950 border border-white/10 rounded px-3 py-2 text-[11px] text-zinc-300 focus:border-amber-500/30 outline-none">
              <option value="aliado">Aliado</option>
              <option value="amenaza">Amenaza</option>
              <option value="neutral">Neutral</option>
              <option value="objetivo">Objetivo</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 uppercase">Perfil Psicologico</label>
            <textarea value={form.psychProfile} onChange={e => setForm({...form, psychProfile: e.target.value})}
              className="w-full bg-zinc-950 border border-white/10 rounded px-3 py-2 text-[11px] text-zinc-300 focus:border-amber-500/30 outline-none resize-none" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-zinc-500 uppercase">Utilidad ({form.utilityScore}%)</label>
              <input type="range" min="0" max="100" value={form.utilityScore} onChange={e => setForm({...form, utilityScore: parseInt(e.target.value)})} className="w-full accent-amber-500" />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 uppercase">Toxicidad ({form.toxicityIndex}%)</label>
              <input type="range" min="0" max="100" value={form.toxicityIndex} onChange={e => setForm({...form, toxicityIndex: parseInt(e.target.value)})} className="w-full accent-red-500" />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="flex-1 py-2 bg-amber-500/10 border border-amber-500/20 rounded text-[11px] text-amber-400 hover:bg-amber-500/20 transition-all">Guardar Perfil</button>
            <button type="button" onClick={onCancel} className="flex-1 py-2 bg-zinc-800 border border-white/10 rounded text-[11px] text-zinc-400 hover:bg-zinc-700 transition-all">Cancelar</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function LabTab() {
  const [projects, setProjects] = useState<AutonomousProject[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    const data = await db.getProjects();
    setProjects(data);
  };

  const addProject = async (project: AutonomousProject) => {
    await db.saveProject(project);
    await loadProjects();
    setShowForm(false);
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
          <Code className="w-4 h-4 text-amber-500" /> Tactical Forge
        </h2>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded text-[10px] text-amber-400 hover:bg-amber-500/20 transition-all">
          <Plus className="w-3 h-3" /> Nuevo Proyecto
        </button>
      </div>

      <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3">
        {projects.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <Code className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
            <p className="text-[11px] text-zinc-500">No hay proyectos activos</p>
          </div>
        ) : (
          projects.map(project => (
            <motion.div key={project.id} layout className="bg-zinc-900/50 border border-white/5 rounded-lg p-3 hover:border-white/10 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {project.type === "app" ? <Smartphone className="w-4 h-4 text-emerald-400" /> :
                   project.type === "code" ? <Code className="w-4 h-4 text-amber-400" /> :
                   project.type === "document" ? <FileText className="w-4 h-4 text-blue-400" /> :
                   <Target className="w-4 h-4 text-purple-400" />}
                  <span className="text-[12px] font-medium text-zinc-300">{project.title}</span>
                </div>
                <span className={cn("text-[9px] px-1.5 py-0.5 rounded uppercase",
                  project.status === "ready" ? "bg-emerald-500/10 text-emerald-400" :
                  project.status === "development" ? "bg-amber-500/10 text-amber-400" : "bg-zinc-800 text-zinc-500")}>
                  {project.status}
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 mb-2">{project.description}</p>
              {project.stack && (
                <div className="flex flex-wrap gap-1">
                  {project.stack.map(s => <span key={s} className="text-[9px] px-1.5 py-0.5 bg-zinc-950 rounded text-zinc-400">{s}</span>)}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {showForm && <ProjectForm onSave={addProject} onCancel={() => setShowForm(false)} />}
    </div>
  );
}

function ProjectForm({ onSave, onCancel }: { onSave: (p: AutonomousProject) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Partial<AutonomousProject>>({
    id: crypto.randomUUID(), title: "", type: "app", description: "", status: "draft", content: "", stack: [], createdAt: new Date().toISOString()
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-xl w-full max-w-lg p-4">
        <h3 className="text-sm font-medium text-zinc-300 mb-3">Nuevo Proyecto</h3>
        <div className="space-y-3">
          <input placeholder="Titulo" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
            className="w-full bg-zinc-950 border border-white/10 rounded px-3 py-2 text-[11px] text-zinc-300 outline-none focus:border-amber-500/30" />
          <textarea placeholder="Descripcion" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
            className="w-full bg-zinc-950 border border-white/10 rounded px-3 py-2 text-[11px] text-zinc-300 outline-none focus:border-amber-500/30 resize-none" rows={3} />
          <div className="flex gap-2">
            <button onClick={() => onSave(form as AutonomousProject)} className="flex-1 py-2 bg-amber-500/10 border border-amber-500/20 rounded text-[11px] text-amber-400">Crear</button>
            <button onClick={onCancel} className="flex-1 py-2 bg-zinc-800 border border-white/10 rounded text-[11px] text-zinc-400">Cancelar</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TerminalTab() {
  const [history, setHistory] = useState<string[]>([
    "Miyagui Terminal v2.0.0 [OFFLINE MODE]",
    "Type 'help' for available commands",
    ""
  ]);
  const [command, setCommand] = useState("");
  const terminalRef = useRef<HTMLDivElement>(null);

  const commands: Record<string, (args: string[]) => string[] | Promise<string[]>> = {
    help: () => [
      "COMANDOS DISPONIBLES:",
      "  help        - Muestra esta ayuda",
      "  clear       - Limpia la terminal",
      "  status      - Estado del sistema",
      "  time        - Hora actual",
      "  date        - Fecha actual",
      "  whoami      - Info del dispositivo",
      "  network     - Estado de red",
      "  battery     - Nivel de bateria",
      "  encrypt     - Encripta texto (base64)",
      "  decrypt     - Desencripta texto (base64)",
      "  hash        - Genera hash",
      "  uuid        - Genera UUID v4",
      "  calc        - Calculadora",
      "  fortune     - Frase tactica",
      "  exit        - Cierra terminal"
    ],
    clear: () => { setHistory([]); return []; },
    status: () => [
      `SISTEMA: OPERATIONAL`,
      `MODO: ${navigator.onLine ? "ONLINE" : "OFFLINE"}`,
      `PLATFORM: ${navigator.platform}`,
      `CORES: ${navigator.hardwareConcurrency || "N/A"}`,
      `MEMORY: ${(navigator as any).deviceMemory || "N/A"}GB`,
      `LANGUAGE: ${navigator.language}`,
      `COOKIES: ${navigator.cookieEnabled}`
    ],
    time: () => [new Date().toLocaleTimeString()],
    date: () => [new Date().toLocaleDateString()],
    whoami: () => [
      `DEVICE: ${navigator.platform}`,
      `BROWSER: ${navigator.userAgent.match(/(?:chrome|firefox|safari|edge|opera)\/[^\s]+/i)?.[0] || "Unknown"}`,
      `SCREEN: ${window.screen.width}x${window.screen.height}`,
      `TOUCH: ${"ontouchstart" in window ? "YES" : "NO"}`
    ],
    network: () => [
      `ONLINE: ${navigator.onLine}`,
      `TYPE: ${(navigator as any).connection?.effectiveType?.toUpperCase() || "N/A"}`,
      `DOWNLINK: ${(navigator as any).connection?.downlink || "N/A"} Mbps`
    ],
    battery: async () => {
      try {
        const battery = await (navigator as any).getBattery?.();
        if (!battery) return ["API no disponible"];
        return [`NIVEL: ${Math.round(battery.level * 100)}%`, `CARGANDO: ${battery.charging ? "SI" : "NO"}`];
      } catch { return ["Error"]; }
    },
    encrypt: (args) => [`ENCRYPTED: ${btoa(args.join(" "))}`],
    decrypt: (args) => { try { return [`DECRYPTED: ${atob(args.join(" "))}`]; } catch { return ["ERROR: Invalid"]; } },
    hash: (args) => {
      let hash = 0;
      for (let i = 0; i < args.join(" ").length; i++) hash = ((hash << 5) - hash) + args.join(" ").charCodeAt(i);
      return [`HASH: ${Math.abs(hash).toString(16).padStart(8, "0")}`];
    },
    uuid: () => [crypto.randomUUID()],
    calc: (args) => { try { return [`RESULT: ${Function("use strict"; return (${args.join(" ")})`)()}`]; } catch { return ["ERROR"]; } },
    fortune: () => {
      const quotes = [
        "La informacion es poder. El poder es control.",
        "En el juego de la informacion, el paranoico gana.",
        "Todo sistema es vulnerable. La pregunta es: quien lo explota primero.",
        "La mejor defensa es un ataque bien planificado.",
        "El dinero no duerme. Tu tampoco deberias.",
        "En la oscuridad, la verdad se revela.",
        "Cada conexion es una puerta. Cada puerta es una oportunidad.",
        "El silencio es la mejor arma del estratega."
      ];
      return [`"${quotes[Math.floor(Math.random() * quotes.length)]}"`];
    },
    exit: () => { setHistory(["Cerrando terminal...", "Sistema listo."]); return []; }
  };

  const executeCommand = async () => {
    if (!command.trim()) return;
    const parts = command.trim().split(" ");
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    setHistory(prev => [...prev, `> ${command}`]);
    setCommand("");

    if (commands[cmd]) {
      try {
        const result = await commands[cmd](args);
        if (result.length > 0) setHistory(prev => [...prev, ...result.map(r => `  ${r}`)]);
      } catch (e) { setHistory(prev => [...prev, `  ERROR: ${e}`]); }
    } else {
      setHistory(prev => [...prev, `  COMANDO NO ENCONTRADO: ${cmd}`, `  Escribe 'help'`]);
    }
    setHistory(prev => [...prev, ""]);
  };

  useEffect(() => { terminalRef.current?.scrollTo(0, terminalRef.current.scrollHeight); }, [history]);

  return (
    <div className="h-full flex flex-col bg-black p-4">
      <div ref={terminalRef} className="flex-1 overflow-y-auto font-mono text-[11px] text-emerald-400 space-y-0.5">
        {history.map((line, i) => (
          <div key={i} className={cn("whitespace-pre-wrap",
            line.startsWith(">") ? "text-amber-400" : line.startsWith("  ERROR") ? "text-red-400" : line.startsWith("  ") ? "text-zinc-400" : "text-emerald-400")}>
            {line}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10">
        <span className="text-emerald-400 text-[11px]">➜</span>
        <input value={command} onChange={e => setCommand(e.target.value)} onKeyDown={e => e.key === "Enter" && executeCommand()}
          placeholder="Escribe un comando..." className="flex-1 bg-transparent text-[11px] text-zinc-300 outline-none font-mono" autoFocus />
      </div>
    </div>
  );
}

function TelemetryTab({ isOffline }: { isOffline: boolean }) {
  const [telemetry, setTelemetry] = useState<HardwareTelemetry>({
    acceleration: { x: 0, y: 0, z: 0 },
    rotation: { alpha: 0, beta: 0, gamma: 0 },
    connectionStatus: isOffline ? "offline" : "online"
  });
  const [battery, setBattery] = useState<any>(null);
  const [networkInfo, setNetworkInfo] = useState<any>(null);

  useEffect(() => {
    const handleMotion = (e: DeviceMotionEvent) => {
      setTelemetry(prev => ({
        ...prev,
        acceleration: { x: e.acceleration?.x || 0, y: e.acceleration?.y || 0, z: e.acceleration?.z || 0 }
      }));
    };
    const handleOrientation = (e: DeviceOrientationEvent) => {
      setTelemetry(prev => ({ ...prev, rotation: { alpha: e.alpha || 0, beta: e.beta || 0, gamma: e.gamma || 0 } }));
    };

    if (window.DeviceMotionEvent) window.addEventListener("devicemotion", handleMotion);
    if (window.DeviceOrientationEvent) window.addEventListener("deviceorientation", handleOrientation);

    const getBattery = async () => {
      try {
        const bat = await (navigator as any).getBattery?.();
        if (bat) { setBattery(bat); bat.addEventListener("levelchange", () => setBattery({...bat})); }
      } catch {}
    };
    getBattery();

    const connection = (navigator as any).connection;
    if (connection) { setNetworkInfo(connection); connection.addEventListener("change", () => setNetworkInfo({...connection})); }

    return () => {
      window.removeEventListener("devicemotion", handleMotion);
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  return (
    <div className="h-full flex flex-col p-4">
      <h2 className="text-sm font-bold text-zinc-300 flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-amber-500" /> Telemetria del Sistema
      </h2>

      <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-zinc-900/50 border border-white/5 rounded-lg p-3">
          <h3 className="text-[10px] text-zinc-500 uppercase mb-2 flex items-center gap-1">
            <Compass className="w-3 h-3" /> Acelerometro
          </h3>
          <div className="space-y-1 text-[10px] font-mono">
            <div className="flex justify-between"><span className="text-zinc-500">X:</span><span className="text-emerald-400">{telemetry.acceleration.x.toFixed(4)} m/s²</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Y:</span><span className="text-emerald-400">{telemetry.acceleration.y.toFixed(4)} m/s²</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Z:</span><span className="text-emerald-400">{telemetry.acceleration.z.toFixed(4)} m/s²</span></div>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 rounded-lg p-3">
          <h3 className="text-[10px] text-zinc-500 uppercase mb-2 flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Rotacion
          </h3>
          <div className="space-y-1 text-[10px] font-mono">
            <div className="flex justify-between"><span className="text-zinc-500">Alpha:</span><span className="text-amber-400">{telemetry.rotation.alpha.toFixed(2)}°</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Beta:</span><span className="text-amber-400">{telemetry.rotation.beta.toFixed(2)}°</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Gamma:</span><span className="text-amber-400">{telemetry.rotation.gamma.toFixed(2)}°</span></div>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 rounded-lg p-3">
          <h3 className="text-[10px] text-zinc-500 uppercase mb-2 flex items-center gap-1">
            <Battery className="w-3 h-3" /> Bateria
          </h3>
          {battery ? (
            <div className="space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span className="text-zinc-500">Nivel:</span>
                <span className={battery.level > 0.2 ? "text-emerald-400" : "text-red-400"}>{Math.round(battery.level * 100)}%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-1">
                <div className={cn("h-1.5 rounded-full transition-all", battery.level > 0.5 ? "bg-emerald-500" : battery.level > 0.2 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${battery.level * 100}%` }} />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-zinc-500">Cargando:</span>
                <span className={battery.charging ? "text-emerald-400" : "text-zinc-400"}>{battery.charging ? "SI ⚡" : "NO"}</span>
              </div>
            </div>
          ) : <p className="text-[10px] text-zinc-600">API no disponible</p>}
        </div>

        <div className="bg-zinc-900/50 border border-white/5 rounded-lg p-3">
          <h3 className="text-[10px] text-zinc-500 uppercase mb-2 flex items-center gap-1">
            <Signal className="w-3 h-3" /> Red
          </h3>
          <div className="space-y-1 text-[10px]">
            <div className="flex justify-between"><span className="text-zinc-500">Estado:</span><span className={isOffline ? "text-red-400" : "text-emerald-400"}>{isOffline ? "OFFLINE" : "ONLINE"}</span></div>
            {networkInfo && (<>
              <div className="flex justify-between"><span className="text-zinc-500">Tipo:</span><span className="text-zinc-300">{networkInfo.effectiveType?.toUpperCase() || "N/A"}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Downlink:</span><span className="text-zinc-300">{networkInfo.downlink || "N/A"} Mbps</span></div>
            </>)}
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 rounded-lg p-3 md:col-span-2">
          <h3 className="text-[10px] text-zinc-500 uppercase mb-2 flex items-center gap-1">
            <Smartphone className="w-3 h-3" /> Dispositivo
          </h3>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="flex justify-between"><span className="text-zinc-500">Plataforma:</span><span className="text-zinc-300">{navigator.platform}</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Nucleos:</span><span className="text-zinc-300">{navigator.hardwareConcurrency || "N/A"}</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Memoria:</span><span className="text-zinc-300">{(navigator as any).deviceMemory || "N/A"} GB</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Idioma:</span><span className="text-zinc-300">{navigator.language}</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Pantalla:</span><span className="text-zinc-300">{window.screen.width}x{window.screen.height}</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Touch:</span><span className="text-zinc-300">{(navigator as any).maxTouchPoints || 0} puntos</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DatabaseTab() {
  const [dataSize, setDataSize] = useState(0);
  const [exportData, setExportData] = useState("");
  const [showExport, setShowExport] = useState(false);

  useEffect(() => { calculateSize(); }, []);

  const calculateSize = async () => {
    try { const data = await db.exportData(); setDataSize(new Blob([data]).size); } catch {}
  };

  const handleExport = async () => {
    const data = await db.exportData();
    setExportData(data);
    setShowExport(true);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `miyagui-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try { await db.importData(event.target?.result as string); alert("Datos importados"); calculateSize(); }
      catch (err) { alert("Error: " + err); }
    };
    reader.readAsText(file);
  };

  const handleClear = async () => {
    if (confirm("Eliminar TODOS los datos?")) { await db.clearAll(); setDataSize(0); alert("Base limpiada"); }
  };

  return (
    <div className="h-full flex flex-col p-4">
      <h2 className="text-sm font-bold text-zinc-300 flex items-center gap-2 mb-4">
        <Database className="w-4 h-4 text-amber-500" /> Gestion de Datos
      </h2>

      <div className="space-y-3">
        <div className="bg-zinc-900/50 border border-white/5 rounded-lg p-3">
          <h3 className="text-[10px] text-zinc-500 uppercase mb-2">Estadisticas</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-lg font-bold text-amber-400">{(dataSize / 1024).toFixed(2)}</p>
              <p className="text-[9px] text-zinc-500">KB Almacenados</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-400">IndexedDB</p>
              <p className="text-[9px] text-zinc-500">Motor BD</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-blue-400">100%</p>
              <p className="text-[9px] text-zinc-500">Offline</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 rounded-lg p-3">
          <h3 className="text-[10px] text-zinc-500 uppercase mb-2">Acciones</h3>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={handleExport} className="flex items-center justify-center gap-2 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-[11px] text-emerald-400 hover:bg-emerald-500/20 transition-all">
              <DownloadIcon className="w-3.5 h-3.5" /> Exportar Datos
            </button>
            <label className="flex items-center justify-center gap-2 py-2 bg-blue-500/10 border border-blue-500/20 rounded text-[11px] text-blue-400 hover:bg-blue-500/20 transition-all cursor-pointer">
              <UploadIcon className="w-3.5 h-3.5" /> Importar Datos
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
            <button onClick={handleClear} className="flex items-center justify-center gap-2 py-2 bg-red-500/10 border border-red-500/20 rounded text-[11px] text-red-400 hover:bg-red-500/20 transition-all col-span-2">
              <TrashIcon className="w-3.5 h-3.5" /> Limpiar Base de Datos
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showExport && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-zinc-900/50 border border-white/5 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] text-zinc-500 uppercase">Vista Previa</h3>
                <button onClick={() => setShowExport(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-3 h-3" /></button>
              </div>
              <pre className="text-[9px] text-zinc-400 overflow-auto max-h-40 bg-zinc-950 rounded p-2">{exportData.slice(0, 500)}...</pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SettingsTab({ engine, setEngineStatus }: { engine: any; setEngineStatus: any }) {
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem("gemini_api_key") || "");
  const [groqKey, setGroqKey] = useState(localStorage.getItem("groq_api_key") || "");
  const [mode, setMode] = useState<"auto" | "local" | "api">("auto");
  const [showKeys, setShowKeys] = useState(false);

  const saveKeys = () => {
    localStorage.setItem("gemini_api_key", geminiKey);
    localStorage.setItem("groq_api_key", groqKey);
    const newEngine = new MiyaguiEngine(geminiKey, groqKey);
    newEngine.setMode(mode);
    setEngineStatus(newEngine.getStatus());
    alert("Credenciales guardadas");
  };

  const setEngineMode = (m: "auto" | "local" | "api") => {
    setMode(m);
    engine?.setMode(m);
    setEngineStatus(engine?.getStatus());
  };

  return (
    <div className="h-full flex flex-col p-4 overflow-y-auto">
      <h2 className="text-sm font-bold text-zinc-300 flex items-center gap-2 mb-4">
        <Settings className="w-4 h-4 text-amber-500" /> Configuracion
      </h2>

      <div className="space-y-4 max-w-2xl">
        <div className="bg-zinc-900/50 border border-white/5 rounded-lg p-4">
          <h3 className="text-[11px] text-zinc-400 uppercase mb-3 flex items-center gap-2">
            <Key className="w-3.5 h-3.5" /> Credenciales API
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-zinc-500 block mb-1">Gemini API Key</label>
              <div className="flex gap-2">
                <input type={showKeys ? "text" : "password"} value={geminiKey} onChange={e => setGeminiKey(e.target.value)}
                  placeholder="AIza..." className="flex-1 bg-zinc-950 border border-white/10 rounded px-3 py-2 text-[11px] text-zinc-300 outline-none focus:border-amber-500/30" />
                <button onClick={() => setShowKeys(!showKeys)} className="p-2 bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200">
                  {showKeys ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 block mb-1">Groq API Key</label>
              <input type={showKeys ? "text" : "password"} value={groqKey} onChange={e => setGroqKey(e.target.value)}
                placeholder="gsk_..." className="w-full bg-zinc-950 border border-white/10 rounded px-3 py-2 text-[11px] text-zinc-300 outline-none focus:border-amber-500/30" />
            </div>
            <button onClick={saveKeys} className="w-full py-2 bg-amber-500/10 border border-amber-500/20 rounded text-[11px] text-amber-400 hover:bg-amber-500/20 transition-all">
              Guardar Credenciales
            </button>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 rounded-lg p-4">
          <h3 className="text-[11px] text-zinc-400 uppercase mb-3 flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5" /> Modo de Operacion
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {(["auto", "local", "api"] as const).map(m => (
              <button key={m} onClick={() => setEngineMode(m)}
                className={cn("py-2 rounded text-[11px] transition-all border", mode === m ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-zinc-950 border-white/5 text-zinc-500 hover:text-zinc-300")}>
                {m === "auto" && "Auto"}{m === "local" && "Solo Local"}{m === "api" && "Solo API"}
              </button>
            ))}
          </div>
          <p className="text-[9px] text-zinc-600 mt-2">
            {mode === "auto" && "Usa API cuando hay internet, fallback a motor local."}
            {mode === "local" && "100% offline. Motor heuristico embebido."}
            {mode === "api" && "Siempre usa APIs. Requiere conexion."}
          </p>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 rounded-lg p-4">
          <h3 className="text-[11px] text-zinc-400 uppercase mb-3">Sistema</h3>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="flex justify-between"><span className="text-zinc-500">Version:</span><span className="text-zinc-300">2.0.0-OFFLINE</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Build:</span><span className="text-zinc-300">{new Date().toISOString().slice(0,10)}</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Motor IA:</span><span className="text-zinc-300">Hibrido</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Persistencia:</span><span className="text-zinc-300">IndexedDB</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Framework:</span><span className="text-zinc-300">React 19 + Vite</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">UI:</span><span className="text-zinc-300">Tailwind CSS</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
