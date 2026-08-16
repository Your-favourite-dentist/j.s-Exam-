const API = "https://nutriplan-api.vercel.app/api";

window.addEventListener("DOMContentLoaded", function () {

  const links = document.querySelectorAll(".nav-link");
  for (let i = 0; i < links.length; i++) {
    links[i].addEventListener("click", function (e) {
      e.preventDefault();

      for (let j = 0; j < links.length; j++) {
        links[j].classList.remove("bg-emerald-50", "text-emerald-700");
        links[j].classList.add("text-gray-600");
      }

      this.classList.add("bg-emerald-50", "text-emerald-700");
      this.classList.remove("text-gray-600");

      const text = this.innerText;

      if (text.includes("Meals")) {
        showPage("meals");
      } else if (text.includes("Product")) {
        showPage("products");
      } else if (text.includes("Food Log")) {
        showPage("foodlog");
        showLog();
      }
    });
  }

  getCategories();
  getAreas();
  getMeals();
});

function showPage(page) {
  document.getElementById("all-recipes-section").style.display = "none";
  document.getElementById("meal-categories-section").style.display = "none";
  document.getElementById("search-filters-section").style.display = "none";
  document.getElementById("meal-details").style.display = "none";
  document.getElementById("products-section").style.display = "none";
  document.getElementById("foodlog-section").style.display = "none";

  if (page === "meals") {
    document.getElementById("all-recipes-section").style.display = "block";
    document.getElementById("meal-categories-section").style.display = "block";
    document.getElementById("search-filters-section").style.display = "block";
  } else if (page === "products") {
    document.getElementById("products-section").style.display = "block";
  } else if (page === "foodlog") {
    document.getElementById("foodlog-section").style.display = "block";
  } else if (page === "details") {
    document.getElementById("meal-details").style.display = "block";
  }
}

async function getCategories() {
  const res = await fetch(API + "/meals/categories");
  const data = await res.json();
  const list = data.results;
  const box = document.getElementById("categories-grid");
  box.innerHTML = "";

  for (let i = 0; i < list.length; i++) {
    box.innerHTML += `
      <div class="category-card" data-category="${list[i].name}">
        <div>
          <h3>${list[i].name}</h3>
        </div>
      </div>
    `;
  }

  const cards = document.querySelectorAll(".category-card");
  for (let i = 0; i < cards.length; i++) {
    cards[i].addEventListener("click", function () {
      filterCategory(this.getAttribute("data-category"));
    });
  }
}

async function filterCategory(name) {
  const res = await fetch(API + "/meals/filter?category=" + name + "&limit=25");
  const data = await res.json();
  showMeals(data.results);
}

async function getAreas() {
  const res = await fetch(API + "/meals/areas");
  const data = await res.json();
  const list = data.results;

  const box = document.querySelector("#search-filters-section .flex.items-center.gap-3");
  if (!box) return;

  box.innerHTML = "";
  box.innerHTML += `<button class="area-btn px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm whitespace-nowrap" data-area="">All Cuisines</button>`;

  for (let i = 0; i < list.length; i++) {
    box.innerHTML += `<button class="area-btn px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap" data-area="${list[i].name}">${list[i].name}</button>`;
  }

  const buttons = document.querySelectorAll(".area-btn");
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", function () {
      for (let j = 0; j < buttons.length; j++) {
        buttons[j].classList.remove("bg-emerald-600", "text-white");
        buttons[j].classList.add("bg-gray-100", "text-gray-700");
      }
      this.classList.remove("bg-gray-100", "text-gray-700");
      this.classList.add("bg-emerald-600", "text-white");

      const area = this.getAttribute("data-area");
      if (area === "") {
        getMeals();
      } else {
        filterArea(area);
      }
    });
  }
}

async function filterArea(name) {
  const res = await fetch(API + "/meals/filter?area=" + name + "&limit=25");
  const data = await res.json();
  showMeals(data.results);
}

async function getMeals() {
  const res = await fetch(API + "/meals/search?limit=25");
  const data = await res.json();
  showMeals(data.results);
}

function showMeals(list) {
  const box = document.getElementById("recipes-grid");
  box.innerHTML = "";

  const count = document.getElementById("recipes-count");
  if (count) {
    count.innerText = "Showing " + list.length + " recipes";
  }

  for (let i = 0; i < list.length; i++) {
    const meal = list[i];

    let image = meal.image;
    if (!image) image = meal.thumbnail;
    if (!image) image = "https://via.placeholder.com/300x200?text=No+Image";

    let category = meal.category;
    if (!category) category = "Unknown";

    let area = meal.area;
    if (!area) area = "Unknown";

    let description = "Delicious recipe to try!";
    if (meal.instructions && meal.instructions[0]) {
      description = meal.instructions[0];
    }

    box.innerHTML += `
      <div class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer" data-meal-id="${meal.id}">
        <div class="relative h-48 overflow-hidden">
          <img class="w-full h-full object-cover" src="${image}" alt="${meal.name}" />
          <div class="absolute bottom-3 left-3 flex gap-2">
            <span class="px-2 py-1 bg-white text-xs rounded-full">${category}</span>
            <span class="px-2 py-1 bg-emerald-500 text-xs rounded-full text-white">${area}</span>
          </div>
        </div>
        <div class="p-4">
          <h3 class="text-base font-bold text-gray-900 mb-1">${meal.name}</h3>
          <p class="text-xs text-gray-600 mb-3">${description}</p>
          <div class="flex items-center justify-between text-xs">
            <span><i class="fa-solid fa-utensils"></i> ${category}</span>
            <span><i class="fa-solid fa-globe"></i> ${area}</span>
          </div>
        </div>
      </div>
    `;
  }
}

