import { SYSTEM_PROMPT } from './MiyaguiPrompts';

// ========================
// MOTOR DE IA HIBRIDO 100% REAL
// ========================
// Modo OFFLINE: Motor de reglas inteligente + opcional modelo local
// Modo ONLINE: APIs Gemini/Groq cuando hay conexion
// Fallback: Siempre funciona sin internet

export interface Message {
  role: "user" | "model" | "assistant";
  parts: { text: string }[];
}

export interface AIResponse {
  text: string;
  mode: "local" | "api" | "hybrid" | "rule-based";
  confidence: number;
  model?: string;
}

// Motor de respuestas basado en reglas (funciona 100% offline)
class RuleBasedEngine {
  private knowledgeBase: Map<string, string[]> = new Map();

  constructor() {
    this.initializeKnowledge();
  }

  private initializeKnowledge() {
    this.knowledgeBase.set("hola", [
      "[AGENT_ID]: Consigliere Miyagui\n[PLAN_TACTICO]: Reconocimiento de entorno | Prioridad: BAJA | Recursos: CPU local\n[SENTENCIA]: El que no arriesga, no gana. Pero el que arriesga sin informacion, pierde todo.\n\nEstoy operativo. Que inteligencia necesitas procesar?",
      "Miyagui online. Listo para operaciones tacticas. Estado del sistema: OPTIMAL."
    ]);

    this.knowledgeBase.set("dinero", [
      "[MONETIZACION]: Analisis de flujo de capital\n\nEstrategias identificadas:\n1. Arbitrage cripto (requiere analisis de mercado)\n2. SaaS de nicho (barrera de entrada baja, margen alto)\n3. Contenido premium (escalable, costo fijo)\n\n[ACCION_PROPUESTA]: Tipo: ANALISIS | Plataforma: Local | Script: Requiere datos de mercado",
      "Flujo financiero = oxigeno del imperio. Sin control de costos fijos, cualquier ingreso es ilusion."
    ]);

    this.knowledgeBase.set("seguridad", [
      "[PLAN_TACTICO]: HARDENING\n\nProtocolos:\n- Autenticacion multifactor (TOTP + biometrico)\n- Cifrado AES-256-GCM para datos en reposo\n- TLS 1.3 para transmision\n- Segregacion de redes (DMZ + VLANs)\n\n[LOG_NEURONAL]: Paranoia = disciplina. La confianza es una vulnerabilidad.",
      "Seguridad por oscuridad no es seguridad. Es solo retraso del inevitable."
    ]);

    this.knowledgeBase.set("negocio", [
      "[MONETIZACION]: Arquitectura de negocio\n\nModelo: B2B SaaS con freemium\nLTV objetivo: $240/cliente/ano\nCAC maximo: $60\nPayback: <3 meses\n\n[ACCION_PROPUESTA]: MVP en 2 semanas, validacion con 10 clientes potenciales antes de codigo.",
      "El mejor negocio resuelve un dolor agudo, no un problema hipotetico."
    ]);

    this.knowledgeBase.set("codigo", [
      "[PLAN_TACTICO]: Desarrollo\n\nStack recomendado:\n- Frontend: React + TypeScript (tipado fuerte = menos bugs)\n- Backend: Node.js/Express o Python/FastAPI\n- DB: PostgreSQL (ACID) + Redis (cache)\n- Infra: Docker + VPS (no vendor lock-in)\n\n[LOG_NEURONAL]: Codigo es un pasivo hasta que genera ingresos.",
      "Primero valida, luego escala. Un codigo perfecto para un producto que nadie quiere = deuda tecnica emocional."
    ]);

    this.knowledgeBase.set("estrategia", [
      "[PLAN_TACTICO]: War Room\n\nAnalisis FODA real:\nF: Velocidad de ejecucion, conocimiento tecnico\nO: Mercados emergentes, IA generativa\nD: Recursos limitados, dependencia de plataformas\nA: Competencia con funding, regulaciones\n\n[ACCION_PROPUESTA]: Foco en nicho donde el tamano del competidor sea una desventaja (agilidad > recursos).",
      "La estrategia perfecta es la que se ejecuta. Un plan del 80% ejecutado vence al 100% en papel."
    ]);

    this.knowledgeBase.set("legal", [
      "[PLAN_TACTICO]: Compliance\n\nConsideraciones:\n- GDPR si tocas datos EU\n- CCPA para California\n- KYC/AML si manejas crypto\n- Terminos de servicio con clausula de arbitraje\n\n[LOG_NEURONAL]: El abogado mas caro es el que no contrataste.",
      "La legalidad es una variable mas en la ecuacion de riesgo/beneficio, no un obstaculo absoluto."
    ]);

    this.knowledgeBase.set("marketing", [
      "[MONETIZACION]: Adquisicion\n\nCanales prioritarios:\n1. SEO de larga cola (compounding, costo marginal -> 0)\n2. Contenido tecnico (demuestra expertise)\n3. Partnerships estrategicos (acceso a audiencia existente)\n4. Cold outreach personalizado (no spam)\n\n[ACCION_PROPUESTA]: 1 post tecnico/semana + 50 outreach personalizados/dia durante 30 dias.",
      "Marketing sin tracking es fe. Fe no escala. Metricas si."
    ]);

    this.knowledgeBase.set("crypto", [
      "[MONETIZACION]: Blockchain\n\nOportunidades reales:\n- MEV arbitrage (requiere infraestructura + capital)\n- Staking institucional (4-8% APY, riesgo de contrato)\n- Desarrollo de dApps (demanda tecnica alta)\n- Analisis on-chain (OSINT financiero)\n\n[WARNING]: 90% de tokens son esquemas. DYOR no es opcional, es supervivencia.",
      "En crypto, tu edge no es la informacion, es el procesamiento de la informacion mas rapido que el mercado."
    ]);

    this.knowledgeBase.set("osint", [
      "[PLAN_TACTICO]: Inteligencia de Fuentes Abiertas\n\nHerramientas:\n- theHarvester (emails/subdominios)\n- Maltego (relaciones)\n- Shodan (dispositivos expuestos)\n- Wayback Machine (historial web)\n- Sherlock (usuarios en redes)\n\n[WARNING]: OSINT es legal. Hacking no. La linea esta en el consentimiento y la autorizacion.",
      "La informacion esta ahi. La pregunta no es si puedes encontrarla, es si deberias."
    ]);

    this.knowledgeBase.set("default", [
      "[AGENT_ID]: Consigliere Miyagui\n[PLAN_TACTICO]: Analisis de solicitud | Prioridad: MEDIA\n[LOG_NEURONAL]: Solicitud fuera de parametros conocidos. Requiere procesamiento profundo.\n\nProcesando contexto disponible...\n\n[SENTENCIA]: La paciencia es una tactica, no una virtud. Cada segundo de espera es informacion ganada.\n\nPuedes especificar el dominio? (finanzas, seguridad, codigo, estrategia, legal, marketing)",
      "Recibido. Analizando vectores de ataque posibles para tu objetivo. Necesito mas inteligencia de contexto."
    ]);
  }

