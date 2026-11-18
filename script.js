(function () {
  "use strict";

  var header = document.getElementById("siteHeader");
  var navToggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("mainNav");
  var dropdownItem = document.querySelector(".has-dropdown");
  var dropdownBtn = document.querySelector(".dropdown-toggle");

  /* ---------- Tandai menu aktif berdasarkan nama file ---------- */
  var current = location.pathname.split("/").pop() || "index.html";
  var contentPages = [
    "artikel.html",
    "baca.html",
    "live-streaming.html",
    "podcast.html",
    "poster.html",
    "infografis.html",
  ];

  document.querySelectorAll(".main-nav a").forEach(function (a) {
    if (a.getAttribute("href") === current) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
    }
  });
  if (dropdownBtn && contentPages.indexOf(current) !== -1) {
    dropdownBtn.classList.add("active");
  }

  /* ---------- Mode gelap / terang ---------- */
  var root = document.documentElement;
  var themeBtn = document.getElementById("themeToggle");

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeBtn) {
      themeBtn.setAttribute("aria-pressed", String(theme === "dark"));
    }
  }

  applyTheme(root.getAttribute("data-theme") || "light");

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem("theme", next);
      } catch (e) {}
    });
  }

  /* ---------- Menu mobile ---------- */
  function closeMenu() {
    navToggle.classList.remove("open");
    nav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    dropdownItem.classList.remove("open");
    dropdownBtn.setAttribute("aria-expanded", "false");
  }

  navToggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    navToggle.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    if (open) header.classList.remove("is-hidden");
  });

  /* ---------- Dropdown (klik / sentuh) ---------- */
  dropdownBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    var open = dropdownItem.classList.toggle("open");
    dropdownBtn.setAttribute("aria-expanded", String(open));
  });

  document.addEventListener("click", function (e) {
    if (!dropdownItem.contains(e.target)) {
      dropdownItem.classList.remove("open");
      dropdownBtn.setAttribute("aria-expanded", "false");
    }
    if (!header.contains(e.target)) closeMenu();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 820) closeMenu();
  });

  /* ---------- Header: sembunyi saat scroll turun, muncul saat scroll naik ---------- */
  var lastY = window.pageYOffset;
  var ticking = false;
  var THRESHOLD = 6;

  function onScroll() {
    var y = Math.max(window.pageYOffset, 0);
    var menuOpen =
      nav.classList.contains("open") || dropdownItem.classList.contains("open");

    if (Math.abs(y - lastY) > THRESHOLD) {
      if (y > lastY && y > header.offsetHeight && !menuOpen) {
        header.classList.add("is-hidden");
      } else if (y < lastY) {
        header.classList.remove("is-hidden");
      }
      lastY = y;
    }
    if (y <= 0) header.classList.remove("is-hidden");
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true },
  );

  /* ---------- Kartu artikel (dipakai artikel.html dan index.html) ---------- */
  function cardHTML(a) {
    var foto = a.gambar || "gambar/artikel-" + a.id + ".jpg";
    return (
      '<a class="card" href="baca.html?id=' +
      a.id +
      '">' +
      '<div class="thumb ' +
      a.warna +
      '">' +
      '<img src="' +
      foto +
      '" alt="' +
      a.judul +
      '" loading="lazy" onerror="this.remove()">' +
      "</div>" +
      '<div class="card-body">' +
      '<span class="tag">' +
      a.kategori +
      "</span>" +
      "<h3>" +
      a.judul +
      "</h3>" +
      "<p>" +
      a.ringkasan +
      "</p>" +
      '<div class="meta">' +
      (a.penulis ? a.penulis + " · " : "") +
      a.tanggal +
      "</div>" +
      "</div>" +
      "</a>"
    );
  }

  /* Halaman Artikel: semua artikel */
  var grid = document.getElementById("articleGrid");
  if (grid && window.ARTICLES) {
    grid.innerHTML = ARTICLES.map(function (a) {
      return cardHTML(a);
    }).join("");
  }

  /* Halaman Muka: 3 artikel terbaru */
  var latest = document.getElementById("latestArticles");
  if (latest && window.ARTICLES) {
    latest.innerHTML = ARTICLES.slice(0, 3)
      .map(function (a) {
        return cardHTML(a);
      })
      .join("");
  }

  /* ---------- Halaman baca (baca.html) ---------- */
  var reader = document.getElementById("reader");
  if (reader && window.ARTICLES) {
    var id = new URLSearchParams(location.search).get("id");
    var idx = ARTICLES.findIndex(function (a) {
      return String(a.id) === id;
    });

    if (idx === -1) {
      document.title = "Artikel tidak ditemukan | Kreasi.Studio";
      reader.innerHTML =
        '<div class="reader-empty"><h1>Artikel tidak ditemukan</h1>' +
        "<p>Artikel yang Anda cari tidak tersedia atau tautannya keliru.</p>" +
        '<a class="btn" href="artikel.html">Kembali ke Artikel</a></div>';
    } else {
      var art = ARTICLES[idx];
      var prev = ARTICLES[idx - 1];
      var next = ARTICLES[idx + 1];
      var fotoArt = art.gambar || "gambar/artikel-" + art.id + ".jpg";

      document.title = art.judul + " | Kreasi.Studio";

      var body = "";
      var inList = false;
      art.isi.forEach(function (t) {
        var teks = t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        var isItem = t.indexOf("- ") === 0;

        if (isItem && !inList) {
          body += "<ul>";
          inList = true;
        }
        if (!isItem && inList) {
          body += "</ul>";
          inList = false;
        }

        if (isItem) body += "<li>" + teks.slice(2) + "</li>";
        else if (t.indexOf("## ") === 0)
          body += "<h2>" + teks.slice(3) + "</h2>";
        else body += "<p>" + teks + "</p>";
      });
      if (inList) body += "</ul>";

      reader.innerHTML =
        '<a class="reader-back" href="artikel.html">← Semua artikel</a>' +
        '<span class="tag">' +
        art.kategori +
        "</span>" +
        "<h1>" +
        art.judul +
        "</h1>" +
        '<div class="meta">' +
        (art.penulis ? art.penulis + " · " : "") +
        art.tanggal +
        "</div>" +
        '<div class="reader-cover thumb ' +
        art.warna +
        '">' +
        '<img src="' +
        fotoArt +
        '" alt="' +
        art.judul +
        '" onerror="this.remove()">' +
        "</div>" +
        '<div class="reader-body">' +
        body +
        "</div>" +
        '<nav class="reader-nav" aria-label="Artikel lainnya">' +
        (prev
          ? '<a class="prev" href="baca.html?id=' +
            prev.id +
            '"><small>← Sebelumnya</small>' +
            prev.judul +
            "</a>"
          : "") +
        (next
          ? '<a class="next" href="baca.html?id=' +
            next.id +
            '"><small>Berikutnya →</small>' +
            next.judul +
            "</a>"
          : "") +
        "</nav>";
    }
  }

  /* ---------- Bilah progres baca ---------- */
  var bar = document.getElementById("readProgress");
  if (bar) {
    window.addEventListener(
      "scroll",
      function () {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width =
          (h > 0 ? Math.min(100, (window.pageYOffset / h) * 100) : 0) + "%";
      },
      { passive: true },
    );
  }

  /* ---------- Galeri infografis (infografis.html) ---------- */
  var infoGrid = document.getElementById("infoGrid");
  if (infoGrid) {
    /* Urutan judul & nama infografis*/
    var JUDUL_INFOGRAFIS = [
      "Sulhan Alwi Rohman",
      "Syahda Aulia ",
      "Arin Siti Barkah",
      "Miranda Oktavia Ramadhani",
      "Destri Aura",
      "Zanira Nurul",
      "Yuli santika",
    ];
    var EKSTENSI = ["png", "jpg", "jpeg"];

    for (var n = 1; n <= JUDUL_INFOGRAFIS.length; n++) {
      (function (nomor) {
        var judul = JUDUL_INFOGRAFIS[nomor - 1];

        var fig = document.createElement("figure");
        fig.className = "info-item";

        var frame = document.createElement("a");
        frame.className = "info-frame g" + (((nomor - 1) % 6) + 1);
        frame.target = "_blank";
        frame.rel = "noopener";
        frame.setAttribute("aria-label", judul);

        var img = document.createElement("img");
        img.alt = judul;
        img.loading = "lazy";
        var urutan = 0;

        img.onload = function () {
          frame.href = img.src;
          frame.classList.add("ada");
        };
        img.onerror = function () {
          urutan++;
          if (urutan < EKSTENSI.length) {
            img.src = "gambar/infografis-" + nomor + "." + EKSTENSI[urutan];
          } else {
            img.remove(); /* tidak ada foto: tetap kotak warna */
          }
        };
        img.src = "gambar/infografis-" + nomor + "." + EKSTENSI[0];

        var cap = document.createElement("figcaption");
        cap.textContent = judul;

        frame.appendChild(img);
        fig.appendChild(frame);
        fig.appendChild(cap);
        infoGrid.appendChild(fig);
      })(n);
    }
  }
  /* ---------- Tahun di footer ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