document.getElementById("recipes-grid").onclick = function (e) {
  const card = e.target.closest(".recipe-card");
  if (!card) return;

  const id = card.getAttribute("data-meal-id");

  fetch(API + "/meals/" + id)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      mealNow = data.result;

      document.querySelector("#meal-details h1").innerText = mealNow.name;
      document.querySelector("#meal-details img").src = mealNow.thumbnail || "";

      showPage("details");
    });
};

document.getElementById("back-to-meals-btn").onclick = function () {
  showPage("meals");
};


document.getElementById("modal-cancel-btn").onclick = function () {
  const modal = document.getElementById("log-meal-modal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
};

document.getElementById("modal-confirm-btn").onclick = function () {
  if (!mealNow) return;

  let log = localStorage.getItem("foodLog");
  if (log) {
    log = JSON.parse(log);
  } else {
    log = [];
  }

  log.push({
    name: mealNow.name,
    image: mealNow.thumbnail || ""
  });

  localStorage.setItem("foodLog", JSON.stringify(log));

  const modal = document.getElementById("log-meal-modal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");

  showPage("foodlog");
  showLog();
};

function showLog() {
  const box = document.getElementById("logged-items-list");
  if (!box) return;

  let log = localStorage.getItem("foodLog");
  if (log) {
    log = JSON.parse(log);
  } else {
    log = [];
  }

  if (log.length === 0) {
    box.innerHTML = `<p class="text-center text-gray-500 py-8">No meals logged today</p>`;
    return;
  }

  box.innerHTML = "";
  for (let i = 0; i < log.length; i++) {
    box.innerHTML += `
      <div class="flex items-center gap-4 p-3 bg-gray-50 rounded-xl mb-2">
        <img src="${log[i].image}" class="w-14 h-14 rounded-lg object-cover">
        <h4 class="font-semibold">${log[i].name}</h4>
      </div>
    `;
  }
}

document.getElementById("search-product-btn").onclick = function () {
  const text = document.getElementById("product-search-input").value;
  if (!text) return;
  findProducts(text);
};

async function findProducts(text) {
  const res = await fetch(API + "/products/search?q=" + text + "&limit=12");
  const data = await res.json();
  showProducts(data.results || []);
}

function showProducts(list) {
  const box = document.getElementById("products-grid");
  box.innerHTML = "";

  const count = document.getElementById("products-count");
  if (count) {
    count.innerText = list.length + " products found";
  }

  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    let calories = "";
    if (item.nutrients) {
      calories = Math.round(item.nutrients.calories) + " kcal";
    }

    box.innerHTML += `
      <div class="product-card bg-white rounded-xl overflow-hidden shadow-sm p-4">
        <img src="${item.image || ''}" class="w-full h-32 object-contain mb-3">
        <p class="text-xs text-emerald-600">${item.brand || ''}</p>
        <h3 class="font-bold text-gray-900 mb-2">${item.name || ''}</h3>
        <p class="text-sm text-gray-500">${calories}</p>
      </div>
    `;
  }
}

document.getElementById("search-input").oninput = function () {
  const text = this.value.trim();

  if (text === "") {
    getMeals();
    return;
  }

  findMeals(text);
};

async function findMeals(text) {
  const res = await fetch(API + "/meals/search?q=" + text + "&limit=25");
  const data = await res.json();
  showMeals(data.results || []);
}

document.getElementById("lookup-barcode-btn").onclick = function () {
  const parCode = document.getElementById("barcode-input").value;
  if (!parCode) return;

  fetch(API + "/products/barcode/" + parCode)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      const item = data.result || data;
      if (item) {
        showProducts([item]);
      } else {
        showProducts([]);
      }
    });
};

const USDA_KEY = "HwoFuw9i6dlzPbtDDnbQ4mVpERFcpxPnbqkrcYLg";

let mealNow = null;

document.getElementById("log-meal-btn").onclick = async function () {
  if (!mealNow) return;

  document.getElementById("modal-meal-name").innerText = mealNow.name;

  const modal = document.getElementById("log-meal-modal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");

  await showNutrition(mealNow);
};

async function showNutrition(meal) {
  const list = meal.ingredients || meal.measures || [];
  const ingredientsText = list.map(function (ing) {
    return ((ing.measure || "") + " " + (ing.name || "")).trim();
  });

  const res = await fetch(API + "/nutrition/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": USDA_KEY },
    body: JSON.stringify({ recipeName: meal.name, ingredients: ingredientsText })
  });
  const result = await res.json();

  if (result.success) {
    const number = result.data.perServing;
    document.getElementById("modal-calories").innerText = number.calories;
    document.getElementById("modal-protein").innerText = number.protein + "g";
    document.getElementById("modal-carbs").innerText = number.carbs + "g";
    document.getElementById("modal-fat").innerText = number.fat + "g";
  }
}