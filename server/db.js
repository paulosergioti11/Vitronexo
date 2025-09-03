import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_FILE = path.resolve(process.cwd(), 'vitronexo.db');
const first = !fs.existsSync(DB_FILE);
const db = new Database(DB_FILE);
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'owner',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  is_adult INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  price_cents INTEGER NOT NULL,
  features TEXT NOT NULL,
  rank INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS businesses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category_id INTEGER,
  city TEXT,
  state TEXT,
  logo_url TEXT,
  cover_url TEXT,
  is_adult INTEGER DEFAULT 0,
  plan_id INTEGER DEFAULT 1,
  highlight_until TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(category_id) REFERENCES categories(id),
  FOREIGN KEY(plan_id) REFERENCES plans(id)
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  price_cents INTEGER DEFAULT 0,
  promo_price_cents INTEGER,
  image_url TEXT,
  is_adult INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(business_id) REFERENCES businesses(id)
);

CREATE TABLE IF NOT EXISTS promotions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  valid_until TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(business_id) REFERENCES businesses(id)
);
`);

const catCount = db.prepare(`SELECT COUNT(*) AS c FROM categories`).get().c;
if (catCount === 0) {
  const insert = db.prepare(`INSERT INTO categories (name, slug, is_adult) VALUES (?, ?, ?)`);
  [
    ['Restaurantes', 'restaurantes', 0],
    ['Moda', 'moda', 0],
    ['Tecnologia', 'tecnologia', 0],
    ['Eventos', 'eventos', 0],
    ['+18', 'adult', 1]
  ].forEach(c => insert.run(...c));
}

const planCount = db.prepare(`SELECT COUNT(*) AS c FROM plans`).get().c;
if (planCount === 0) {
  const insert = db.prepare(`INSERT INTO plans (name, price_cents, features, rank) VALUES (?, ?, ?, ?)`);
  insert.run('Grátis', 0, JSON.stringify(['Listagem básica', 'Até 5 produtos']), 1);
  insert.run('Bronze', 2990, JSON.stringify(['Destaque na busca', 'Até 20 produtos', 'Imagem de capa']), 2);
  insert.run('Prata', 7990, JSON.stringify(['Home destaque', 'Até 100 produtos', 'Galeria']), 3);
  insert.run('Ouro', 14990, JSON.stringify(['Topo da home', 'Produtos ilimitados', 'Selo verificado']), 4);
}

export default db;
