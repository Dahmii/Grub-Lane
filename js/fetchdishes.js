// Function to fetch and display menu data
function fetchMenuData(menuType) {
  // Determine whether it's takeout or dine-in
  const takeOut = menuType === "dine_in" ? "false" : "true";
  const endpointUrl = `https://grublanerestaurant.com/api/dish/getDishes?take_out=${takeOut}`;

  fetch(endpointUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Fetched data:", data); // Log the fetched data for debugging

      const menuContainer = document.getElementById("menu-container");
      let menuHtml = "";

      // Check if data.dishes is valid and not empty
      if (
        !data.dishes ||
        !Array.isArray(data.dishes) ||
        data.dishes.length === 0
      ) {
        menuHtml = `
          <div class="text-center">
            <h2>No menu items available</h2>
            <p>We couldn't find any menu items at the moment for this type. Please try again later.</p>
          </div>
        `;
      } else {
        // Process menu data
        data.dishes.forEach((item) => {
          menuHtml += `
            <div class="col-md-4 mb-4">
              <div class="menu-item">
                <img src="${item.image_url}" alt="${item.name}" class="img-fluid" />
                <h4>${item.name}</h4>
                <p>N${item.price}</p>
                <button class="add-to-cart-btn" data-item="${item.name}" data-price="${item.price}">
                  Add to cart
                </button>
              </div>
            </div>
          `;
        });
      }

      menuContainer.innerHTML = menuHtml;

      // Ensure cart functionality is available after rendering the menu
      addCartFunctionality();
    })
    .catch((error) => {
      const menuContainer = document.getElementById("menu-container");
      menuContainer.innerHTML = `
        <div class="text-center">
          <h2>Error Fetching Data</h2>
          <p>We couldn't fetch the menu data. Please try again later.</p>
        </div>
      `;
      console.error("Error fetching menu data:", error);
    });
}

// Function to add cart functionality to the buttons
function addCartFunctionality() {
  document.querySelectorAll(".add-to-cart-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const itemName = this.getAttribute("data-item");
      const itemPrice = parseInt(this.getAttribute("data-price"));

      // Find if the item is already in the cart
      const existingItemIndex = cart.findIndex(
        (item) => item.name === itemName
      );

      if (existingItemIndex > -1) {
        // Increase quantity if item is already in cart
        cart[existingItemIndex].quantity += 1;
      } else {
        // Add new item to cart
        cart.push({ name: itemName, price: itemPrice, quantity: 1 });
      }

      // Save cart to localStorage
      localStorage.setItem("cart", JSON.stringify(cart));

      // Render updated cart
      renderCart();

      // Show side cart and overlay
      document.getElementById("side-cart").classList.add("active");
      document.getElementById("overlay").classList.add("active");
    });
  });
}

// Initialize menu data fetch on page load
document.addEventListener("DOMContentLoaded", () => {
  const pageType = document.body.dataset.pageType;
  fetchMenuData(pageType);
});
