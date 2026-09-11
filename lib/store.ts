import fs from 'node:fs/promises';
import path from 'node:path';
import { connectToDatabase, isMongoConfigured } from './mongo';
import mongoose from 'mongoose';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const KITS_FILE = path.join(DATA_DIR, 'kits.json');

export type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export type UserKit = {
  id: string;
  userId: string;
  companyUrl: string;
  jobDescription: string;
  daysToInterview: number;
  status: 'ready' | 'failed' | 'generating';
  companyBrief: { summary: string; whatTheyDo: string; note?: string };
  requirements: Array<{ id: string; text: string; priority: 'must' | 'nice'; kind: 'technical' | 'behavioural' | 'domain' }>;
  questions: Array<{ id: string; requirementIds: string[]; prompt: string; difficulty: number; priority: 'must' | 'nice' }>;
  flashcards: Array<{ id: string; front: string; back: string }>;
  schedule: Array<{ day: number; focus: string; questions: Array<{ id: string; requirementIds: string[]; prompt: string; difficulty: number; priority: 'must' | 'nice' }> }>;
  editedFields: string[];
  practiceScores: Record<string, number>;
  createdAt: string;
  updatedAt: string;
};

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content) as T;
  } catch {
    await fs.writeFile(filePath, JSON.stringify(fallback, null, 2), 'utf8');
    return fallback;
  }
}

export async function getUsers(): Promise<UserRecord[]> {
  if (isMongoConfigured()) {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) return [];
    const docs = await db.collection('users').find({}).toArray();
    return docs.map((doc) => ({
      id: String(doc._id),
      email: doc.email,
      passwordHash: doc.passwordHash,
      createdAt: doc.createdAt,
    }));
  }

  await ensureDataDir();
  return readJson<UserRecord[]>(USERS_FILE, []);
}

export async function saveUsers(users: UserRecord[]) {
  if (isMongoConfigured()) {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) return;
    await db.collection('users').deleteMany({});
    if (users.length) {
      await db.collection('users').insertMany(users.map((user) => ({
        email: user.email,
        passwordHash: user.passwordHash,
        createdAt: user.createdAt,
      })));
    }
    return;
  }

  await ensureDataDir();
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

export async function getKits(): Promise<UserKit[]> {
  if (isMongoConfigured()) {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) return [];
    const docs = await db.collection('kits').find({}).toArray();
    return docs.map((doc) => ({
      id: String(doc._id),
      userId: doc.userId,
      companyUrl: doc.companyUrl,
      jobDescription: doc.jobDescription,
      daysToInterview: Number(doc.daysToInterview || 1),
      status: doc.status,
      companyBrief: doc.companyBrief,
      requirements: doc.requirements,
      questions: doc.questions,
      flashcards: doc.flashcards,
      schedule: doc.schedule,
      editedFields: doc.editedFields || [],
      practiceScores: doc.practiceScores || {},
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  }

  await ensureDataDir();
  return readJson<UserKit[]>(KITS_FILE, []);
}

export async function saveKits(kits: UserKit[]) {
  if (isMongoConfigured()) {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) return;
    await db.collection('kits').deleteMany({});
    if (kits.length) {
      await db.collection('kits').insertMany(kits.map((kit) => ({
        userId: kit.userId,
        companyUrl: kit.companyUrl,
        jobDescription: kit.jobDescription,
        daysToInterview: kit.daysToInterview,
        status: kit.status,
        companyBrief: kit.companyBrief,
        requirements: kit.requirements,
        questions: kit.questions,
        flashcards: kit.flashcards,
        schedule: kit.schedule,
        editedFields: kit.editedFields,
        practiceScores: kit.practiceScores,
        createdAt: kit.createdAt,
        updatedAt: kit.updatedAt,
      })));
    }
    return;
  }

  await ensureDataDir();
  await fs.writeFile(KITS_FILE, JSON.stringify(kits, null, 2), 'utf8');
}

export async function createUser(email: string, passwordHash: string): Promise<UserRecord> {
  const users = await getUsers();
  const user: UserRecord = {
    id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  await saveUsers(users);
  return user;
}

export async function findUserByEmail(email: string): Promise<UserRecord | undefined> {
  const users = await getUsers();
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export async function findUserById(userId: string): Promise<UserRecord | undefined> {
  const users = await getUsers();
  return users.find((user) => user.id === userId);
}

export async function createKitForUser(userId: string, input: Omit<UserKit, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<UserKit> {
  const kits = await getKits();
  const kit: UserKit = {
    ...input,
    id: `kit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  kits.push(kit);
  await saveKits(kits);
  return kit;
}

export async function getKitsForUser(userId: string): Promise<UserKit[]> {
  const kits = await getKits();
  return kits.filter((kit) => kit.userId === userId);
}

export async function getKitById(id: string): Promise<UserKit | undefined> {
  const kits = await getKits();
  return kits.find((kit) => kit.id === id);
}

export async function saveKit(kit: UserKit) {
  const kits = await getKits();
  const index = kits.findIndex((item) => item.id === kit.id);
  if (index === -1) {
    kits.push(kit);
  } else {
    kits[index] = kit;
  }
  await saveKits(kits);
}
