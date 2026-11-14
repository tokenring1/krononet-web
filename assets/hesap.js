// Krononet net hesaplama — tek motor, sınav ayarları SINAVLAR'da.
// Soru dağılımları resmî ÖSYM/MEB kitapçık düzenidir.
(function () {
  var SINAVLAR = {
    tyt: { ad: 'TYT', carpan: 0.25, gruplar: [
      { ad: 'Türkçe', dersler: [['Türkçe', 40]] },
      { ad: 'Sosyal Bilimler', dersler: [['Tarih', 5], ['Coğrafya', 5], ['Felsefe', 5], ['Din Kültürü', 5]] },
      { ad: 'Temel Matematik', dersler: [['Matematik', 40]] },
      { ad: 'Fen Bilimleri', dersler: [['Fizik', 7], ['Kimya', 7], ['Biyoloji', 6]] }
    ] },
    ayt: { ad: 'AYT', carpan: 0.25, gruplar: [
      { ad: 'Matematik', kod: 'mat', dersler: [['Matematik', 40]] },
      { ad: 'Fen Bilimleri', kod: 'fen', dersler: [['Fizik', 14], ['Kimya', 13], ['Biyoloji', 13]] },
      { ad: 'Türk Dili ve Edebiyatı – Sosyal 1', kod: 'tde', dersler: [['Edebiyat', 24], ['Tarih-1', 10], ['Coğrafya-1', 6]] },
      { ad: 'Sosyal Bilimler 2', kod: 'sos2', dersler: [['Tarih-2', 11], ['Coğrafya-2', 11], ['Felsefe Grubu', 12], ['Din Kültürü', 6]] }
    ], alanlar: [['Sayısal', ['mat', 'fen']], ['Eşit Ağırlık', ['mat', 'tde']], ['Sözel', ['tde', 'sos2']]] },
    ydt: { ad: 'YDT', carpan: 0.25, gruplar: [
      { ad: 'Yabancı Dil', dersler: [['Yabancı Dil', 80]] }
    ] },
    lgs: { ad: 'LGS', carpan: 1 / 3, gruplar: [
      { ad: 'Sözel Bölüm', dersler: [['Türkçe', 20], ['T.C. İnkılap Tarihi', 10], ['Din Kültürü', 10], ['Yabancı Dil', 10]] },
      { ad: 'Sayısal Bölüm', dersler: [['Matematik', 20], ['Fen Bilimleri', 20]] }
    ] },
    kpss: { ad: 'KPSS', carpan: 0.25, gruplar: [
      { ad: 'Genel Yetenek', dersler: [['Türkçe', 30], ['Matematik', 30]] },
      { ad: 'Genel Kültür', dersler: [['Tarih', 27], ['Coğrafya', 18], ['Vatandaşlık', 9], ['Güncel Bilgiler', 6]] }
    ] }
  };

  function yuvarla(x) { return Math.round(x * 100) / 100; }
  function goster(x) { return yuvarla(x).toLocaleString('tr-TR', { maximumFractionDigits: 2 }); }

  function sakla(anahtar, deger) { try { localStorage.setItem(anahtar, JSON.stringify(deger)); } catch (e) {} }
  function oku(anahtar) { try { return JSON.parse(localStorage.getItem(anahtar) || 'null'); } catch (e) { return null; } }

  function kur(kok) {
    var kodlar = (kok.getAttribute('data-sinavlar') || '').split(',');
    var sekmeler = document.createElement('div');
    sekmeler.className = 'sekmeler';
    sekmeler.setAttribute('role', 'tablist');
    var alan = document.createElement('div');
    if (kodlar.length > 1) kok.appendChild(sekmeler);
    kok.appendChild(alan);

    kodlar.forEach(function (kod, i) {
      if (kodlar.length < 2) return;
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.textContent = SINAVLAR[kod].ad;
      b.onclick = function () { sec(kod); };
      b.dataset.kod = kod;
      sekmeler.appendChild(b);
    });

    function sec(kod) {
      Array.prototype.forEach.call(sekmeler.children, function (b) {
        b.setAttribute('aria-selected', b.dataset.kod === kod ? 'true' : 'false');
      });
      ciz(alan, kod);
      sakla('krn_sekme_' + kodlar.join(), kod);
    }
    var son = oku('krn_sekme_' + kodlar.join());
    sec(kodlar.indexOf(son) >= 0 ? son : kodlar[0]);
  }

  function ciz(alan, kod) {
    var s = SINAVLAR[kod];
    var kayit = oku('krn_net_' + kod) || {};
    var html = '<div class="kart"><table class="tablo"><thead><tr><th>Ders</th><th>Doğru</th><th>Yanlış</th><th>Net</th></tr></thead><tbody>';
    var satirlar = [];
    s.gruplar.forEach(function (g, gi) {
      if (s.gruplar.length > 1) html += '<tr class="grup"><td colspan="4">' + g.ad + '</td></tr>';
      g.dersler.forEach(function (d, di) {
        var id = gi + '_' + di;
        satirlar.push({ id: id, soru: d[1], grup: gi });
        var k = kayit[id] || {};
        html += '<tr data-id="' + id + '"><td>' + d[0] + '<small>' + d[1] + ' soru</small></td>' +
          '<td><input inputmode="numeric" type="number" min="0" max="' + d[1] + '" data-t="d" value="' + (k.d != null ? k.d : '') + '" aria-label="' + d[0] + ' doğru"></td>' +
          '<td><input inputmode="numeric" type="number" min="0" max="' + d[1] + '" data-t="y" value="' + (k.y != null ? k.y : '') + '" aria-label="' + d[0] + ' yanlış"></td>' +
          '<td class="net">–</td></tr>';
      });
    });
    html += '</tbody></table>' +
      '<div class="sonuc"><div><b data-s="d">0</b><span>Doğru</span></div><div><b data-s="y">0</b><span>Yanlış</span></div><div><b data-s="n">0</b><span>' + s.ad + ' Net</span></div></div>' +
      (s.alanlar ? '<div class="ekstra" data-s="alan" style="grid-template-columns:repeat(3,1fr)"></div>' : '') +
      '<div class="uyari" aria-live="polite"></div>' +
      '<button type="button" class="temizle">Temizle</button></div>';
    alan.innerHTML = html;

    function hesapla() {
      var td = 0, ty = 0, tn = 0, hatali = false, kayitYeni = {}, grupNet = {};
      satirlar.forEach(function (r) {
        var tr = alan.querySelector('tr[data-id="' + r.id + '"]');
        var iD = tr.querySelector('[data-t="d"]'), iY = tr.querySelector('[data-t="y"]');
        var d = Math.max(0, parseInt(iD.value, 10) || 0), y = Math.max(0, parseInt(iY.value, 10) || 0);
        var asim = d + y > r.soru;
        iD.classList.toggle('hata', asim); iY.classList.toggle('hata', asim);
        var net = d - y * s.carpan;
        tr.querySelector('.net').textContent = (iD.value === '' && iY.value === '') ? '–' : goster(net);
        if (asim) hatali = true;
        if (iD.value !== '' || iY.value !== '') kayitYeni[r.id] = { d: iD.value, y: iY.value };
        td += d; ty += y; tn += net;
        var gk = s.gruplar[r.grup].kod;
        if (gk) grupNet[gk] = (grupNet[gk] || 0) + net;
      });
      alan.querySelector('[data-s="d"]').textContent = td;
      alan.querySelector('[data-s="y"]').textContent = ty;
      alan.querySelector('[data-s="n"]').textContent = goster(tn);
      if (s.alanlar) {
        alan.querySelector('[data-s="alan"]').innerHTML = s.alanlar.map(function (a) {
          var n = a[1].reduce(function (t, k) { return t + (grupNet[k] || 0); }, 0);
          return '<div><b>' + goster(n) + '</b><span>' + a[0] + '</span></div>';
        }).join('');
      }
      alan.querySelector('.uyari').textContent = hatali ? 'Doğru + yanlış, dersin soru sayısını geçemez.' : '';
      sakla('krn_net_' + kod, kayitYeni);
    }
    alan.oninput = hesapla; // sekme değişince eski dinleyici kalmasın
    alan.querySelector('.temizle').onclick = function () {
      Array.prototype.forEach.call(alan.querySelectorAll('input'), function (i) { i.value = ''; });
      hesapla();
    };
    hesapla();
  }

  // Geri sayım: <div data-sayac="2027-06-19T10:15:00+03:00">
  function sayacKur(kok) {
    var hedef = new Date(kok.getAttribute('data-sayac')).getTime();
    var parca = ['gun', 'saat', 'dk', 'sn'].map(function (k) { return kok.querySelector('[data-k="' + k + '"]'); });
    function tik() {
      var fark = Math.max(0, hedef - Date.now());
      var sn = Math.floor(fark / 1000);
      var v = [Math.floor(sn / 86400), Math.floor(sn % 86400 / 3600), Math.floor(sn % 3600 / 60), sn % 60];
      v.forEach(function (x, i) { if (parca[i]) parca[i].textContent = x; });
      var hafta = document.querySelector('[data-k="hafta"]');
      if (hafta) hafta.textContent = Math.floor(v[0] / 7);
      var pazar = document.querySelector('[data-k="pazar"]');
      if (pazar) pazar.textContent = pazarSayisi(new Date(), new Date(hedef));
    }
    function pazarSayisi(bas, bit) {
      var n = 0, g = new Date(bas.getFullYear(), bas.getMonth(), bas.getDate() + 1);
      while (g < bit) { if (g.getDay() === 0) n++; g.setDate(g.getDate() + 1); }
      return n;
    }
    tik();
    setInterval(tik, 1000);
  }

  // Sınav takvimi: kalan gün + geçenleri soluklaştır + kategori filtresi
  function takvimKur() {
    var simdi = new Date(); simdi.setHours(0, 0, 0, 0);
    document.querySelectorAll('[data-kalan]').forEach(function (td) {
      var p = td.getAttribute('data-kalan').split('-');
      var gun = Math.round((new Date(+p[0], +p[1] - 1, +p[2]) - simdi) / 86400000);
      td.textContent = gun > 0 ? gun + ' gün' : gun === 0 ? 'Bugün' : 'Yapıldı';
      if (gun < 0) td.parentNode.classList.add('gecti');
    });
    var f = document.querySelector('[data-filtre]');
    if (!f) return;
    f.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var k = b.getAttribute('data-k');
      f.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      document.querySelectorAll('tr[data-kat]').forEach(function (tr) {
        tr.style.display = !k || tr.getAttribute('data-kat') === k ? '' : 'none';
      });
    });
  }

  document.querySelectorAll('[data-sinavlar]').forEach(kur);
  document.querySelectorAll('[data-sayac]').forEach(sayacKur);
  takvimKur();
})();
