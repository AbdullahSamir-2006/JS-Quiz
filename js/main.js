
class NavigationRouter {
  constructor(app) {
    this.app = app;
    this.views = {
      home: "meals",
      product: "scanner",
      foodlog: "foodlog",
    };

    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.searchFiltersSection = document.getElementById(
      "search-filters-section",
    );
    this.mealCategoriesSection = document.getElementById(
      "meal-categories-section",
    );
    this.allRecipesSection = document.getElementById("all-recipes-section");
    this.mealDetailsSection = document.getElementById("meal-details");
    this.productsSection = document.getElementById("products-section");
    this.foodlogSection = document.getElementById("foodlog-section");

    this.navMealsBtn = document.getElementById("nav-meals");
    this.navScannerBtn = document.getElementById("nav-scanner");
    this.navFoodlogBtn = document.getElementById("nav-foodlog");

    this.headerTitle = document.querySelector("#header h1");
    this.headerSubtitle = document.querySelector("#header p");
  }

  bindEvents() {
    if (this.navMealsBtn) {
      this.navMealsBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.navigateTo("meals");
      });
    }
    if (this.navScannerBtn) {
      this.navScannerBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.navigateTo("scanner");
      });
    }
    if (this.navFoodlogBtn) {
      this.navFoodlogBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.navigateTo("foodlog");
      });
    }

    window.addEventListener("hashchange", () => this.handleHashChange());
  }

  navigateTo(pageName) {
    this.searchFiltersSection?.classList.add("hidden");
    this.mealCategoriesSection?.classList.add("hidden");
    this.allRecipesSection?.classList.add("hidden");
    this.mealDetailsSection?.classList.add("hidden");
    this.productsSection?.classList.add("hidden");
    this.foodlogSection?.classList.add("hidden");

    this.navMealsBtn?.classList.remove("active");
    this.navScannerBtn?.classList.remove("active");
    this.navFoodlogBtn?.classList.remove("active");

    if (pageName === "meals") {
      this.searchFiltersSection?.classList.remove("hidden");
      this.mealCategoriesSection?.classList.remove("hidden");
      this.allRecipesSection?.classList.remove("hidden");

      if (this.headerTitle) this.headerTitle.textContent = "Meals & Recipes";
      if (this.headerSubtitle)
        this.headerSubtitle.textContent =
          "Discover delicious and nutritious recipes tailored for you";
      this.navMealsBtn?.classList.add("active");

      if (location.hash !== "#home") {
        location.hash = "home";
      }
    } else if (pageName === "details") {
      this.mealDetailsSection?.classList.remove("hidden");
      if (this.headerTitle) this.headerTitle.textContent = "Recipe Details";
      if (this.headerSubtitle)
        this.headerSubtitle.textContent =
          "View full recipe information and nutrition facts";
      this.navMealsBtn?.classList.add("active");
    } else if (pageName === "scanner") {
      this.productsSection?.classList.remove("hidden");
      if (this.headerTitle) this.headerTitle.textContent = "Product Scanner";
      if (this.headerSubtitle)
        this.headerSubtitle.textContent =
          "Search packaged foods by name or barcode";
      this.navScannerBtn?.classList.add("active");

      if (location.hash !== "#product") {
        location.hash = "product";
      }
    } else if (pageName === "foodlog") {
      this.foodlogSection?.classList.remove("hidden");
      if (this.headerTitle) this.headerTitle.textContent = "Food Log";
      if (this.headerSubtitle)
        this.headerSubtitle.textContent =
          "Track and monitor your daily nutrition intake";
      this.navFoodlogBtn?.classList.add("active");

      if (location.hash !== "#foodlog") {
        location.hash = "foodlog";
      }
      this.app.foodLog.render();
    }
  }

  handleHashChange() {
    const rawHash = location.hash.replace("#", "");
    const view = this.views[rawHash] || "meals";
    this.navigateTo(view);
  }

  initRoute() {
    const rawHash = location.hash.replace("#", "");
    const initialView = this.views[rawHash] || "meals";
    this.navigateTo(initialView);
  }
}

// ============================================================================
class MealPlanner {
  constructor(app) {
    this.app = app;
    this.mealsList = [];
    this.categoriesList = [];
    this.areasList = [];
    this.currentViewMode = "grid";

    this.categoryMeta = {
      Beef: "fa-drumstick-bite",
      Chicken: "fa-drumstick-bite",
      Dessert: "fa-cake-candles",
      Lamb: "fa-drumstick-bite",
      Miscellaneous: "fa-bowl-rice",
      Pasta: "fa-bowl-food",
      Pork: "fa-bacon",
      Seafood: "fa-fish",
      Side: "fa-bowl-rice",
      Starter: "fa-utensils",
      Vegan: "fa-leaf",
      Vegetarian: "fa-seedling",
      Breakfast: "fa-mug-hot",
      Goat: "fa-cheese",
    };

    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.categoriesGrid = document.getElementById("categories-grid");
    this.areaFilters = document.getElementById("area-filters");
    this.recipesGrid = document.getElementById("recipes-grid");
    this.recipesCount = document.getElementById("recipes-count");
    this.searchInput = document.getElementById("search-input");
    this.gridViewBtn = document.getElementById("grid-view-btn");
    this.listViewBtn = document.getElementById("list-view-btn");
  }

  bindEvents() {
    if (this.recipesGrid) {
      this.recipesGrid.addEventListener("click", (e) => {
        const targetCard = e.target.closest(".recipe-card");
        if (targetCard) {
          const mealId = targetCard.getAttribute("data-meal-id");
          this.app.recipeDetails.fetchDetails(mealId);
        }
      });
    }

    if (this.gridViewBtn && this.listViewBtn) {
      this.gridViewBtn.addEventListener("click", () =>
        this.toggleViewMode("grid"),
      );
      this.listViewBtn.addEventListener("click", () =>
        this.toggleViewMode("list"),
      );
    }

    if (this.searchInput) {
      this.searchInput.addEventListener("input", () =>
        this.handleSearchQuery(),
      );
    }
  }

  async loadInitialCatalog() {
    await Promise.all([
      this.fetchCategories(),
      this.fetchAreas(),
      this.fetchMeals(),
    ]);
  }

  async fetchCategories() {
    try {
      const response = await fetch(
        "https://nutriplan-api.vercel.app/api/meals/categories",
      );
      const data = await response.json();
      this.categoriesList = data.results || [];
      this.renderCategories();
    } catch (err) {
      console.error("Error fetching recipe categories:", err);
    }
  }

  renderCategories() {
    if (!this.categoriesGrid) return;

    let gridMarkup = "";
    const renderLimit = Math.min(this.categoriesList.length, 12);

    for (let i = 0; i < renderLimit; i++) {
      const category = this.categoriesList[i];
      const iconClass = this.categoryMeta[category.name] || "fa-utensils";
      const normalizedCategoryName = category.name.toLowerCase();

      gridMarkup += `
        <div class="category-card rounded-xl p-3 border hover:shadow-md cursor-pointer transition-all group"
             data-category="${category.name}"
             data-category-id="${normalizedCategoryName}">
          <div class="flex items-center gap-2.5">
            <div class="category-icon-wrapper text-white w-9 h-9 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <i class="fa-solid ${iconClass}"></i>
            </div>
            <div>
              <h3 class="text-sm font-bold text-gray-900">${category.name}</h3>
            </div>
          </div>
        </div>
      `;
    }

    this.categoriesGrid.innerHTML = gridMarkup;

    const cards = this.categoriesGrid.querySelectorAll(".category-card");
    cards.forEach((card) => {
      card.addEventListener("click", () => {
        const categoryName = card.getAttribute("data-category");
        this.resetCuisineActiveStates();
        if (this.searchInput) this.searchInput.value = "";
        this.fetchMeals(categoryName, "", "");
      });
    });
  }

  async fetchAreas() {
    try {
      const response = await fetch(
        "https://nutriplan-api.vercel.app/api/meals/areas",
      );
      const data = await response.json();
      this.areasList = data.results || [];
      this.renderAreas();
    } catch (err) {
      console.error("Error fetching meal regions:", err);
    }
  }

