import { openDB, DBSchema, IDBPDatabase } from 'idb';
import {
  PersonProfile, AutonomousProject, TacticalFile,
  Message, NetworkDevice, EncryptedVault, CodeSnippet
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
  messages: {
    key: string;
    value: Message & { id: string; sessionId: string };
    indexes: { 'by-session': string; 'by-timestamp': string };
  };
  networkDevices: {
    key: string;
    value: NetworkDevice;
    indexes: { 'by-status': string; 'by-ip': string };
  };
  vaults: {
    key: string;
    value: EncryptedVault;
    indexes: { 'by-name': string };
  };
  codeSnippets: {
    key: string;
    value: CodeSnippet;
    indexes: { 'by-language': string; 'by-tag': string };
  };
  settings: {
    key: string;
    value: any;
  };
}

let db: IDBPDatabase<MiyaguiDB> | null = null;

export async function initDB(): Promise<IDBPDatabase<MiyaguiDB>> {
  if (db) return db;

  db = await openDB<MiyaguiDB>('miyagui-db', 1, {
    upgrade(db) {
      // Profiles store
      const profileStore = db.createObjectStore('profiles', { keyPath: 'id' });
      profileStore.createIndex('by-category', 'category');
      profileStore.createIndex('by-name', 'name');

      // Projects store
      const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
      projectStore.createIndex('by-status', 'status');
      projectStore.createIndex('by-type', 'type');

      // Files store
      const fileStore = db.createObjectStore('files', { keyPath: 'id' });
      fileStore.createIndex('by-category', 'category');
      fileStore.createIndex('by-parent', 'parentId');

      // Messages store
      const msgStore = db.createObjectStore('messages', { keyPath: 'id' });
      msgStore.createIndex('by-session', 'sessionId');
      msgStore.createIndex('by-timestamp', 'timestamp');

      // Network devices store
      const netStore = db.createObjectStore('networkDevices', { keyPath: 'ip' });
      netStore.createIndex('by-status', 'status');
      netStore.createIndex('by-ip', 'ip');

      // Vaults store
      const vaultStore = db.createObjectStore('vaults', { keyPath: 'id' });
      vaultStore.createIndex('by-name', 'name');

      // Code snippets store
      const codeStore = db.createObjectStore('codeSnippets', { keyPath: 'id' });
      codeStore.createIndex('by-language', 'language');
      codeStore.createIndex('by-tag', 'tags', { multiEntry: true });

      // Settings store
      db.createObjectStore('settings', { keyPath: 'key' });
    }
  });

  return db;
}

// Profile operations
export async function saveProfile(profile: PersonProfile): Promise<void> {
  const database = await initDB();
  await database.put('profiles', profile);
}

export async function getProfiles(): Promise<PersonProfile[]> {
  const database = await initDB();
  return database.getAll('profiles');
}

export async function deleteProfile(id: string): Promise<void> {
  const database = await initDB();
  await database.delete('profiles', id);
}

// Project operations
export async function saveProject(project: AutonomousProject): Promise<void> {
  const database = await initDB();
  await database.put('projects', project);
}

export async function getProjects(): Promise<AutonomousProject[]> {
  const database = await initDB();
  return database.getAll('projects');
}

export async function deleteProject(id: string): Promise<void> {
  const database = await initDB();
  await database.delete('projects', id);
}

// Message operations
export async function saveMessage(sessionId: string, message: Message): Promise<void> {
  const database = await initDB();
  const id = `${sessionId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  await database.put('messages', { ...message, id, sessionId, timestamp: new Date().toISOString() });
}

export async function getMessages(sessionId: string): Promise<(Message & { id: string; sessionId: string })[]> {
  const database = await initDB();
  return database.getAllFromIndex('messages', 'by-session', sessionId);
}

export async function clearMessages(sessionId: string): Promise<void> {
  const database = await initDB();
  const msgs = await getMessages(sessionId);
  const tx = database.transaction('messages', 'readwrite');
  for (const msg of msgs) {
    await tx.store.delete(msg.id);
  }
  await tx.done;
}

// Network device operations
export async function saveNetworkDevice(device: NetworkDevice): Promise<void> {
  const database = await initDB();
  await database.put('networkDevices', device);
}

export async function getNetworkDevices(): Promise<NetworkDevice[]> {
  const database = await initDB();
  return database.getAll('networkDevices');
}

// Vault operations
export async function saveVault(vault: EncryptedVault): Promise<void> {
  const database = await initDB();
  await database.put('vaults', vault);
}

export async function getVaults(): Promise<EncryptedVault[]> {
  const database = await initDB();
  return database.getAll('vaults');
}

export async function deleteVault(id: string): Promise<void> {
  const database = await initDB();
  await database.delete('vaults', id);
}

// Code snippet operations
export async function saveCodeSnippet(snippet: CodeSnippet): Promise<void> {
  const database = await initDB();
  await database.put('codeSnippets', snippet);
}

export async function getCodeSnippets(): Promise<CodeSnippet[]> {
  const database = await initDB();
  return database.getAll('codeSnippets');
}

export async function deleteCodeSnippet(id: string): Promise<void> {
  const database = await initDB();
  await database.delete('codeSnippets', id);
}

// Settings operations
export async function setSetting(key: string, value: any): Promise<void> {
  const database = await initDB();
  await database.put('settings', { key, value });
}

export async function getSetting(key: string): Promise<any> {
  const database = await initDB();
  const result = await database.get('settings', key);
  return result?.value;
}

// Export all data
export async function exportAllData(): Promise<string> {
  const database = await initDB();
  const data = {
    profiles: await database.getAll('profiles'),
    projects: await database.getAll('projects'),
    files: await database.getAll('files'),
    messages: await database.getAll('messages'),
    networkDevices: await database.getAll('networkDevices'),
    vaults: await database.getAll('vaults'),
    codeSnippets: await database.getAll('codeSnippets'),
    settings: await database.getAll('settings'),
    exportedAt: new Date().toISOString()
  };
  return JSON.stringify(data, null, 2);
}

// Import data
export async function importAllData(jsonData: string): Promise<void> {
  const data = JSON.parse(jsonData);
  const database = await initDB();

  const tx = database.transaction(
    ['profiles', 'projects', 'files', 'messages', 'networkDevices', 'vaults', 'codeSnippets', 'settings'],
    'readwrite'
  );

  if (data.profiles) for (const p of data.profiles) await tx.objectStore('profiles').put(p);
  if (data.projects) for (const p of data.projects) await tx.objectStore('projects').put(p);
  if (data.files) for (const f of data.files) await tx.objectStore('files').put(f);
  if (data.messages) for (const m of data.messages) await tx.objectStore('messages').put(m);
  if (data.networkDevices) for (const n of data.networkDevices) await tx.objectStore('networkDevices').put(n);
  if (data.vaults) for (const v of data.vaults) await tx.objectStore('vaults').put(v);
  if (data.codeSnippets) for (const c of data.codeSnippets) await tx.objectStore('codeSnippets').put(c);
  if (data.settings) for (const s of data.settings) await tx.objectStore('settings').put(s);

  await tx.done;
}
