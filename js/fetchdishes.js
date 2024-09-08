// Function to fetch and display menu data dynamically
function fetchMenuData(menuType) {
  // Set takeOut flag based on menu type (dine_in or take_out)
  const takeOut = menuType === "take_out" ? "true" : "false"; // Ensure correct boolean flag
  const endpointUrl = `https://grublanerestaurant.com/api/dish/getDishes?take_out=${takeOut}`;

  fetch(endpointUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
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
        // Group dishes by subcategory (e.g., appetizers, main courses)
        const groupedMenu = {};
        data.dishes.forEach((dish) => {
          const { subcategory } = dish;
          if (!groupedMenu[subcategory]) {
            groupedMenu[subcategory] = [];
          }
          groupedMenu[subcategory].push(dish);
        });

        // Build the HTML for each subcategory
        for (const subcategory in groupedMenu) {
          menuHtml += `<h3 class="menu-category">${subcategory}</h3>`;
          menuHtml += `<div class="row">`;

          groupedMenu[subcategory].forEach((item) => {
            menuHtml += `<div class="col-md-4 mb-4"><div class="menu-item">`;

            // Only display images for the take-out menu
            if (menuType === "take_out") {
              menuHtml += `
                <img src="${item.image_url}" alt="${item.name}" class="img-fluid" />
              `;
            }

            menuHtml += `
              <h5>${item.name}</h5>
              <p>N${item.price}</p>
              <button class="add-to-cart-btn" data-item="${item.name}" data-price="${item.price}">
                Add to cart
              </button>
            </div></div>`;
          });

          menuHtml += `</div>`;
        }
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

      // Retrieve the cart from localStorage or create a new one if it doesn't exist
      let cart = JSON.parse(localStorage.getItem("cart")) || [];

      // Check if the item is already in the cart
      const existingItemIndex = cart.findIndex(
        (item) => item.name === itemName
      );

      if (existingItemIndex > -1) {
        // Increase the quantity if the item is already in the cart
        cart[existingItemIndex].quantity += 1;
      } else {
        // Add the new item to the cart
        cart.push({ name: itemName, price: itemPrice, quantity: 1 });
      }

      // Save the updated cart back to localStorage
      localStorage.setItem("cart", JSON.stringify(cart));

      // Re-render the cart
      renderCart();

      // Show the side cart and overlay
      document.getElementById("side-cart").classList.add("active");
      document.getElementById("overlay").classList.add("active");
    });
  });
}

// Function to render the cart
function renderCart() {
  const cartItemsContainer = document.getElementById("side-cart-items");
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cartItemsContainer.innerHTML = "";

  let totalPrice = 0;
  cart.forEach((item) => {
    const cartItemDiv = document.createElement("div");
    cartItemDiv.classList.add("side-cart-item");
    cartItemDiv.innerHTML = `
      <h4>${item.name}</h4>
      <p>N${item.price} x ${item.quantity}</p>
      <span class="remove-btn" data-item="${item.name}">&times;</span>
    `;
    cartItemsContainer.appendChild(cartItemDiv);

    totalPrice += item.price * item.quantity;
  });

  document.getElementById("total-price").textContent = `Total: N${totalPrice}`;

  // Enable or disable checkout button based on cart items
  document.getElementById("checkout-button").disabled = cart.length === 0;

  // Add remove functionality to cart items
  document.querySelectorAll(".remove-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const itemName = this.getAttribute("data-item");
      cart = cart.filter((item) => item.name !== itemName);
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart(); // Re-render the cart
    });
  });
}

// Initialize menu data fetch on page load
document.addEventListener("DOMContentLoaded", () => {
  const pageType = document.body.dataset.pageType; // Detect whether it's dine_in or take_out page
  fetchMenuData(pageType); // Fetch menu based on the page type
});
