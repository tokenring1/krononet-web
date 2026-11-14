// Site üretici: `node _uret.js` → tüm sayfalar + sitemap.xml + robots.txt
// Alt çizgiyle başladığı için GitHub Pages (Jekyll) bu dosyayı yayımlamaz.
// privacy.html ve hesap-silme.html elle yazılır, buraya dokunulmaz.
const fs = require('fs');
const path = require('path');

const SITE = 'https://krononet.com';
const PLAY = 'https://play.google.com/store/apps/details?id=com.krononet.app';
const bugun = new Date().toISOString().slice(0, 10);
const play = (k) => `${PLAY}&referrer=${encodeURIComponent(`utm_source=krononet.com&utm_medium=web&utm_campaign=${k}`)}`;
const kacis = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// ───────────── Veriler ─────────────
const GUN_ADI = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const AY_ADI = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const tarihYaz = (iso, gunlu = true) => {
  const [y, a, g] = iso.split('-').map(Number);
  const d = new Date(Date.UTC(y, a - 1, g));
  return `${g} ${AY_ADI[a - 1]} ${y}${gunlu ? ' ' + GUN_ADI[d.getUTCDay()] : ''}`;
};
const aralik = (a, b) => {
  if (!a) return '—';
  const [, a1, g1] = a.split('-').map(Number), [, a2, g2] = b.split('-').map(Number);
  return a1 === a2 ? `${g1}–${g2} ${AY_ADI[a1 - 1]}` : `${g1} ${AY_ADI[a1 - 1]} – ${g2} ${AY_ADI[a2 - 1]}`;
};

// ÖSYM 2027 takvimi (28 Ekim 2026) + MEB 2027 sınav takvimi (30 Ekim 2026).
// [ad, kategori, kurum, sınav, sınav bitiş?, başvuru başlangıç, başvuru bitiş, sonuç, not?, bağlantı?]
const TAKVIM = [
  ['YÖKDİL/1', 'dil', 'ÖSYM', '2027-02-28', null, '2027-01-12', '2027-01-20', '2027-03-26'],
  ['MSÜ', 'lise', 'ÖSYM', '2027-03-20', null, '2027-01-13', '2027-02-10', '2027-04-15', 'Millî Savunma Üniversitesi'],
  ['TUS 1. Dönem', 'tip', 'ÖSYM', '2027-03-27', null, '2027-02-02', '2027-02-10', '2027-04-22'],
  ['YDS/1', 'dil', 'ÖSYM', '2027-03-28', null, '2027-02-03', '2027-02-11', '2027-04-21'],
  ['ALES/1', 'dil', 'ÖSYM', '2027-04-18', null, '2027-02-24', '2027-03-04', '2027-05-07'],
  ['YDUS', 'tip', 'ÖSYM', '2027-05-02', null, null, null, '2027-06-04'],
  ['MEB-AGS', 'kpss', 'ÖSYM', '2027-05-08', null, '2027-03-19', '2027-03-29', '2027-06-11', 'Akademi Giriş Sınavı'],
  ['ÖABT', 'kpss', 'ÖSYM', '2027-05-09', null, '2027-03-19', '2027-03-29', '2027-06-11', 'Öğretmenlik Alan Bilgisi'],
  ['LGS', 'lise', 'MEB', '2027-06-13', null, null, null, null, 'Liselere Geçiş Sistemi merkezi sınavı', '/lgs-kac-gun-kaldi/'],
  ['YKS – TYT', 'lise', 'ÖSYM', '2027-06-19', null, '2027-02-04', '2027-03-02', '2027-07-21', 'Geç başvuru 16–18 Mart', '/yks-kac-gun-kaldi/'],
  ['YKS – AYT ve YDT', 'lise', 'ÖSYM', '2027-06-20', null, '2027-02-04', '2027-03-02', '2027-07-21', 'Geç başvuru 16–18 Mart'],
  ['ALES/2', 'dil', 'ÖSYM', '2027-07-11', null, '2027-05-25', '2027-06-02', '2027-07-30'],
  ['DGS', 'dil', 'ÖSYM', '2027-07-18', null, '2027-05-26', '2027-06-03', '2027-08-12', 'Dikey Geçiş Sınavı'],
  ['YÖKDİL/2', 'dil', 'ÖSYM', '2027-07-25', null, '2027-06-08', '2027-06-16', '2027-08-13'],
  ['TUS 2. Dönem', 'tip', 'ÖSYM', '2027-08-22', null, '2027-07-05', '2027-07-13', '2027-09-16'],
  ['KPSS Lisans GY-GK', 'kpss', 'ÖSYM', '2027-09-12', null, '2027-07-08', '2027-07-19', '2027-10-13', 'A Grubu ve öğretmenlik', '/kpss-kac-gun-kaldi/'],
  ['KPSS Alan Bilgisi', 'kpss', 'ÖSYM', '2027-09-18', '2027-09-19', '2027-07-08', '2027-07-19', '2027-10-13'],
  ['DUS', 'tip', 'ÖSYM', '2027-10-24', null, '2027-09-07', '2027-09-15', '2027-11-18'],
  ['EUS', 'tip', 'ÖSYM', '2027-11-06', null, null, null, '2027-11-25'],
  ['YDS/2', 'dil', 'ÖSYM', '2027-11-21', null, '2027-10-05', '2027-10-13', '2027-12-10'],
  ['ALES/3', 'dil', 'ÖSYM', '2027-11-28', null, '2027-10-12', '2027-10-20', '2027-12-17'],
];
const KATEGORI = { lise: 'YKS · LGS · MSÜ', kpss: 'KPSS · Öğretmenlik', dil: 'ALES · DGS · Dil', tip: 'Tıp · Diş' };

