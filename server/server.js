import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import bcrypt from 'bcryptjs';
import db from './db.js';

const app = Fastify({ logger: true });

await app.register(cors, { origin: true, credentials: true });
await app.register(jwt, { secret: process.env.JWT_SECRET || 'dev-secret' });

const toBRL = cents => (cents / 100).toFixed(2);

// auth hook
app.decorate('auth', async (req, reply) => {
  try { await req.jwtVerify(); } catch (e) { reply.code(401).send({ error: 'não autorizado' }); }
});

// -------- AUTH ----------
app.post('/auth/register', async (req, reply) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) return reply.code(400).send({ error: 'dados inválidos' });
  const hash = await bcrypt.hash(password, 10);
  try {
    const stmt = db.prepare(`INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)`);
    const info = stmt.run(name, email.toLowerCase(), hash);
    const token = app.jwt.sign({ id: info.lastInsertRowid, email });
    reply.send({ token, user: { id: info.lastInsertRowid, name, email } });
  } catch (e) {
    reply.code(400).send({ error: 'email já cadastrado' });
  }
});

app.post('/auth/login', async (req, reply) => {
  const { email, password } = req.body || {};
  const user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email?.toLowerCase());
  if (!user) return reply.code(401).send({ error: 'credenciais inválidas' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return reply.code(401).send({ error: 'credenciais inválidas' });
  const token = app.jwt.sign({ id: user.id, email: user.email });
  reply.send({ token, user: { id: user.id, name: user.name, email: user.email } });
});

app.get('/me', { preHandler: [app.auth] }, async (req) => {
  const u = db.prepare(`SELECT id, name, email, role FROM users WHERE id = ?`).get(req.user.id);
  return { user: u };
});

// -------- CATEGORIES & PLANS ----------
app.get('/categories', async () => {
  const cats = db.prepare(`SELECT * FROM categories ORDER BY is_adult, name`).all();
  return { categories: cats };
});

app.get('/plans', async () => {
  const plans = db.prepare(`SELECT * FROM plans ORDER BY rank`).all()
    .map(p => ({ ...p, price_brl: toBRL(p.price_cents), features: JSON.parse(p.features) }));
  return { plans };
});

// -------- BUSINESSES ----------
app.post('/businesses', { preHandler: [app.auth] }, async (req, reply) => {
  const { name, description, category_id, city, state, logo_url, cover_url, is_adult, plan_id } = req.body || {};
  if (!name) return reply.code(400).send({ error: 'nome obrigatório' });
  const stmt = db.prepare(`
    INSERT INTO businesses (user_id, name, description, category_id, city, state, logo_url, cover_url, is_adult, plan_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(req.user.id, name, description || '', category_id || null, city || '', state || '', logo_url || '', cover_url || '', is_adult ? 1 : 0, plan_id || 1);
  return { id: info.lastInsertRowid };
});

app.get('/businesses', async (req) => {
  const { limit = 20, featured = 0 } = req.query || {};
  const rows = db.prepare(`
    SELECT b.*, c.name AS category_name, p.name AS plan_name, p.rank
    FROM businesses b
    LEFT JOIN categories c ON c.id = b.category_id
    LEFT JOIN plans p ON p.id = b.plan_id
    ORDER BY (CASE WHEN ?=1 THEN p.rank END) DESC, b.created_at DESC
    LIMIT ?
  `).all(Number(featured), Number(limit));
  return { businesses: rows };
});

app.get('/businesses/:id', async (req, reply) => {
  const b = db.prepare(`SELECT * FROM businesses WHERE id = ?`).get(req.params.id);
  if (!b) return reply.code(404).send({ error: 'não encontrado' });
  const prods = db.prepare(`SELECT * FROM products WHERE business_id = ? ORDER BY created_at DESC`).all(b.id);
  const promos = db.prepare(`SELECT * FROM promotions WHERE business_id = ? ORDER BY created_at DESC`).all(b.id);
  return { business: b, products: prods, promotions: promos };
});

app.put('/businesses/:id', { preHandler: [app.auth] }, async (req, reply) => {
  const owner = db.prepare(`SELECT user_id FROM businesses WHERE id = ?`).get(req.params.id);
  if (!owner) return reply.code(404).send({ error: 'não encontrado' });
  if (owner.user_id !== req.user.id) return reply.code(403).send({ error: 'sem permissão' });
  const fields = ['name','description','category_id','city','state','logo_url','cover_url','is_adult','plan_id'];
  const data = fields.reduce((o,f)=> ({...o, [f]: req.body?.[f]}), {});
  const stmt = db.prepare(`
    UPDATE businesses SET
      name = COALESCE(@name, name),
      description = COALESCE(@description, description),
      category_id = COALESCE(@category_id, category_id),
      city = COALESCE(@city, city),
      state = COALESCE(@state, state),
      logo_url = COALESCE(@logo_url, logo_url),
      cover_url = COALESCE(@cover_url, cover_url),
      is_adult = COALESCE(@is_adult, is_adult),
      plan_id = COALESCE(@plan_id, plan_id)
    WHERE id = @id
  `);
  stmt.run({ ...data, id: req.params.id });
  return { ok: true };
});

app.delete('/businesses/:id', { preHandler: [app.auth] }, async (req, reply) => {
  const owner = db.prepare(`SELECT user_id FROM businesses WHERE id = ?`).get(req.params.id);
  if (!owner) return reply.code(404).send({ error: 'não encontrado' });
  if (owner.user_id !== req.user.id) return reply.code(403).send({ error: 'sem permissão' });
  db.prepare(`DELETE FROM products WHERE business_id = ?`).run(req.params.id);
  db.prepare(`DELETE FROM promotions WHERE business_id = ?`).run(req.params.id);
  db.prepare(`DELETE FROM businesses WHERE id = ?`).run(req.params.id);
  return { ok: true };
});

// -------- PRODUCTS ----------
app.post('/products', { preHandler: [app.auth] }, async (req, reply) => {
  const { business_id, title, price_cents = 0, promo_price_cents = null, image_url = '', is_adult = 0 } = req.body || {};
  if (!business_id || !title) return reply.code(400).send({ error: 'dados obrigatórios' });
  const owner = db.prepare(`SELECT user_id FROM businesses WHERE id = ?`).get(business_id);
  if (!owner || owner.user_id !== req.user.id) return reply.code(403).send({ error: 'sem permissão' });
  const info = db.prepare(`
    INSERT INTO products (business_id, title, price_cents, promo_price_cents, image_url, is_adult)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(business_id, title, price_cents, promo_price_cents, image_url, is_adult ? 1 : 0);
  return { id: info.lastInsertRowid };
});

app.delete('/products/:id', { preHandler: [app.auth] }, async (req, reply) => {
  const prod = db.prepare(`SELECT p.*, b.user_id FROM products p JOIN businesses b ON b.id = p.business_id WHERE p.id = ?`).get(req.params.id);
  if (!prod) return reply.code(404).send({ error: 'não encontrado' });
  if (prod.user_id !== req.user.id) return reply.code(403).send({ error: 'sem permissão' });
  db.prepare(`DELETE FROM products WHERE id = ?`).run(req.params.id);
  return { ok: true };
});

// -------- PROMOTIONS ----------
app.post('/promotions', { preHandler: [app.auth] }, async (req, reply) => {
  const { business_id, title, description = '', valid_until = null } = req.body || {};
  const owner = db.prepare(`SELECT user_id FROM businesses WHERE id = ?`).get(business_id);
  if (!owner || owner.user_id !== req.user.id) return reply.code(403).send({ error: 'sem permissão' });
  const info = db.prepare(`INSERT INTO promotions (business_id, title, description, valid_until) VALUES (?, ?, ?, ?)`)
    .run(business_id, title, description, valid_until);
  return { id: info.lastInsertRowid };
});

// -------- SEARCH / EXPLORE ----------
app.get('/search', async (req) => {
  const { q = '', category = '', adult = 'all' } = req.query || {};
  const params = [];
  let sql = `
    SELECT b.*, c.name AS category_name, p.name AS plan_name, p.rank
    FROM businesses b
    LEFT JOIN categories c ON c.id = b.category_id
    LEFT JOIN plans p ON p.id = b.plan_id
    WHERE 1=1
  `;
  if (q) { sql += ` AND (b.name LIKE ? OR b.description LIKE ?) `; params.push(`%${q}%`, `%${q}%`); }
  if (category) { sql += ` AND c.slug = ? `; params.push(category); }
  if (adult === 'only') sql += ` AND b.is_adult = 1 `;
  if (adult === 'no') sql += ` AND b.is_adult = 0 `;
  sql += ` ORDER BY p.rank DESC, b.created_at DESC LIMIT 100 `;
  const rows = db.prepare(sql).all(...params);
  return { results: rows };
});

// -------- START ----------
const port = Number(process.env.PORT || 4000);
app.listen({ port, host: '0.0.0.0' }).then(() => {
  console.log('VitroNexo API ON http://localhost:' + port);
});