  renderAreas() {
    if (!this.areaFilters) return;

    let areaButtonsMarkup = `
      <button class="area-btn active px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all" data-area="">
        All Cuisines
      </button>
    `;
    const renderLimit = Math.min(this.areasList.length, 10);

    for (let i = 0; i < renderLimit; i++) {
      const area = this.areasList[i];
      areaButtonsMarkup += `
        <button class="area-btn px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all" data-area="${area.name}">
          ${area.name}
        </button>
      `;
    }

    this.areaFilters.innerHTML = areaButtonsMarkup;

    const buttons = this.areaFilters.querySelectorAll(".area-btn");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((item) => item.classList.remove("active"));
        btn.classList.add("active");
        if (this.searchInput) this.searchInput.value = "";
        this.fetchMeals("", btn.getAttribute("data-area"), "");
      });
    });
  }

  resetCuisineActiveStates() {
    if (!this.areaFilters) return;
    const buttons = this.areaFilters.querySelectorAll(".area-btn");
    buttons.forEach((btn, idx) => {
      if (idx === 0) btn.classList.add("active");
      else btn.classList.remove("active");
    });
  }

  async fetchMeals(category = "", area = "", query = "") {
    try {
      let endpointUrl = "";
      if (query) {
        endpointUrl = `https://nutriplan-api.vercel.app/api/meals/search?q=${query}&page=1&limit=20`;
      } else if (category) {
        endpointUrl = `https://nutriplan-api.vercel.app/api/meals/filter?category=${category}&page=1&limit=20`;
      } else if (area) {
        endpointUrl = `https://nutriplan-api.vercel.app/api/meals/filter?area=${area}&page=1&limit=20`;
      } else {
        endpointUrl = `https://nutriplan-api.vercel.app/api/meals/search?q=chicken&page=1&limit=20`;
      }

      if (this.recipesGrid) {
        this.recipesGrid.innerHTML = `
          <div class="col-span-full flex items-center justify-center py-12">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        `;
      }

      const response = await fetch(endpointUrl);
      const data = await response.json();
      this.mealsList = data.results || [];
      this.renderMeals();
    } catch (err) {
      console.error("Error fetching recipes:", err);
      if (this.recipesGrid) {
        this.recipesGrid.innerHTML = `
          <div class="col-span-full text-center py-12 text-red-500">
              <i class="fa-solid fa-circle-exclamation text-4xl mb-2"></i>
              <p>Failed to load recipes. Please try again.</p>
          </div>
        `;
      }
    }
  }

  renderMeals() {
    if (!this.recipesGrid) return;

    if (this.mealsList.length === 0) {
      this.recipesCount.textContent = "No recipes found";
      this.recipesGrid.className = "grid grid-cols-1 gap-5";
      this.recipesGrid.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <i class="fa-solid fa-magnifying-glass text-gray-400 text-2xl"></i>
            </div>
            <p class="text-gray-500 text-lg">No recipes found</p>
            <p class="text-gray-400 text-sm mt-2">Try searching for something else</p>
        </div>
      `;
      return;
    }

    this.recipesCount.textContent = `Showing ${this.mealsList.length} recipes`;
    let markup = "";

    if (this.currentViewMode === "grid") {
      this.recipesGrid.className = "grid grid-cols-4 gap-5";

      this.mealsList.forEach((meal) => {
        const textSnippet =
          meal.instructions && meal.instructions.length > 0
            ? meal.instructions[0]
            : "Delicious recipe to try!";
        markup += `
          <div class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group border border-gray-100" data-meal-id="${meal.id}">
            <div class="relative h-48 overflow-hidden bg-gray-50">
              <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="${meal.thumbnail}" alt="${meal.name}" loading="lazy" />
              <div class="absolute bottom-3 left-3 flex gap-2">
                ${meal.category ? `<span class="px-2 py-1 bg-gray-100 text-[10px] font-semibold rounded-full text-gray-800 flex items-center gap-1 shadow-sm"><i class="fa-solid fa-tag text-emerald-600"></i> ${meal.category}</span>` : ""}
                ${meal.area ? `<span class="px-2 py-1 bg-gray-100 text-[10px] font-semibold rounded-full text-gray-800 flex items-center gap-1 shadow-sm"><i class="fa-solid fa-globe text-blue-500"></i> ${meal.area}</span>` : ""}
              </div>
            </div>
            <div class="p-4 flex flex-col justify-between h-32">
              <div>
                <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">${meal.name}</h3>
                <p class="text-xs text-gray-500 line-clamp-2 mb-2">${textSnippet}</p>
              </div>
              <div class="flex items-center justify-between text-xs pt-2">
                <span class="font-semibold text-gray-900 flex items-center gap-1">
                  <i class="fa-solid fa-utensils text-emerald-600"></i> ${meal.category || "Meal"}
                </span>
                <span class="font-semibold text-gray-500 flex items-center gap-1">
                  <i class="fa-solid fa-globe text-blue-500"></i> ${meal.area || "International"}
                </span>
              </div>
            </div>
          </div>
        `;
      });
    } else {
      this.recipesGrid.className = "grid grid-cols-2 gap-5";

      this.mealsList.forEach((meal) => {
        const textSnippet =
          meal.instructions && meal.instructions.length > 0
            ? meal.instructions.join(" ")
            : "Delicious recipe to try!";
        markup += `
          <div class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group flex h-40 border border-gray-100" data-meal-id="${meal.id}">
            <div class="relative w-40 shrink-0 overflow-hidden bg-gray-50">
              <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="${meal.thumbnail}" alt="${meal.name}" loading="lazy" />
              <div class="absolute bottom-2 left-2 flex flex-col gap-1">
                ${meal.category ? `<span class="px-1.5 py-0.5 bg-gray-100 text-[8px] font-semibold rounded-full text-gray-800 flex items-center gap-0.5 self-start shadow-sm"><i class="fa-solid fa-tag text-emerald-600"></i> ${meal.category}</span>` : ""}
                ${meal.area ? `<span class="px-1.5 py-0.5 bg-gray-100 text-[8px] font-semibold rounded-full text-gray-800 flex items-center gap-0.5 self-start shadow-sm"><i class="fa-solid fa-globe text-blue-500"></i> ${meal.area}</span>` : ""}
              </div>
            </div>
            <div class="p-4 flex-1 flex flex-col justify-start gap-3 overflow-hidden">
              <div>
                <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">${meal.name}</h3>
                <p class="text-xs text-gray-500 line-clamp-2">${textSnippet}</p>
              </div>
              <div class="flex items-center justify-between text-xs pt-2">
                <span class="font-semibold text-gray-900 flex items-center gap-1"><i class="fa-solid fa-utensils text-emerald-600"></i> ${meal.category || "Meal"}</span>
                <span class="font-semibold text-gray-500 flex items-center gap-1"><i class="fa-solid fa-globe text-blue-500"></i> ${meal.area || "International"}</span>
              </div>
            </div>
          </div>
        `;
      });
    }

    this.recipesGrid.innerHTML = markup;
  }

  toggleViewMode(mode) {
    this.currentViewMode = mode;
    if (mode === "grid") {
      this.gridViewBtn?.classList.add("active");
      this.listViewBtn?.classList.remove("active");
    } else {
      this.listViewBtn?.classList.add("active");
      this.gridViewBtn?.classList.remove("active");
    }
    this.renderMeals();
  }

  handleSearchQuery() {
    const rawInput = this.searchInput.value;
    let listContent = "";

    this.mealsList.forEach((meal) => {
      if (meal.name.toLowerCase().includes(rawInput.toLowerCase())) {
        const textSnippet =
          meal.instructions && meal.instructions.length > 0
            ? meal.instructions[0]
            : "Delicious recipe to try!";

        if (this.currentViewMode === "grid") {
          listContent += `
            <div class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group border border-gray-100" data-meal-id="${meal.id}">
              <div class="relative h-48 overflow-hidden bg-gray-50">
                <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="${meal.thumbnail}" alt="${meal.name}" loading="lazy" />
                <div class="absolute bottom-3 left-3 flex gap-2">
                  ${meal.category ? `<span class="px-2 py-1 bg-gray-100 text-[10px] font-semibold rounded-full text-gray-800 flex items-center gap-1 shadow-sm"><i class="fa-solid fa-tag text-emerald-600"></i> ${meal.category}</span>` : ""}
                  ${meal.area ? `<span class="px-2 py-1 bg-gray-100 text-[10px] font-semibold rounded-full text-gray-800 flex items-center gap-1 shadow-sm"><i class="fa-solid fa-globe text-blue-500"></i> ${meal.area}</span>` : ""}
                </div>
              </div>
              <div class="p-4 flex flex-col justify-between h-32">
                <div>
                  <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">${meal.name}</h3>
                  <p class="text-xs text-gray-500 line-clamp-2 mb-2">${textSnippet}</p>
                </div>
                <div class="flex items-center justify-between text-xs pt-2">
                  <span class="font-semibold text-gray-900 flex items-center gap-1">
                    <i class="fa-solid fa-utensils text-emerald-600"></i> ${meal.category || "Meal"}
                  </span>
                  <span class="font-semibold text-gray-500 flex items-center gap-1">
                    <i class="fa-solid fa-globe text-blue-500"></i> ${meal.area || "International"}
                  </span>
                </div>
              </div>
            </div>
          `;
        } else {
          const joinedSnippet =
            meal.instructions && meal.instructions.length > 0
              ? meal.instructions.join(" ")
              : "Delicious recipe to try!";
          listContent += `
            <div class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group flex h-40 border border-gray-100" data-meal-id="${meal.id}">
              <div class="relative w-40 shrink-0 overflow-hidden bg-gray-50">
                <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="${meal.thumbnail}" alt="${meal.name}" loading="lazy" />
                <div class="absolute bottom-2 left-2 flex flex-col gap-1">
                  ${meal.category ? `<span class="px-1.5 py-0.5 bg-gray-100 text-[8px] font-semibold rounded-full text-gray-800 flex items-center gap-0.5 self-start shadow-sm"><i class="fa-solid fa-tag text-emerald-600"></i> ${meal.category}</span>` : ""}
                  ${meal.area ? `<span class="px-1.5 py-0.5 bg-gray-100 text-[8px] font-semibold rounded-full text-gray-800 flex items-center gap-0.5 self-start shadow-sm"><i class="fa-solid fa-globe text-blue-500"></i> ${meal.area}</span>` : ""}
                </div>
              </div>
              <div class="p-4 flex-1 flex flex-col justify-start gap-3 overflow-hidden">
                <div>
                  <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">${meal.name}</h3>
                  <p class="text-xs text-gray-500 line-clamp-2">${textSnippet}</p>
                </div>
                <div class="flex items-center justify-between text-xs pt-2">
                  <span class="font-semibold text-gray-900 flex items-center gap-1"><i class="fa-solid fa-utensils text-emerald-600"></i> ${meal.category || "Meal"}</span>
                  <span class="font-semibold text-gray-500 flex items-center gap-1"><i class="fa-solid fa-globe text-blue-500"></i> ${meal.area || "International"}</span>
                </div>
              </div>
            </div>
          `;
        }
      }
    });

    if (this.recipesGrid) {
      this.recipesGrid.innerHTML = listContent;
    }
  }
}

// ============================================================================
class RecipeDetails {
  constructor(app) {
    this.app = app;
    this.mealDetailsView = document.getElementById("meal-details");
  }

  async fetchDetails(id) {
    try {
      this.app.router.navigateTo("details");

      if (this.mealDetailsView) {
        this.mealDetailsView.innerHTML = `
          <div class="max-w-7xl mx-auto flex items-center justify-center py-24">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        `;
      }

      const response = await fetch(
        `https://nutriplan-api.vercel.app/api/meals/${id}`,
      );
      const data = await response.json();
      const meal = data.result;

      if (!meal) throw new Error("Could not find the selected recipe.");

      this.render(meal);
      this.fetchNutritionMetrics(meal);
    } catch (err) {
      console.error("Error loading meal metadata:", err);
      if (this.mealDetailsView) {
        this.mealDetailsView.innerHTML = `
          <div class="max-w-7xl mx-auto text-center py-24 text-red-500">
            <button id="back-to-meals-btn-error" class="flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-medium mb-6 transition-colors">
              <i class="fa-solid fa-arrow-left"></i>
              <span>Back to Recipes</span>
            </button>
            <i class="fa-solid fa-circle-exclamation text-4xl mb-2"></i>
            <p>Failed to load recipe details. Please try again.</p>
          </div>
        `;

        const backBtnError = document.getElementById("back-to-meals-btn-error");
        backBtnError?.addEventListener("click", () =>
          this.app.router.navigateTo("meals"),
        );
      }
    }
  }

  render(meal) {
    if (!this.mealDetailsView) return;

    let ingredientTemplate = "";
    meal.ingredients.forEach((ing, i) => {
      ingredientTemplate += `
        <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
          <input type="checkbox" id="ing-${i}" class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500" />
          <label for="ing-${i}" class="text-gray-700 cursor-pointer select-none">
            <span class="font-medium text-gray-900">${ing.measure}</span> ${ing.ingredient}
          </label>
        </div>
      `;
    });

    let stepsTemplate = "";
    meal.instructions.forEach((step, idx) => {
      stepsTemplate += `
        <div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
          <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
            ${idx + 1}
          </div>
          <p class="text-gray-700 leading-relaxed pt-2">${step}</p>
        </div>
      `;
    });

    let mediaIframeHtml = "";
    if (meal.youtube) {
      const urlSplit = meal.youtube.split("v=")[1];
      if (urlSplit) {
        const videoId = urlSplit.split("&")[0];
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        mediaIframeHtml = `
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i class="fa-brands fa-youtube text-red-500"></i>
              Video Tutorial
            </h2>
            <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:12px;">
              <iframe
                src="${embedUrl}"
                style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen>
              </iframe>
            </div>
          </div>
        `;
      }
    }

    let tagsHtml = "";
    if (meal.category) {
      tagsHtml += `<span class="px-3 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full">${meal.category}</span>`;
    }
    if (meal.area) {
      tagsHtml += `<span class="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">${meal.area}</span>`;
    }
    if (meal.tags && meal.tags.length > 0) {
      meal.tags.forEach((tag) => {
        tagsHtml += `<span class="px-3 py-1 bg-purple-500 text-white text-sm font-semibold rounded-full">${tag}</span>`;
      });
    }

    this.mealDetailsView.innerHTML = `
      <div class="max-w-7xl mx-auto">
        <button id="back-to-meals-btn" class="flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-medium mb-6 transition-colors">
          <i class="fa-solid fa-arrow-left"></i>
          <span>Back to Recipes</span>
        </button>

        <div class="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div class="relative h-80 md:h-96">
            <img src="${meal.thumbnail}" alt="${meal.name}" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            <div class="absolute bottom-0 left-0 right-0 p-8">
              <div class="flex items-center gap-3 mb-3">
                ${tagsHtml}
              </div>
              <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">${meal.name}</h1>
              <div class="flex items-center gap-6 text-white/90">
                <span class="flex items-center gap-2">
                  <i class="fa-solid fa-clock"></i>
                  <span>30 min</span>
                </span>
                <span class="flex items-center gap-2">
                  <i class="fa-solid fa-utensils"></i>
                  <span id="hero-servings">Calculating servings...</span>
                </span>
                <span class="flex items-center gap-2">
                  <i class="fa-solid fa-fire"></i>
                  <span id="hero-calories">Calculating calories...</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap gap-3 mb-8">
          <button id="log-meal-btn" class="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all cursor-not-allowed opacity-50" disabled>
            <i class="fa-solid fa-clipboard-list"></i>
            <span id="log-meal-btn-text">Calculating Nutrition...</span>
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-8">
            <div class="bg-white rounded-2xl shadow-lg p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i class="fa-solid fa-list-check text-emerald-600"></i>
                Ingredients
                <span class="text-sm font-normal text-gray-500 ml-auto">${meal.ingredients.length} items</span>
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                ${ingredientTemplate}
              </div>
            </div>

            <div class="bg-white rounded-2xl shadow-lg p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i class="fa-solid fa-shoe-prints text-emerald-600"></i>
                Instructions
              </h2>
              <div class="space-y-4">
                ${stepsTemplate}
              </div>
            </div>

            ${mediaIframeHtml}
          </div>

          <div class="space-y-6">
            <div class="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i class="fa-solid fa-chart-pie text-emerald-600"></i>
                Nutrition Facts
              </h2>
              <div id="nutrition-facts-container">
                <div class="flex items-center justify-center py-12">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const backBtn = document.getElementById("back-to-meals-btn");
    backBtn?.addEventListener("click", () =>
      this.app.router.navigateTo("meals"),
    );
  }

  async fetchNutritionMetrics(meal) {
    const formattedIngredients = meal.ingredients.map(
      (ing) => `${ing.measure} ${ing.ingredient}`,
    );

    try {
      const response = await fetch(
        "https://nutriplan-api.vercel.app/api/nutrition/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "xRGnhxcXrKuX8hJpeeQE5Rac9b7dyQDpaMs5fWFL",
          },
          body: JSON.stringify({
            recipeName: meal.name,
            ingredients: formattedIngredients,
          }),
        },
      );

      if (!response.ok) throw new Error("Nutrition API response failure.");

      const payload = await response.json();
      this.renderNutritionFacts(payload.data, meal);
    } catch (err) {
      console.error("Nutrition analysis module failed:", err);
      const container = document.getElementById("nutrition-facts-container");
      if (container) {
        container.innerHTML = `
          <div class="text-center py-6 text-red-500">
            <i class="fa-solid fa-circle-exclamation text-3xl mb-2"></i>
            <p class="text-sm font-semibold">Failed to load nutrition data.</p>
          </div>
        `;
      }
    }
  }

  renderNutritionFacts(metrics, meal) {
    const servings = metrics.servings || 4;
    const perServing = metrics.perServing;
    const totals = metrics.totals;

    const servingsEl = document.getElementById("hero-servings");
    const caloriesEl = document.getElementById("hero-calories");

    if (servingsEl) servingsEl.textContent = `${servings} servings`;
    if (caloriesEl)
      caloriesEl.textContent = `${Math.round(perServing.calories)} cal/serving`;

    const logBtn = document.getElementById("log-meal-btn");
    const logBtnText = document.getElementById("log-meal-btn-text");

    if (logBtn && logBtnText) {
      logBtn.classList.remove("opacity-50", "cursor-not-allowed");
      logBtn.removeAttribute("disabled");
      logBtnText.textContent = "Log This Meal";

      logBtn.addEventListener("click", () => {
        this.app.foodLog.openLogModal(meal, perServing);
      });
    }

    const proteinPercent =
      Math.min(100, Math.round((perServing.protein / 50) * 100)) || 0;
    const carbsPercent =
      Math.min(100, Math.round((perServing.carbs / 250) * 100)) || 0;
    const fatPercent =
      Math.min(100, Math.round((perServing.fat / 65) * 100)) || 0;
    const fiberPercent =
      Math.min(100, Math.round((perServing.fiber / 25) * 100)) || 0;
    const sugarPercent =
      Math.min(100, Math.round((perServing.sugar / 50) * 100)) || 0;

    const container = document.getElementById("nutrition-facts-container");
    if (!container) return;

    container.innerHTML = `
      <p class="text-sm text-gray-500 mb-4">Per serving</p>

      <div class="text-center py-4 mb-4 bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl">
        <p class="text-sm text-gray-600">Calories per serving</p>
        <p class="text-4xl font-bold text-emerald-600">${Math.round(perServing.calories)}</p>
        <p class="text-xs text-gray-500 mt-1">Total: ${Math.round(totals.calories)} cal</p>
      </div>

      <div class="space-y-4">
        <div>
          <div class="flex items-center justify-between text-sm mb-1">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span class="text-gray-700">Protein</span>
            </div>
            <span class="font-bold text-gray-900">${Math.round(perServing.protein)}g</span>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-2">
            <div class="bg-emerald-500 h-2 rounded-full" style="width: ${proteinPercent}%"></div>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between text-sm mb-1">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-blue-500"></div>
              <span class="text-gray-700">Carbs</span>
            </div>
            <span class="font-bold text-gray-900">${Math.round(perServing.carbs)}g</span>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-2">
            <div class="bg-blue-500 h-2 rounded-full" style="width: ${carbsPercent}%"></div>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between text-sm mb-1">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-purple-500"></div>
              <span class="text-gray-700">Fat</span>
            </div>
            <span class="font-bold text-gray-900">${Math.round(perServing.fat)}g</span>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-2">
            <div class="bg-purple-500 h-2 rounded-full" style="width: ${fatPercent}%"></div>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between text-sm mb-1">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-orange-500"></div>
              <span class="text-gray-700">Fiber</span>
            </div>
            <span class="font-bold text-gray-900">${Math.round(perServing.fiber)}g</span>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-2">
            <div class="bg-orange-500 h-2 rounded-full" style="width: ${fiberPercent}%"></div>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between text-sm mb-1">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-pink-500"></div>
              <span class="text-gray-700">Sugar</span>
            </div>
            <span class="font-bold text-gray-900">${Math.round(perServing.sugar)}g</span>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-2">
            <div class="bg-pink-500 h-2 rounded-full" style="width: ${sugarPercent}%"></div>
          </div>
        </div>
      </div>

      <div class="mt-6 pt-6 border-t border-gray-100">
        <h3 class="text-sm font-semibold text-gray-900 mb-3">Vitamins &amp; Minerals (% Daily Value)</h3>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Vitamin A</span>
            <span class="font-medium">${perServing.vitaminA || 0}%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Vitamin C</span>
            <span class="font-medium">${perServing.vitaminC || 0}%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Calcium</span>
            <span class="font-medium">${perServing.calcium || 0}%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Iron</span>
            <span class="font-medium">${perServing.iron || 0}%</span>
          </div>
        </div>
      </div>
    `;
  }
}
// ============================================================================
class DailyFoodLog {
  constructor(app) {
    this.app = app;
    this.foodLogList = [];
    this.dailyCaloriesGoal = 2000;
    this.dailyProteinGoal = 50;
    this.dailyCarbsGoal = 250;
    this.dailyFatGoal = 65;

    this.initDOM();
    this.bindEvents();
    this.loadFromStorage();
  }

  initDOM() {
    this.listContainer = document.getElementById("logged-items-list");
    this.clearLogBtn = document.getElementById("clear-foodlog");
  }

  bindEvents() {
    if (this.clearLogBtn) {
      this.clearLogBtn.addEventListener("click", () => this.clearAllEntries());
    }
  }

  loadFromStorage() {
    try {
      const storedData = localStorage.getItem("nutriplan_foodlog");
      this.foodLogList = storedData ? JSON.parse(storedData) : [];
    } catch (err) {
      this.foodLogList = [];
    }
  }

  saveToStorage() {
    localStorage.setItem("nutriplan_foodlog", JSON.stringify(this.foodLogList));
  }

  logMealEntry(meal, perServing, servingsCount) {
    this.foodLogList.push({
      meal: meal,
      servings: servingsCount,
      calories: Math.round(perServing.calories * servingsCount),
      protein: Math.round(perServing.protein * servingsCount),
      carbs: Math.round(perServing.carbs * servingsCount),
      fat: Math.round(perServing.fat * servingsCount),
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });

    this.saveToStorage();
    this.render();
    this.app.router.navigateTo("foodlog");
  }

  openLogModal(meal, perServing) {
    const modalOverlay = document.createElement("div");
    modalOverlay.id = "log-modal-overlay";

    modalOverlay.innerHTML = `
      <div class="log-modal-box">
        <div class="log-modal-header">
          <img class="log-modal-thumb" src="${meal.thumbnail}" alt="${meal.name}" />
          <div>
            <h3 class="log-modal-title">Log This Meal</h3>
            <p class="log-modal-mealname">${meal.name}</p>
          </div>
        </div>

        <div class="log-modal-counter-section">
          <p class="log-modal-counter-label">Number of Servings</p>
          <div class="log-modal-counter-wrapper">
            <button id="modal-minus-btn" class="log-modal-counter-btn">−</button>
            <input id="modal-servings-input" class="log-modal-counter-input" type="number" value="1" min="0.5" step="0.5" />
            <button id="modal-plus-btn" class="log-modal-counter-btn">+</button>
          </div>
        </div>

        <div class="log-modal-preview-box">
          <p class="log-modal-preview-label">Estimated nutrition per serving:</p>
          <div class="log-modal-preview-grid">
            <div class="log-modal-preview-item">
              <p id="modal-cal" class="log-modal-preview-val-cal">${Math.round(perServing.calories)}</p>
              <p class="log-modal-preview-sub">Calories</p>
            </div>
            <div class="log-modal-preview-item">
              <p id="modal-prot" class="log-modal-preview-val-prot">${Math.round(perServing.protein)}g</p>
              <p class="log-modal-preview-sub">Protein</p>
            </div>
            <div class="log-modal-preview-item">
              <p id="modal-carbs" class="log-modal-preview-val-carbs">${Math.round(perServing.carbs)}g</p>
              <p class="log-modal-preview-sub">Carbs</p>
            </div>
            <div class="log-modal-preview-item">
              <p id="modal-fat" class="log-modal-preview-val-fat">${Math.round(perServing.fat)}g</p>
              <p class="log-modal-preview-sub">Fat</p>
            </div>
          </div>
        </div>

        <div class="log-modal-actions">
          <button id="modal-cancel-btn" class="log-modal-btn-cancel">Cancel</button>
          <button id="modal-log-btn" class="log-modal-btn-log">
            <i class="fa-solid fa-clipboard-list"></i> Log Meal
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    const minusBtn = document.getElementById("modal-minus-btn");
    const plusBtn = document.getElementById("modal-plus-btn");
    const servingsInput = document.getElementById("modal-servings-input");

    const updatePreview = () => {
      const scaleValue = parseFloat(servingsInput.value) || 1;
      document.getElementById("modal-cal").textContent = Math.round(
        perServing.calories * scaleValue,
      );
      document.getElementById("modal-prot").textContent =
        `${Math.round(perServing.protein * scaleValue)}g`;
      document.getElementById("modal-carbs").textContent =
        `${Math.round(perServing.carbs * scaleValue)}g`;
      document.getElementById("modal-fat").textContent =
        `${Math.round(perServing.fat * scaleValue)}g`;
    };

    minusBtn?.addEventListener("click", () => {
      const currentVal = parseFloat(servingsInput.value) || 1;
      if (currentVal > 0.5) {
        servingsInput.value = Math.round((currentVal - 0.5) * 10) / 10;
        updatePreview();
      }
    });

    plusBtn?.addEventListener("click", () => {
      const currentVal = parseFloat(servingsInput.value) || 1;
      servingsInput.value = Math.round((currentVal + 0.5) * 10) / 10;
      updatePreview();
    });

    servingsInput?.addEventListener("input", updatePreview);

    document
      .getElementById("modal-cancel-btn")
      ?.addEventListener("click", () => {
        modalOverlay.remove();
      });

    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.remove();
      }
    });

    document.getElementById("modal-log-btn")?.addEventListener("click", () => {
      const scaledServings = parseFloat(servingsInput.value) || 1;
      const computedCalories = Math.round(perServing.calories * scaledServings);

      modalOverlay.remove();
      this.logMealEntry(meal, perServing, scaledServings);

      Swal.fire({
        icon: "success",
        title: "Meal Logged!",
        html: `
          <p style="color:#6B7280; margin:0 0 8px 0;">${meal.name} (${scaledServings} serving${scaledServings !== 1 ? "s" : ""}) has been added to your daily log.</p>
          <p style="font-size:18px; font-weight:700; color:#059669;">+${computedCalories} calories</p>
        `,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: false,
        backdrop: "rgba(0,0,0,0.5)",
      });
    });
  }

  render() {
    if (!this.listContainer) return;

    const dateHeader = document.getElementById("foodlog-date");
    if (dateHeader) {
      const dateFormatOptions = {
        weekday: "long",
        month: "short",
        day: "numeric",
      };
      dateHeader.textContent = new Date().toLocaleDateString(
        "en-US",
        dateFormatOptions,
      );
    }

    let aggregatedCalories = 0,
      aggregatedProtein = 0,
      aggregatedCarbs = 0,
      aggregatedFat = 0;
    this.foodLogList.forEach((entry) => {
      aggregatedCalories += entry.calories;
      aggregatedProtein += entry.protein;
      aggregatedCarbs += entry.carbs;
      aggregatedFat += entry.fat;
    });

    this.updateProgressBar(
      "cal",
      aggregatedCalories,
      this.dailyCaloriesGoal,
      "kcal",
    );
    this.updateProgressBar(
      "prot",
      aggregatedProtein,
      this.dailyProteinGoal,
      "g",
    );
    this.updateProgressBar("carbs", aggregatedCarbs, this.dailyCarbsGoal, "g");
    this.updateProgressBar("fat", aggregatedFat, this.dailyFatGoal, "g");

    if (this.foodLogList.length === 0) {
      this.listContainer.innerHTML = `
        <div class="text-center py-28 text-gray-500">
          <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <i class="fa-solid fa-utensils text-2xl text-gray-400"></i>
          </div>
          <p class="font-semibold text-lg text-gray-800 mb-2">No food logged today</p>
          <p class="text-sm text-gray-400 mb-8">
            Start tracking your nutrition by logging meals or scanning products
          </p>
          <div class="flex justify-center gap-4">
            <button id="fallback-browse-btn" class="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-sm">
              <i class="fa-solid fa-plus"></i> Browse Recipes
            </button>
            <button id="fallback-scan-btn" class="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-sm">
              <i class="fa-solid fa-barcode"></i> Scan Product
            </button>
          </div>
        </div>
      `;
      if (this.clearLogBtn) this.clearLogBtn.classList.add("hidden");

      const loggedCounter = document.querySelector("#foodlog-today-section h4");
      if (loggedCounter) loggedCounter.textContent = "Logged Items (0)";

      document
        .getElementById("fallback-browse-btn")
        ?.addEventListener("click", () => this.app.router.navigateTo("meals"));
      document
        .getElementById("fallback-scan-btn")
        ?.addEventListener("click", () =>
          this.app.router.navigateTo("scanner"),
        );

      this.renderWeeklyProgressPanel();
      return;
    }

    if (this.clearLogBtn) this.clearLogBtn.classList.remove("hidden");

    const loggedCounter = document.querySelector("#foodlog-today-section h4");
    if (loggedCounter)
      loggedCounter.textContent = `Logged Items (${this.foodLogList.length})`;

    let itemMarkupList = "";
    this.foodLogList.forEach((item, index) => {
      itemMarkupList += `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 20px; background-color: #f8fafc; border-radius: 16px; border: 1px solid rgba(241, 245, 249, 0.8);">
          <div style="display: flex; align-items: center; gap: 16px;">
            <img src="${item.meal.thumbnail}" alt="${item.meal.name}" style="width: 56px; height: 56px; border-radius: 12px; object-fit: cover; flex-shrink: 0;" />
            <div style="display: flex; flex-direction: column;">
              <h5 style="font-weight: 700; color: #1e293b; font-size: 15px; margin: 0 0 4px 0; font-family: inherit;">${item.meal.name}</h5>
              <p style="font-size: 13px; color: #64748b; margin: 0; display: flex; align-items: center; gap: 6px; font-family: inherit;">
                <span>${item.servings} serving${item.servings !== 1 ? "s" : ""}</span>
                <span style="color: #cbd5e1;">•</span>
                <span style="color: #059669; font-weight: 600;">Recipe</span>
              </p>
              <p style="font-size: 11px; color: #94a3b8; margin: 4px 0 0 0; font-family: inherit;">${item.time}</p>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="text-align: center; min-w: 56px;">
              <span style="font-size: 18px; font-weight: 700; color: #059669; display: block; line-height: 1.1; font-family: inherit;">${item.calories}</span>
              <span style="font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: 600; font-family: inherit;">kcal</span>
            </div>

            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="background-color: #eff6ff; color: #475569; padding: 4px 10px; font-size: 12px; font-weight: 500; border-radius: 8px; font-family: inherit; white-space: nowrap;">${item.protein}g P</span>
              <span style="background-color: #fffbeb; color: #475569; padding: 4px 10px; font-size: 12px; font-weight: 500; border-radius: 8px; font-family: inherit; white-space: nowrap;">${item.carbs}g C</span>
              <span style="background-color: #faf5ff; color: #475569; padding: 4px 10px; font-size: 12px; font-weight: 500; border-radius: 8px; font-family: inherit; white-space: nowrap;">${item.fat}g F</span>
            </div>

            <button class="food-log-delete-btn" data-index="${index}"
                    style="background: none; border: none; padding: 6px; cursor: pointer; color: #94a3b8; font-size: 16px; transition: color 0.2s;">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      `;
    });

    this.listContainer.innerHTML = itemMarkupList;

    const deleteButtons = this.listContainer.querySelectorAll(
      ".food-log-delete-btn",
    );
    deleteButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetIndex = parseInt(btn.getAttribute("data-index"));
        this.removeEntry(targetIndex);
      });
    });

    this.renderWeeklyProgressPanel();
  }

  updateProgressBar(barId, value, targetGoal, unit) {
    const barElement = document.getElementById(`${barId}-bar`);
    const pctElement = document.getElementById(`${barId}-pct`);
    const currentElement = document.getElementById(`${barId}-current`);

    if (!barElement || !pctElement || !currentElement) return;

    const computedPercentage = (value / targetGoal) * 100;
    const isGoalExceeded = value > targetGoal;

    barElement.style.width = `${Math.min(100, computedPercentage)}%`;

    if (isGoalExceeded) {
      barElement.classList.add("bg-red-600");
      pctElement.classList.add("text-red-600");
      currentElement.classList.add("text-red-600");
    } else {
      barElement.classList.remove("bg-red-600");
      pctElement.classList.remove("text-red-600");
      currentElement.classList.remove("text-red-600");
    }

    pctElement.textContent = isGoalExceeded
      ? "100%"
      : `${Math.round(computedPercentage)}%`;
    currentElement.textContent = `${value} ${unit}`;
  }

  renderWeeklyProgressPanel() {
    const daysGrid = document.getElementById("weekly-days-grid");
    if (!daysGrid) return;

    const dayNameCollection = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const referenceDate = new Date();
    const activeDayIndex = referenceDate.getDay();

    const startingWeekDate = new Date(referenceDate);
    startingWeekDate.setDate(referenceDate.getDate() - activeDayIndex);

    let weekCalTotal = 0;
    let totalWeekLogCount = this.foodLogList.length;
    let goalMetDays = 0;

    let calendarGridContent = "";

    for (let d = 0; d < 7; d++) {
      const indexedDate = new Date(startingWeekDate);
      indexedDate.setDate(startingWeekDate.getDate() + d);
      const isTodayMatched = d === activeDayIndex;

      let computedDayCals = 0;
      let computedDayItems = 0;

      if (isTodayMatched) {
        this.foodLogList.forEach((entry) => {
          computedDayCals += entry.calories;
          computedDayItems++;
        });
      }

      weekCalTotal += computedDayCals;
      if (computedDayCals >= this.dailyCaloriesGoal) goalMetDays++;

      const calsContent =
        computedDayCals > 0
          ? `<p style="font-size:13px; font-weight:700; color:#059669; margin:0;">${computedDayCals}</p><p style="font-size:10px; color:#6B7280; margin:0;">kcal</p>`
          : `<p style="font-size:13px; color:#9CA3AF; margin:0;">0</p><p style="font-size:10px; color:#D1D5DB; margin:0;">kcal</p>`;

      calendarGridContent += `
        <div style="text-align:center; padding:12px 4px; border-radius:12px; ${isTodayMatched ? "background:#EEF2FF;" : ""}">
          <p style="font-size:12px; color:${isTodayMatched ? "#4F46E5" : "#6B7280"}; font-weight:${isTodayMatched ? "700" : "400"}; margin:0 0 6px 0;">${dayNameCollection[indexedDate.getDay()]}</p>
          <p style="font-size:16px; font-weight:700; color:${isTodayMatched ? "#4F46E5" : "#374151"}; margin:0 0 6px 0;">${indexedDate.getDate()}</p>
          ${calsContent}
          ${computedDayItems > 0 ? `<p style="font-size:10px; color:#6B7280; margin:4px 0 0 0;">${computedDayItems} items</p>` : ""}
        </div>
      `;
    }

    daysGrid.innerHTML = calendarGridContent;

    const avgElement = document.getElementById("weekly-avg");
    const counterElement = document.getElementById("weekly-items");
    const milestoneElement = document.getElementById("weekly-goal");

    if (avgElement)
      avgElement.textContent = `${Math.round(weekCalTotal / 7)} kcal`;
    if (counterElement)
      counterElement.textContent = `${totalWeekLogCount} items`;
    if (milestoneElement) milestoneElement.textContent = `${goalMetDays} / 7`;
  }

  removeEntry(index) {
    this.foodLogList.splice(index, 1);
    this.saveToStorage();
    this.render();

    Swal.fire({
      toast: true,
      position: "bottom-end",
      showConfirmButton: false,
      timer: 2000,
      title: "Item removed from log",
      background: "#2563eb",
      color: "#fff",
      customClass: { popup: "custom-toast-slide-up" },
    });
  }

  clearAllEntries() {
    Swal.fire({
      title: "Clear Today's Log?",
      text: "This will remove all logged food items for today.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, clear it!",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "rounded-2xl",
        confirmButton: "rounded-xl font-semibold",
        cancelButton: "rounded-xl font-semibold",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.foodLogList = [];
        this.saveToStorage();
        this.render();

        Swal.fire({
          title: "Cleared!",
          text: "Your food log has been cleared.",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          customClass: { popup: "rounded-2xl" },
        });
      }
    });
  }
}

