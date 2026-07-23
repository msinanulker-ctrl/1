const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4242;
const JWT_SECRET = process.env.JWT_SECRET || 'elara-secret-2026';
const DB_DIR = path.join(__dirname, 'db');

// ── JSON file DB ──
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR);

function readDB(name) {
  const file = path.join(DB_DIR, name + '.json');
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeDB(name, data) {
  fs.writeFileSync(path.join(DB_DIR, name + '.json'), JSON.stringify(data, null, 2));
}

function nextId(arr) {
  return arr.length ? Math.max(...arr.map(r => r.id)) + 1 : 1;
}

// ── Seed ──
if (!readDB('admins').length) {
  writeDB('admins', [{ id: 1, username: 'admin', password: bcrypt.hashSync('admin123', 10) }]);
  console.log('Default admin: admin / admin123');
}

if (!readDB('profiles').length) {
  writeDB('profiles', [
    { id:1,  name:'Sofia',  age:27, city:'İstanbul', languages:'Türkçe, İngilizce',            tags:'VIP,Sosyal,Seyahat',    tier:'vip',      hue:18,  bio:'Hukuk eğitimi almış, birden fazla dil konuşan biri olarak her ortama kolayca uyum sağlarım.', sponsored:true,  active:true },
    { id:2,  name:'Neva',   age:29, city:'İzmir',    languages:'Türkçe, İngilizce, İtalyanca',  tags:'VIP,Kurumsal',          tier:'vip',      hue:210, bio:"İzmir doğumlu, İtalya'da eğitim görmüş. Sanat ve müzik tutkunu.",                           sponsored:true,  active:true },
    { id:3,  name:'Ceren',  age:27, city:'İstanbul', languages:'Türkçe, Fransızca, İngilizce',  tags:'VIP,Özel Akşam',        tier:'vip',      hue:340, bio:'Fransız edebiyatı mezunu, şehrin en iyi restoranlarını ezberden bilirim.',                 sponsored:true,  active:true },
    { id:4,  name:'Elif',   age:26, city:'İstanbul', languages:'Türkçe, Almanca',               tags:'VIP,Sosyal,Seyahat',    tier:'vip',      hue:280, bio:"Almanya'da büyüdüm, iki kültür arasında köprü kurabilirim.",                              sponsored:false, active:true },
    { id:5,  name:'Lara',   age:23, city:'İstanbul', languages:'Türkçe, Rusça, İngilizce',     tags:'VIP,Özel Akşam',        tier:'vip',      hue:160, bio:'Rusya kökenli, üç dil konuşuyorum. Dans ve tiyatro ilgi alanlarım.',                      sponsored:false, active:true },
    { id:6,  name:'Zeynep', age:25, city:'İstanbul', languages:'Türkçe, Arapça, İngilizce',    tags:'VIP,Kurumsal,Seyahat',  tier:'vip',      hue:55,  bio:"Orta Doğu iş dünyasına yönelik etkinliklerde deneyimliyim.",                             sponsored:false, active:true },
    { id:7,  name:'Yıldız', age:32, city:'İzmir',    languages:'Türkçe, İngilizce, Japonca',   tags:'VIP,Seyahat',           tier:'vip',      hue:140, bio:"Japonya'da iki yıl yaşadım. Minimalist yaşam tarzını benimsiyorum.",                     sponsored:false, active:true },
    { id:8,  name:'Alara',  age:24, city:'Ankara',   languages:'Türkçe, Fransızca',             tags:'Sosyal,Kurumsal',       tier:'standard', hue:210, bio:'Ankara Üniversitesi mezunu, protokol etkinliklerinde tecrübeli.',                        sponsored:false, active:true },
    { id:9,  name:'Mira',   age:31, city:'Ankara',   languages:'Türkçe, İngilizce',             tags:'Kurumsal,Sosyal',       tier:'standard', hue:340, bio:'Siyaset bilimi mezunu, kurumsal etkinliklerde rahat ve temsil gücü yüksek.',             sponsored:false, active:true },
    { id:10, name:'Derin',  age:28, city:'İzmir',    languages:'Türkçe, İspanyolca',            tags:'Seyahat,Sosyal',        tier:'standard', hue:190, bio:"İspanya'da yaşadım, seyahat etmeyi ve yeni insanlarla tanışmayı seviyorum.",             sponsored:false, active:true },
    { id:11, name:'Berin',  age:30, city:'Ankara',   languages:'Türkçe, İngilizce',             tags:'Seyahat,Sosyal',        tier:'standard', hue:240, bio:'Doğa sporlarına ilgi duyuyorum, enerjik ve pozitifim.',                                  sponsored:false, active:true },
    { id:12, name:'Rüya',   age:22, city:'İstanbul', languages:'Türkçe, Rusça',                 tags:'Sosyal,Özel Akşam',     tier:'standard', hue:0,   bio:'Genç ve dinamik; müzik, sinema ve şehir hayatı benim dünyam.',                          sponsored:false, active:true },
    { id:13, name:'Selin',  age:25, city:'İzmir',    languages:'Türkçe, İngilizce',             tags:'Sosyal,Seyahat',        tier:'standard', hue:40,  bio:'Ege yaşam tarzını benimseyen, sıcak ve samimi biri.',                                    sponsored:false, active:true },
    { id:14, name:'Aylin',  age:27, city:'Ankara',   languages:'Türkçe, Fransızca',             tags:'Kurumsal,Sosyal',       tier:'standard', hue:320, bio:'Fransız dili öğretmeni, kültür ve sanat etkinliklerine meraklı.',                        sponsored:false, active:true },
    { id:15, name:'Deniz',  age:29, city:'İstanbul', languages:'Türkçe, İngilizce',             tags:'Özel Akşam,Sosyal',     tier:'standard', hue:100, bio:'Mutfak sanatlarına tutkulu, şehrin en iyi mekanlarını tanıyorum.',                       sponsored:false, active:true },
  ]);
}

if (!readDB('blog').length) {
  const now = new Date().toISOString().slice(0,10);
  writeDB('blog', [
    { id:1, title:"Cannes'da Bir Hafta: Film Festivali ve Özel Refakat",    excerpt:"Güney Fransa'nın en prestijli etkinliğinde nasıl bir eşlik deneyimi yaşanır?", category:'Seyahat', content:'', published_at: now, active:true },
    { id:2, title:"İstanbul'un En Seçkin Restoranları",                     excerpt:"Nişantaşı'ndan Bebek'e, şehrin gözde mekanlarında akşam yemeği için bilmeniz gerekenler.", category:'Rehber',  content:'', published_at: now, active:true },
    { id:3, title:"Kurumsal Etkinliklerde Refakat: İlk İzlenim Her Şeydir", excerpt:"İş dünyasının yüksek profilli daveti için doğru eşlikçiyi seçmek neden kritik?", category:'VIP',     content:'', published_at: now, active:true },
    { id:4, title:"Gizlilik Bir Lüks Değil, Temel Bir Haktır",             excerpt:"Elara'nın veri güvenliği ve anonimlik politikası hakkında şeffaf bir değerlendirme.", category:'Yaşam',   content:'', published_at: now, active:true },
    { id:5, title:"Dubai, Doha, Abu Dhabi: Körfez Şehirlerinde Refakat",   excerpt:"Farklı kültürlerde refakat etiketi nasıl şekillenir?", category:'Seyahat', content:'', published_at: now, active:true },
    { id:6, title:"İlk Buluşmadan Önce: Beklentileri Doğru Yönetmek",     excerpt:"Hem müşterilerimiz hem de kadromuz için sorunsuz bir ilk deneyim için ipuçları.", category:'Rehber',  content:'', published_at: now, active:true },
  ]);
}

// ── Middleware ──
app.use(express.json());
app.use(express.static(__dirname));

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Yetkisiz' });
  try { req.admin = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Token geçersiz' }); }
}

// ── Auth ──
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const admin = readDB('admins').find(a => a.username === username);
  if (!admin || !bcrypt.compareSync(password, admin.password))
    return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı' });
  const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, username: admin.username });
});

