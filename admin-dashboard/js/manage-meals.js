// Replace these URLs with your actual API endpoints
const API_FETCH_URL = "https://grublanerestaurant.com/api/dish/getDishes";
const API_CREATE_URL = "https://grublanerestaurant.com/api/dish/createDish";
const API_UPDATE_URL = "https://grublanerestaurant.com/api/dish/updateDish"; // Assuming there's an endpoint for updating
const API_DELETE_URL = "https://grublanerestaurant.com/api/dish/deleteDish"; // Assuming there's an endpoint for deleting

// Fetch meals from the backend
async function fetchMeals() {
  try {
    const response = await fetch(API_FETCH_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetched data:", data); // Log the fetched data

    // Ensure that 'meals' is correctly set to the array of dishes
    if (data.dishes && Array.isArray(data.dishes)) {
      meals = data.dishes;
    } else {
      throw new Error("Invalid data format: Expected an array of meals");
    }

    displayMeals();
  } catch (error) {
    console.error("Error fetching meals:", error.message);
    document.getElementById("mealsTableBody").innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-danger">
            Failed to load meals. Please try again later.
          </td>
        </tr>`;
  }
}

function displayMeals() {
  const tableBody = document.getElementById("mealsTableBody");
  tableBody.innerHTML = "";

  meals.forEach((meal) => {
    const row = `
            <tr>
                <td>${meal.name}</td>
                <td>${meal.description}</td>
                <td>$${meal.price.toFixed(2)}</td>
                <td>${meal.category}</td>
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
}

async function addMeal(event) {
  event.preventDefault();

  const newMeal = {
    name: document.getElementById("mealName").value,
    description: document.getElementById("mealDescription").value,
    price: parseFloat(document.getElementById("mealPrice").value),
    category: document.getElementById("mealCategory").value,
  };

  try {
    console.log("Sending new meal data:", JSON.stringify(newMeal)); // Debugging line
    const response = await fetch(API_CREATE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newMeal),
    });

    if (response.ok) {
      const createdMeal = await response.json();
      console.log("Meal added successfully:", createdMeal); // Debugging line
      meals.push(createdMeal); // Add the new meal to the local array
      displayMeals();
      document.getElementById("addMealForm").reset();
    } else {
      const errorText = await response.text(); // Capture error response from the server
      console.error("Failed to add meal:", errorText); // More detailed error logging
    }
  } catch (error) {
    console.error("Error adding meal:", error); // Capturing network or other errors
  }
}

function editMeal(id) {
  const meal = meals.find((m) => m.id === id);
  if (meal) {
    document.getElementById("editMealId").value = meal.id;
    document.getElementById("editMealName").value = meal.name;
    document.getElementById("editMealDescription").value = meal.description;
    document.getElementById("editMealPrice").value = meal.price;
    document.getElementById("editMealCategory").value = meal.category;
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
    category: document.getElementById("editMealCategory").value,
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
        meals[mealIndex] = updatedMeal; // Update the meal in the local array
        displayMeals();
        $("#editMealModal").modal("hide");
      }
    } else {
      console.error("Failed to update meal");
    }
  } catch (error) {
    console.error("Error updating meal:", error);
  }
}

async function deleteMeal(id) {
  if (confirm("Are you sure you want to delete this meal?")) {
    try {
      const response = await fetch(`${API_DELETE_URL}/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        meals = meals.filter((meal) => meal.id !== id); // Remove the deleted meal from the local array
        displayMeals();
      } else {
        console.error("Failed to delete meal");
      }
    } catch (error) {
      console.error("Error deleting meal:", error);
    }
  }
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  fetchMeals(); // Fetch meals when the page loads
  document.getElementById("addMealForm").addEventListener("submit", addMeal);
  document
    .getElementById("saveEditMeal")
    .addEventListener("click", saveMealEdit);
});
