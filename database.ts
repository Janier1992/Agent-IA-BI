import pg from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { createClient } from "@insforge/sdk";

dotenv.config({ path: ".env.local" });
dotenv.config();

// Interfaces matching frontend structures
export interface DBMetrics {
  revenue: number;
  users: number;
  riskScore: number;
  efficiency: number;
  warehouseDelay: boolean;
  activeDataset: string;
}

export interface DBChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
  simulated?: boolean;
  hasVarianceChart?: boolean;
  impact?: string;
  delta?: string;
  confidence?: string;
}

export interface DBValidationLog {
  id: string;
  time: string;
  category: "Sistema" | "Escaneo" | "Análisis" | "Seguridad" | "Integridad" | "Alerta";
  message: string;
}

export interface DBUser {
  id: string;
  username: string;
  email: string;
  password?: string;
  createdAt: string;
}

export interface IDatabase {
  init(): Promise<boolean>;
  getMetrics(): Promise<DBMetrics>;
  updateMetrics(metrics: Partial<DBMetrics>): Promise<DBMetrics>;
  getChatHistory(): Promise<DBChatMessage[]>;
  saveChatMessage(msg: Omit<DBChatMessage, "id" | "timestamp">): Promise<DBChatMessage>;
  getEtlLogs(): Promise<DBValidationLog[]>;
  saveEtlLog(category: DBValidationLog["category"], message: string): Promise<DBValidationLog>;
  clearEtlLogs(): Promise<void>;
  clearChatHistory(): Promise<void>;
  isFallback(): boolean;
  registerUser(username: string, email: string, passwordHash: string): Promise<DBUser>;
  validateUser(usernameOrEmail: string, passwordHash: string): Promise<DBUser | null>;
}

// ==========================================
// 1. POSTGRESQL CONCRETE IMPLEMENTATION
// ==========================================
class PostgresDB implements IDatabase {
  private pool: pg.Pool | null = null;
  private connectionDetails: string = "";

  constructor() {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

    if (connectionString) {
      // Clean and prepare connection string for logging (hide password)
      let maskedUrl = connectionString;
      try {
        const parsed = new URL(connectionString);
        if (parsed.password) {
          parsed.password = "********";
        }
        maskedUrl = parsed.toString();
      } catch (e) {
        // Fallback mask if not a perfect URL
        maskedUrl = connectionString.replace(/:([^:@]+)@/, ":********@");
      }
      
      this.connectionDetails = `DATABASE_URL connection string (${maskedUrl})`;
      this.pool = new pg.Pool({
        connectionString,
        connectionTimeoutMillis: 15000, // Safe timeout for remote databases
        ssl: {
          rejectUnauthorized: false
        }
      });
    } else {
      const host = process.env.POSTGRES_HOST || process.env.PGHOST || "localhost";
      const user = process.env.POSTGRES_USER || process.env.PGUSER || "postgres";
      const database = process.env.POSTGRES_DATABASE || process.env.PGDATABASE || "agent_bi";
      const password = process.env.POSTGRES_PASSWORD || process.env.PGPASSWORD || process.env.INSFORGE_API_KEY || "postgres";
      const port = parseInt(process.env.POSTGRES_PORT || process.env.PGPORT || "5432", 10);

      this.connectionDetails = `Parameters (host: ${host}, database: ${database}, user: ${user}, port: ${port})`;
      
      this.pool = new pg.Pool({
        host,
        user,
        database,
        password,
        port,
        connectionTimeoutMillis: 15000, // Safe timeout for remote databases
        ssl: {
          rejectUnauthorized: false
        }
      });
    }
  }

  isFallback(): boolean {
    return false;
  }

