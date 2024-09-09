function fetchMenuData(menuType) {
  console.log(menuType);
  const takeOut = menuType === "take_out" ? true : false;

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

      if (!data.dishes || !Array.isArray(data.dishes) || data.dishes.length === 0) {
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
          const subcategoryId = subcategory.replace(/\s+/g, '-').toLowerCase();
          menuHtml += `<div class="menu-section">
            <h3 class="menu-category" onclick="toggleMenu('${subcategoryId}')">${subcategory}</h3>
            <div class="menu-items" id="${subcategoryId}">`;

          groupedMenu[subcategory].forEach((item) => {
            menuHtml += `<div class="menu-item-card">
              <div class="menu-item fancy-card">
                <h5>${item.name}</h5>
                <p class="price"><strong>N${item.price}</strong></p>
                <p class="description">A delicious ${item.subcategory} offering.</p>
              </div>
            </div>`;
          });

          menuHtml += `</div></div>`;
        }
      }

      menuContainer.innerHTML = menuHtml;
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

document.addEventListener("DOMContentLoaded", () => {
  const pageType = document.body.dataset.pageType;
  fetchMenuData(pageType);
});

function addCartFunctionality() {
  document.querySelectorAll(".add-to-cart-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const itemName = this.getAttribute("data-item");
      const itemPrice = parseInt(this.getAttribute("data-price"));
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      const existingItemIndex = cart.findIndex((item) => item.name === itemName);

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
  document.getElementById("checkout-button").disabled = cart.length === 0;

  document.querySelectorAll(".remove-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const itemName = this.getAttribute("data-item");
      cart = cart.filter((item) => item.name !== itemName);
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart();
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const pageType = document.body.dataset.pageType;
  fetchMenuData(pageType);
});