// Kaynak: Krononet/src/hazirSablonlar.ts — orası değişirse burayı da güncelle.
// [ders, kaynak, soru, dakika, günler (1=Pzt..6=Cmt), saat]
const HG = [1, 2, 3, 4, 5, 6], HI = [1, 2, 3, 4, 5];
const PROGRAMLAR = [
  { slug: 'lgs', ad: 'LGS Haftalık Çalışma Programı', kisa: 'LGS', krono: 'sinav',
    not: '8. sınıf için okul sonrası: her gün Matematik, gün aşırı Türkçe ve Fen, kısa bir sözel ders. 18:00–20:00 arası, günde yaklaşık 1,5 saat.',
    dersler: [
      ['Türkçe', 'Branş Denemesi', 20, 30, [1, 3, 5], '18:00'], ['Fen Bilimleri', 'Branş Denemesi', 20, 40, [2, 4, 6], '18:00'],
      ['Matematik', 'Branş Denemesi', 20, 40, HG, '18:50'], ['T.C. İnkılap Tarihi', 'Branş Denemesi', 10, 15, [1, 4], '19:45'],
      ['İngilizce', 'Branş Denemesi', 10, 15, [2, 5], '19:45'], ['Din Kültürü', 'Branş Denemesi', 10, 15, [3, 6], '19:45']] },
  { slug: 'tyt', ad: 'TYT Haftalık Çalışma Programı', kisa: 'TYT', krono: 'sinav',
    not: 'Her gün Türkçe ve Matematik branş denemesi; Fen, Sosyal ve Geometri soru bankasıyla haftaya yayılır. Pazar dinlenme ve telafi günü.',
    dersler: [
      ['Türkçe', 'Branş Denemesi', 40, 45, HG, '18:00'], ['Matematik', 'Branş Denemesi', 30, 34, HG, '18:55'],
      ['Fizik', 'Soru Bankası', 15, 20, [1, 4], '19:40'], ['Kimya', 'Soru Bankası', 15, 20, [2, 5], '19:40'],
      ['Biyoloji', 'Soru Bankası', 15, 20, [3, 6], '19:40'], ['Geometri', 'Soru Bankası', 15, 20, [1, 3, 5], '20:10'],
      ['Tarih', 'Soru Bankası', 15, 20, [2], '20:10'], ['Coğrafya', 'Soru Bankası', 15, 20, [4], '20:10'],
      ['Felsefe', 'Soru Bankası', 15, 20, [6], '20:10'], ['Din Kültürü', 'Soru Bankası', 15, 20, [6], '20:40']] },
  { slug: 'ayt-sayisal', ad: 'AYT Sayısal Haftalık Çalışma Programı', kisa: 'AYT Sayısal', krono: 'odakli',
    not: 'Her gün AYT Matematik branş denemesi; Fizik, Kimya ve Biyoloji haftada ikişer kez, Geometri üç kez.',
    dersler: [
      ['Matematik', 'Branş Denemesi', 30, 68, HG, '18:00'], ['Geometri', 'Soru Bankası', 15, 25, [1, 3, 5], '19:20'],
      ['Fizik', 'Branş Denemesi', 14, 32, [2, 4], '19:20'], ['Kimya', 'Branş Denemesi', 13, 29, [2, 5], '20:05'],
      ['Biyoloji', 'Branş Denemesi', 13, 29, [4, 6], '20:05']] },
  { slug: 'ayt-esit-agirlik', ad: 'AYT Eşit Ağırlık Haftalık Çalışma Programı', kisa: 'AYT Eşit Ağırlık', krono: 'odakli',
    not: 'Her gün AYT Matematik; Edebiyat haftada üç kez branş denemesi, Tarih ve Coğrafya ikişer kez soru bankası.',
    dersler: [
      ['Matematik', 'Branş Denemesi', 30, 68, HG, '18:00'], ['Türk Edebiyatı', 'Branş Denemesi', 24, 54, [1, 3, 5], '19:20'],
      ['Geometri', 'Soru Bankası', 15, 25, [1, 5], '20:25'], ['Tarih', 'Soru Bankası', 15, 25, [2, 4], '19:20'],
      ['Coğrafya', 'Soru Bankası', 15, 25, [2, 4], '19:55']] },
  { slug: 'kpss', ad: 'KPSS GY-GK Haftalık Çalışma Programı', kisa: 'KPSS GY-GK', krono: 'odakli',
    not: 'Hafta içi akşam Genel Yetenek ve Genel Kültür soru bankası; Cumartesi sabah iki oturumluk tam deneme. Çalışanlara uygun.',
    dersler: [
      ['Genel Yetenek', 'Soru Bankası', 30, 30, HI, '19:00'], ['Genel Kültür', 'Soru Bankası', 30, 30, HI, '19:40'],
      ['Genel Yetenek', 'Branş Denemesi', 60, 60, [6], '10:00'], ['Genel Kültür', 'Branş Denemesi', 60, 60, [6], '11:30']] },
];

// ───────────── Ortak parçalar ─────────────
const MENU = [
  ['/yks-net-hesaplama/', 'Net Hesaplama'],
  ['/sinav-takvimi-2027/', 'Sınav Takvimi'],
  ['/calisma-programi/', 'Çalışma Programları'],
  ['/yks-kac-gun-kaldi/', 'Geri Sayım'],
  ['/#kimler', 'Veli & Koç'],
];
const ARACLAR = [
  ['/yks-net-hesaplama/', 'YKS Net Hesaplama', 'TYT · AYT · YDT', '🧮'],
  ['/lgs-net-hesaplama/', 'LGS Net Hesaplama', '3 yanlış 1 doğru', '🧮'],
  ['/kpss-net-hesaplama/', 'KPSS Net Hesaplama', 'Genel Yetenek · Genel Kültür', '🧮'],
  ['/yks-kac-gun-kaldi/', 'YKS\'ye Kaç Gün Kaldı?', '19 Haziran 2027', '⏳'],
  ['/lgs-kac-gun-kaldi/', 'LGS\'ye Kaç Gün Kaldı?', '13 Haziran 2027', '⏳'],
  ['/kpss-kac-gun-kaldi/', 'KPSS\'ye Kaç Gün Kaldı?', '12 Eylül 2027', '⏳'],
];

