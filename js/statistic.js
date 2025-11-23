class StatisticsManager {
  constructor() {
    this.articleCountElement = document.getElementById("articleCount");
    this.visitorCountElement = document.getElementById("visitorCount");
    this.isAnimating = false;
    this.init();
  }

  init() {
    if (!this.articleCountElement && !this.visitorCountElement) return;

    //Load dulu dari storage
    this.loadStatistics();

    //Track visitor (increment jika hari baru)
    this.trackVisitor();

    //Hitung artikel (read-only dari localStorage)
    this.updateArticleCount();

    // Set tampilan awal ke 0 SEBELUM animasi
    if (this.articleCountElement) this.articleCountElement.textContent = "0";
    if (this.visitorCountElement) this.visitorCountElement.textContent = "0";

    // Tunda animasi sedikit agar DOM sudah stabil
    requestAnimationFrame(() => {
      this.startCounterAnimation();
    });

    // Setup listener (jangan langsung ubah textContent, animasikan kalau perlu)
    window.addEventListener("journals:changed", () => {
      const oldCount = this.currentArticles;
      this.updateArticleCount();
      if (this.articleCountElement && this.currentArticles !== oldCount) {
        this.animateCounter(
          this.articleCountElement,
          oldCount,
          this.currentArticles,
          600
        );
      }
    });

    // Listen untuk perubahan opinions
    window.addEventListener("opinions:changed", () => {
      console.log("Opinions changed, updating article count...");
      const oldCount = this.currentArticles;
      this.updateArticleCount();
      if (this.articleCountElement && this.currentArticles !== oldCount) {
        this.animateCounter(
          this.articleCountElement,
          oldCount,
          this.currentArticles,
          600
        );
      }
    });

    // Listen untuk storage changes (opinions)
    window.addEventListener("storage", (e) => {
      if (e.key === "opinions") {
        console.log("Storage opinions changed, updating article count...");
        const oldCount = this.currentArticles;
        this.updateArticleCount();
        if (this.articleCountElement && this.currentArticles !== oldCount) {
          this.animateCounter(
            this.articleCountElement,
            oldCount,
            this.currentArticles,
            600
          );
        }
      }
    });

    window.addEventListener("storage", (e) => {
      if (e.key === "journals") {
        const oldCount = this.currentArticles;
        this.updateArticleCount();
        if (this.articleCountElement && this.currentArticles !== oldCount) {
          this.animateCounter(
            this.articleCountElement,
            oldCount,
            this.currentArticles,
            600
          );
        }
      }
      if (e.key === "siteStatistics") {
        const s = this.getStoredStats();
        const oldV = this.currentVisitors;
        this.currentVisitors = s.visitors || 0;
        if (this.visitorCountElement && this.currentVisitors !== oldV) {
          this.animateCounter(
            this.visitorCountElement,
            oldV,
            this.currentVisitors,
            600
          );
        }
      }
    });
  }

  loadStatistics() {
    const stats = this.getStoredStats();
    this.currentArticles = stats.articles || 0;
    this.currentVisitors = stats.visitors || 0;
  }

  getStoredStats() {
    const stored = localStorage.getItem("siteStatistics");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return this.defaultStats();
      }
    }
    return this.defaultStats();
  }

  defaultStats() {
    return {
      articles: 0,
      visitors: 0,
      lastVisit: null,
      uniqueVisitorId: this.generateVisitorId(),
    };
  }

  saveStatistics() {
    const stats = {
      articles: this.currentArticles || 0,
      visitors: this.currentVisitors || 0,
      lastVisit: new Date().toISOString(),
      uniqueVisitorId: this.getStoredStats().uniqueVisitorId,
    };
    localStorage.setItem("siteStatistics", JSON.stringify(stats));
  }

  generateVisitorId() {
    return (
      "visitor_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9)
    );
  }

  trackVisitor() {
    const stats = this.getStoredStats();

    // Cek apakah session ini sudah di-track
    // Jika belum pernah di-track di session ini, tambah visitor
    if (!sessionStorage.getItem("visitorTracked")) {
      this.currentVisitors = (stats.visitors || 0) + 1;
      this.saveStatistics();

      // Mark sudah di-track di session ini (jangan tambah lagi)
      sessionStorage.setItem("visitorTracked", "1");
    } else {
      // Session sudah di-track, ambil nilai terkini saja
      this.currentVisitors = stats.visitors || 0;
    }
  }

  updateArticleCount() {
    try {
      const journals = JSON.parse(localStorage.getItem("journals") || "[]");
      const opinions = JSON.parse(localStorage.getItem("opinions") || "[]");

      // Hitung total (jurnal + opini)
      const journalsCount = Array.isArray(journals) ? journals.length : 0;
      const opinionsCount = Array.isArray(opinions) ? opinions.length : 0;

      this.currentArticles = journalsCount + opinionsCount;

      console.log(
        `Article count: ${journalsCount} journals + ${opinionsCount} opinions = ${this.currentArticles} total`
      );
    } catch {
      this.currentArticles = 0;
    }
    // JANGAN langsung set textContent di sini, biar animasi yang handle
    this.saveStatistics();
  }

  startCounterAnimation() {
    // Animasi dari 0 → nilai target
    if (this.articleCountElement) {
      this.animateCounter(
        this.articleCountElement,
        0,
        this.currentArticles,
        700
      );
    }
    if (this.visitorCountElement) {
      this.animateCounter(
        this.visitorCountElement,
        0,
        this.currentVisitors,
        900
      );
    }
  }

  animateCounter(element, start, end, duration) {
    if (!element) return;

    element.classList.add("counting");
    const startTime = performance.now();
    const range = end - start;

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(start + range * easeOutQuart);

      element.textContent = String(current);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = String(end);
        element.classList.remove("counting");
      }
    };

    requestAnimationFrame(updateCounter);
  }

  incrementArticleCount() {
    const old = this.currentArticles;
    this.currentArticles++;
    this.saveStatistics();
    if (this.articleCountElement) {
      this.animateCounter(
        this.articleCountElement,
        old,
        this.currentArticles,
        500
      );
    }
  }

  decrementArticleCount() {
    if (this.currentArticles > 0) {
      const old = this.currentArticles;
      this.currentArticles--;
      this.saveStatistics();
      if (this.articleCountElement) {
        this.animateCounter(
          this.articleCountElement,
          old,
          this.currentArticles,
          500
        );
      }
    }
  }

  incrementVisitorCount() {
    const old = this.currentVisitors;
    this.currentVisitors++;
    this.saveStatistics();
    if (this.visitorCountElement) {
      this.animateCounter(
        this.visitorCountElement,
        old,
        this.currentVisitors,
        500
      );
    }
  }

  // DISABLE atau hapus setupPeriodicUpdates kalau tidak diperlukan
  setupPeriodicUpdates() {
    // Simulasi visitor acak (5% setiap 10 detik)
    // Ini bisa bikin loncat angka, sebaiknya dihapus untuk produksi
    setInterval(() => {
      if (Math.random() < 0.05) {
        this.incrementVisitorCount();
      }
    }, 10000);
  }

  resetStatistics() {
    localStorage.removeItem("siteStatistics");
    sessionStorage.removeItem("sessionVisitorCount");
    this.currentArticles = 0;
    this.currentVisitors = 0;
    this.saveStatistics();
    if (this.articleCountElement) this.articleCountElement.textContent = "0";
    if (this.visitorCountElement) this.visitorCountElement.textContent = "0";
  }
}
