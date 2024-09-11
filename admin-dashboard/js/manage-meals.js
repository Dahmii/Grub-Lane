const API_FETCH_URL = "https://grublanerestaurant.com/api/dish/getDishes";
const API_CREATE_URL = "https://grublanerestaurant.com/api/dish/createDish";
const API_UPDATE_URL = "https://grublanerestaurant.com/api/dish/updateDish";
const API_DELETE_URL = "https://grublanerestaurant.com/api/dish/deleteDish";
const API_MENU_URL = "https://grublanerestaurant.com/api/menu/getMenus"; // For fetching menu IDs

let meals = [];
let menuId = null;
let currentPage = 1;
const mealsPerPage = 10; // Number of meals to show per page

// Function to fetch menu ID from the backend
async function fetchMenuId() {
  try {
    const response = await fetch(API_MENU_URL, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });

    // Ensure the response is OK and parse JSON
    if (!response.ok) {
      throw new Error(`Failed to fetch menu ID: ${response.status}`);
    }

    const menus = await response.json();

    // Check if valid menus are received
    if (menus && menus.length > 0) {
      menuId = menus[0].id; // Use the first menu ID or adjust as needed
    } else {
      throw new Error("No menus found.");
    }
  } catch (error) {
    console.error("Error fetching menu ID:", error);
  }
}

// Function to fetch meals from the API and display them
async function fetchMeals() {
  try {
    const response = await fetch(API_FETCH_URL, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.dishes && Array.isArray(data.dishes)) {
      meals = data.dishes;
    } else {
      throw new Error("Invalid data format: Expected an array of meals");
    }

    displayMeals();
  } catch (error) {
    document.getElementById("mealsTableBody").innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-danger">
          Failed to load meals. Please try again later.
        </td>
      </tr>`;
    console.error("Error fetching meals:", error);
  }
}

// Function to display meals in the table
function displayMeals(filteredMeals = meals) {
  const tableBody = document.getElementById("mealsTableBody");
  tableBody.innerHTML = "";

  // Calculate pagination limits
  const startIndex = (currentPage - 1) * mealsPerPage;
  const endIndex = startIndex + mealsPerPage;
  const paginatedMeals = filteredMeals.slice(startIndex, endIndex);

  // Display meals for the current page
  paginatedMeals.forEach((meal) => {
    const row = `
      <tr>
          <td>${meal.name}</td>
          <td>${meal.description || ""}</td>
          <td>₦${meal.price.toFixed(2)}</td>
          <td>${meal.servicetype}</td>
          <td>${meal.subcategory || ""}</td>
          <td>
              <button class="btn btn-sm btn-primary" onclick="editMeal(${
                meal.id
              })">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="deleteMeal(${
                meal.id
              })">Delete</button>
          </td>
      </tr>
    `;
    tableBody.innerHTML += row;
  });

  // Update pagination controls based on filtered data
  displayPagination(filteredMeals.length);
}

function displayPagination(totalMeals) {
  const paginationControls = document.getElementById("paginationControls");
  paginationControls.innerHTML = "";

  const totalPages = Math.ceil(totalMeals / mealsPerPage);

  // Create Previous button
  const prevButton = document.createElement("button");
  prevButton.classList.add("btn", "btn-secondary");
  prevButton.innerText = "Previous";
  prevButton.disabled = currentPage === 1;
  prevButton.onclick = () => {
    currentPage--;
    displayMeals();
  };
  paginationControls.appendChild(prevButton);

  // Create page number buttons
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("button");
    pageButton.classList.add("btn", "btn-secondary");
    pageButton.innerText = i;
    pageButton.disabled = i === currentPage;
    pageButton.onclick = () => {
      currentPage = i;
      displayMeals();
    };
    paginationControls.appendChild(pageButton);
  }

  // Create Next button
  const nextButton = document.createElement("button");
  nextButton.classList.add("btn", "btn-secondary");
  nextButton.innerText = "Next";
  nextButton.disabled = currentPage === totalPages;
  nextButton.onclick = () => {
    currentPage++;
    displayMeals();
  };
  paginationControls.appendChild(nextButton);
}

// Function to add a new meal
async function addMeal(event) {
  event.preventDefault();

  const newMeal = {
    name: document.getElementById("mealName").value,
    description: document.getElementById("mealDescription").value,
    price: parseFloat(document.getElementById("mealPrice").value),
    serviceType: document.getElementById("mealServiceType").value,
    subcategory: document.getElementById("mealCategory").value,
  };

  try {
    const response = await fetch(API_CREATE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newMeal),
    });

    if (response.ok) {
      const createdMeal = await response.json();
      meals.push(createdMeal);
      displayMeals();
      document.getElementById("addMealForm").reset();
      $("#addMealFormCollapse").collapse("hide");
      $("#manageMealsCollapse").collapse("show"); // Reopen the Manage Meals section after adding a meal
    }
  } catch (error) {
    // Handle error
  }
}

function editMeal(id) {
  console.log("Edit button clicked for meal ID:", id);
  const meal = meals.find((m) => m.id === id);
  if (meal) {
    document.getElementById("editMealId").value = meal.id;
    document.getElementById("editMealName").value = meal.name;
    document.getElementById("editMealDescription").value =
      meal.description || "";
    document.getElementById("editMealPrice").value = meal.price;
    document.getElementById("editMealServiceType").value = meal.servicetype;
    document.getElementById("editMealCategory").value = meal.subcategory || "";
    $("#editMealModal").modal("show");
  }
}

// Function to save changes to a meal after editing
async function saveMealEdit() {
  const id = parseInt(document.getElementById("editMealId").value);
  const updatedMeal = {
    id: id,
    name: document.getElementById("editMealName").value,
    description: document.getElementById("editMealDescription").value,
    price: parseFloat(document.getElementById("editMealPrice").value),
    servicetype: document.getElementById("editMealServiceType").value,
    subcategory: document.getElementById("editMealCategory").value,
  };

  try {
    const response = await fetch(`${API_UPDATE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(updatedMeal),
    });

    if (response.ok) {
      const mealIndex = meals.findIndex((m) => m.id === id);
      if (mealIndex !== -1) {
        meals[mealIndex] = updatedMeal;
        displayMeals();
        $("#editMealModal").modal("hide");
      }
    } else {
      console.error("Error updating meal:", await response.json());
    }
  } catch (error) {
    console.error("Error updating meal:", error);
  }
}

