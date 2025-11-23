// ===== EXPLORE JURNAL USER - DATABASE VERSION =====
console.log("Starting explore_jurnal_user.js (Database Mode)");

// Initialize Feather Icons
if (typeof feather !== "undefined") {
  feather.replace();
} else {
  console.warn("Feather icons not loaded");
}

// Initialize PDF Extractor
let pdfExtractor = null;
if (typeof PDFTextExtractor !== "undefined") {
  pdfExtractor = new PDFTextExtractor();
  console.log("PDF Extractor ready");
} else {
  console.warn("PDF Extractor not available - text extraction disabled");
}

// ===== GET ARTICLE BY ID FROM DATABASE =====
async function getArticleById(id, type) {
  console.log("📥 Getting article from database:", id, type);

  try {
    if (type === "jurnal") {
      // Fetch from database
      const response = await fetch(`/ksmaja/api/get_journal.php?id=${id}`);
      const data = await response.json();

      if (data.ok && data.result) {
        const j = data.result;

        // Parse JSON fields
        const authors = j.authors
          ? typeof j.authors === "string"
            ? JSON.parse(j.authors)
            : j.authors
          : [];
        const tags = j.tags ? (typeof j.tags === "string" ? JSON.parse(j.tags) : j.tags) : [];
        const pengurus = j.pengurus
          ? typeof j.pengurus === "string"
            ? JSON.parse(j.pengurus)
            : j.pengurus
          : [];

        return {
          id: j.id,
          title: j.title,
          judul: j.title,
          abstract: j.abstract,
          abstrak: j.abstract,
          authors: authors,
          author: authors,
          penulis: authors.length > 0 ? authors[0] : "Unknown",
          tags: tags,
          pengurus: pengurus,
          volume: j.volume, // ✅ TAMBAH INI
          date: j.created_at,
          uploadDate: j.created_at,
          fileData: j.file_url,
          file: j.file_url,
          pdfUrl: j.file_url,
          coverImage: j.cover_url,
          cover: j.cover_url,
          email: j.email,
          contact: j.contact,
          kontak: j.contact,
          phone: j.contact,
          views: j.views || 0,
          type: "jurnal",
        };
      } else {
        console.error("Journal not found in database:", data);
        return null;
      }
    } else if (type === "opini") {
      // Fetch opinion from database
      const response = await fetch(`/ksmaja/api/get_opinion.php?id=${id}`);
      const data = await response.json();

      if (data.ok && data.result) {
        const o = data.result;
        return {
          id: o.id,
          title: o.title,
          judul: o.title,
          description: o.description,
          abstract: o.description,
          abstrak: o.description,
          category: o.category || "opini",
          author: [o.author_name || "Anonymous"],
          authors: [o.author_name || "Anonymous"],
          penulis: o.author_name || "Anonymous",
          date: o.created_at,
          uploadDate: o.created_at,
          coverImage: o.cover_url,
          cover: o.cover_url,
          fileUrl: o.file_url,
          fileData: o.file_url,
          file: o.file_url,
          pdfUrl: o.file_url,
          views: o.views || 0,
          type: "opini",
        };
      } else {
        console.error("Opinion not found in database:", data);
        return null;
      }
    }
  } catch (error) {
    console.error("❌ Error fetching article from database:", error);

    // Fallback to localStorage
    console.warn("⚠️ Falling back to localStorage...");
    if (type === "jurnal") {
      const journals = JSON.parse(localStorage.getItem("journals") || "[]");
      return journals.find((j) => j.id === id || j.id === String(id));
    } else {
      const opinions = JSON.parse(localStorage.getItem("opinions") || "[]");
      return opinions.find((o) => o.id === id || o.id === String(id));
    }
  }
}