function sablon({ yol, baslik, aciklama, govde, ld = [], kampanya = 'site', tamGenislik = false }) {
  const url = SITE + yol;
  const menu = MENU.map(([h, ad]) => `<a href="${h}"${!h.includes('#') && yol.startsWith(h) ? ' aria-current="page"' : ''}>${ad}</a>`).join('');
  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${kacis(baslik)}</title>
<meta name="description" content="${kacis(aciklama)}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#7c3aed">
<link rel="icon" type="image/png" href="/img/favicon.png">
<link rel="apple-touch-icon" href="/img/ikon.png">
<meta property="og:type" content="website">
<meta property="og:locale" content="tr_TR">
<meta property="og:site_name" content="Krononet">
<meta property="og:title" content="${kacis(baslik)}">
<meta property="og:description" content="${kacis(aciklama)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/img/paylas.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/site.css?v=${bugun}">
${ld.filter(Boolean).map((x) => `<script type="application/ld+json">${JSON.stringify(x)}</script>`).join('\n')}
</head>
<body>
<header class="nav"><div class="wrap">
  <a class="marka" href="/"><i>K</i>Krononet</a>
  <nav class="menu" aria-label="Ana menü">${menu}</nav>
  <a class="btn" href="${play(kampanya + '-menu')}">Uygulamayı İndir</a>
  <details class="hamburger"><summary aria-label="Menü">☰</summary><nav>${menu}<a href="${play(kampanya + '-menu')}"><b style="color:var(--accent)">▶ Uygulamayı İndir</b></a></nav></details>
</div></header>
${tamGenislik ? govde : `<main class="wrap">${govde}</main>`}
<footer><div class="wrap">
  <div class="sutun">
    <div><a class="marka" href="/"><i>K</i>Krononet</a><p>YKS, LGS, KPSS ve TUS öğrencileri için deneme programı, alarm ve net takibi. Öğrencilere ücretsiz.</p></div>
    <div><h4>Araçlar</h4>${ARACLAR.map(([h, ad]) => `<a href="${h}">${ad}</a>`).join('')}</div>
    <div><h4>Programlar</h4><a href="/sinav-takvimi-2027/">2027 Sınav Takvimi</a>${PROGRAMLAR.map((p) => `<a href="/calisma-programi/${p.slug}/">${p.kisa} Çalışma Programı</a>`).join('')}</div>
    <div><h4>Krononet</h4><a href="${play(kampanya + '-alt')}">Google Play'den İndir</a><a href="/#kimler">Veliler ve Koçlar</a><a href="/privacy.html">Gizlilik Politikası</a><a href="/hesap-silme.html">Hesap ve Veri Silme</a><a href="mailto:destek.krononet@gmail.com">İletişim</a></div>
  </div>
  <div class="alt"><span>© 2026 Krononet · Türkiye</span><span>destek.krononet@gmail.com</span></div>
</div></footer>
<script src="/assets/hesap.js?v=${bugun}" defer></script>
</body>
</html>
`;
}

const yolHaritasi = (parcalar) => {
  const html = `<div class="yol"><a href="/">Ana sayfa</a>${parcalar.map(([h, ad]) => ` › ${h ? `<a href="${h}">${ad}</a>` : ad}`).join('')}</div>`;
  const ld = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['/', 'Ana sayfa'], ...parcalar].map(([h, ad], i) => ({ '@type': 'ListItem', position: i + 1, name: ad, ...(h ? { item: SITE + h } : {}) })) };
  return { html, ld };
};
const baslikBlok = (h1, alt, krono) => `<div class="baslik">${krono ? `<img src="/img/${krono}.webp" alt="" width="104" height="104">` : ''}<div><h1>${h1}</h1>${alt ? `<p>${alt}</p>` : ''}</div></div>`;
const cta = (kampanya, b = 'Netlerini her seferinde yeniden hesaplama', s = 'Deneme saatini kur, alarm gelsin, netini gir. Krononet gelişimini senin yerine takip etsin.') =>
  `<div class="cta"><img src="/img/filiz.webp" alt="" width="96" height="96" loading="lazy"><div><b>${b}</b><span>${s}</span><a class="btn beyaz" href="${play(kampanya)}">▶ Google Play'den ücretsiz indir</a></div></div>`;
const sssBlok = (sss) => sss.length ? `<section class="dar" style="padding:20px 0 10px"><h2 style="font-size:24px;margin-bottom:14px">Sık sorulanlar</h2>${sss.map(([s, c]) => `<details class="sss"><summary>${s}</summary><p>${c}</p></details>`).join('')}</section>` : '';
const sssLd = (sss) => sss.length && { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: sss.map(([s, c]) => ({ '@type': 'Question', name: s, acceptedAnswer: { '@type': 'Answer', text: c.replace(/<[^>]+>/g, '') } })) };
const kutular = (liste, sinif = 'i3') => `<div class="izgara ${sinif}">${liste.map(([h, ad, a, ik]) => `<a class="kutu" href="${h}"><div class="ikon">${ik}</div><b>${ad}</b><span>${a}</span></a>`).join('')}</div>`;
const digerAraclar = (yol) => `<section style="padding:30px 0"><h2 style="font-size:24px">Diğer ücretsiz araçlar</h2>${kutular(ARACLAR.filter(([h]) => h !== yol))}</section>`;
const webApp = (ad, url) => ({ '@context': 'https://schema.org', '@type': 'WebApplication', name: ad, url, applicationCategory: 'EducationalApplication', operatingSystem: 'Any', inLanguage: 'tr', offers: { '@type': 'Offer', price: '0', priceCurrency: 'TRY' } });

const SAYFALAR = [];

// ───────────── Araç sayfaları ─────────────
function aracSayfasi({ yol, baslik, aciklama, h1, alt, krono, kampanya, arac, sss }) {
  const y = yolHaritasi([[null, h1.replace(/\?$/, '')]]);
  SAYFALAR.push({ yol, baslik, aciklama, kampanya, ld: [webApp(h1, SITE + yol), sssLd(sss), y.ld],
    govde: `${y.html}${baslikBlok(h1, alt, krono)}<div class="dar"><div class="kart">${arac}</div>${cta(kampanya)}</div>${sssBlok(sss)}${digerAraclar(yol)}` });
}
const sayacHtml = (iso, satir) => `<div class="sayac" data-sayac="${iso}"><div><b data-k="gun">–</b><span>gün</span></div><div><b data-k="saat">–</b><span>saat</span></div><div><b data-k="dk">–</b><span>dakika</span></div><div><b data-k="sn">–</b><span>saniye</span></div></div>
<div class="ekstra"><div><b data-k="hafta">–</b><span>hafta</span></div><div><b data-k="pazar">–</b><span>Pazar = deneme günü</span></div></div><p class="tarih">${satir}</p>`;

aracSayfasi({ yol: '/yks-net-hesaplama/', h1: 'YKS Net Hesaplama', krono: 'sinav', kampanya: 'yks-net',
  baslik: 'YKS Net Hesaplama 2027 – TYT, AYT, YDT Net Hesapla | Krononet',
  aciklama: 'TYT, AYT ve YDT netini ders ders hesapla. 4 yanlış 1 doğruyu götürür; AYT Sayısal, Eşit Ağırlık ve Sözel netlerin otomatik çıkar.',
  alt: 'TYT, AYT ve YDT · 4 yanlış 1 doğruyu götürür', arac: '<div data-sinavlar="tyt,ayt,ydt"></div>',
  sss: [
    ['YKS net nasıl hesaplanır?', 'Net = Doğru − (Yanlış ÷ 4). Örneğin 30 doğru 8 yanlış yaptıysan netin 30 − 2 = 28 olur. Boş bıraktığın sorular netini etkilemez.'],
    ['TYT\'de kaç yanlış bir doğruyu götürür?', 'TYT, AYT ve YDT\'de 4 yanlış 1 doğruyu götürür.'],
    ['AYT alan netleri nasıl çıkıyor?', 'Sayısal = Matematik + Fen Bilimleri; Eşit Ağırlık = Matematik + Türk Dili ve Edebiyatı–Sosyal Bilimler 1; Sözel = Türk Dili ve Edebiyatı–Sosyal Bilimler 1 + Sosyal Bilimler 2 testlerinin netleridir.'],
    ['TYT\'de hangi dersten kaç soru var?', 'Türkçe 40, Sosyal Bilimler 20 (Tarih 5, Coğrafya 5, Felsefe 5, Din Kültürü 5), Temel Matematik 40, Fen Bilimleri 20 (Fizik 7, Kimya 7, Biyoloji 6). Toplam 120 soru.'],
    ['AYT\'de hangi dersten kaç soru var?', 'Matematik 40; Fen Bilimleri 40 (Fizik 14, Kimya 13, Biyoloji 13); Türk Dili ve Edebiyatı–Sosyal Bilimler 1 40 (Edebiyat 24, Tarih-1 10, Coğrafya-1 6); Sosyal Bilimler 2 40 (Tarih-2 11, Coğrafya-2 11, Felsefe Grubu 12, Din Kültürü 6).'],
    ['Bu araç puanımı da hesaplıyor mu?', 'Hayır. YKS puanı, o yılın ortalama ve standart sapmasına göre ÖSYM tarafından hesaplanır. Bu araç yalnızca neti hesaplar.'],
    ['Girdiğim netler kaydediliyor mu?', 'Yalnızca kendi tarayıcında durur, hiçbir yere gönderilmez. Denemelerinin geçmişini tutmak istersen Krononet uygulamasını kullanabilirsin.']] });

aracSayfasi({ yol: '/lgs-net-hesaplama/', h1: 'LGS Net Hesaplama', krono: 'sinav', kampanya: 'lgs-net',
  baslik: 'LGS Net Hesaplama 2027 – 3 Yanlış 1 Doğru | Krononet',
  aciklama: 'LGS netini ders ders hesapla: Türkçe, Matematik, Fen, İnkılap, Din ve İngilizce. 3 yanlış 1 doğruyu götürür, toplam netin anında çıkar.',
  alt: '90 soru · 3 yanlış 1 doğruyu götürür', arac: '<div data-sinavlar="lgs"></div>',
  sss: [
    ['LGS net nasıl hesaplanır?', 'Net = Doğru − (Yanlış ÷ 3). Örneğin Matematikte 15 doğru 3 yanlış yaptıysan netin 15 − 1 = 14 olur. Boş bıraktığın sorular netini etkilemez.'],
    ['LGS\'de kaç yanlış bir doğruyu götürür?', '3 yanlış 1 doğruyu götürür.'],
    ['LGS\'de hangi dersten kaç soru var?', 'Sözel bölüm (75 dakika): Türkçe 20, T.C. İnkılap Tarihi 10, Din Kültürü 10, Yabancı Dil 10. Sayısal bölüm (80 dakika): Matematik 20, Fen Bilimleri 20. Toplam 90 soru.'],
    ['Bu araç LGS puanımı hesaplıyor mu?', 'Hayır. LGS puanı MEB\'in o yılki ortalama ve standart sapmaya dayalı hesabıyla bulunur. Bu araç yalnızca neti hesaplar.'],
    ['Girdiğim netler kaydediliyor mu?', 'Yalnızca kendi tarayıcında durur, hiçbir yere gönderilmez.']] });

aracSayfasi({ yol: '/kpss-net-hesaplama/', h1: 'KPSS Net Hesaplama', krono: 'odakli', kampanya: 'kpss-net',
  baslik: 'KPSS Net Hesaplama – Genel Yetenek, Genel Kültür | Krononet',
  aciklama: 'KPSS GY-GK netini ders ders hesapla: Türkçe, Matematik, Tarih, Coğrafya, Vatandaşlık, Güncel. 4 yanlış 1 doğruyu götürür.',
  alt: 'Genel Yetenek + Genel Kültür · 4 yanlış 1 doğru', arac: '<div data-sinavlar="kpss"></div>',
  sss: [
    ['KPSS net nasıl hesaplanır?', 'Net = Doğru − (Yanlış ÷ 4). Boş bıraktığın sorular netini etkilemez.'],
    ['KPSS GY-GK\'da hangi dersten kaç soru var?', 'Genel Yetenek: Türkçe 30, Matematik 30. Genel Kültür: Tarih 27, Coğrafya 18, Vatandaşlık 9, Güncel Bilgiler 6. Toplam 120 soru.'],
    ['Bu araç KPSS puanımı hesaplıyor mu?', 'Hayır. KPSS puanı ÖSYM tarafından standart puanla hesaplanır; bu araç yalnızca neti hesaplar.']] });

aracSayfasi({ yol: '/yks-kac-gun-kaldi/', h1: 'YKS\'ye kaç gün kaldı?', krono: 'odakli', kampanya: 'yks-sayac',
  baslik: 'YKS\'ye Kaç Gün Kaldı? 2027 YKS Geri Sayım | Krononet',
  aciklama: '2027 YKS\'ye kaç gün kaldı? TYT 19 Haziran 2027 Cumartesi, AYT ve YDT 20 Haziran 2027 Pazar. Gün, saat, dakika ve kalan deneme Pazarı.',
  alt: 'TYT · 19 Haziran 2027 Cumartesi', arac: sayacHtml('2027-06-19T10:15:00+03:00', 'TYT 19 Haziran 2027 Cumartesi · AYT ve YDT 20 Haziran 2027 Pazar'),
  sss: [
    ['2027 YKS ne zaman?', 'ÖSYM\'nin 2027 takvimine göre TYT 19 Haziran 2027 Cumartesi, AYT ve YDT 20 Haziran 2027 Pazar günü yapılacak.'],
    ['2027 YKS başvuruları ne zaman?', 'Başvurular 4 Şubat – 2 Mart 2027, geç başvuru 16–18 Mart 2027. Sonuçlar 21 Temmuz 2027. Tüm sınavlar için <a href="/sinav-takvimi-2027/">2027 sınav takvimine</a> bak.'],
    ['Kalan sürede kaç deneme çözebilirim?', 'Sayaçtaki Pazar sayısı, haftada bir genel deneme çözersen kaç deneme yapabileceğini gösterir. Hafta içi için <a href="/calisma-programi/tyt/">TYT haftalık çalışma programına</a> göz at.']] });

aracSayfasi({ yol: '/lgs-kac-gun-kaldi/', h1: 'LGS\'ye kaç gün kaldı?', krono: 'odakli', kampanya: 'lgs-sayac',
  baslik: 'LGS\'ye Kaç Gün Kaldı? 2027 LGS Geri Sayım | Krononet',
  aciklama: '2027 LGS\'ye kaç gün kaldı? MEB takvimine göre LGS 13 Haziran 2027 Pazar. Gün, saat, dakika ve kalan deneme Pazarı.',
  alt: '13 Haziran 2027 Pazar', arac: sayacHtml('2027-06-13T09:30:00+03:00', 'LGS merkezi sınavı · 13 Haziran 2027 Pazar'),
  sss: [
    ['2027 LGS ne zaman?', 'MEB\'in 2027 sınav takvimine göre LGS 13 Haziran 2027 Pazar günü yapılacak.'],
    ['LGS kaç soru, kaç dakika?', 'Sözel bölüm 50 soru 75 dakika, sayısal bölüm 40 soru 80 dakika. Toplam 90 soru.'],
    ['Kalan sürede nasıl çalışmalıyım?', 'Her gün Matematik, gün aşırı Türkçe ve Fen düzenli bir başlangıçtır. Hazır <a href="/calisma-programi/lgs/">LGS haftalık çalışma programına</a> bak.']] });

aracSayfasi({ yol: '/kpss-kac-gun-kaldi/', h1: 'KPSS\'ye kaç gün kaldı?', krono: 'odakli', kampanya: 'kpss-sayac',
  baslik: 'KPSS\'ye Kaç Gün Kaldı? 2027 KPSS Geri Sayım | Krononet',
  aciklama: '2027 KPSS Genel Yetenek–Genel Kültür oturumuna kaç gün kaldı? ÖSYM takvimine göre 12 Eylül 2027 Pazar.',
  alt: 'GY-GK · 12 Eylül 2027 Pazar', arac: sayacHtml('2027-09-12T10:15:00+03:00', 'KPSS Genel Yetenek–Genel Kültür · 12 Eylül 2027 Pazar'),
  sss: [
    ['2027 KPSS ne zaman?', 'ÖSYM\'nin 2027 takvimine göre KPSS Lisans Genel Yetenek–Genel Kültür 12 Eylül 2027 Pazar, Alan Bilgisi 18–19 Eylül 2027. Başvurular 8–19 Temmuz 2027.'],
    ['KPSS\'ye nasıl çalışmalıyım?', 'Hafta içi akşam kısa soru bankası testleri, hafta sonu tam deneme iyi bir düzendir. <a href="/calisma-programi/kpss/">KPSS haftalık çalışma programına</a> bak.']] });

// ───────────── Sınav takvimi ─────────────
{
  const yol = '/sinav-takvimi-2027/';
  const y = yolHaritasi([[null, '2027 Sınav Takvimi']]);
  const satirlar = TAKVIM.map(([ad, kat, kurum, s, s2, b1, b2, sonuc, not, link]) => {
    const sinavYazi = s2 ? `${s.slice(8).replace(/^0/, '')}–${tarihYaz(s2)}` : tarihYaz(s);
    const adHtml = link ? `<a href="${link}">${ad}</a>` : ad;
    return `<tr data-kat="${kat}"><td><b>${adHtml}<span class="kurum${kurum === 'MEB' ? ' meb' : ''}">${kurum}</span></b>${not ? `<small>${not}</small>` : ''}</td>
<td data-b="Sınav"><b>${sinavYazi}</b></td><td data-b="Başvuru">${aralik(b1, b2)}</td><td data-b="Sonuç">${sonuc ? tarihYaz(sonuc, false) : '—'}</td><td data-b="Kalan" class="kalan" data-kalan="${s}">–</td></tr>`;
  }).join('\n');
  const filtre = `<div class="filtre" data-filtre><button type="button" aria-pressed="true" data-k="">Tümü</button>${Object.entries(KATEGORI).map(([k, ad]) => `<button type="button" aria-pressed="false" data-k="${k}">${ad}</button>`).join('')}</div>`;
  const olaylar = TAKVIM.map(([ad, , kurum, s, s2]) => ({ '@context': 'https://schema.org', '@type': 'Event', name: `2027 ${ad}`, startDate: s, endDate: s2 || s,
    eventStatus: 'https://schema.org/EventScheduled', eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: { '@type': 'Place', name: 'Türkiye geneli sınav merkezleri', address: { '@type': 'PostalAddress', addressCountry: 'TR' } },
    organizer: { '@type': 'Organization', name: kurum === 'MEB' ? 'Millî Eğitim Bakanlığı' : 'ÖSYM', url: kurum === 'MEB' ? 'https://www.meb.gov.tr' : 'https://www.osym.gov.tr' } }));
  const sss = [
    ['2027 YKS ne zaman?', 'TYT 19 Haziran 2027 Cumartesi, AYT ve YDT 20 Haziran 2027 Pazar. Başvurular 4 Şubat – 2 Mart 2027, sonuçlar 21 Temmuz 2027.'],
    ['2027 LGS ne zaman?', 'MEB takvimine göre 13 Haziran 2027 Pazar. Başvuru ve sonuç tarihleri LGS kılavuzuyla açıklanacak.'],
    ['2027 KPSS ne zaman?', 'KPSS Lisans Genel Yetenek–Genel Kültür 12 Eylül 2027, Alan Bilgisi 18–19 Eylül 2027. Başvurular 8–19 Temmuz 2027. KPSS Önlisans ve Ortaöğretim iki yılda bir yapıldığı için 2027 takviminde yok.'],
    ['2027 TUS ne zaman?', '1. dönem 27 Mart 2027, 2. dönem 22 Ağustos 2027.'],
    ['Tarihler kesin mi?', 'Tarihler ÖSYM\'nin 28 Ekim 2026\'da ve MEB\'in 30 Ekim 2026\'da yayımladığı 2027 takvimlerine dayanır. Kurumlar takvimi güncelleyebilir; başvuru öncesi <a href="https://www.osym.gov.tr" rel="nofollow">osym.gov.tr</a> ve <a href="https://www.meb.gov.tr" rel="nofollow">meb.gov.tr</a> duyurularını kontrol et.']];
  SAYFALAR.push({ yol, kampanya: 'takvim',
    baslik: '2027 Sınav Takvimi – YKS, LGS, KPSS, ALES, TUS Tarihleri | Krononet',
    aciklama: '2027 ÖSYM ve MEB sınav takvimi: YKS 19-20 Haziran, LGS 13 Haziran, KPSS 12 Eylül, TUS, ALES, DGS, YDS. Başvuru ve sonuç tarihleri, kaç gün kaldı.',
    ld: [sssLd(sss), y.ld, ...olaylar],
    govde: `${y.html}${baslikBlok('2027 Sınav Takvimi', 'ÖSYM ve MEB · sınav, başvuru ve sonuç tarihleri', 'odakli')}
${filtre}
<table class="takvim"><thead><tr><th>Sınav</th><th>Sınav tarihi</th><th>Başvuru</th><th>Sonuç</th><th>Kalan</th></tr></thead><tbody>
${satirlar}
</tbody></table>
<p style="color:var(--dim2);font-size:13px;margin-top:10px">Kaynak: ÖSYM 2027 Yılı Sınav Takvimi (28.10.2026) ve MEB 2027 Sınav Uygulama Takvimi (30.10.2026). Kurumlar değişiklik yapabilir.</p>
<div class="dar">${cta('takvim', 'Sınav gününe kadar her denemen planlı olsun', 'Deneme saatlerini kur, alarm hatırlatsın, netlerini gir. Sınava kaç deneme kaldığını hep bil.')}</div>
${sssBlok(sss)}${digerAraclar(yol)}` });
}

// ───────────── Çalışma programları ─────────────
const KAYNAK_SINIF = { 'Branş Denemesi': 'b', 'Soru Bankası': 's', 'Fasikül': 'f' };
for (const p of PROGRAMLAR) {
  const yol = `/calisma-programi/${p.slug}/`;
  const y = yolHaritasi([['/calisma-programi/', 'Çalışma Programları'], [null, p.kisa]]);
  const testSayisi = p.dersler.reduce((t, d) => t + d[4].length, 0);
  const soru = p.dersler.reduce((t, d) => t + d[2] * d[4].length, 0);
  const dakika = p.dersler.reduce((t, d) => t + d[3] * d[4].length, 0);
  const gunler = [1, 2, 3, 4, 5, 6].map((g) => {
    const o = p.dersler.filter((d) => d[4].includes(g)).sort((a, b) => a[5].localeCompare(b[5]));
    return `<div class="gun"><h3>${GUN_ADI[g]}</h3><ul>${o.map(([ders, kaynak, s, dk, , saat]) => `<li class="${KAYNAK_SINIF[kaynak]}"><time>${saat}</time>${ders}<small>${kaynak} · ${s} soru · ${dk} dk</small></li>`).join('') || '<li><small>Serbest</small></li>'}</ul></div>`;
  }).join('');
  const sss = [
    [`${p.kisa} çalışma programı nasıl kullanılır?`, 'Her gün belirtilen saatte o dersin testini çöz, süreni tut ve netini not et. Krononet uygulamasında bu program hazır paket olarak var; tek dokunuşla kurulur, her ders için alarm kendiliğinden ayarlanır.'],
    ['Pazar neden boş?', 'Pazar dinlenme ve telafi günü. Hafta içinde kaçırdığın testleri tamamlayabilir ya da genel deneme çözebilirsin.'],
    ['Saatleri değiştirebilir miyim?', 'Evet. Okul ya da kurs saatine göre kaydırabilirsin; önemli olan her gün aynı saatte oturmak. Uygulamada her dersin saatini ayrı ayrı değiştirebilirsin.'],
    ['Hangi yayınevinin kitabını kullanmalıyım?', 'Program yayınevinden bağımsız. Elindeki branş denemesi ya da soru bankasıyla uygula; uygulamada kitabını 180+ yayınevi arasından seçebilir ya da barkodunu okutabilirsin.']];
  SAYFALAR.push({ yol, kampanya: `program-${p.slug}`,
    baslik: `${p.ad} 2027 (Hazır, Ücretsiz) | Krononet`,
    aciklama: `${p.kisa} için hazır haftalık çalışma programı: hangi gün, hangi saat, hangi ders, kaç soru. Haftada ${testSayisi} test. Uygulamaya tek dokunuşla kur, alarmlar hazır.`,
    ld: [sssLd(sss), y.ld],
    govde: `${y.html}${baslikBlok(p.ad, p.not, p.krono)}
<div class="ozet"><div><b>${testSayisi}</b><span>test / hafta</span></div><div><b>${soru}</b><span>soru / hafta</span></div><div><b>${(Math.round(dakika / 6) / 10).toLocaleString('tr-TR')} saat</b><span>haftalık süre</span></div><div><b>Pazar</b><span>dinlenme</span></div></div>
<div class="hafta">${gunler}</div>
<div class="lejant">${[...new Set(p.dersler.map((d) => d[1]))].map((k) => `<span><i style="background:${{ b: '#ede4ff', s: '#fbdcec', f: '#cffafe' }[KAYNAK_SINIF[k]]}"></i>${k}</span>`).join('')}</div>
<div class="dar">${cta(`program-${p.slug}`, 'Bu programı uygulamaya tek dokunuşla kur', `Krononet'te Hazır Programlar → ${p.kisa}. Her ders için alarm kendiliğinden kurulur, netlerini girdikçe gelişimini görürsün.`)}</div>
${sssBlok(sss)}
<section style="padding:30px 0"><h2 style="font-size:24px">Diğer programlar</h2>${kutular(PROGRAMLAR.filter((x) => x !== p).map((x) => [`/calisma-programi/${x.slug}/`, x.kisa, 'Haftalık çalışma programı', '📅']), 'i4')}</section>` });
}
{
  const yol = '/calisma-programi/';
  const y = yolHaritasi([[null, 'Çalışma Programları']]);
  SAYFALAR.push({ yol, kampanya: 'programlar',
    baslik: 'Hazır Haftalık Çalışma Programları – LGS, TYT, AYT, KPSS | Krononet',
    aciklama: 'LGS, TYT, AYT Sayısal, AYT Eşit Ağırlık ve KPSS için ücretsiz hazır haftalık çalışma programları. Gün gün, saat saat; uygulamaya tek dokunuşla kur.',
    ld: [y.ld],
    govde: `${y.html}${baslikBlok('Hazır Haftalık Çalışma Programları', 'Gün gün, saat saat. İster yazdır, ister uygulamaya tek dokunuşla kur.', 'sinav')}
${kutular(PROGRAMLAR.map((p) => [`/calisma-programi/${p.slug}/`, p.ad, p.not, '📅']), 'i3')}
<div class="dar">${cta('programlar', 'Programı kur, alarmlar seni çağırsın', 'Krononet her dersin saatinde alarm çalar; sen sadece masaya otur.')}</div>` });
}

// ───────────── Ana sayfa ─────────────
{
  const sss = [
    ['Krononet ücretsiz mi?', 'Öğrenciler ve veliler için tamamen ücretsiz. Eğitim koçları için ücretsiz plan ve daha fazla öğrenci için Premium plan var.'],
    ['Hangi sınavlar için kullanılır?', 'YKS (TYT ve AYT), LGS, KPSS Genel Yetenek–Genel Kültür ve TUS. Her sınavın süresi, soru sayısı ve yanlış katsayısı ayrı ayarlıdır.'],
    ['iPhone\'da var mı?', 'Şimdilik yalnızca Android\'de, Google Play\'de.'],
    ['Veli çocuğunun netlerini nasıl görür?', 'Öğrenci uygulamadaki 6 haneli davet koduyla velisini bağlar; veli kendi telefonundan ilerlemeyi takip eder.'],
    ['Koç öğrencisine nasıl program gönderir?', 'Koç bir grup kurar ve grup kodunu öğrencisiyle paylaşır. Öğrenci "Koça Bağlan" ile katılır; koçun hazırladığı program şablonu öğrencinin uygulamasına alarmlarıyla birlikte gelir.']];
  const govde = `
<section class="giris"><div class="wrap">
  <div>
    <h1>Denemeyi <em>yarına</em> bırakma.</h1>
    <p class="alt">Deneme saatini kur, saati gelince alarm çalsın, bitince netini gir. Gelişimini Krononet takip etsin.</p>
    <div class="eylem"><a class="btn buyuk" href="${play('ana-sayfa')}">▶ Google Play'den ücretsiz indir</a><a class="btn buyuk cizgi" href="/calisma-programi/">Hazır programlar</a></div>
    <div class="cipler"><span>🎯 YKS</span><span>📖 LGS</span><span>🏛️ KPSS</span><span>🩺 TUS</span><span>Öğrenciye ücretsiz</span></div>
  </div>
  <div class="sahne">
    <div class="telefon arka" aria-hidden="true"><div class="alarm"><div class="ust">Krononet · Deneme zamanı</div><img src="/img/odakli.webp" alt="" width="118" height="118"><div class="saat">19:45</div><div class="ders">LGS · Din Kültürü</div><div class="kaynak">Branş Denemesi · 10 soru</div><div class="b1">BAŞLIYORUM</div><div class="b2">10 dk ertele</div></div></div>
    <div class="telefon on"><img class="gercek" src="/img/ekran-bugun.webp" alt="Krononet Bugün ekranı: Bu Hafta kartı, tamamlanan ve bekleyen denemeler" width="540" height="1145"></div>
  </div>
</div></section>

<section class="blok"><div class="wrap">
  <div class="ortala"><h2>Ücretsiz araçlar</h2><p class="ust-yazi">Uygulamayı indirmeden de kullanabilirsin.</p></div>
  ${kutular([...ARACLAR.slice(0, 3), ['/sinav-takvimi-2027/', '2027 Sınav Takvimi', 'YKS, LGS, KPSS, ALES, TUS', '🗓️'], ['/calisma-programi/', 'Hazır Çalışma Programları', 'LGS, TYT, AYT, KPSS', '📅'], ARACLAR[3]], 'i3')}
</div></section>

<section class="blok renkli" id="nasil"><div class="wrap">
  <div class="ortala"><h2>Dört adımda düzenli deneme</h2><p class="ust-yazi">Çalışmayı hatırlamak sana kalmasın.</p></div>
  <div class="izgara i4 adimlar">
    <div class="kutu"><b>Programını kur</b><span>Dersini, kitabını ve saatini seç ya da hazır programla tek dokunuşta başla.</span></div>
    <div class="kutu"><b>Alarm çalsın</b><span>Saati gelince tam ekran alarm. Sessiz bir bildirim değil.</span></div>
    <div class="kutu"><b>Netini gir</b><span>Kronometreyle süreni tut, doğru-yanlışını gir, netin anında hesaplansın.</span></div>
    <div class="kutu"><b>Gelişimini gör</b><span>Ders ders net yüzden, haftalık hedefin ve ilerleme grafiklerin.</span></div>
  </div>
</div></section>

<section class="blok" id="kimler"><div class="wrap">
  <div class="ortala"><h2>Öğrenci çalışır, veli ve koç takip eder</h2><p class="ust-yazi">Aynı uygulama, üç farklı rol.</p></div>
  <div class="izgara i3">
    <div class="kutu rol"><img src="/img/normal.webp" alt="" width="120" height="120" loading="lazy"><h3>Öğrenci</h3><span class="etiket">Ücretsiz</span><ul><li>Deneme programı ve alarm</li><li>Net takibi ve analiz</li><li>Hazır haftalık programlar</li><li>180+ yayınevi, barkodla kitap ekleme</li></ul></div>
    <div class="kutu rol"><img src="/img/veli.webp" alt="" width="120" height="120" loading="lazy"><h3>Veli</h3><span class="etiket">Ücretsiz</span><ul><li>Çocuğunun ilerlemesini gör</li><li>Net bildirimleri</li><li>6 haneli kodla bağlan</li><li>3 öğrenciye kadar</li></ul></div>
    <div class="kutu rol"><img src="/img/koc.webp" alt="" width="120" height="120" loading="lazy"><h3>Eğitim Koçu</h3><span class="etiket mor">Ücretsiz başla · Premium</span><ul><li>Grup kur, kodla öğrenci ekle</li><li>Program şablonu gönder</li><li>Hazır paketler (TYT, AYT, LGS, KPSS)</li><li>Öğrenci ilerleme paneli</li></ul></div>
  </div>
</div></section>

<section class="blok renkli"><div class="wrap">
  <div class="ortala"><h2>Sınavına göre ayarlı</h2><p class="ust-yazi">Her sınavın süresi, soru sayısı ve yanlış katsayısı ayrı.</p></div>
  <div class="izgara i3">
    <div class="kutu"><div class="ikon">⏰</div><b>Gerçek alarm</b><span>Telefon kilitliyken bile tam ekran, sesli alarm. Ertele ya da başla.</span></div>
    <div class="kutu"><div class="ikon">⏱️</div><b>Kronometre</b><span>Denemeyi gerçek sınav süresinde çöz, süren kayda geçsin.</span></div>
    <div class="kutu"><div class="ikon">📊</div><b>Net analizi</b><span>Ders bazında net yüzdesi; sınavlar arası karşılaştırılabilir.</span></div>
    <div class="kutu"><div class="ikon">📚</div><b>Hazır programlar</b><span>Sınavına göre haftalık paket, tek dokunuşla kurulur.</span></div>
    <div class="kutu"><div class="ikon">🏷️</div><b>Yayınevi ve barkod</b><span>Kitabını barkodundan tara, test sayısı hazır gelsin.</span></div>
    <div class="kutu"><div class="ikon">📄</div><b>PDF rapor</b><span>Gelişimini rapor olarak velinle ya da koçunla paylaş.</span></div>
  </div>
</div></section>

<section class="blok"><div class="wrap">
  <div class="ortala"><h2>Tanış: Krono 🥔</h2><p class="ust-yazi">Krononet'in maskotu. Sen çalıştıkça o da değişir.</p></div>
  <div class="izgara i4">
    <div class="kutu krono"><img src="/img/normal.webp" alt="Krono" width="100" height="100" loading="lazy"><b>Merhaba!</b><span>İlk testini bekliyor</span></div>
    <div class="kutu krono"><img src="/img/filiz.webp" alt="Krono filizlendi" width="100" height="100" loading="lazy"><b>Filizlendi</b><span>Güzel çalışıyorsun</span></div>
    <div class="kutu krono"><img src="/img/kizarmis.webp" alt="Krono kızardı" width="100" height="100" loading="lazy"><b>Kızardı</b><span>Bugün çok çalıştın</span></div>
    <div class="kutu krono"><img src="/img/ozlemis.webp" alt="Krono özledi" width="100" height="100" loading="lazy"><b>Özledi</b><span>Birkaç gündür yoksun</span></div>
  </div>
</div></section>

<section class="blok renkli"><div class="wrap">${sssBlok(sss)}</div></section>

<div class="wrap"><div class="son"><h2>Bugünün denemesi seni bekliyor</h2><p>Kurulumu bir dakika sürer.</p><a class="btn buyuk beyaz" href="${play('ana-alt')}">▶ Google Play'den indir</a></div></div>`;
  SAYFALAR.push({ yol: '/', kampanya: 'ana', tamGenislik: true, govde,
    baslik: 'Krononet – Deneme Programı, Alarm ve Net Takibi | YKS, LGS, KPSS, TUS',
    aciklama: 'Deneme saatini kur, alarm çalsın, netini gir. YKS, LGS, KPSS ve TUS için deneme programı, net takibi, sınav takvimi ve hazır çalışma programları. Öğrencilere ücretsiz.',
    ld: [
      { '@context': 'https://schema.org', '@type': 'MobileApplication', name: 'Krononet', operatingSystem: 'Android', applicationCategory: 'EducationalApplication', inLanguage: 'tr', url: SITE + '/', downloadUrl: PLAY, image: SITE + '/img/ikon.png', offers: { '@type': 'Offer', price: '0', priceCurrency: 'TRY' } },
      { '@context': 'https://schema.org', '@type': 'Organization', name: 'Krononet', url: SITE + '/', logo: SITE + '/img/ikon.png', email: 'destek.krononet@gmail.com' },
      { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Krononet', url: SITE + '/', inLanguage: 'tr' },
      sssLd(sss)] });
}

// ───────────── Yaz ─────────────
for (const s of SAYFALAR) {
  const hedef = path.join(__dirname, s.yol, 'index.html');
  fs.mkdirSync(path.dirname(hedef), { recursive: true });
  fs.writeFileSync(hedef, sablon(s));
  console.log('yazıldı', s.yol);
}
const urller = [...SAYFALAR.map((s) => s.yol), '/privacy.html', '/hesap-silme.html'];
fs.writeFileSync(path.join(__dirname, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urller.map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${bugun}</lastmod></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(__dirname, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log('sitemap.xml + robots.txt');
