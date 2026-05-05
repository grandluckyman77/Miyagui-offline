// Miyagui Offline Database - Persistencia 100% local
// Usa IndexedDB para almacenamiento offline completo

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { 
  PersonProfile, 
  AutonomousProject, 
  TacticalFile,
  SystemProcess,
  CommunicationAction,
  DigitalProduct,
  ShadowAgent,
  TacticalTool,
  HardwareTelemetry
} from './MiyaguiTypes';

interface MiyaguiDB extends DBSchema {
  profiles: {
    key: string;
    value: PersonProfile;
    indexes: { 'by-category': string; 'by-name': string };
  };
  projects: {
    key: string;
    value: AutonomousProject;
    indexes: { 'by-status': string; 'by-type': string };
  };
  files: {
    key: string;
    value: TacticalFile;
    indexes: { 'by-category': string; 'by-parent': string };
  };
  chat_history: {
    key: number;
    value: {
      id: number;
      timestamp: string;
      role: string;
      content: string;
      sessionId: string;
    };
    indexes: { 'by-session': string; 'by-timestamp': string };
  };
  actions: {
    key: string;
    value: CommunicationAction;
    indexes: { 'by-status': string; 'by-type': string };
  };
  products: {
    key: string;
    value: DigitalProduct;
    indexes: { 'by-status': string };
  };
  agents: {
    key: string;
    value: ShadowAgent;
    indexes: { 'by-status': string; 'by-specialty': string };
  };
  tools: {
    key: string;
    value: TacticalTool;
    indexes: { 'by-category': string; 'by-status': string };
  };
  telemetry: {
    key: number;
    value: {
      id: number;
      timestamp: string;
      data: HardwareTelemetry;
    };
    indexes: { 'by-timestamp': string };
  };
  settings: {
    key: string;
    value: {
      key: string;
      value: any;
      updatedAt: string;
    };
  };
  evolution_logs: {
    key: number;
    value: {
      id: number;
      timestamp: string;
      type: string;
      msg: string;
      data?: any;
    };
    indexes: { 'by-type': string };
  };
}

const DB_NAME = 'MiyaguiOfflineDB';
const DB_VERSION = 1;

let db: IDBPDatabase<MiyaguiDB> | null = null;

export async function initDB(): Promise<IDBPDatabase<MiyaguiDB>> {
  if (db) return db;

  db = await openDB<MiyaguiDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Profiles store
      if (!db.objectStoreNames.contains('profiles')) {
        const profileStore = db.createObjectStore('profiles', { keyPath: 'id' });
        profileStore.createIndex('by-category', 'category', { unique: false });
        profileStore.createIndex('by-name', 'name', { unique: false });
      }

      // Projects store
      if (!db.objectStoreNames.contains('projects')) {
        const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
        projectStore.createIndex('by-status', 'status', { unique: false });
        projectStore.createIndex('by-type', 'type', { unique: false });
      }

      // Files store
      if (!db.objectStoreNames.contains('files')) {
        const fileStore = db.createObjectStore('files', { keyPath: 'id' });
        fileStore.createIndex('by-category', 'category', { unique: false });
        fileStore.createIndex('by-parent', 'parentId', { unique: false });
      }

      // Chat history store
      if (!db.objectStoreNames.contains('chat_history')) {
        const chatStore = db.createObjectStore('chat_history', { keyPath: 'id', autoIncrement: true });
        chatStore.createIndex('by-session', 'sessionId', { unique: false });
        chatStore.createIndex('by-timestamp', 'timestamp', { unique: false });
      }

      // Actions store
      if (!db.objectStoreNames.contains('actions')) {
        const actionStore = db.createObjectStore('actions', { keyPath: 'id' });
        actionStore.createIndex('by-status', 'status', { unique: false });
        actionStore.createIndex('by-type', 'type', { unique: false });
      }

      // Products store
      if (!db.objectStoreNames.contains('products')) {
        const productStore = db.createObjectStore('products', { keyPath: 'id' });
        productStore.createIndex('by-status', 'status', { unique: false });
      }

      // Agents store
      if (!db.objectStoreNames.contains('agents')) {
        const agentStore = db.createObjectStore('agents', { keyPath: 'id' });
        agentStore.createIndex('by-status', 'status', { unique: false });
        agentStore.createIndex('by-specialty', 'specialty', { unique: false });
      }

      // Tools store
      if (!db.objectStoreNames.contains('tools')) {
        const toolStore = db.createObjectStore('tools', { keyPath: 'id' });
        toolStore.createIndex('by-category', 'category', { unique: false });
        toolStore.createIndex('by-status', 'status', { unique: false });
      }

      // Telemetry store
      if (!db.objectStoreNames.contains('telemetry')) {
        const telemStore = db.createObjectStore('telemetry', { keyPath: 'id', autoIncrement: true });
        telemStore.createIndex('by-timestamp', 'timestamp', { unique: false });
      }

      // Settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }

      // Evolution logs store
      if (!db.objectStoreNames.contains('evolution_logs')) {
        const evoStore = db.createObjectStore('evolution_logs', { keyPath: 'id', autoIncrement: true });
        evoStore.createIndex('by-type', 'type', { unique: false });
      }
    }
  });

  return db;
}