// ── Profiles (public) ──
app.get('/api/profiles', (req, res) => {
  const all = readDB('profiles').filter(p => p.active);
  all.sort((a, b) => (b.sponsored ? 1 : 0) - (a.sponsored ? 1 : 0) || (b.tier === 'vip' ? 1 : 0) - (a.tier === 'vip' ? 1 : 0));
  res.json(all);
});

// ── Profiles (admin) ──
app.post('/api/profiles', auth, (req, res) => {
  const profiles = readDB('profiles');
  const p = { id: nextId(profiles), active: true, ...req.body };
  profiles.push(p);
  writeDB('profiles', profiles);
  res.json({ id: p.id });
});

app.put('/api/profiles/:id', auth, (req, res) => {
  const profiles = readDB('profiles');
  const i = profiles.findIndex(p => p.id === +req.params.id);
  if (i < 0) return res.status(404).json({ error: 'Bulunamadı' });
  profiles[i] = { ...profiles[i], ...req.body, id: +req.params.id };
  writeDB('profiles', profiles);
  res.json({ ok: true });
});

app.delete('/api/profiles/:id', auth, (req, res) => {
  const profiles = readDB('profiles');
  const i = profiles.findIndex(p => p.id === +req.params.id);
  if (i >= 0) { profiles[i].active = false; writeDB('profiles', profiles); }
  res.json({ ok: true });
});

// ── Blog (public) ──
app.get('/api/blog', (req, res) => {
  res.json(readDB('blog').filter(p => p.active).sort((a, b) => b.id - a.id));
});

// ── Blog (admin) ──
app.post('/api/blog', auth, (req, res) => {
  const posts = readDB('blog');
  const p = { id: nextId(posts), active: true, published_at: new Date().toISOString().slice(0,10), ...req.body };
  posts.push(p);
  writeDB('blog', posts);
  res.json({ id: p.id });
});

app.put('/api/blog/:id', auth, (req, res) => {
  const posts = readDB('blog');
  const i = posts.findIndex(p => p.id === +req.params.id);
  if (i < 0) return res.status(404).json({ error: 'Bulunamadı' });
  posts[i] = { ...posts[i], ...req.body, id: +req.params.id };
  writeDB('blog', posts);
  res.json({ ok: true });
});

app.delete('/api/blog/:id', auth, (req, res) => {
  const posts = readDB('blog');
  const i = posts.findIndex(p => p.id === +req.params.id);
  if (i >= 0) { posts[i].active = false; writeDB('blog', posts); }
  res.json({ ok: true });
});

// ── Stats (admin) ──
app.get('/api/stats', auth, (req, res) => {
  const profiles = readDB('profiles').filter(p => p.active);
  res.json({
    profiles:  profiles.length,
    vip:       profiles.filter(p => p.tier === 'vip').length,
    sponsored: profiles.filter(p => p.sponsored).length,
    blog:      readDB('blog').filter(p => p.active).length,
  });
});

app.listen(PORT, () => console.log(`Elara → http://localhost:${PORT}`));
