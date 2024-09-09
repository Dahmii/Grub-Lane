function fetchMenuData(menuType) {
  console.log("Menu type: ", menuType);
  const takeOut = menuType === "take_out" ? true : false;

  const endpointUrl = `https://grublanerestaurant.com/api/dish/getDishes?take_out=${takeOut}`;
  console.log("Fetching menu from: ", endpointUrl);

  fetch(endpointUrl)
    .then((response) => {
      console.log("Fetch response: ", response);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Menu data: ", data);
      const menuContainer = document.getElementById("menu-container");
      let menuHtml = "";

      if (
        !data.dishes ||
        !Array.isArray(data.dishes) ||
        data.dishes.length === 0
      ) {
        menuHtml = `<div class="text-center"><h2>No menu items available</h2><p>We couldn't find any menu items at the moment for this type. Please try again later.</p></div>`;
      } else {
        const groupedMenu = {};
        data.dishes.forEach((dish) => {
          const { subcategory } = dish;
          if (!groupedMenu[subcategory]) {
            groupedMenu[subcategory] = [];
          }
          groupedMenu[subcategory].push(dish);
        });

        for (const subcategory in groupedMenu) {
          const subcategoryId = subcategory.replace(/\s+/g, "-").toLowerCase();
          menuHtml += `<div class="menu-section">
            <h3 class="menu-category" onclick="toggleMenu('${subcategoryId}')">${subcategory}</h3>
            <div class="menu-items" id="${subcategoryId}">`;

          groupedMenu[subcategory].forEach((item) => {
            menuHtml += `<div class="menu-item-card">
              <div class="menu-item fancy-card">
                <h5>${item.name}</h5>
                <p class="price"><strong>N${item.price}</strong></p>
                <p class="description">A delicious ${item.subcategory} offering.</p>
                <button class="add-to-cart-btn" data-item="${item.name}" data-price="${item.price}">Add to Cart</button>
              </div>
            </div>`;
          });

          menuHtml += `</div></div>`;
        }
      }

      menuContainer.innerHTML = menuHtml;
      addCartFunctionality();
    })
    .catch((error) => {
      const menuContainer = document.getElementById("menu-container");
      menuContainer.innerHTML = `<div class="text-center"><h2>Error Fetching Data</h2><p>We couldn't fetch the menu data. Please try again later.</p></div>`;
      console.error("Error fetching menu data:", error);
    });
}

function toggleMenu(subcategoryId) {
  const element = document.getElementById(subcategoryId);
  if (element.style.display === "none" || element.style.display === "") {
    element.style.display = "grid";
  } else {
    element.style.display = "none";
  }
}

function addCartFunctionality() {
  console.log("Adding cart functionality");
  document.querySelectorAll(".add-to-cart-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const itemName = this.getAttribute("data-item");
      const itemPrice = parseInt(this.getAttribute("data-price"));
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      const existingItemIndex = cart.findIndex(
        (item) => item.name === itemName
      );

      if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += 1;
      } else {
        cart.push({ name: itemName, price: itemPrice, quantity: 1 });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart();
      document.getElementById("side-cart").classList.add("active");
      document.getElementById("overlay").classList.add("active");
    });
  });
}

function renderCart() {
  console.log("Rendering cart");
  const cartItemsContainer = document.getElementById("side-cart-items");
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cartItemsContainer.innerHTML = "";

  let totalPrice = 0;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = "<p>No items in cart</p>";
    document.getElementById("total-price").textContent = "Total: N0";
    document.getElementById("checkout-button").disabled = true;
    return; // Exit the function if the cart is empty
  }

  cart.forEach((item, index) => {
    const cartItemDiv = document.createElement("div");
    cartItemDiv.classList.add("side-cart-item");
    cartItemDiv.innerHTML = `
      <h4>${item.name}</h4>
      <p>N${item.price} x ${item.quantity}</p>
      <button class="decrease-btn" data-index="${index}">-</button>
      <button class="increase-btn" data-index="${index}">+</button>
      <span class="remove-btn" data-index="${index}">&times;</span>
    `;
    cartItemsContainer.appendChild(cartItemDiv);

    totalPrice += item.price * item.quantity;
  });

  document.getElementById("total-price").textContent = `Total: N${totalPrice}`;
  document.getElementById("checkout-button").disabled = cart.length === 0;

  // Add event listeners for remove buttons
  document.querySelectorAll(".remove-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const itemIndex = this.getAttribute("data-index");
      cart.splice(itemIndex, 1);
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart(); // Re-render cart after item is removed
    });
  });

  // Add event listeners for increase and decrease buttons
  document.querySelectorAll(".increase-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const itemIndex = this.getAttribute("data-index");
      cart[itemIndex].quantity += 1;
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart(); // Re-render cart after quantity is increased
    });
  });

  document.querySelectorAll(".decrease-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const itemIndex = this.getAttribute("data-index");
      if (cart[itemIndex].quantity > 1) {
        cart[itemIndex].quantity -= 1;
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart(); // Re-render cart after quantity is decreased
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const pageType = document.body.dataset.pageType;
  console.log("Page type: ", pageType);
  fetchMenuData(pageType);
  renderCart(); // Ensure cart is rendered after DOM loads
});