  async init(): Promise<boolean> {
    try {
      console.log(`Attempting to connect to PostgreSQL database using: ${this.connectionDetails}`);
      // Test query
      const client = await this.pool!.connect();
      console.log("Successfully connected to PostgreSQL!");
      
      // Initialize Tables
      await client.query(`
        CREATE TABLE IF NOT EXISTS active_metrics (
          id SERIAL PRIMARY KEY,
          revenue BIGINT,
          users INT,
          risk_score DECIMAL(5,2),
          efficiency DECIMAL(5,2),
          warehouse_delay BOOLEAN,
          active_dataset VARCHAR(255)
        );
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS chat_messages (
          id SERIAL PRIMARY KEY,
          role VARCHAR(50) NOT NULL,
          text TEXT NOT NULL,
          timestamp VARCHAR(100),
          simulated BOOLEAN DEFAULT FALSE,
          has_variance_chart BOOLEAN DEFAULT FALSE,
          impact VARCHAR(50),
          delta VARCHAR(50),
          confidence VARCHAR(50)
        );
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS etl_logs (
          id SERIAL PRIMARY KEY,
          time VARCHAR(50) NOT NULL,
          category VARCHAR(50) NOT NULL,
          message TEXT NOT NULL
        );
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(100) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Seed initial metrics if table is empty
      const metricsRes = await client.query("SELECT COUNT(*) FROM active_metrics");
      if (parseInt(metricsRes.rows[0].count, 10) === 0) {
        await client.query(`
          INSERT INTO active_metrics (revenue, users, risk_score, efficiency, warehouse_delay, active_dataset)
          VALUES (0, 0, 0.0, 0.0, FALSE, 'Ninguno')
        `);
      }

      // Seed initial logs if table is empty
      const logsRes = await client.query("SELECT COUNT(*) FROM etl_logs");
      if (parseInt(logsRes.rows[0].count, 10) === 0) {
        const timeNow = new Date().toLocaleTimeString("en-GB");
        await client.query(`
          INSERT INTO etl_logs (time, category, message) VALUES
          ('${timeNow}', 'Sistema', 'Plataforma autónoma de datos inicializada.'),
          ('${timeNow}', 'Escaneo', 'Esperando la carga de un conjunto de datos en el Hub de Ingestión...'),
          ('${timeNow}', 'Análisis', 'Estructuras analíticas preparadas para el tratamiento de datos.')
        `);
      }

      // Seed director user if not present
      // SHA-256 of 'director123': 4e73b22cf9017686524317ed5c088ef399c43d3df13f707f59d57a2b9044e138
      const userRes = await client.query("SELECT COUNT(*) FROM users WHERE username = 'director'");
      if (parseInt(userRes.rows[0].count, 10) === 0) {
        await client.query(`
          INSERT INTO users (username, email, password)
          VALUES ('director', 'director@strategist.co', '4e73b22cf9017686524317ed5c088ef399c43d3df13f707f59d57a2b9044e138')
        `);
        console.log("Successfully seeded 'director' account in PostgreSQL.");
      }

      client.release();
      return true;
    } catch (err) {
      console.warn("PostgreSQL initialization failed. Database is not running or credentials invalid.");
      console.warn("Reason:", (err as Error).message);
      return false; // Triggers fallback to InMemoryDB
    }
  }

  async getMetrics(): Promise<DBMetrics> {
    const res = await this.pool!.query("SELECT * FROM active_metrics ORDER BY id DESC LIMIT 1");
    if (res.rows.length === 0) {
      return {
        revenue: 0,
        users: 0,
        riskScore: 0.0,
        efficiency: 0.0,
        warehouseDelay: false,
        activeDataset: "Ninguno",
      };
    }
    const row = res.rows[0];
    return {
      revenue: parseInt(row.revenue, 10),
      users: parseInt(row.users, 10),
      riskScore: parseFloat(row.risk_score),
      efficiency: parseFloat(row.efficiency),
      warehouseDelay: row.warehouse_delay,
      activeDataset: row.active_dataset,
    };
  }

  async updateMetrics(metrics: Partial<DBMetrics>): Promise<DBMetrics> {
    const current = await this.getMetrics();
    const updated = { ...current, ...metrics };
    
    await this.pool!.query(`
      UPDATE active_metrics 
      SET revenue = $1, users = $2, risk_score = $3, efficiency = $4, warehouse_delay = $5, active_dataset = $6
      WHERE id = (SELECT id FROM active_metrics ORDER BY id DESC LIMIT 1)
    `, [updated.revenue, updated.users, updated.riskScore, updated.efficiency, updated.warehouseDelay, updated.activeDataset]);

    return updated;
  }

  async getChatHistory(): Promise<DBChatMessage[]> {
    const res = await this.pool!.query("SELECT * FROM chat_messages ORDER BY id ASC");
    return res.rows.map(row => ({
      id: row.id.toString(),
      role: row.role as "user" | "model",
      text: row.text,
      timestamp: row.timestamp,
      simulated: row.simulated,
      hasVarianceChart: row.has_variance_chart,
      impact: row.impact,
      delta: row.delta,
      confidence: row.confidence,
    }));
  }

  async saveChatMessage(msg: Omit<DBChatMessage, "id" | "timestamp">): Promise<DBChatMessage> {
    const timeNow = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) + " PM";
    const timestamp = msg.role === "user" ? `${timeNow} • ENVIADO` : `${timeNow} • RECIBIDO`;

    const res = await this.pool!.query(`
      INSERT INTO chat_messages (role, text, timestamp, simulated, has_variance_chart, impact, delta, confidence)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [msg.role, msg.text, timestamp, msg.simulated || false, msg.hasVarianceChart || false, msg.impact || null, msg.delta || null, msg.confidence || null]);

    const row = res.rows[0];
    return {
      id: row.id.toString(),
      role: row.role as "user" | "model",
      text: row.text,
      timestamp: row.timestamp,
      simulated: row.simulated,
      hasVarianceChart: row.has_variance_chart,
      impact: row.impact,
      delta: row.delta,
      confidence: row.confidence,
    };
  }

  async getEtlLogs(): Promise<DBValidationLog[]> {
    const res = await this.pool!.query("SELECT * FROM etl_logs ORDER BY id ASC");
    return res.rows.map(row => ({
      id: row.id.toString(),
      time: row.time,
      category: row.category as DBValidationLog["category"],
      message: row.message,
    }));
  }

  async saveEtlLog(category: DBValidationLog["category"], message: string): Promise<DBValidationLog> {
    const timeNow = new Date().toLocaleTimeString("en-GB");
    const res = await this.pool!.query(`
      INSERT INTO etl_logs (time, category, message)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [timeNow, category, message]);

    const row = res.rows[0];
    return {
      id: row.id.toString(),
      time: row.time,
      category: row.category as DBValidationLog["category"],
      message: row.message,
    };
  }

  async clearEtlLogs(): Promise<void> {
    await this.pool!.query("TRUNCATE TABLE etl_logs");
  }

  async clearChatHistory(): Promise<void> {
    await this.pool!.query("TRUNCATE TABLE chat_messages");
  }

  async registerUser(username: string, email: string, passwordHash: string): Promise<DBUser> {
    const res = await this.pool!.query(`
      INSERT INTO users (username, email, password)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [username, email, passwordHash]);
    const row = res.rows[0];
    return {
      id: row.id.toString(),
      username: row.username,
      email: row.email,
      createdAt: row.created_at.toISOString(),
    };
  }

  async validateUser(usernameOrEmail: string, passwordHash: string): Promise<DBUser | null> {
    const res = await this.pool!.query(`
      SELECT * FROM users
      WHERE (username = $1 OR email = $1) AND password = $2
      LIMIT 1
    `, [usernameOrEmail, passwordHash]);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: row.id.toString(),
      username: row.username,
      email: row.email,
      createdAt: row.created_at.toISOString(),
    };
  }
}