// ============================================================================
class ProductScanner {
  constructor(app) {
    this.app = app;
    this.productsCatalog = [];
    this.activeGradeFilter = "";

    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.productSearchInput = document.getElementById("product-search-input");
    this.searchProductBtn = document.getElementById("search-product-btn");
    this.barcodeInput = document.getElementById("barcode-input");
    this.lookupBarcodeBtn = document.getElementById("lookup-barcode-btn");
    this.productsGrid = document.getElementById("products-grid");
    this.productsCount = document.getElementById("products-count");
    this.productsEmptyState = document.getElementById("products-empty-state");
    this.nutriFilters = document.querySelectorAll(".nutri-score-filter");
  }

  bindEvents() {
    if (this.searchProductBtn) {
      this.searchProductBtn.addEventListener("click", () =>
        this.handleProductTextSearch(),
      );
    }

    if (this.productSearchInput) {
      this.productSearchInput.addEventListener("keyup", (e) => {
        if (e.key === "Enter") this.handleProductTextSearch();
      });
    }

    if (this.lookupBarcodeBtn) {
      this.lookupBarcodeBtn.addEventListener("click", () =>
        this.handleBarcodeLookup(),
      );
    }

    if (this.barcodeInput) {
      this.barcodeInput.addEventListener("keyup", (e) => {
        if (e.key === "Enter") this.handleBarcodeLookup();
      });
    }

    this.nutriFilters.forEach((filterBtn) => {
      filterBtn.addEventListener("click", () => {
        this.nutriFilters.forEach((f) => f.classList.remove("active"));
        filterBtn.classList.add("active");
        this.activeGradeFilter = filterBtn.getAttribute("data-grade");
        this.filterCatalogByScore(this.activeGradeFilter);
      });
    });

    if (this.productsGrid) {
      this.productsGrid.addEventListener("click", (e) => {
        const card = e.target.closest(".product-card");
        if (card) {
          const barcode = card.getAttribute("data-barcode");
          const product = this.productsCatalog.find(
            (p) => String(p.barcode) === String(barcode),
          );
          if (product) {
            this.openProductDetailsModal(product);
          }
        }
      });
    }
  }

