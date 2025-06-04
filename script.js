// === DECLARAȚII GLOBALE ===
let translations = {};
let restaurantMenus = {};

// === FUNCȚII UTILE ===
function translate(key) {
  const lang = localStorage.getItem("lang") || "en";
  return translations[lang]?.[key] || key;
}

function createRatingElement(id) {
  const container = document.createElement("div");
  container.classList.add("rating");

  for (let i = 1; i <= 5; i++) {
    const star = document.createElement("span");
    star.textContent = "⭐";
    star.dataset.value = i;
    star.style.cursor = "pointer";

    star.onclick = () => {
      localStorage.setItem(id, i);
      updateStars(container, i);
    };

    container.appendChild(star);
  }

  const saved = localStorage.getItem(id);
  if (saved) updateStars(container, saved);
  return container;
}

function updateStars(container, value) {
  const stars = container.querySelectorAll("span");
  stars.forEach(star => {
    star.style.opacity = star.dataset.value <= value ? "1" : "0.3";
  });
}

function openLightbox(src) {
  const lightbox = document.getElementById("lightbox");
  const image = document.getElementById("lightboxImage");
  image.src = src;
  lightbox.style.display = "flex";
}

function closeLightbox() {
  document.getElementById("lightbox").style.display = "none";
}

// === Încărcare JSON ===
function loadTranslations(callback) {
  fetch("translations.json")
    .then(res => res.json())
    .then(data => {
      translations = data;
      if (typeof callback === "function") callback();
    })
    .catch(err => console.error("Eroare traduceri:", err));
}

function loadMenu(callback) {
  fetch("menu.json")
    .then(res => res.json())
    .then(data => {
      restaurantMenus = data;
      if (typeof callback === "function") callback();
    })
    .catch(err => console.error("Eroare meniu:", err));
}

// === UI ===
function updateLanguage(lang) {
  const currentTranslation = translations[lang];
  document.querySelector(".sidebar h2").innerText = currentTranslation.about;
  const info = document.querySelector(".location-info");
  info.innerHTML = `
    <p>${currentTranslation.description}</p>
    <h3>🌮 Xhaman</h3><p>${currentTranslation.xhaman}</p>
    <h3>🍕 Little Italy</h3><p>${currentTranslation.little_italy}</p>
    <h3>🍔 XHily Burger</h3><p>${currentTranslation.xhily}</p>
    <h3>🏖️ Hotel Playa Golf</h3><p>${currentTranslation.hotel}</p>`;
}

function openRestaurant(restaurant) {
  const restaurantData = restaurantMenus[restaurant]; 
  const categoriesPage = document.getElementById('categoriesPage');
  const galleryPage = document.getElementById('galleryPage');

  categoriesPage.innerHTML = '';
  categoriesPage.style.display = 'flex';
  galleryPage.style.display = 'none';

  for (let category in restaurantData.categories) {
    const images = restaurantData.categories[category];
    const categoryBox = document.createElement('div');
    categoryBox.classList.add('menu-category-box');
    categoryBox.onclick = () => openCategory(restaurant, category);

    const title = document.createElement('h3');
    title.innerText = translate(category);
    categoryBox.appendChild(title);

    const grid = document.createElement('div');
    grid.classList.add('app-style-grid');

    for (let i = 0; i < 3 && i < images.length; i++) {
      const img = document.createElement('img');
      img.src = images[i].src; // 🔧 FIX aici!
      img.alt = images[i].name?.en || "";
      img.classList.add('grid-item', 'large');
      img.style.cursor = "pointer";
      grid.appendChild(img);
    }

    for (let i = 3; i < 7 && i < images.length; i++) {
      const img = document.createElement('img');
      img.src = images[i].src; // 🔧 FIX aici!
      img.alt = images[i].name?.en || "";
      img.classList.add('grid-item', 'small');
      img.style.cursor = "pointer";
      grid.appendChild(img);
    }

    categoryBox.appendChild(grid);
    categoriesPage.appendChild(categoryBox);
  }
}


function openCategory(restaurant, category) {
  const galleryPage = document.getElementById("galleryPage");
  const galleryTitle = document.getElementById("galleryTitle");
  const galleryImages = document.getElementById("galleryImages");
  const backButton = document.getElementById("backButton");
  const images = restaurantMenus[restaurant].categories[category];
  const lang = localStorage.getItem("lang") || "en";

  galleryTitle.textContent = translate(category);
  galleryImages.innerHTML = "";

  images.forEach((item, index) => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("dish");

    const img = document.createElement("img");
    img.src = item.src;
    img.alt = item.name?.[lang] || "";
    img.onclick = () => openLightbox(item.src);

    const title = document.createElement("p");
    title.textContent = item.name?.[lang] || "Unnamed Dish";
    title.classList.add("dish-name");

    const rating = createRatingElement(`${restaurant}_${category}_${index}`);

    wrapper.appendChild(img);
    wrapper.appendChild(title);
    wrapper.appendChild(rating);
    galleryImages.appendChild(wrapper);
  });

  categoriesPage.style.display = "none";
  galleryPage.style.display = "block";
  backButton.style.display = "block";
}