// ===== LOAD ARTICLE DETAIL =====
async function loadArticleDetail() {
  console.log("Loading article detail...");

  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get("id");
  const articleType = urlParams.get("type") || "jurnal";

  console.log("Article ID:", articleId, "Type:", articleType);

  const loadingState = document.getElementById("loadingState");
  const errorState = document.getElementById("errorState");
  const articleDetail = document.getElementById("articleDetail"); //  ADD THIS

  // Show loading
  if (loadingState) {
    loadingState.style.display = "flex";
  }
  if (errorState) {
    errorState.style.display = "none";
  }
  //  ADD: Hide article detail during loading
  if (articleDetail) {
    articleDetail.style.display = "none";
  }

  // Validate parameters
  if (!articleId) {
    showError("Article ID missing from URL\n\nDebug Info:\nArticle ID: null\nType: " + articleType);
    return;
  }

  try {
    // Get article from database
    const article = await getArticleById(articleId, articleType);

    if (!article) {
      showError(
        "Article not found in database\n\nDebug Info:\nArticle ID: " +
          articleId +
          "\nType: " +
          articleType +
          "\nError: Article not found in database"
      );
      return;
    }

    console.log("Article loaded:", article);

    //  FIX: Hide loading, Show article detail
    if (loadingState) {
      loadingState.style.display = "none";
    }

    //  ADD: SHOW ARTICLE DETAIL
    if (articleDetail) {
      articleDetail.style.display = "block";
      console.log(" Article detail shown");
    }

    // Display article
    await displayArticle(article, articleType);
  } catch (error) {
    console.error("Error loading article:", error);
    showError(
      "Failed to load article\n\nDebug Info:\nArticle ID: " +
        articleId +
        "\nType: " +
        articleType +
        "\nError: " +
        error.message
    );
  }
}

