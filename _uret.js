// Sayfa üretici: `node _uret.js` → araç sayfaları + ana sayfa + sitemap.xml
// Alt çizgiyle başladığı için GitHub Pages (Jekyll) bu dosyayı yayımlamaz.
const fs = require('fs');
const path = require('path');

const SITE = 'https://krononet.com';
const PLAY = 'https://play.google.com/store/apps/details?id=com.krononet.app';
const bugun = new Date().toISOString().slice(0, 10);

const play = (kampanya) =>
  `${PLAY}&referrer=${encodeURIComponent(`utm_source=krononet.com&utm_medium=web&utm_campaign=${kampanya}`)}`;

const kacis = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const ARACLAR = [
  ['/yks-net-hesaplama/', 'YKS Net Hesaplama', 'TYT · AYT · YDT'],
  ['/lgs-net-hesaplama/', 'LGS Net Hesaplama', '3 yanlış 1 doğru'],
  ['/kpss-net-hesaplama/', 'KPSS Net Hesaplama', 'GY · GK'],
  ['/yks-kac-gun-kaldi/', 'YKS\'ye Kaç Gün Kaldı?', '19 Haziran 2027'],
  ['/lgs-kac-gun-kaldi/', 'LGS\'ye Kaç Gün Kaldı?', '13 Haziran 2027'],
  ['/kpss-kac-gun-kaldi/', 'KPSS\'ye Kaç Gün Kaldı?', '12 Eylül 2027'],
];

function sayfa({ yol, baslik, aciklama, h1, alt, krono, govde, sss = [], kampanya, ldTip = 'WebApplication', ekLd = [] }) {
  const url = SITE + yol;
  const ld = [
    ldTip && {
      '@context': 'https://schema.org', '@type': ldTip, name: h1, url,
      applicationCategory: 'EducationalApplication', operatingSystem: 'Any', inLanguage: 'tr',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'TRY' },
    },
    sss.length && {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: sss.map(([s, c]) => ({ '@type': 'Question', name: s, acceptedAnswer: { '@type': 'Answer', text: c } })),
    },
    ...ekLd,
  ].filter(Boolean);

  const digerAraclar = ARACLAR.filter(([y]) => y !== yol)
    .map(([y, ad, a]) => `<a href="${y}">${ad}<span>${a}</span></a>`).join('\n      ');

  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${kacis(baslik)}</title>
<meta name="description" content="${kacis(aciklama)}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#150a24">
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
<link rel="stylesheet" href="/assets/site.css">
${ld.map((x) => `<script type="application/ld+json">${JSON.stringify(x)}</script>`).join('\n')}
</head>
<body>
<nav class="nav"><div class="wrap">
  <a class="marka" href="/"><i>K</i>Krononet</a>
  <span class="bos"></span>
  <a class="mini" href="${play(kampanya)}">Uygulamayı indir</a>
</div></nav>

<main class="wrap">
  <div class="hero">
    ${krono ? `<img src="/img/${krono}.webp" alt="Krono" width="120" height="120">` : ''}
    <h1>${h1}</h1>
    ${alt ? `<p>${alt}</p>` : ''}
  </div>

  ${govde}

  <div class="cta">
    <img src="/img/filiz.webp" alt="" width="76" height="76" loading="lazy">
    <div>
      <b>Netlerini her seferinde yeniden hesaplama</b>
      <span>Deneme saatini kur, alarm gelsin, netini gir. Krononet gelişimini senin yerine takip etsin.</span><br>
      <a class="indir" href="${play(kampanya)}">▶ Google Play'den ücretsiz indir</a>
    </div>
  </div>

  ${sss.length ? `<section>
    <h2>Sık sorulanlar</h2>
    ${sss.map(([s, c]) => `<details><summary>${s}</summary><p>${c}</p></details>`).join('\n    ')}
  </section>` : ''}

  <section>
    <h2>Diğer araçlar</h2>
    <div class="araclar">
      ${digerAraclar}
    </div>
  </section>
</main>

<footer>
  <a href="/">Krononet</a> · <a href="/privacy.html">Gizlilik</a> · <a href="/hesap-silme.html">Hesap silme</a> · <a href="mailto:destek.krononet@gmail.com">İletişim</a><br>
  © 2026 Krononet
