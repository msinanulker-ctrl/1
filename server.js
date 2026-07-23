const express = require('express');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4242;
const JWT_SECRET = process.env.JWT_SECRET || 'elara-secret-2026';

// DB
const dbDir = path.join(__dirname, 'db');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir);
const db = new Database(path.join(dbDir, 'elara.db'));

// Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER,
    city TEXT,
    languages TEXT,
    tags TEXT,
    tier TEXT DEFAULT 'standard',
    hue INTEGER DEFAULT 18,
    bio TEXT,
    sponsored INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS blog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT,
    category TEXT,
    published_at TEXT DEFAULT (datetime('now')),
    active INTEGER DEFAULT 1
  );
`);

// Seed admin if none exists
const adminCount = db.prepare('SELECT COUNT(*) as c FROM admins').get();
if (adminCount.c === 0) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO admins (username, password) VALUES (?, ?)').run('admin', hash);
  console.log('Default admin created: admin / admin123');
}

// Seed sample profiles
const profileCount = db.prepare('SELECT COUNT(*) as c FROM profiles').get();
if (profileCount.c === 0) {
  const profiles = [
    { name: 'Sofia',  age: 27, city: 'İstanbul', languages: 'Türkçe, İngilizce',         tags: 'VIP,Sosyal,Seyahat',    tier: 'vip',      hue: 18,  bio: 'Hukuk eğitimi almış, birden fazla dil konuşan biri olarak her ortama kolayca uyum sağlarım.',  sponsored: 1 },
    { name: 'Neva',   age: 29, city: 'İzmir',    languages: 'Türkçe, İngilizce, İtalyanca', tags: 'VIP,Kurumsal',         tier: 'vip',      hue: 210, bio: 'İzmir doğumlu, İtalya\'da eğitim görmüş. Sanat ve müzik tutkunu.',                            sponsored: 1 },
    { name: 'Ceren',  age: 27, city: 'İstanbul', languages: 'Türkçe, Fransızca, İngilizce', tags: 'VIP,Özel Akşam',       tier: 'vip',      hue: 340, bio: 'Fransız edebiyatı mezunu, şehrin en iyi restoranlarını ezberden bilirim.',                    sponsored: 1 },
    { name: 'Elif',   age: 26, city: 'İstanbul', languages: 'Türkçe, Almanca',              tags: 'VIP,Sosyal,Seyahat',   tier: 'vip',      hue: 280, bio: 'Almanya\'da büyüdüm, iki kültür arasında köprü kurabilirim.',                                 sponsored: 0 },
    { name: 'Lara',   age: 23, city: 'İstanbul', languages: 'Türkçe, Rusça, İngilizce',    tags: 'VIP,Özel Akşam',       tier: 'vip',      hue: 160, bio: 'Rusya kökenli, üç dil konuşuyorum. Dans ve tiyatro ilgi alanlarım.',                          sponsored: 0 },
    { name: 'Zeynep', age: 25, city: 'İstanbul', languages: 'Türkçe, Arapça, İngilizce',   tags: 'VIP,Kurumsal,Seyahat', tier: 'vip',      hue: 55,  bio: 'Orta Doğu iş dünyasına yönelik etkinliklerde deneyimliyim.',                                  sponsored: 0 },
    { name: 'Yıldız', age: 32, city: 'İzmir',    languages: 'Türkçe, İngilizce, Japonca',  tags: 'VIP,Seyahat',          tier: 'vip',      hue: 140, bio: 'Japonya\'da iki yıl yaşadım. Minimalist yaşam tarzını benimsiyorum.',                         sponsored: 0 },
    { name: 'Alara',  age: 24, city: 'Ankara',   languages: 'Türkçe, Fransızca',            tags: 'Sosyal,Kurumsal',      tier: 'standard', hue: 210, bio: 'Ankara Üniversitesi mezunu, protokol etkinliklerinde tecrübeli.',                             sponsored: 0 },
    { name: 'Mira',   age: 31, city: 'Ankara',   languages: 'Türkçe, İngilizce',            tags: 'Kurumsal,Sosyal',      tier: 'standard', hue: 340, bio: 'Siyaset bilimi mezunu, kurumsal etkinliklerde rahat ve temsil gücü yüksek.',                  sponsored: 0 },
    { name: 'Derin',  age: 28, city: 'İzmir',    languages: 'Türkçe, İspanyolca',           tags: 'Seyahat,Sosyal',       tier: 'standard', hue: 190, bio: 'İspanya\'da yaşadım, seyahat etmeyi ve yeni insanlarla tanışmayı seviyorum.',                  sponsored: 0 },
    { name: 'Berin',  age: 30, city: 'Ankara',   languages: 'Türkçe, İngilizce',            tags: 'Seyahat,Sosyal',       tier: 'standard', hue: 240, bio: 'Doğa sporlarına ilgi duyuyorum, enerjik ve pozitifim.',                                        sponsored: 0 },
    { name: 'Rüya',   age: 22, city: 'İstanbul', languages: 'Türkçe, Rusça',                tags: 'Sosyal,Özel Akşam',    tier: 'standard', hue: 0,   bio: 'Genç ve dinamik; müzik, sinema ve şehir hayatı benim dünyam.',                               sponsored: 0 },
    { name: 'Selin',  age: 25, city: 'İzmir',    languages: 'Türkçe, İngilizce',            tags: 'Sosyal,Seyahat',       tier: 'standard', hue: 40,  bio: 'Ege yaşam tarzını benimseyen, sıcak ve samimi biri.',                                         sponsored: 0 },
    { name: 'Aylin',  age: 27, city: 'Ankara',   languages: 'Türkçe, Fransızca',            tags: 'Kurumsal,Sosyal',      tier: 'standard', hue: 320, bio: 'Fransız dili öğretmeni, kültür ve sanat etkinliklerine meraklı.',                             sponsored: 0 },
    { name: 'Deniz',  age: 29, city: 'İstanbul', languages: 'Türkçe, İngilizce',            tags: 'Özel Akşam,Sosyal',    tier: 'standard', hue: 100, bio: 'Mutfak sanatlarına tutkulu, şehrin en iyi mekanlarını tanıyorum.',                            sponsored: 0 },
  ];
  const ins = db.prepare('INSERT INTO profiles (name,age,city,languages,tags,tier,hue,bio,sponsored) VALUES (?,?,?,?,?,?,?,?,?)');
  profiles.forEach(p => ins.run(p.name, p.age, p.city, p.languages, p.tags, p.tier, p.hue, p.bio, p.sponsored));
}

// Seed blog
const blogCount = db.prepare('SELECT COUNT(*) as c FROM blog').get();
if (blogCount.c === 0) {
  const posts = [
    { title: "Cannes'da Bir Hafta: Film Festivali ve Özel Refakat",     excerpt: "Güney Fransa'nın en prestijli etkinliğinde nasıl bir eşlik deneyimi yaşanır? Sofia'nın gözünden Cannes günlüğü.", category: 'Seyahat' },
    { title: "İstanbul'un En Seçkin Restoranları: Masa Rezervasyonu",   excerpt: "Nişantaşı'ndan Bebek'e, şehrin gözde mekanlarında akşam yemeği için bilmeniz gerekenler.", category: 'Rehber' },
    { title: "Kurumsal Etkinliklerde Refakat: İlk İzlenim Her Şeydir",  excerpt: "İş dünyasının yüksek profilli daveti için doğru eşlikçiyi seçmek neden kritik öneme sahip?", category: 'VIP' },
    { title: "Gizlilik Bir Lüks Değil, Temel Bir Haktır",              excerpt: "Elara'nın veri güvenliği ve anonimlik politikası hakkında şeffaf bir değerlendirme.", category: 'Yaşam' },
    { title: "Dubai, Doha, Abu Dhabi: Körfez Şehirlerinde Refakat",    excerpt: "Farklı kültürlerde refakat etiketi nasıl şekillenir? Körfez seyahatlerinde dikkat edilmesi gerekenler.", category: 'Seyahat' },
    { title: "İlk Buluşmadan Önce: Beklentileri Doğru Yönetmek",      excerpt: "Hem müşterilerimiz hem de kadromuz için sorunsuz bir ilk deneyim için pratik ipuçları.", category: 'Rehber' },
  ];
  const ins = db.prepare('INSERT INTO blog (title,excerpt,category) VALUES (?,?,?)');
  posts.forEach(p => ins.run(p.title, p.excerpt, p.category));
}

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Auth middleware
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Yetkisiz' });
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token geçersiz' });
  }
}

/* ── Auth ── */
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
  if (!admin || !bcrypt.compareSync(password, admin.password))
    return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı' });
  const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, username: admin.username });
});

/* ── Profiles (public) ── */
app.get('/api/profiles', (req, res) => {
  const profiles = db.prepare('SELECT * FROM profiles WHERE active = 1 ORDER BY sponsored DESC, tier DESC, id').all();
  res.json(profiles);
});

/* ── Profiles (admin) ── */
app.post('/api/profiles', auth, (req, res) => {
  const { name, age, city, languages, tags, tier, hue, bio, sponsored } = req.body;
  const r = db.prepare('INSERT INTO profiles (name,age,city,languages,tags,tier,hue,bio,sponsored) VALUES (?,?,?,?,?,?,?,?,?)').run(name, age, city, languages, tags, tier||'standard', hue||18, bio||'', sponsored?1:0);
  res.json({ id: r.lastInsertRowid });
});

app.put('/api/profiles/:id', auth, (req, res) => {
  const { name, age, city, languages, tags, tier, hue, bio, sponsored, active } = req.body;
  db.prepare('UPDATE profiles SET name=?,age=?,city=?,languages=?,tags=?,tier=?,hue=?,bio=?,sponsored=?,active=? WHERE id=?')
    .run(name, age, city, languages, tags, tier, hue, bio||'', sponsored?1:0, active?1:0, req.params.id);
  res.json({ ok: true });
});

app.delete('/api/profiles/:id', auth, (req, res) => {
  db.prepare('UPDATE profiles SET active = 0 WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

/* ── Blog (public) ── */
app.get('/api/blog', (req, res) => {
  const posts = db.prepare('SELECT * FROM blog WHERE active = 1 ORDER BY published_at DESC').all();
  res.json(posts);
});

/* ── Blog (admin) ── */
app.post('/api/blog', auth, (req, res) => {
  const { title, excerpt, content, category } = req.body;
  const r = db.prepare('INSERT INTO blog (title,excerpt,content,category) VALUES (?,?,?,?)').run(title, excerpt||'', content||'', category||'');
  res.json({ id: r.lastInsertRowid });
});

app.put('/api/blog/:id', auth, (req, res) => {
  const { title, excerpt, content, category, active } = req.body;
  db.prepare('UPDATE blog SET title=?,excerpt=?,content=?,category=?,active=? WHERE id=?')
    .run(title, excerpt||'', content||'', category||'', active?1:0, req.params.id);
  res.json({ ok: true });
});

app.delete('/api/blog/:id', auth, (req, res) => {
  db.prepare('UPDATE blog SET active = 0 WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

/* ── Stats (admin) ── */
app.get('/api/stats', auth, (req, res) => {
  res.json({
    profiles: db.prepare('SELECT COUNT(*) as c FROM profiles WHERE active=1').get().c,
    vip:      db.prepare('SELECT COUNT(*) as c FROM profiles WHERE active=1 AND tier="vip"').get().c,
    sponsored:db.prepare('SELECT COUNT(*) as c FROM profiles WHERE active=1 AND sponsored=1').get().c,
    blog:     db.prepare('SELECT COUNT(*) as c FROM blog WHERE active=1').get().c,
  });
});

app.listen(PORT, () => console.log(`Elara server → http://localhost:${PORT}`));