// Function to delete a meal
async function deleteMeal(id) {
  if (confirm("Are you sure you want to delete this meal?")) {
    try {
      const response = await fetch(`${API_DELETE_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        meals = meals.filter((meal) => meal.id !== id);
        displayMeals();
      } else {
        console.error("Error deleting meal:", await response.json());
      }
    } catch (error) {
      console.error("Error deleting meal:", error);
    }
  }
}

function filterAndSearchMeals() {
  const serviceType = document
    .getElementById("filterServiceType")
    .value.toLowerCase();
  const subcategory = document
    .getElementById("filterCategory")
    .value.toLowerCase();
  const searchQuery = document.getElementById("searchMeal").value.toLowerCase();

  const filteredMeals = meals.filter((meal) => {
    const matchesServiceType =
      !serviceType || meal.servicetype.toLowerCase().includes(serviceType);
    const matchesSubcategory =
      !subcategory ||
      (meal.subcategory &&
        meal.subcategory.toLowerCase().includes(subcategory));
    const matchesSearch =
      meal.name.toLowerCase().includes(searchQuery) ||
      (meal.description &&
        meal.description.toLowerCase().includes(searchQuery));

    return matchesServiceType && matchesSubcategory && matchesSearch;
  });

  // Reset current page to 1 when applying new filters
  currentPage = 1;

  // Display the filtered meals
  displayMeals(filteredMeals);
}

document.addEventListener("DOMContentLoaded", () => {
  fetchMenuId().then(() => {
    fetchMeals();
  });
  document.getElementById("addMealForm").addEventListener("submit", addMeal);
  document
    .getElementById("saveEditMeal")
    .addEventListener("click", saveMealEdit);
  document
    .getElementById("filterServiceType")
    .addEventListener("change", filterAndSearchMeals);
  document
    .getElementById("filterCategory")
    .addEventListener("change", filterAndSearchMeals);
  document
    .getElementById("searchMeal")
    .addEventListener("input", filterAndSearchMeals);

  document.getElementById("addMealButton").addEventListener("click", () => {
    $("#manageMealsCollapse").collapse("hide");
  });
});