document.getElementById("backButton").addEventListener("click", () => {
  document.getElementById("galleryPage").style.display = "none";
  document.getElementById("categoriesPage").style.display = "flex";
  document.getElementById("searchInput").value = "";
  document.getElementById("suggestions").innerHTML = "";
  document.getElementById("backButton").style.display = "none";
});

// === SEARCH ===
document.getElementById("searchInput").addEventListener("keypress", function (e) {
  if (e.key === "Enter") handleGlobalSearch();
});

document.getElementById("searchInput").addEventListener("input", function () {
  const query = this.value.toLowerCase();
  const suggestionBox = document.getElementById("suggestions");
  suggestionBox.innerHTML = "";
  const lang = localStorage.getItem("lang") || "en";

  if (!query) return;

  const suggestionsSet = new Set();

  for (const data of Object.values(restaurantMenus)) {
    for (const items of Object.values(data.categories)) {
      items.forEach((item) => {
        const name = item.name?.[lang]?.toLowerCase?.() || "";
        if (name.includes(query)) {
          suggestionsSet.add(item.name?.[lang]);
        }
      });
    }
  }

  Array.from(suggestionsSet).slice(0, 6).forEach((name) => {
    const div = document.createElement("div");
    div.classList.add("suggestion-item");
    div.textContent = name;
    div.onclick = () => {
      document.getElementById("searchInput").value = name;
      suggestionBox.innerHTML = "";
      handleGlobalSearch();
    };
    suggestionBox.appendChild(div);
  });
});

function handleGlobalSearch() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const galleryPage = document.getElementById("galleryPage");
  const galleryTitle = document.getElementById("galleryTitle");
  const galleryImages = document.getElementById("galleryImages");
  const lang = localStorage.getItem("lang") || "en";
  const backButton = document.getElementById("backButton");

  galleryTitle.textContent = `Results for "${query}"`;
  galleryImages.innerHTML = "";
  let found = false;

  for (const [restaurant, data] of Object.entries(restaurantMenus)) {
    for (const [category, items] of Object.entries(data.categories)) {
      items.forEach((item, index) => {
        const name = item.name?.[lang]?.toLowerCase?.() || "";
        if (name.includes(query)) {
          const wrapper = document.createElement("div");
          wrapper.classList.add("dish");

          const img = document.createElement("img");
          img.src = item.src;
          img.alt = item.name?.[lang];
          img.onclick = () => openLightbox(item.src);

          const title = document.createElement("p");
          title.textContent = item.name?.[lang];
          title.classList.add("dish-name");

          const rating = createRatingElement(`${restaurant}_${category}_${index}`);

          wrapper.appendChild(img);
          wrapper.appendChild(title);
          wrapper.appendChild(rating);
          galleryImages.appendChild(wrapper);

          found = true;
        }
      });
    }
  }

  if (!found) {
    galleryImages.innerHTML = `<p style="color: #888;">No results found.</p>`;
  }

  document.getElementById("categoriesPage").style.display = "none";
  galleryPage.style.display = "block";
  backButton.style.display = "block";
  document.getElementById("suggestions").innerHTML = "";
}

// === AUDIO ===
const audio = document.getElementById("backgroundAudio");
const toggle = document.getElementById("audioToggle");
audio.pause();
audio.autoplay = false;
toggle.innerHTML = `<span class="audio-icon">🔇</span>`;
toggle.setAttribute("aria-label", "Toggle audio");
toggle.style.fontSize = "1.5rem";

toggle.addEventListener("click", () => {
  if (audio.paused) {
    audio.play().then(() => {
      toggle.innerHTML = `<span class="audio-icon">🔊</span>`;
    }).catch((e) => {
      console.warn("Playback blocked:", e);
    });
  } else {
    audio.pause();
    toggle.innerHTML = `<span class="audio-icon">🔇</span>`;
  }
});

// === TEMA ===
const themeToggle = document.getElementById("themeToggle");
const body = document.body;
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  body.classList.toggle("light-theme", savedTheme === "light");
  document.documentElement.classList.toggle("light-theme", savedTheme === "light");
  updateThemeIcon(savedTheme);
}

themeToggle.addEventListener("click", () => {
  const isLight = body.classList.toggle("light-theme");
  document.documentElement.classList.toggle("light-theme", isLight);
  localStorage.setItem("theme", isLight ? "light" : "dark");
  updateThemeIcon(isLight ? "light" : "dark");
});

function updateThemeIcon(mode) {
  themeToggle.textContent = mode === "light" ? "🌞" : "🌓";
}

// === INIT ===
document.addEventListener("DOMContentLoaded", () => {
  loadTranslations(() => {
    loadMenu(() => {
      const savedLang = localStorage.getItem("lang") || "en";
      const langSelect = document.getElementById("languageSelect");

      if (langSelect) {
        langSelect.value = savedLang;
        updateLanguage(savedLang);
        langSelect.addEventListener("change", (e) => {
          const selectedLang = e.target.value;
          localStorage.setItem("lang", selectedLang);
          updateLanguage(selectedLang);
        });
      }

      openRestaurant("xhaman");
    });
  });
});