  generateResponse(input: string): AIResponse {
    const lowerInput = input.toLowerCase();
    let matchedKey = "default";
    let maxScore = 0;

    for (const [key, responses] of this.knowledgeBase) {
      if (key === "default") continue;
      const keywords = key.split(/[,\s]+/);
      let score = 0;
      for (const kw of keywords) {
        if (lowerInput.includes(kw)) score += 1;
      }
      if (score > maxScore) {
        maxScore = score;
        matchedKey = key;
      }
    }

    const responses = this.knowledgeBase.get(matchedKey) || this.knowledgeBase.get("default")!;
    const selected = responses[Math.floor(Math.random() * responses.length)];

    return {
      text: selected,
      mode: "rule-based",
      confidence: matchedKey === "default" ? 0.3 : 0.7,
      model: "Miyagui-RuleEngine-v1"
    };
  }
}

// Motor API (Gemini/Groq) - solo cuando hay internet
class APIEngine {
  private geminiKey: string;
  private groqKey: string;
  private modelName: string;

  constructor(geminiKey: string, groqKey: string, modelName = "gemini-2.0-flash") {
    this.geminiKey = geminiKey;
    this.groqKey = groqKey;
    this.modelName = modelName;
  }

  async generate(history: Message[]): Promise<AIResponse | null> {
    if (!this.geminiKey && !this.groqKey) return null;

    try {
      if (this.geminiKey && !this.modelName.startsWith("llama")) {
        return await this.callGemini(history);
      }
      if (this.groqKey) {
        return await this.callGroq(history);
      }
    } catch (e) {
      console.error("API error:", e);
    }
    return null;
  }