// ==========================================
// 2. IN-MEMORY HIGHLY RESILIENT BACKUP DB (PERSISTED ON DISK)
// ==========================================
const FALLBACK_FILE = path.join(process.cwd(), "database_fallback.json");

class InMemoryDB implements IDatabase {
  private metrics: DBMetrics = {
    revenue: 0,
    users: 0,
    riskScore: 0.0,
    efficiency: 0.0,
    warehouseDelay: false,
    activeDataset: "Ninguno",
  };

  private chatHistory: DBChatMessage[] = [];
  private etlLogs: DBValidationLog[] = [];
  private users: DBUser[] = [];

  private loadFromFile() {
    try {
      if (fs.existsSync(FALLBACK_FILE)) {
        const fileContent = fs.readFileSync(FALLBACK_FILE, "utf-8");
        if (fileContent.trim() !== "") {
          const data = JSON.parse(fileContent);
          if (data.metrics) this.metrics = data.metrics;
          if (data.chatHistory) this.chatHistory = data.chatHistory;
          if (data.etlLogs) this.etlLogs = data.etlLogs;
          if (data.users) this.users = data.users;
          console.log("Loaded persistent fallback database from database_fallback.json");
        }
      }
    } catch (err: any) {
      console.warn("Failed to load fallback database from disk:", err.message);
    }
  }

