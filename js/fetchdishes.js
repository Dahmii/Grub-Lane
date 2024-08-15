function fetchMenuData(menuType) {
  const takeOut = menuType === "dine_in" ? "false" : "true";
<<<<<<< HEAD
  const endpointUrl = `https  ://grublanerestaurant.com:3000/dish/getDishes?take_out=${takeOut}`;
=======
  const endpointUrl = `https://grublanerestaurant.com/api/dish/getDishes?take_out=${takeOut}`;
>>>>>>> bbcd0c0b49294f9fb57f134be4ab83bd16872ee5

  fetch(endpointUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => {
      const menuContainer = document.getElementById("menu-container");
      let menuHtml = "";

      if (Object.keys(data).length === 0) {
        menuHtml = `
            <div class="text-center">
              <h2>Oops! Something went wrong!</h2>
              <p>We couldn't find any menu items at the moment. Please try again later.</p>
            </div>
          `;
      } else {
        for (const category in data) {
          menuHtml += `<h2 class="text-center">${category}</h2><div class="row">`;

          data[category].forEach((item) => {
            menuHtml += `
                <div class="col-md-4 mb-4">
                  <div class="menu-item">
                    <img src="${item.image_url}" alt="${item.name}" class="img-fluid" />
                    <h4>${item.name}</h4>
                    <p>N${item.price}</p>
                    ${
                      menuType === "take_out"
                        ? `
                    <button class="add-to-cart-btn" data-item="${item.name}" data-price="${item.price}">
                      Add to cart
                    </button>
                    `
                        : ""
                    }
                  </div>
                </div>
              `;
          });

          menuHtml += "</div>";
        }
      }

      menuContainer.innerHTML = menuHtml;

      if (menuType === "take_out") {
        addCartFunctionality();
      }
    })
    .catch((error) => {
      const menuContainer = document.getElementById("menu-container");
      menuContainer.innerHTML = `
          <div class="text-center">
            <h2>Oops! Something went wrong!</h2>
            <p>We couldn't fetch the menu data. Please try again later.</p>
          </div>
        `;
      console.error("Error fetching menu data:", error);
    });
}

function addCartFunctionality() {
  document.querySelectorAll(".add-to-cart-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const itemName = this.getAttribute("data-item");
      const itemPrice = parseInt(this.getAttribute("data-price"));
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

document.addEventListener("DOMContentLoaded", () => {
  const pageType = document.body.dataset.pageType;
  fetchMenuData(pageType);
});