  showProductsGrid() {
    this.productsGrid?.classList.remove("hidden");
    if (this.productsEmptyState) this.productsEmptyState.style.display = "none";
  }

  showProductsEmptyState() {
    this.productsGrid?.classList.add("hidden");
    if (this.productsEmptyState) this.productsEmptyState.style.display = "flex";
  }

  async fetchProducts(query) {
    try {
      this.showProductsGrid();
      if (this.productsGrid) {
        this.productsGrid.innerHTML = `
          <div class="col-span-full flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        `;
      }

      const response = await fetch(
        `https://nutriplan-api.vercel.app/api/products/search?q=${query}&page=1&limit=24`,
      );
      const data = await response.json();
      this.productsCatalog = data.results || [];
      this.resetFilterView();
      this.render();
    } catch (err) {
      console.error("Error fetching matching products:", err);
      this.showProductsGrid();
      if (this.productsGrid) {
        this.productsGrid.innerHTML = `
          <div class="col-span-full text-center py-12 text-red-500">
            <i class="fa-solid fa-circle-exclamation text-4xl mb-2"></i>
            <p>Failed to load products. Please try again.</p>
          </div>
        `;
      }
    }
  }

  bindProductCategoryListeners() {
    const container = document.getElementById("product-categories");
    if (!container) return;

    const buttons = container.querySelectorAll(".product-category-btn");

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const categoryId = btn.getAttribute("data-category-id");
        const categoryName = btn.textContent.trim();

        if (this.productSearchInput) {
          this.productSearchInput.value = categoryName;
        }
        this.fetchProductsByCategory(categoryId);
      });
    });
  }

  async fetchProductsByCategory(categoryId) {
    try {
      this.showProductsGrid();
      if (this.productsGrid) {
        this.productsGrid.innerHTML = `
          <div class="col-span-full flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        `;
      }

      const response = await fetch(
        `https://nutriplan-api.vercel.app/api/products/category/${categoryId}?page=1&limit=24`,
      );
      const data = await response.json();
      this.productsCatalog = data.results || [];
      this.resetFilterView();
      this.render();
    } catch (err) {
      console.error("Error loading category products:", err);
      this.showProductsGrid();
      if (this.productsGrid) {
        this.productsGrid.innerHTML = `
          <div class="col-span-full text-center py-12 text-red-500">
            <i class="fa-solid fa-circle-exclamation text-4xl mb-2"></i>
            <p>Failed to load products. Please try again.</p>
          </div>
        `;
      }
    }
  }

  async fetchProductByBarcode(barcode) {
    try {
      if (this.productsGrid) {
        this.productsGrid.innerHTML = `
          <div class="col-span-full flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        `;
      }

      const response = await fetch(
        `https://nutriplan-api.vercel.app/api/products/barcode/${barcode}`,
      );
      const data = await response.json();

      this.productsCatalog = data.result ? [data.result] : [];
      this.resetFilterView();
      this.render();
    } catch (err) {
      console.error("Error fetching product by barcode:", err);
      if (this.productsGrid) {
        this.productsGrid.innerHTML = `
          <div class="col-span-full text-center py-12 text-red-500">
            <i class="fa-solid fa-circle-exclamation text-4xl mb-2"></i>
            <p>Product not found. Check the barcode and try again.</p>
          </div>
        `;
      }
    }
  }

  render() {
    if (!this.productsGrid) return;

    if (this.productsCatalog.length === 0) {
      const searchVal = this.productSearchInput
        ? this.productSearchInput.value.trim()
        : "";
      this.productsCount.textContent = `No products found in ${searchVal || "search"}`;
      this.showProductsEmptyState();

      if (this.productsEmptyState) {
        this.productsEmptyState.innerHTML = `
          <div class="w-20 h-20 rounded-full flex items-center justify-center mb-6" style="background-color: #f1f5f9;">
            <i class="fa-solid fa-magnifying-glass text-3xl" style="color: #94a3b8;"></i>
          </div>
          <p class="text-xl font-medium mb-2" style="color: #64748b;">No products found</p>
          <p class="text-sm" style="color: #94a3b8;">Try searching for something else</p>
        `;
      }
      return;
    }

    this.showProductsGrid();
    this.productsCount.textContent = `Showing ${this.productsCatalog.length} products`;

    let productGridMarkup = "";
    this.productsCatalog.forEach((product) => {
      const ratingGrade = product.nutritionGrade || "unknown";
      const novaClassGroup = product.novaGroup || "unknown";
      const stats = product.nutrients || {};

      productGridMarkup += `
        <div class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group" data-barcode="${product.barcode}">
          <div class="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
            ${product.image ? `<img class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" src="${product.image}" alt="${product.name}" loading="lazy" />` : `<i class="fa-solid fa-box-open text-gray-300 text-4xl"></i>`}
            <div class="absolute top-2 left-2 nutri-score-${ratingGrade} text-white text-xs font-bold px-2 py-1 rounded uppercase">
              Nutri-Score ${ratingGrade.toUpperCase()}
            </div>
            ${novaClassGroup !== "unknown" && novaClassGroup > 0 ? `<div class="absolute top-2 right-2 nova-group-${novaClassGroup} text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center" title="NOVA ${novaClassGroup}">${novaClassGroup}</div>` : ""}
          </div>
          <div class="p-4">
            <p class="text-xs text-emerald-600 font-semibold mb-1 truncate">${product.brand || "Unknown Brand"}</p>
            <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">${product.name}</h3>
            <div class="flex items-center gap-3 text-xs text-gray-500 mb-3">
              <span><i class="fa-solid fa-fire mr-1"></i>${Math.round(stats.calories || 0)} kcal/100g</span>
            </div>
            <div class="grid grid-cols-4 gap-1 text-center">
              <div class="bg-emerald-50 rounded p-1.5">
                <p class="text-xs font-bold text-emerald-700">${Math.round(stats.protein || 0)}g</p>
                <p class="text-[10px] text-gray-500">Protein</p>
              </div>
              <div class="bg-blue-50 rounded p-1.5">
                <p class="text-xs font-bold text-blue-700">${Math.round(stats.carbs || 0)}g</p>
                <p class="text-[10px] text-gray-500">Carbs</p>
              </div>
              <div class="bg-purple-50 rounded p-1.5">
                <p class="text-xs font-bold text-purple-700">${Math.round(stats.fat || 0)}g</p>
                <p class="text-[10px] text-gray-500">Fat</p>
              </div>
              <div class="bg-orange-50 rounded p-1.5">
                <p class="text-xs font-bold text-orange-700">${Math.round(stats.sugar || 0)}g</p>
                <p class="text-[10px] text-gray-500">Sugar</p>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    this.productsGrid.innerHTML = productGridMarkup;
  }

  filterCatalogByScore(grade) {
    if (!this.productsGrid) return;

    let matchCount = 0;
    let filteredMarkupList = "";

    this.productsCatalog.forEach((product) => {
      if (grade === "" || product.nutritionGrade === grade) {
        matchCount++;
        const targetGrade = product.nutritionGrade || "unknown";
        const novaClassGroup = product.novaGroup || "unknown";
        const stats = product.nutrients || {};

        filteredMarkupList += `
          <div class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group" data-barcode="${product.barcode}">
            <div class="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
              ${product.image ? `<img class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" src="${product.image}" alt="${product.name}" loading="lazy" />` : `<i class="fa-solid fa-box-open text-gray-300 text-4xl"></i>`}
              <div class="absolute top-2 left-2 nutri-score-${targetGrade} text-white text-xs font-bold px-2 py-1 rounded uppercase">
                Nutri-Score ${targetGrade.toUpperCase()}
              </div>
              ${novaClassGroup !== "unknown" && novaClassGroup > 0 ? `<div class="absolute top-2 right-2 nova-group-${novaClassGroup} text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center" title="NOVA ${novaClassGroup}">${novaClassGroup}</div>` : ""}
            </div>
            <div class="p-4">
              <p class="text-xs text-emerald-600 font-semibold mb-1 truncate">${product.brand || "Unknown Brand"}</p>
              <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">${product.name}</h3>
              <div class="flex items-center gap-3 text-xs text-gray-500 mb-3">
                <span><i class="fa-solid fa-fire mr-1"></i>${Math.round(stats.calories || 0)} kcal/100g</span>
              </div>
              <div class="grid grid-cols-4 gap-1 text-center">
                <div class="bg-emerald-50 rounded p-1.5">
                  <p class="text-xs font-bold text-emerald-700">${Math.round(stats.protein || 0)}g</p>
                  <p class="text-[10px] text-gray-500">Protein</p>
                </div>
                <div class="bg-blue-50 rounded p-1.5">
                  <p class="text-xs font-bold text-blue-700">${Math.round(stats.carbs || 0)}g</p>
                  <p class="text-[10px] text-gray-500">Carbs</p>
                </div>
                <div class="bg-purple-50 rounded p-1.5">
                  <p class="text-xs font-bold text-purple-700">${Math.round(stats.fat || 0)}g</p>
                  <p class="text-[10px] text-gray-500">Fat</p>
                </div>
                <div class="bg-orange-50 rounded p-1.5">
                  <p class="text-xs font-bold text-orange-700">${Math.round(stats.sugar || 0)}g</p>
                  <p class="text-[10px] text-gray-500">Sugar</p>
                </div>
              </div>
            </div>
          </div>
        `;
      }
    });

    if (matchCount === 0) {
      this.productsCount.textContent = `No products found with Nutri-Score ${grade.toUpperCase()}`;
      this.productsGrid.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-12 text-center">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <i class="fa-solid fa-magnifying-glass text-gray-400 text-2xl"></i>
          </div>
          <p class="text-gray-500 text-lg">No products found</p>
          <p class="text-gray-400 text-sm mt-2">Try selecting another Nutri-Score filter</p>
        </div>
      `;
    } else {
      this.productsCount.textContent = `Showing ${matchCount} products`;
      this.productsGrid.innerHTML = filteredMarkupList;
    }
  }

  handleProductTextSearch() {
    const rawQuery = this.productSearchInput.value.trim();
    if (rawQuery !== "") {
      this.fetchProducts(rawQuery);
    }
  }

  handleBarcodeLookup() {
    const rawBarcode = this.barcodeInput.value.trim();
    if (rawBarcode !== "") {
      this.fetchProductByBarcode(rawBarcode);
    }
  }

  resetFilterView() {
    this.nutriFilters.forEach((filter) => {
      if (filter.getAttribute("data-grade") === "") {
        filter.classList.add("active");
      } else {
        filter.classList.remove("active");
      }
    });
  }

  openProductDetailsModal(product) {
    const nutrients = product.nutrients || {};
    const nutriGrade = (product.nutritionGrade || "unknown").toLowerCase();
    const novaGroup = product.novaGroup || "unknown";

    const nutriConfig = {
      a: {
        color: "bg-[#038141]",
        label: "Excellent",
        text: "A",
        badgeColor: "bg-emerald-50 border border-emerald-100",
      },
      b: {
        color: "bg-[#85bb2f]",
        label: "Good",
        text: "B",
        badgeColor: "bg-green-50 border border-green-100",
      },
      c: {
        color: "bg-[#fecb02]",
        label: "Moderate",
        text: "C",
        badgeColor: "bg-yellow-50 border border-yellow-100",
      },
      d: {
        color: "bg-[#ee8100]",
        label: "Poor",
        text: "D",
        badgeColor: "bg-orange-50 border border-orange-100",
      },
      e: {
        color: "bg-[#e63e11]",
        label: "Bad",
        text: "E",
        badgeColor: "bg-[#fef1ec] border border-[#fcdcd2]",
      },
      unknown: {
        color: "bg-gray-400",
        label: "Unknown",
        text: "?",
        badgeColor: "bg-gray-50 border border-gray-100",
      },
    };

    const nutriInfo = nutriConfig[nutriGrade] || nutriConfig.unknown;

    const novaConfig = {
      1: {
        color: "bg-[#038141]",
        label: "Unprocessed",
        badgeColor: "bg-emerald-50 border border-emerald-100",
      },
      2: {
        color: "bg-[#fecb02]",
        label: "Processed Ingredients",
        badgeColor: "bg-yellow-50 border border-yellow-100",
      },
      3: {
        color: "bg-[#ee8100]",
        label: "Processed Foods",
        badgeColor: "bg-orange-50 border border-orange-100",
      },
      4: {
        color: "bg-[#e63e11]",
        label: "Ultra-processed",
        badgeColor: "bg-[#fef1ec] border border-[#fcdcd2]",
      },
      unknown: {
        color: "bg-gray-400",
        label: "Unknown",
        badgeColor: "bg-gray-50 border border-gray-100",
      },
    };

    const novaInfo = novaConfig[novaGroup] || novaConfig.unknown;

    const metrics = {
      calories: Math.round(nutrients.calories || 0),

      protein: parseFloat(nutrients.protein || 0).toFixed(1),

      carbs: parseFloat(nutrients.carbs || 0).toFixed(1),

      fat: parseFloat(nutrients.fat || 0).toFixed(1),

      sugar: parseFloat(nutrients.sugar || 0).toFixed(1),

      satFat: parseFloat(
        nutrients.saturatedFat || nutrients["saturated-fat"] || 0,
      ).toFixed(1),

      fiber: parseFloat(nutrients.fiber || 0).toFixed(1),

      salt: parseFloat(nutrients.salt || 0).toFixed(2),
    };

    const modalOverlay = document.createElement("div");

    modalOverlay.id = "product-modal-overlay";

    modalOverlay.className = `
    fixed
    inset-0
    bg-black/50
    z-[100]
    flex
    items-center
    justify-center
    p-4
  `;

    const proteinPercentage = Math.min(parseFloat(metrics.protein), 100);

    const carbsPercentage = Math.min(parseFloat(metrics.carbs), 100);

    const fatPercentage = Math.min(parseFloat(metrics.fat), 100);

    const sugarPercentage = Math.min(parseFloat(metrics.sugar) * 2, 100);
// modal but with tailwind 
    modalOverlay.innerHTML = `
    <!-- Modal -->
    <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl " style="font-family: inherit;" >

      <div class="p-6">
        <div class="flex items-start gap-6 mb-6">

          <!-- Product Image -->
          <div class="  w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 " >
            ${
              product.image
                ? ` <img src="${product.image}" alt="${product.name}" class=" w-full  h-full object-contain " /> `
                : ` <i class=" fa-solid fa-box text-4xl text-gray-400 " ></i> `
            }

          </div>
          <!-- Product Information -->
          <div class="flex-1 min-w-0">

            <!-- Brand -->
            <p class=" text-sm text-emerald-600 font-semibold mb-1 " >
              ${product.brand || "Unknown Brand"}
            </p>


            <!-- Product Name -->
            <h2 class=" text-2xl font-bold text-gray-900 mb-2 " >
              ${product.name}
            </h2>


            <!-- Quantity -->
            <p class=" text-sm text-gray-500 mb-3 " >
              ${product.quantity || ""}
            </p>


            <!-- Badges -->
            <div class="flex items-center gap-3">

              <!-- Nutri-Score -->
              <div class=" flex items-center gap-2 px-3 py-1.5 rounded-lg ${nutriInfo.badgeColor} " >

                <span class=" ${nutriInfo.color}  w-8 h-8 rounded flex items-center justify-center text-white font-bold " >
                  ${nutriInfo.text}
                </span>

                <div>

                  <p class=" text-xs font-bold ${nutriInfo.color.replace("bg-", "text-")} " >
                    Nutri-Score
                  </p>

                  <p class="text-[10px] text-gray-600">
                    ${nutriInfo.label}
                  </p>

                </div>

              </div>


              <!-- NOVA -->
              <div class=" flex items-center gap-2 px-3 py-1.5 rounded-lg ${novaInfo.badgeColor} " >

                <span class=" ${novaInfo.color} w-8 h-8 rounded-full flex items-center justify-center text-white font-bold " >
                  ${novaGroup}
                </span>

                <div>

                  <p class=" text-xs font-bold ${novaInfo.color.replace("bg-", "text-")} " >
                    NOVA
                  </p>

                  <p class="text-[10px] text-gray-600">
                    ${novaInfo.label}
                  </p>

                </div>

              </div>

            </div>

          </div>


          <!-- Close Button -->
          <button id="product-modal-close-x" class=" close-product-modal text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 " >
            <i class="fa-solid fa-xmark text-2xl"></i>
          </button>

        </div>

        <div class=" bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5  mb-6 border  border-emerald-200 " >

          <!-- Nutrition Header -->
          <h3 class=" font-bold text-gray-900 mb-4 flex items-center gap-2 " >

            <i class=" fa-solid fa-chart-pie text-emerald-600 " ></i>

            Nutrition Facts

            <span class=" text-sm font-normal text-gray-500 " >
              (per 100g)
            </span>

          </h3>

          <div class=" text-center mb-4 pb-4 border-b border-emerald-200 " >

            <p class=" text-4xl font-bold text-gray-900 " >
              ${metrics.calories}
            </p>

            <p class=" text-sm text-gray-500 " >
              Calories
            </p>

          </div>

          <div class="grid grid-cols-4 gap-4">


            <!-- Protein -->
            <div class="text-center">

              <div class=" w-full bg-gray-200 rounded-full h-2 mb-2 " >
                <div class=" bg-emerald-500 h-2 rounded-full " style="width: ${proteinPercentage}%" ></div>
              </div>

              <p class=" text-lg font-bold text-emerald-600 " >
                ${metrics.protein}g
              </p>

              <p class=" text-xs text-gray-500 " >
                Protein
              </p>

            </div>


            <!-- Carbs -->
            <div class="text-center">

              <div class="  w-full  bg-gray-200  rounded-full  h-2 mb-2 " >
                <div class=" bg-blue-500 h-2 rounded-full " style="width: ${carbsPercentage}%" ></div>
              </div>

              <p class=" text-lg font-bold text-blue-600 " >
                ${metrics.carbs}g
              </p>

              <p class=" text-xs text-gray-500 " >
                Carbs
              </p>

            </div>


            <!-- Fat -->
            <div class="text-center">

              <div class=" w-full bg-gray-200 rounded-full h-2  mb-2 " >
                <div class=" bg-purple-500 h-2 rounded-full " style="width: ${fatPercentage}%" ></div>
              </div>

              <p class=" text-lg font-bold text-purple-600 " >
                ${metrics.fat}g
              </p>

              <p class="  text-xs  text-gray-500 " >
                Fat
              </p>
            </div>
            <!-- Sugar -->
            <div class="text-center">

              <div class=" w-full bg-gray-200 rounded-full h-2 mb-2 " >
                <div class=" bg-orange-500 h-2 rounded-full " style="width: ${sugarPercentage}%" ></div>
              </div>

              <p class=" text-lg font-bold text-orange-600 " >
                ${metrics.sugar}g
              </p>

              <p class=" text-xs text-gray-500 " >
                Sugar
              </p>

            </div>

          </div>

          <div class=" grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-emerald-200  " >

            <!-- Saturated Fat -->
            <div class="text-center">

              <p class=" text-sm font-semibold text-gray-900 " >
                ${metrics.satFat}g
              </p>

              <p class=" text-xs text-gray-500 " >
                Saturated Fat
              </p>

            </div>


            <!-- Fiber -->
            <div class="text-center">

              <p class=" text-sm  font-semibold text-gray-900 " >
                ${metrics.fiber}g
              </p>

              <p class=" text-xs text-gray-500 " >
                Fiber
              </p>

            </div>


            <!-- Salt -->
            <div class="text-center">

              <p class=" text-sm font-semibold text-gray-900 " > 
                ${metrics.salt}g
              </p>

              <p class=" text-xs text-gray-500 " >
                Salt
              </p>

            </div>

          </div>

        </div>

        <div class="flex gap-3">

          <!-- Log Food -->
          <button id="p-modal-log-btn" class="  add-product-to-log flex-1  py-3 bg-emerald-600 text-white  rounded-xl  font-semibold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 " data-barcode="${product.barcode || ""}" >

            <i class="fa-solid fa-plus"></i>

            Log This Food

          </button>


          <!-- Close -->
          <button id="p-modal-close-btn" class="close-product-modal flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all " >
            Close
          </button>

        </div>

      </div>

    </div>
  `;

    document.body.appendChild(modalOverlay);

    const closeModal = () => {
      modalOverlay.remove();
    };

    modalOverlay
      .querySelector("#p-modal-close-btn")
      .addEventListener("click", closeModal);

    modalOverlay
      .querySelector("#product-modal-close-x")
      .addEventListener("click", closeModal);
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });
    modalOverlay
      .querySelector("#p-modal-log-btn")
      .addEventListener("click", () => {
        closeModal();

        const itemToLog = {
          meal: {
            name: product.name,
            thumbnail: product.image || "",
          },

          servings: "100g",

          calories: Math.round(nutrients.calories || 0),

          protein: Math.round(nutrients.protein || 0),

          carbs: Math.round(nutrients.carbs || 0),

          fat: Math.round(nutrients.fat || 0),

          time: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        this.app.foodLog.foodLogList.push(itemToLog);

        this.app.foodLog.saveToStorage();

        this.app.foodLog.render();

        this.app.router.navigateTo("foodlog");
        Swal.fire({
          icon: "success",

          title: "Logged Successfully!",

          html: `
          <p
            style="
              color:#6B7280;
              margin:0 0 8px 0;
            "
          >
            ${product.name} (100g) added to log.
          </p>

          <p
            style="
              font-size:18px;
              font-weight:700;
              color:#059669;
            "
          >
            +${Math.round(nutrients.calories || 0)} calories
          </p>
        `,

          showConfirmButton: false,

          timer: 1500,

          backdrop: "rgba(0,0,0,0.5)",
        });
      });
  }
}

// ============================================================================
class NutriPlan {
  constructor() {
    this.router = new NavigationRouter(this);
    this.meals = new MealPlanner(this);
    this.recipeDetails = new RecipeDetails(this);
    this.foodLog = new DailyFoodLog(this);
    this.productScanner = new ProductScanner(this);

    this.initUI();
    this.run();
  }

  initUI() {
    const menuBtn = document.getElementById("header-menu-btn");
    const closeBtn = document.getElementById("sidebar-close-btn");
    const overlay = document.getElementById("sidebar-overlay");

    const toggleSidebar = () => {
      const sidebar = document.getElementById("sidebar");
      sidebar?.classList.toggle("active");
      overlay?.classList.toggle("active");
    };

    menuBtn?.addEventListener("click", toggleSidebar);
    closeBtn?.addEventListener("click", toggleSidebar);
    overlay?.addEventListener("click", toggleSidebar);
  }

  async run() {
    this.router.initRoute();

    await this.meals.loadInitialCatalog();
    this.productScanner.bindProductCategoryListeners();

    const loaderElement = document.getElementById("app-loading-overlay");
    if (loaderElement) {
      loaderElement.classList.add("opacity-0");
      setTimeout(() => {
        loaderElement.classList.add("hidden");
      }, 500);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.appInstance = new NutriPlan();
});