  private saveToFile() {
    try {
      const data = {
        metrics: this.metrics,
        chatHistory: this.chatHistory,
        etlLogs: this.etlLogs,
        users: this.users
      };
      fs.writeFileSync(FALLBACK_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (err: any) {
      console.warn("Failed to save fallback database to disk:", err.message);
    }
  }

  isFallback(): boolean {
    return true;
  }

  async init(): Promise<boolean> {
    console.log("Initializing dynamic In-Memory Backup Engine.");
    this.loadFromFile();
    
    // Seed default logs if empty
    if (this.etlLogs.length === 0) {
      const timeNow = new Date().toLocaleTimeString("en-GB");
      this.etlLogs = [
        { id: "1", time: timeNow, category: "Sistema", message: "Plataforma autónoma de datos inicializada en memoria local." },
        { id: "2", time: timeNow, category: "Escaneo", message: "Esperando la carga de un conjunto de datos en el Hub de Ingestión..." },
        { id: "3", time: timeNow, category: "Análisis", message: "Estructuras analíticas preparadas para el tratamiento de datos." }
      ];
    }

    // Seed default director user if empty
    if (this.users.length === 0) {
      this.users = [{
        id: "1",
        username: "director",
        email: "director@strategist.co",
        password: "4e73b22cf9017686524317ed5c088ef399c43d3df13f707f59d57a2b9044e138",
        createdAt: new Date().toISOString()
      }];
      console.log("Successfully seeded 'director' account in InMemoryDB.");
    }
    
    this.saveToFile();
    return true;
  }

  async getMetrics(): Promise<DBMetrics> {
    this.loadFromFile();
    return this.metrics;
  }

  async updateMetrics(metrics: Partial<DBMetrics>): Promise<DBMetrics> {
    this.loadFromFile();
    this.metrics = { ...this.metrics, ...metrics };
    this.saveToFile();
    return this.metrics;
  }

  async getChatHistory(): Promise<DBChatMessage[]> {
    this.loadFromFile();
    return this.chatHistory;
  }

  async saveChatMessage(msg: Omit<DBChatMessage, "id" | "timestamp">): Promise<DBChatMessage> {
    this.loadFromFile();
    const timeNow = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) + " PM";
    const timestamp = msg.role === "user" ? `${timeNow} • ENVIADO` : `${timeNow} • RECIBIDO`;
    
    const newMsg: DBChatMessage = {
      id: Date.now().toString(),
      role: msg.role,
      text: msg.text,
      timestamp,
      simulated: msg.simulated ?? true,
      hasVarianceChart: msg.hasVarianceChart,
      impact: msg.impact,
      delta: msg.delta,
      confidence: msg.confidence
    };
    this.chatHistory.push(newMsg);
    this.saveToFile();
    return newMsg;
  }

  async getEtlLogs(): Promise<DBValidationLog[]> {
    this.loadFromFile();
    return this.etlLogs;
  }

  async saveEtlLog(category: DBValidationLog["category"], message: string): Promise<DBValidationLog> {
    this.loadFromFile();
    const newLog: DBValidationLog = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString("en-GB"),
      category,
      message,
    };
    this.etlLogs.push(newLog);
    this.saveToFile();
    return newLog;
  }

  async clearEtlLogs(): Promise<void> {
    this.loadFromFile();
    this.etlLogs = [];
    this.saveToFile();
  }

  async clearChatHistory(): Promise<void> {
    this.loadFromFile();
    this.chatHistory = [];
    this.saveToFile();
  }

  async registerUser(username: string, email: string, passwordHash: string): Promise<DBUser> {
    this.loadFromFile();
    const exists = this.users.find(u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      throw new Error("El nombre de usuario o el correo electrónico ya se encuentra registrado.");
    }
    const newUser: DBUser = {
      id: (this.users.length + 1).toString(),
      username,
      email,
      password: passwordHash,
      createdAt: new Date().toISOString()
    };
    this.users.push(newUser);
    this.saveToFile();
    return {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      createdAt: newUser.createdAt
    };
  }

  async validateUser(usernameOrEmail: string, passwordHash: string): Promise<DBUser | null> {
    this.loadFromFile();
    const user = this.users.find(u => 
      (u.username.toLowerCase() === usernameOrEmail.toLowerCase() || u.email.toLowerCase() === usernameOrEmail.toLowerCase()) && 
      u.password === passwordHash
    );
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    };
  }
}

// ==========================================
// 3. INSFORGE CLOUD SDK ENGINE (NO TCP PORT 5432 REQUIRED)
// ==========================================
class InsforgeDB implements IDatabase {
  private client: any;

