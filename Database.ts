import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { PersonProfile, AutonomousProject, ChatMessage, SavedSession } from './MiyaguiTypes';

interface MiyaguiDB extends DBSchema {
  profiles: {
    key: string;
    value: PersonProfile;
    indexes: { 'by-category': string };
  };
  projects: {
    key: string;
    value: AutonomousProject;
    indexes: { 'by-status': string };
  };
  messages: {
    key: string;
    value: ChatMessage;
    indexes: { 'by-session': string };
  };
  sessions: {
    key: string;
    value: SavedSession;
    indexes: { 'by-date': number };
  };
  settings: {
    key: string;
    value: any;
  };
}

const DB_NAME = 'miyagui-offline-db';
const DB_VERSION = 1;

class MiyaguiDatabase {
  private db: IDBPDatabase<MiyaguiDB> | null = null;

  async init() {
    this.db = await openDB<MiyaguiDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Profiles store
        if (!db.objectStoreNames.contains('profiles')) {
          const profileStore = db.createObjectStore('profiles', { keyPath: 'id' });
          profileStore.createIndex('by-category', 'category');
        }

        // Projects store
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
          projectStore.createIndex('by-status', 'status');
        }

        // Messages store
        if (!db.objectStoreNames.contains('messages')) {
          const msgStore = db.createObjectStore('messages', { keyPath: 'id' });
          msgStore.createIndex('by-session', 'sessionId');
        }

        // Sessions store
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
          sessionStore.createIndex('by-date', 'updatedAt');
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      }
    });
    return this.db;
  }

  // Profiles
  async saveProfile(profile: PersonProfile) {
    if (!this.db) await this.init();
    await this.db!.put('profiles', profile);
  }

  async getProfiles(): Promise<PersonProfile[]> {
    if (!this.db) await this.init();
    return await this.db!.getAll('profiles');
  }

  async deleteProfile(id: string) {
    if (!this.db) await this.init();
    await this.db!.delete('profiles', id);
  }

  // Projects
  async saveProject(project: AutonomousProject) {
    if (!this.db) await this.init();
    await this.db!.put('projects', project);
  }

  async getProjects(): Promise<AutonomousProject[]> {
    if (!this.db) await this.init();
    return await this.db!.getAll('projects');
  }

  // Sessions
  async saveSession(session: SavedSession) {
    if (!this.db) await this.init();
    await this.db!.put('sessions', session);
  }

  async getSessions(): Promise<SavedSession[]> {
    if (!this.db) await this.init();
    return await this.db!.getAllFromIndex('sessions', 'by-date');
  }

  async deleteSession(id: string) {
    if (!this.db) await this.init();
    await this.db!.delete('sessions', id);
  }

  // Settings
  async setSetting(key: string, value: any) {
    if (!this.db) await this.init();
    await this.db!.put('settings', value, key);
  }

  async getSetting(key: string): Promise<any> {
    if (!this.db) await this.init();
    return await this.db!.get('settings', key);
  }

  // Export all data
  async exportData(): Promise<string> {
    if (!this.db) await this.init();
    const data = {
      profiles: await this.db!.getAll('profiles'),
      projects: await this.db!.getAll('projects'),
      sessions: await this.db!.getAll('sessions'),
      settings: await this.db!.getAll('settings'),
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  // Import data
  async importData(jsonString: string) {
    if (!this.db) await this.init();
    const data = JSON.parse(jsonString);

    if (data.profiles) {
      for (const p of data.profiles) await this.db!.put('profiles', p);
    }
    if (data.projects) {
      for (const p of data.projects) await this.db!.put('projects', p);
    }
    if (data.sessions) {
      for (const s of data.sessions) await this.db!.put('sessions', s);
    }
    if (data.settings) {
      for (const [key, value] of Object.entries(data.settings)) {
        await this.db!.put('settings', value, key);
      }
    }
  }

  // Clear all
  async clearAll() {
    if (!this.db) await this.init();
    await this.db!.clear('profiles');
    await this.db!.clear('projects');
    await this.db!.clear('messages');
    await this.db!.clear('sessions');
    await this.db!.clear('settings');
  }
}

export const db = new MiyaguiDatabase();