</footer>
<script src="/assets/hesap.js" defer></script>
</body>
</html>
`;
}

const sayac = (iso, satirlar) => `<div class="kart">
    <div class="sayac" data-sayac="${iso}">
      <div><b data-k="gun">–</b><span>gün</span></div>
      <div><b data-k="saat">–</b><span>saat</span></div>
      <div><b data-k="dk">–</b><span>dakika</span></div>
      <div><b data-k="sn">–</b><span>saniye</span></div>
    </div>
    <div class="ekstra">
      <div><b data-k="hafta">–</b><span>hafta</span></div>
      <div><b data-k="pazar">–</b><span>Pazar = deneme günü</span></div>
    </div>
    <p class="tarih">${satirlar}</p>
  </div>`;

const SAYFALAR = [
  {
    yol: '/yks-net-hesaplama/',
    baslik: 'YKS Net Hesaplama 2027 – TYT, AYT, YDT Net Hesapla | Krononet',
    aciklama: 'TYT, AYT ve YDT netini ders ders hesapla. 4 yanlış 1 doğruyu götürür; AYT Sayısal, Eşit Ağırlık ve Sözel netlerin otomatik çıkar.',
    h1: 'YKS Net Hesaplama',
    alt: 'TYT, AYT ve YDT · 4 yanlış 1 doğruyu götürür',
    krono: 'sinav',
    kampanya: 'yks-net',
    govde: '<div data-sinavlar="tyt,ayt,ydt"></div>',
    sss: [
      ['YKS net nasıl hesaplanır?', 'Net = Doğru − (Yanlış ÷ 4). Örneğin 30 doğru 8 yanlış yaptıysan netin 30 − 2 = 28 olur. Boş bıraktığın sorular netini etkilemez.'],
      ['TYT\'de kaç yanlış bir doğruyu götürür?', 'TYT, AYT ve YDT\'de 4 yanlış 1 doğruyu götürür.'],
      ['AYT alan netleri nasıl çıkıyor?', 'Sayısal = Matematik + Fen Bilimleri, Eşit Ağırlık = Matematik + Türk Dili ve Edebiyatı–Sosyal 1, Sözel = Türk Dili ve Edebiyatı–Sosyal 1 + Sosyal Bilimler 2 testlerinin netleridir.'],
      ['TYT\'de hangi dersten kaç soru var?', 'Türkçe 40, Sosyal Bilimler 20 (Tarih 5, Coğrafya 5, Felsefe 5, Din 5), Temel Matematik 40, Fen Bilimleri 20 (Fizik 7, Kimya 7, Biyoloji 6). Toplam 120 soru, 165 dakika.'],
      ['Bu araç puanımı da hesaplıyor mu?', 'Hayır. YKS puanı, o yılın ortalama ve standart sapmasına göre ÖSYM tarafından hesaplanır. Buradaki araç yalnızca neti hesaplar.'],
      ['Girdiğim netler kaydediliyor mu?', 'Yalnızca kendi tarayıcında durur, hiçbir yere gönderilmez. Denemelerinin geçmişini tutmak istersen Krononet uygulamasını kullanabilirsin.'],
    ],
  },
  {
    yol: '/lgs-net-hesaplama/',
    baslik: 'LGS Net Hesaplama 2027 – 3 Yanlış 1 Doğru | Krononet',
    aciklama: 'LGS netini ders ders hesapla: Türkçe, Matematik, Fen, İnkılap, Din ve İngilizce. 3 yanlış 1 doğruyu götürür, sözel ve sayısal toplamın anında çıkar.',
    h1: 'LGS Net Hesaplama',
    alt: '90 soru · 3 yanlış 1 doğruyu götürür',
    krono: 'sinav',
    kampanya: 'lgs-net',
    govde: '<div data-sinavlar="lgs"></div>',
    sss: [
      ['LGS net nasıl hesaplanır?', 'Net = Doğru − (Yanlış ÷ 3). Örneğin Matematikte 15 doğru 3 yanlış yaptıysan netin 15 − 1 = 14 olur. Boş bıraktığın sorular netini etkilemez.'],
      ['LGS\'de kaç yanlış bir doğruyu götürür?', '3 yanlış 1 doğruyu götürür.'],
      ['LGS\'de hangi dersten kaç soru var?', 'Sözel bölüm (75 dakika): Türkçe 20, T.C. İnkılap Tarihi 10, Din Kültürü 10, Yabancı Dil 10. Sayısal bölüm (80 dakika): Matematik 20, Fen Bilimleri 20. Toplam 90 soru.'],
      ['Bu araç LGS puanımı hesaplıyor mu?', 'Hayır. LGS puanı, MEB\'in o yılki ortalama ve standart sapmaya dayalı hesabıyla bulunur. Buradaki araç yalnızca neti hesaplar.'],
      ['Girdiğim netler kaydediliyor mu?', 'Yalnızca kendi tarayıcında durur, hiçbir yere gönderilmez.'],
    ],
  },
  {
    yol: '/kpss-net-hesaplama/',
    baslik: 'KPSS Net Hesaplama – Genel Yetenek, Genel Kültür | Krononet',
    aciklama: 'KPSS GY-GK netini ders ders hesapla: Türkçe, Matematik, Tarih, Coğrafya, Vatandaşlık, Güncel. 4 yanlış 1 doğruyu götürür.',
    h1: 'KPSS Net Hesaplama',
    alt: 'Genel Yetenek + Genel Kültür · 4 yanlış 1 doğru',
    krono: 'odakli',
    kampanya: 'kpss-net',
    govde: '<div data-sinavlar="kpss"></div>',
    sss: [
      ['KPSS net nasıl hesaplanır?', 'Net = Doğru − (Yanlış ÷ 4). Boş bıraktığın sorular netini etkilemez.'],
      ['KPSS GY-GK\'da hangi dersten kaç soru var?', 'Genel Yetenek: Türkçe 30, Matematik 30. Genel Kültür: Tarih 27, Coğrafya 18, Vatandaşlık 9, Güncel Bilgiler 6. Toplam 120 soru.'],
      ['Bu araç KPSS puanımı hesaplıyor mu?', 'Hayır. KPSS puanı ÖSYM tarafından standart puanla hesaplanır; buradaki araç yalnızca neti hesaplar.'],
    ],
  },
  {
    yol: '/yks-kac-gun-kaldi/',
    baslik: 'YKS\'ye Kaç Gün Kaldı? 2027 YKS Geri Sayım | Krononet',
    aciklama: '2027 YKS\'ye kaç gün kaldı? TYT 19 Haziran 2027 Cumartesi, AYT ve YDT 20 Haziran 2027 Pazar. Gün, saat, dakika ve kalan deneme Pazarı.',
    h1: 'YKS\'ye kaç gün kaldı?',
    alt: 'TYT · 19 Haziran 2027 Cumartesi',
    krono: 'odakli',
    kampanya: 'yks-sayac',
    govde: sayac('2027-06-19T10:15:00+03:00', 'TYT 19 Haziran 2027 Cumartesi · AYT ve YDT 20 Haziran 2027 Pazar'),
    sss: [
      ['2027 YKS ne zaman?', 'ÖSYM\'nin 2027 takvimine göre TYT 19 Haziran 2027 Cumartesi, AYT ve YDT 20 Haziran 2027 Pazar günü yapılacak.'],
      ['2027 YKS başvuruları ne zaman?', 'ÖSYM takvimine göre başvurular 4 Şubat – 2 Mart 2027 arasında. Kesin tarihler için ÖSYM duyurularını takip et.'],
      ['Kalan sürede kaç deneme çözebilirim?', 'Sayaçtaki Pazar sayısı, haftada bir deneme çözersen kaç deneme yapabileceğini gösterir. Krononet deneme saatini kurup alarmla hatırlatır.'],
    ],
  },
  {
    yol: '/lgs-kac-gun-kaldi/',
    baslik: 'LGS\'ye Kaç Gün Kaldı? 2027 LGS Geri Sayım | Krononet',
    aciklama: '2027 LGS\'ye kaç gün kaldı? MEB takvimine göre LGS 13 Haziran 2027 Pazar. Gün, saat, dakika ve kalan deneme Pazarı.',
    h1: 'LGS\'ye kaç gün kaldı?',
    alt: '13 Haziran 2027 Pazar',
    krono: 'odakli',
    kampanya: 'lgs-sayac',
    govde: sayac('2027-06-13T09:30:00+03:00', 'LGS merkezi sınavı · 13 Haziran 2027 Pazar'),
    sss: [
      ['2027 LGS ne zaman?', 'MEB\'in 2027 sınav takvimine göre LGS 13 Haziran 2027 Pazar günü yapılacak.'],
      ['LGS kaç soru, kaç dakika?', 'Sözel bölüm 50 soru 75 dakika, sayısal bölüm 40 soru 80 dakika. Toplam 90 soru.'],
      ['Kalan sürede kaç deneme çözebilirim?', 'Sayaçtaki Pazar sayısı, haftada bir deneme çözersen kaç deneme yapabileceğini gösterir.'],
    ],
  },
  {
    yol: '/kpss-kac-gun-kaldi/',
    baslik: 'KPSS\'ye Kaç Gün Kaldı? 2027 KPSS Geri Sayım | Krononet',
    aciklama: '2027 KPSS Genel Yetenek–Genel Kültür oturumuna kaç gün kaldı? ÖSYM takvimine göre 12 Eylül 2027 Pazar.',
    h1: 'KPSS\'ye kaç gün kaldı?',
    alt: 'GY-GK · 12 Eylül 2027 Pazar',
    krono: 'odakli',
    kampanya: 'kpss-sayac',
    govde: sayac('2027-09-12T10:15:00+03:00', 'KPSS Genel Yetenek–Genel Kültür · 12 Eylül 2027 Pazar'),
    sss: [
      ['2027 KPSS ne zaman?', 'ÖSYM\'nin 2027 takvimine göre KPSS Genel Yetenek–Genel Kültür oturumu 12 Eylül 2027 Pazar günü yapılacak.'],
    ],
  },
];


const kok = __dirname;
// Ana sayfa (index.html) elle yazılır; burada yalnız araç sayfaları.
for (const s of SAYFALAR) {
  const hedef = path.join(kok, s.yol, 'index.html');
  fs.mkdirSync(path.dirname(hedef), { recursive: true });
  fs.writeFileSync(hedef, sayfa(s));
  console.log('yazıldı', s.yol);
}

const urller = ['/', ...SAYFALAR.map((s) => s.yol), '/privacy.html', '/hesap-silme.html'];
fs.writeFileSync(path.join(kok, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urller.map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${bugun}</lastmod></url>`).join('\n')}
</urlset>
`);
fs.writeFileSync(path.join(kok, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log('sitemap.xml + robots.txt');