  constructor() {
    let url = process.env.INSFORGE_URL || "";
    if (url.endsWith("/")) {
      url = url.slice(0, -1);
    }
    
    this.client = createClient({
      baseUrl: url,
      anonKey: process.env.INSFORGE_API_KEY
    });
  }

  isFallback(): boolean {
    return false;
  }

  async init(): Promise<boolean> {
    try {
      console.log("Attempting to connect to InsForge Cloud Database using SDK...");
      const { data, error } = await this.client.database.from("users").select("*").limit(1);
      if (error) {
        throw new Error(error.message || JSON.stringify(error));
      }
      console.log("Successfully connected to InsForge Cloud Database via SDK!");
      return true;
    } catch (err: any) {
      console.warn("InsForge Cloud SDK connection failed.");
      console.warn("Reason:", err.message);
      return false;
    }
  }

  async getMetrics(): Promise<DBMetrics> {
    const { data, error } = await this.client.database.from("active_metrics").select("*").order("id", { ascending: false }).limit(1);
    if (error || !data || data.length === 0) {
      return {
        revenue: 0,
        users: 0,
        riskScore: 0.0,
        efficiency: 0.0,
        warehouseDelay: false,
        activeDataset: "Ninguno",
      };
    }
    const row = data[0];
    return {
      revenue: parseInt(row.revenue, 10),
      users: parseInt(row.users, 10),
      riskScore: parseFloat(row.risk_score),
      efficiency: parseFloat(row.efficiency),
      warehouseDelay: row.warehouse_delay,
      activeDataset: row.active_dataset,
    };
  }

  async updateMetrics(metrics: Partial<DBMetrics>): Promise<DBMetrics> {
    const current = await this.getMetrics();
    const updated = { ...current, ...metrics };
    
    const { data: latestRows } = await this.client.database.from("active_metrics").select("id").order("id", { ascending: false }).limit(1);
    if (latestRows && latestRows.length > 0) {
      const id = latestRows[0].id;
      await this.client.database.from("active_metrics").update({
        revenue: updated.revenue,
        users: updated.users,
        risk_score: updated.riskScore,
        efficiency: updated.efficiency,
        warehouse_delay: updated.warehouseDelay,
        active_dataset: updated.activeDataset
      }).match({ id });
    } else {
      await this.client.database.from("active_metrics").insert([{
        revenue: updated.revenue,
        users: updated.users,
        risk_score: updated.riskScore,
        efficiency: updated.efficiency,
        warehouse_delay: updated.warehouseDelay,
        active_dataset: updated.activeDataset
      }]);
    }

    return updated;
  }

  async getChatHistory(): Promise<DBChatMessage[]> {
    const { data, error } = await this.client.database.from("chat_messages").select("*").order("id", { ascending: true });
    if (error || !data) return [];
    return data.map((row: any) => ({
      id: row.id.toString(),
      role: row.role as "user" | "model",
      text: row.text,
      timestamp: row.timestamp,
      simulated: row.simulated,
      hasVarianceChart: row.has_variance_chart,
      impact: row.impact,
      delta: row.delta,
      confidence: row.confidence,
    }));
  }

  async saveChatMessage(msg: Omit<DBChatMessage, "id" | "timestamp">): Promise<DBChatMessage> {
    const timeNow = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) + " PM";
    const timestamp = msg.role === "user" ? `${timeNow} • ENVIADO` : `${timeNow} • RECIBIDO`;

    await this.client.database.from("chat_messages").insert([{
      role: msg.role,
      text: msg.text,
      timestamp,
      simulated: msg.simulated || false,
      has_variance_chart: msg.hasVarianceChart || false,
      impact: msg.impact || null,
      delta: msg.delta || null,
      confidence: msg.confidence || null
    }]);