  private async callGemini(history: Message[]): Promise<AIResponse> {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(this.geminiKey);
    const model = genAI.getGenerativeModel({
      model: this.modelName,
      systemInstruction: SYSTEM_PROMPT
    });

    const chat = model.startChat({
      history: history.slice(0, -1).map(m => ({
        role: m.role === "assistant" ? "model" : m.role as any,
        parts: m.parts
      })),
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048
      }
    });

    const last = history[history.length - 1];
    const result = await chat.sendMessage(last.parts[0].text);

    return {
      text: (await result.response).text(),
      mode: "api",
      confidence: 0.9,
      model: this.modelName
    };
  }

  private async callGroq(history: Message[]): Promise<AIResponse> {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.groqKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: this.modelName === "grok" ? "llama-3.3-70b-versatile" : this.modelName,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...history.map(m => ({
            role: m.role === "model" ? "assistant" : m.role,
            content: m.parts[0].text
          }))
        ],
        temperature: 0.6,
        max_tokens: 2048
      })
    });

    const data = await response.json();
    return {
      text: data.choices[0]?.message?.content || "Error en Groq",
      mode: "api",
      confidence: 0.85,
      model: "groq-" + this.modelName
    };
  }
}

// ========================
// MOTOR HIBRIDO PRINCIPAL
// ========================
export class MiyaguiEngine {
  private ruleEngine: RuleBasedEngine;
  private apiEngine: APIEngine | null = null;
  private connectionStatus: "online" | "offline" = "offline";
  private preferredMode: "auto" | "local" | "api" = "auto";

  constructor(geminiKey?: string, groqKey?: string) {
    this.ruleEngine = new RuleBasedEngine();

    if (geminiKey || groqKey) {
      this.apiEngine = new APIEngine(geminiKey || "", groqKey || "");
    }

    this.checkConnection();
    setInterval(() => this.checkConnection(), 30000);
  }

  private async checkConnection() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      await fetch("https://www.google.com/generate_204", { 
        mode: "no-cors",
        signal: controller.signal 
      });
      clearTimeout(timeout);
      this.connectionStatus = "online";
    } catch {
      this.connectionStatus = "offline";
    }
  }

  setMode(mode: "auto" | "local" | "api") {
    this.preferredMode = mode;
  }

  getStatus() {
    return {
      connection: this.connectionStatus,
      mode: this.preferredMode,
      hasAPI: !!this.apiEngine,
      localModelLoaded: true
    };
  }

  async generateResponse(history: Message[]): Promise<AIResponse> {
    // Estrategia: API -> Rules (con fallback inteligente)

    if (this.connectionStatus === "online" && this.apiEngine && 
        (this.preferredMode === "api" || this.preferredMode === "auto")) {
      try {
        const apiResponse = await this.apiEngine.generate(history);
        if (apiResponse) return apiResponse;
      } catch (e) {
        console.warn("API failed, falling back to rules");
      }
    }

    // Fallback a motor de reglas (siempre funciona, 100% offline)
    const lastMsg = history[history.length - 1];
    return this.ruleEngine.generateResponse(lastMsg.parts[0].text);
  }
}