// ===== DISPLAY ARTICLE =====
async function displayArticle(article, type) {
  console.log("Displaying article:", article.title);

  // Title
  const titleElement = document.getElementById("articleTitle");
  if (titleElement) {
    titleElement.textContent = article.title || article.judul || "Untitled";
  }

  //  FIX: Cover Image - ALWAYS show and set display block
  const coverImg = document.getElementById("articleCover");
  if (coverImg) {
    const coverUrl =
      article.coverImage ||
      article.cover ||
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&h=400&fit=crop";

    // Set display first
    coverImg.style.display = "block";
    coverImg.src = coverUrl;
    coverImg.onerror = () => {
      coverImg.src =
        "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&h=400&fit=crop";
    };

    console.log(" Cover image set:", coverUrl);
  }

  // Meta info
  const dateElement = document.getElementById("articleDate");
  if (dateElement) {
    const date = new Date(article.date || article.uploadDate);
    dateElement.textContent = date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  const viewsElement = document.getElementById("articleViews");
  if (viewsElement) {
    viewsElement.textContent = article.views || 0;
  }

  // Abstract
  const abstractElement = document.getElementById("articleAbstract");
  if (abstractElement) {
    abstractElement.textContent = article.abstract || article.abstrak || "No abstract available";
  }

  // Body
  const bodyElement = document.getElementById("articleBody");

  if (bodyElement) {
    // Check if we have body content
    if (article.body || article.content) {
      const bodyContent = article.body || article.content;
      bodyElement.innerHTML = `<div class="article-body-content">${bodyContent.replace(
        /\n/g,
        "<br><br>"
      )}</div>`;
      console.log(" Body content set from article.body");
    }
    // Try to extract from PDF
    else if (pdfExtractor && (article.fileData || article.file || article.pdfUrl)) {
      const pdfUrl = article.fileData || article.file || article.pdfUrl;
      console.log("Attempting to extract PDF content from:", pdfUrl);
      try {
        await pdfExtractor.renderPDFContent(pdfUrl, bodyElement);
        console.log(" PDF content extracted and rendered");
      } catch (error) {
        console.error("PDF extraction failed:", error);
        bodyElement.innerHTML = "<p>Unable to extract PDF content</p>";
      }
    }
    // No content available
    else {
      bodyElement.innerHTML = "<p>No additional content available</p>";
    }
  }

  // Tags
  const tagsSection = document.getElementById("tagsSection");
  const tagsContainer = document.getElementById("articleTags");
  if (tagsSection && tagsContainer) {
    if (article.tags && article.tags.length > 0) {
      tagsSection.style.display = "block";
      tagsContainer.innerHTML = article.tags
        .map((tag) => `<span class="tag">${tag}</span>`)
        .join("");
      console.log(" Tags displayed:", article.tags.length);
    } else {
      tagsSection.style.display = "none";
    }
  }

  // Authors
  const authorsContainer = document.getElementById("articleAuthors");
  if (authorsContainer) {
    if (article.authors && Array.isArray(article.authors) && article.authors.length > 0) {
      authorsContainer.innerHTML = article.authors
        .map((author) => `<span class="author-badge">${author}</span>`)
        .join("");
      console.log(" Authors displayed:", article.authors);
    } else {
      const singleAuthor = article.author || article.penulis || "Unknown Author";
      authorsContainer.innerHTML = `<span class="author-badge">${singleAuthor}</span>`;
    }
  }

  // Pengurus (only for jurnal)
  const pengurusSection = document.getElementById("pengurusSection");
  const pengurusContainer = document.getElementById("articlePengurus");
  if (pengurusSection && pengurusContainer) {
    if (type === "jurnal" && article.pengurus && article.pengurus.length > 0) {
      pengurusSection.style.display = "block";
      pengurusContainer.innerHTML = article.pengurus
        .map((pengurus) => `<span class="pengurus-badge">${pengurus}</span>`)
        .join("");
      console.log(" Pengurus displayed:", article.pengurus.length);
    } else {
      pengurusSection.style.display = "none";
    }
  }

  // Contact
  // Contact
  const emailLink = document.getElementById("articleEmail");
  const phoneEl = document.getElementById("articlePhone");

  if (emailLink) {
    const email = article.email || article.contact?.email || "-";
    emailLink.textContent = email;
    emailLink.href = email !== "-" ? `mailto:${email}` : "#";
  }

  if (phoneEl) {
    phoneEl.textContent = article.phone || article.contact?.phone || article.kontak || "-";
  }

  // Volume (TAMBAH INI)
  const volumeSection = document.getElementById("volumeSection");
  const volumeElement = document.getElementById("articleVolume");

  if (volumeSection && volumeElement) {
    if (type === "jurnal" && article.volume) {
      volumeSection.style.display = "block";
      volumeElement.textContent = article.volume;
      console.log("✅ Volume displayed:", article.volume);
    } else {
      volumeSection.style.display = "none";
    }
  }

  // PDF Section
  const pdfSection = document.getElementById("pdfSection");
  if (pdfSection) {
    const pdfUrl = article.fileData || article.file || article.pdfUrl;
    if (pdfUrl) {
      pdfSection.style.display = "block";

      const pdfIframe = document.getElementById("pdfIframe");
      if (pdfIframe) {
        pdfIframe.src = pdfUrl;
        console.log(" PDF iframe set:", pdfUrl);
      }

      const downloadLink = document.getElementById("pdfDownload");
      if (downloadLink) {
        downloadLink.href = pdfUrl;
        downloadLink.download = `${article.title || article.judul || "artikel"}.pdf`;
      }
    } else {
      pdfSection.style.display = "none";
    }
  }

  // Replace feather icons
  if (typeof feather !== "undefined") {
    feather.replace();
  }

  console.log(" Article displayed successfully");
}

// ===== SHOW ERROR =====
function showError(message) {
  console.error("Showing error:", message);

  const loadingState = document.getElementById("loadingState");
  const errorState = document.getElementById("errorState");

  if (loadingState) loadingState.style.display = "none";
  if (errorState) {
    errorState.style.display = "flex";
    const errorDebug = errorState.querySelector("p");
    if (errorDebug) {
      errorDebug.innerHTML = `
        ${errorDebug.textContent}<br><br>
        <strong>Debug Info:</strong><br>
        ${message.replace(/\n/g, "<br>")}
      `;
    }
  }
}

// ===== SETUP NAV DROPDOWN =====
function setupNavDropdown() {
  document.querySelectorAll(".nav-dropdown").forEach((dd) => {
    const btn = dd.querySelector(".nav-link.has-caret");
    const menu = dd.querySelector(".dropdown-menu");

    if (!btn || !menu) return;

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      document.querySelectorAll(".nav-dropdown.open").forEach((x) => {
        if (x !== dd) x.classList.remove("open");
      });

      dd.classList.toggle("open");
    });
  });

  document.addEventListener("click", () => {
    document.querySelectorAll(".nav-dropdown.open").forEach((x) => x.classList.remove("open"));
  });
}