    const { data: latest } = await this.client.database.from("chat_messages").select("*").order("id", { ascending: false }).limit(1);
    const row = latest && latest.length > 0 ? latest[0] : { id: Date.now() };
    return {
      id: row.id.toString(),
      role: msg.role as "user" | "model",
      text: msg.text,
      timestamp,
      simulated: msg.simulated || false,
      hasVarianceChart: msg.hasVarianceChart || false,
      impact: msg.impact,
      delta: msg.delta,
      confidence: msg.confidence,
    };
  }

  async getEtlLogs(): Promise<DBValidationLog[]> {
    const { data, error } = await this.client.database.from("etl_logs").select("*").order("id", { ascending: true });
    if (error || !data) return [];
    return data.map((row: any) => ({
      id: row.id.toString(),
      time: row.time,
      category: row.category as DBValidationLog["category"],
      message: row.message,
    }));
  }

  async saveEtlLog(category: DBValidationLog["category"], message: string): Promise<DBValidationLog> {
    const timeNow = new Date().toLocaleTimeString("en-GB");
    await this.client.database.from("etl_logs").insert([{
      time: timeNow,
      category,
      message
    }]);

    const { data: latest } = await this.client.database.from("etl_logs").select("*").order("id", { ascending: false }).limit(1);
    const row = latest && latest.length > 0 ? latest[0] : { id: Date.now() };
    return {
      id: row.id.toString(),
      time: timeNow,
      category,
      message,
    };
  }

  async clearEtlLogs(): Promise<void> {
    await this.client.database.from("etl_logs").delete().gt("id", 0);
  }

  async clearChatHistory(): Promise<void> {
    await this.client.database.from("chat_messages").delete().gt("id", 0);
  }

  async registerUser(username: string, email: string, passwordHash: string): Promise<DBUser> {
    const { data: exists } = await this.client.database.from("users").select("*").or(`username.eq.${username},email.eq.${email}`);
    if (exists && exists.length > 0) {
      throw new Error("El nombre de usuario o el correo electrónico ya se encuentra registrado.");
    }

    // Double-persist: 1. Register user directly in InsForge Auth to show in Authentication dashboard
    try {
      console.log(`Registering user ${email} in InsForge Auth system...`);
      const signUpParams = {
        email,
        password: passwordHash,
        name: username,
        redirectTo: "http://localhost:3000/"
      };
      console.log("Calling client.auth.signUp with parameters:", JSON.stringify(signUpParams, null, 2));
      const { data: authData, error: authError } = await this.client.auth.signUp(signUpParams);
      if (authError) {
        console.warn("InsForge Auth signUp returned an error:", authError);
      } else {
        console.log("Successfully registered user in InsForge Auth system:", authData);
      }
    } catch (authErr: any) {
      console.warn("Exception while calling InsForge Auth signUp:", authErr.message);
    }

    // Double-persist: 2. Insert into the public users table for bypass/fallback login
    await this.client.database.from("users").insert([{
      username,
      email,
      password: passwordHash
    }]);

    const { data: latest } = await this.client.database.from("users").select("*").match({ email });
    if (!latest || latest.length === 0) {
      throw new Error("Error al recuperar el usuario registrado.");
    }
    const row = latest[0];
    return {
      id: row.id.toString(),
      username: row.username,
      email: row.email,
      createdAt: new Date(row.created_at || Date.now()).toISOString(),
    };
  }

  async validateUser(usernameOrEmail: string, passwordHash: string): Promise<DBUser | null> {
    // Check in the public users table first for fallback (bypasses unverified email block)
    const { data } = await this.client.database.from("users")
      .select("*")
      .or(`username.eq.${usernameOrEmail},email.eq.${usernameOrEmail}`)
      .match({ password: passwordHash })
      .limit(1);

    if (!data || data.length === 0) return null;
    const row = data[0];
    return {
      id: row.id.toString(),
      username: row.username,
      email: row.email,
      createdAt: new Date(row.created_at || Date.now()).toISOString(),
    };
  }
}

// Factory to select active Database Engine
let activeDB: IDatabase | null = null;

export async function getDatabase(): Promise<IDatabase> {
  if (activeDB) return activeDB;

  const url = process.env.INSFORGE_URL;
  const apiKey = process.env.INSFORGE_API_KEY;

  if (url && url.trim() !== "" && apiKey && apiKey.trim() !== "") {
    const insforgeDb = new InsforgeDB();
    const connected = await insforgeDb.init();
    if (connected) {
      activeDB = insforgeDb;
      return activeDB;
    }
  }

  const pgDb = new PostgresDB();
  const connected = await pgDb.init();

  if (connected) {
    activeDB = pgDb;
  } else {
    console.warn("⚠️ Switching to InMemory fallback database wrapper due to PostgreSQL connection issues.");
    const memDb = new InMemoryDB();
    await memDb.init();
    activeDB = memDb;
  }

  return activeDB;
}