// Profile Operations
export async function saveProfile(profile: PersonProfile): Promise<void> {
  const db = await initDB();
  await db.put('profiles', profile);
}

export async function getProfiles(): Promise<PersonProfile[]> {
  const db = await initDB();
  return db.getAll('profiles');
}

export async function getProfileById(id: string): Promise<PersonProfile | undefined> {
  const db = await initDB();
  return db.get('profiles', id);
}

export async function deleteProfile(id: string): Promise<void> {
  const db = await initDB();
  await db.delete('profiles', id);
}

export async function getProfilesByCategory(category: string): Promise<PersonProfile[]> {
  const db = await initDB();
  return db.getAllFromIndex('profiles', 'by-category', category);
}

// Project Operations
export async function saveProject(project: AutonomousProject): Promise<void> {
  const db = await initDB();
  await db.put('projects', project);
}

export async function getProjects(): Promise<AutonomousProject[]> {
  const db = await initDB();
  return db.getAll('projects');
}

export async function deleteProject(id: string): Promise<void> {
  const db = await initDB();
  await db.delete('projects', id);
}

// Chat History Operations
export async function saveChatMessage(sessionId: string, role: string, content: string): Promise<void> {
  const db = await initDB();
  await db.add('chat_history', {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    role,
    content,
    sessionId
  });
}

export async function getChatHistory(sessionId: string): Promise<any[]> {
  const db = await initDB();
  return db.getAllFromIndex('chat_history', 'by-session', sessionId);
}

export async function getAllChatSessions(): Promise<string[]> {
  const db = await initDB();
  const all = await db.getAll('chat_history');
  return [...new Set(all.map(m => m.sessionId))];
}

export async function clearChatHistory(sessionId: string): Promise<void> {
  const db = await initDB();
  const messages = await db.getAllFromIndex('chat_history', 'by-session', sessionId);
  const tx = db.transaction('chat_history', 'readwrite');
  for (const msg of messages) {
    await tx.store.delete(msg.id);
  }
  await tx.done;
}

// Tactical File Operations
export async function saveFile(file: TacticalFile): Promise<void> {
  const db = await initDB();
  await db.put('files', file);
}

export async function getFiles(): Promise<TacticalFile[]> {
  const db = await initDB();
  return db.getAll('files');
}

export async function deleteFile(id: string): Promise<void> {
  const db = await initDB();
  await db.delete('files', id);
}

// Action Operations
export async function saveAction(action: CommunicationAction): Promise<void> {
  const db = await initDB();
  await db.put('actions', action);
}

export async function getActions(): Promise<CommunicationAction[]> {
  const db = await initDB();
  return db.getAll('actions');
}

