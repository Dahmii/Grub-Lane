const API_FETCH_URL = "https://grublanerestaurant.com/api/dish/getDishes";
const API_CREATE_URL = "https://grublanerestaurant.com/api/dish/createDish";
const API_UPDATE_URL = "https://grublanerestaurant.com/api/dish/updateDish";
const API_DELETE_URL = "https://grublanerestaurant.com/api/dish/deleteDish";

let meals = [];

async function fetchMeals() {
  try {
    const response = await fetch(API_FETCH_URL);
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
  }
}

function displayMeals(filteredMeals = meals) {
  const tableBody = document.getElementById("mealsTableBody");
  tableBody.innerHTML = "";

  filteredMeals.forEach((meal) => {
    const row = `
            <tr>
                <td>${meal.name}</td>
                <td>${meal.description || ''}</td>
                <td>₦${meal.price.toFixed(2)}</td>             
                <td>${meal.servicetype}</td>
                <td>${meal.subcategory || ''}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editMeal(${meal.id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteMeal(${meal.id})">Delete</button>
                </td>
            </tr>
        `;
    tableBody.innerHTML += row;
  });
}

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
      $('#addMealFormCollapse').collapse('hide');
    }
  } catch (error) {
    // Handle error
  }
}

function editMeal(id) {
  const meal = meals.find((m) => m.id === id);
  if (meal) {
    document.getElementById("editMealId").value = meal.id;
    document.getElementById("editMealName").value = meal.name;
    document.getElementById("editMealDescription").value = meal.description || '';
    document.getElementById("editMealPrice").value = meal.price;
    document.getElementById("editMealServiceType").value = meal.servicetype;
    document.getElementById("editMealCategory").value = meal.subcategory || '';
    $("#editMealModal").modal("show");
  }
}

async function saveMealEdit() {
  const id = parseInt(document.getElementById("editMealId").value);
  const updatedMeal = {
    id: id,
    name: document.getElementById("editMealName").value,
    description: document.getElementById("editMealDescription").value,
    price: parseFloat(document.getElementById("editMealPrice").value),
    serviceType: document.getElementById("editMealServiceType").value,
    subcategory: document.getElementById("editMealCategory").value,
  };

  try {
    const response = await fetch(`${API_UPDATE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
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
    }
  } catch (error) {
    // Handle error
  }
}

async function deleteMeal(id) {
  if (confirm("Are you sure you want to delete this meal?")) {
    try {
      const response = await fetch(`${API_DELETE_URL}/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        meals = meals.filter((meal) => meal.id !== id);
        displayMeals();
      }
    } catch (error) {
      // Handle error
    }
  }
}

function filterAndSearchMeals() {
  const servicetype = document.getElementById("filterServiceType").value.toLowerCase();
  const subcategory = document.getElementById("filterCategory").value.toLowerCase();
  const searchQuery = document.getElementById("searchMeal").value.toLowerCase();

  const filteredMeals = meals.filter(meal => {
    const matchesServiceType = !servicetype || meal.servicetype.toLowerCase().includes(servicetype);
    const matchesSubcategory = !subcategory || (meal.subcategory && meal.subcategory.toLowerCase().includes(subcategory));
    const matchesSearch = meal.name.toLowerCase().includes(searchQuery) || (meal.description && meal.description.toLowerCase().includes(searchQuery));

    return matchesServiceType && matchesSubcategory && matchesSearch;
  });

  displayMeals(filteredMeals);
}

document.addEventListener("DOMContentLoaded", () => {
  fetchMeals();
  document.getElementById("addMealForm").addEventListener("submit", addMeal);
  document.getElementById("saveEditMeal").addEventListener("click", saveMealEdit);
  document.getElementById("filterServiceType").addEventListener("input", filterAndSearchMeals);
  document.getElementById("filterCategory").addEventListener("input", filterAndSearchMeals);
  document.getElementById("searchMeal").addEventListener("input", filterAndSearchMeals);
});