// ===== SEARCH FUNCTIONALITY =====
const searchInput = document.getElementById("searchInput");
const searchModal = document.getElementById("searchModal");
const closeSearchModal = document.getElementById("closeSearchModal");
const searchResults = document.getElementById("searchResults");
let searchTimeout;

if (searchInput) {
  searchInput.addEventListener("input", function (e) {
    const query = e.target.value.trim();
    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {
      if (query.length >= 2) {
        performSearch(query);
        if (searchModal) searchModal.style.display = "flex";
      } else {
        if (searchModal) searchModal.style.display = "none";
      }
    }, 300);
  });
}

if (closeSearchModal) {
  closeSearchModal.addEventListener("click", function () {
    if (searchModal) searchModal.style.display = "none";
  });
}

if (searchModal) {
  searchModal.addEventListener("click", function (e) {
    if (e.target === searchModal) {
      searchModal.style.display = "none";
    }
  });
}

async function performSearch(query) {
  // Fetch from database instead of localStorage
  try {
    //  FIX: Tambahkan path lengkap
    const journalsResp = await fetch("/ksmaja/api/list_journals.php?limit=50&offset=0");
    const journalsData = await journalsResp.json();

    const opinionsResp = await fetch("/ksmaja/api/list_opinion.php?limit=50&offset=0");
    const opinionsData = await opinionsResp.json();

    const journals = journalsData.ok
      ? journalsData.results.map((j) => ({ ...j, type: "jurnal" }))
      : [];
    const opinions = opinionsData.ok
      ? opinionsData.results.map((o) => ({ ...o, type: "opini" }))
      : [];

    const allArticles = [...journals, ...opinions];

    const results = allArticles.filter((article) => {
      const title = (article.title || "").toLowerCase();
      const abstract = (article.abstract || article.description || "").toLowerCase();
      const searchQuery = query.toLowerCase();

      return title.includes(searchQuery) || abstract.includes(searchQuery);
    });

    displaySearchResults(results, query);
  } catch (error) {
    console.error("Search error:", error);
  }
}

function displaySearchResults(results, query) {
  if (!searchResults) return;

  if (results.length === 0) {
    searchResults.innerHTML = `
      <div class="search-no-results">
        <p>Tidak ada artikel yang cocok dengan pencarian "${query}"</p>
      </div>
    `;
    return;
  }

  searchResults.innerHTML = results
    .map(
      (article) => `
    <div class="search-result-item" onclick="window.location.href='explore_jurnal_user.html?id=${
      article.id
    }&type=${article.type}'">
      <div class="search-result-title">${article.title}</div>
      <div class="search-result-excerpt">${(
        article.abstract ||
        article.description ||
        ""
      ).substring(0, 150)}...</div>
      <div class="search-result-meta">
        <span class="badge">${article.type === "jurnal" ? "Jurnal" : "Opini"}</span>
      </div>
    </div>
  `
    )
    .join("");
}

// ===== INITIALIZE =====
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Explore Jurnal User initialized (Database Mode)");

  setupNavDropdown();
  loadArticleDetail();

  if (typeof feather !== "undefined") feather.replace();
});

console.log("explore_jurnal_user.js loaded (Database Mode)");