// Product Operations
export async function saveProduct(product: DigitalProduct): Promise<void> {
  const db = await initDB();
  await db.put('products', product);
}

export async function getProducts(): Promise<DigitalProduct[]> {
  const db = await initDB();
  return db.getAll('products');
}

// Agent Operations
export async function saveAgent(agent: ShadowAgent): Promise<void> {
  const db = await initDB();
  await db.put('agents', agent);
}

export async function getAgents(): Promise<ShadowAgent[]> {
  const db = await initDB();
  return db.getAll('agents');
}

// Tool Operations
export async function saveTool(tool: TacticalTool): Promise<void> {
  const db = await initDB();
  await db.put('tools', tool);
}

export async function getTools(): Promise<TacticalTool[]> {
  const db = await initDB();
  return db.getAll('tools');
}

// Telemetry Operations
export async function saveTelemetry(data: HardwareTelemetry): Promise<void> {
  const db = await initDB();
  await db.add('telemetry', {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    data
  });
}

export async function getTelemetryHistory(limit: number = 100): Promise<any[]> {
  const db = await initDB();
  const all = await db.getAll('telemetry');
  return all.slice(-limit);
}

// Settings Operations
export async function setSetting(key: string, value: any): Promise<void> {
  const db = await initDB();
  await db.put('settings', {
    key,
    value,
    updatedAt: new Date().toISOString()
  });
}

export async function getSetting(key: string): Promise<any> {
  const db = await initDB();
  const result = await db.get('settings', key);
  return result?.value;
}

export async function getAllSettings(): Promise<Record<string, any>> {
  const db = await initDB();
  const all = await db.getAll('settings');
  return all.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
}

// Evolution Log Operations
export async function addEvolutionLog(type: string, msg: string, data?: any): Promise<void> {
  const db = await initDB();
  await db.add('evolution_logs', {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    type,
    msg,
    data
  });
}

export async function getEvolutionLogs(limit: number = 50): Promise<any[]> {
  const db = await initDB();
  const all = await db.getAll('evolution_logs');
  return all.slice(-limit).reverse();
}

// Export/Import para backup
export async function exportAllData(): Promise<string> {
  const db = await initDB();
  const data = {
    profiles: await db.getAll('profiles'),
    projects: await db.getAll('projects'),
    files: await db.getAll('files'),
    chat_history: await db.getAll('chat_history'),
    actions: await db.getAll('actions'),
    products: await db.getAll('products'),
    agents: await db.getAll('agents'),
    tools: await db.getAll('tools'),
    settings: await db.getAll('settings'),
    evolution_logs: await db.getAll('evolution_logs'),
    exportedAt: new Date().toISOString()
  };
  return JSON.stringify(data, null, 2);
}

export async function importAllData(jsonString: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonString);
    const db = await initDB();

    // Clear existing data
    const stores = ['profiles', 'projects', 'files', 'chat_history', 'actions', 'products', 'agents', 'tools', 'settings', 'evolution_logs'];
    for (const store of stores) {
      await db.clear(store as any);
    }

    // Import new data
    for (const [store, items] of Object.entries(data)) {
      if (store === 'exportedAt') continue;
      if (Array.isArray(items)) {
        for (const item of items) {
          await db.put(store as any, item);
        }
      }
    }

    return true;
  } catch (e) {
    console.error('Import failed:', e);
    return false;
  }
}

// Database stats
export async function getDBStats(): Promise<Record<string, number>> {
  const db = await initDB();
  return {
    profiles: (await db.getAll('profiles')).length,
    projects: (await db.getAll('projects')).length,
    files: (await db.getAll('files')).length,
    chatMessages: (await db.getAll('chat_history')).length,
    actions: (await db.getAll('actions')).length,
    products: (await db.getAll('products')).length,
    agents: (await db.getAll('agents')).length,
    tools: (await db.getAll('tools')).length,
    telemetry: (await db.getAll('telemetry')).length,
    logs: (await db.getAll('evolution_logs')).length
  };
}
