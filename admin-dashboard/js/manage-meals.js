const API_FETCH_URL = "https://grublanerestaurant.com/api/dish/getDishes";
const API_CREATE_URL = "https://grublanerestaurant.com/api/dish/createDish";
const API_UPDATE_URL = "https://grublanerestaurant.com/api/dish/updateDish";
const API_DELETE_URL = "https://grublanerestaurant.com/api/dish/deleteDish";

let meals = [];

// Function to fetch meals from the API and display them
async function fetchMeals() {
  try {
    const response = await fetch(API_FETCH_URL, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Ensure token is set
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

  filteredMeals.forEach((meal) => {
    const price = parseFloat(meal.price);
    const formattedPrice = !isNaN(price) ? `₦${price.toFixed(2)}` : "N/A"; // Show "N/A" if price is invalid

    const row = `
      <tr>
          <td>${meal.name}</td>
          <td>${meal.description || ""}</td>
          <td>${formattedPrice}</td>             
          <td>${meal.servicetype || ""}</td>
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
}

// Function to add a new meal
async function addMeal(event) {
  event.preventDefault();

  const formData = new FormData();
  formData.append("name", document.getElementById("mealName").value);
  formData.append(
    "description",
    document.getElementById("mealDescription").value
  );
  formData.append(
    "price",
    parseFloat(document.getElementById("mealPrice").value)
  );
  formData.append(
    "servicetype",
    document.getElementById("mealServiceType").value
  ); // Ensure this is set correctly (e.g., dine-in or take-out)
  formData.append("subcategory", document.getElementById("mealCategory").value);
  formData.append("menu_id", document.getElementById("mealMenuId").value);

  // Add the image file if provided
  const imageFile = document.getElementById("mealImage").files[0];
  if (imageFile) {
    formData.append("image", imageFile);
  }

  try {
    const response = await fetch(API_CREATE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Ensure token is provided
      },
      body: formData, // Use FormData to handle both text and file data
    });

    if (response.ok) {
      const createdMeal = await response.json();
      meals.push(createdMeal); // Add the newly created meal to the array
      displayMeals(); // Update the meal list to include the new meal
      document.getElementById("addMealForm").reset(); // Clear the form
      $("#addMealFormCollapse").collapse("hide"); // Collapse the form
    } else {
      const errorResponse = await response.json();
      console.error("Error creating meal:", errorResponse);
      alert(
        `Failed to create meal: ${errorResponse.message || "Unknown error"}`
      );
    }
  } catch (error) {
    console.error("Network or server error:", error);
    alert("Network or server error occurred while creating the meal.");
  }
}

// Function to edit a meal (load existing data into the form for editing)
function editMeal(id) {
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
        meals = meals.filter((meal) => meal.id !== id); // Remove the meal from the list
        displayMeals(); // Update the display
      } else {
        console.error("Error deleting meal:", await response.json());
      }
    } catch (error) {
      console.error("Error deleting meal:", error);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetchMeals(); // Fetch meals when the page loads
  document.getElementById("addMealForm").addEventListener("submit", addMeal); // Add meal form handler
});
