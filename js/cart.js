// Initialize cart
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Function to render cart items in the side cart
function renderCart() {
  const cartItemsContainer = document.getElementById("side-cart-items");
  cartItemsContainer.innerHTML = "";

  let totalPrice = 0;

  cart.forEach((item, index) => {
    const cartItemDiv = document.createElement("div");
    cartItemDiv.classList.add("side-cart-item");
    cartItemDiv.innerHTML = `
      <h4>${item.name}</h4>
      <p>N${item.price} x ${item.quantity}</p>
      <span class="remove-btn" data-index="${index}">&times;</span>
    `;
    cartItemsContainer.appendChild(cartItemDiv);

    totalPrice += item.price * item.quantity;
  });

  document.getElementById("total-price").textContent = `Total: N${totalPrice}`;

  // Enable or disable checkout button based on cart items
  const checkoutButton = document.getElementById("checkout-button");
  checkoutButton.disabled = cart.length === 0;

  // Add event listeners for remove buttons
  document.querySelectorAll(".remove-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const itemIndex = this.getAttribute("data-index");
      cart.splice(itemIndex, 1);
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart(); // Re-render cart after item is removed
    });
  });
}

// Initial render
renderCart();

// Handle click event for Add to Cart button
document.querySelectorAll(".add-to-cart-btn").forEach((button) => {
  button.addEventListener("click", function () {
    // Get item name and price from data attributes
    const itemName = this.getAttribute("data-item");
    const itemPrice = parseInt(this.getAttribute("data-price"));

    // Check if item is already in cart
    const existingItemIndex = cart.findIndex((item) => item.name === itemName);

    if (existingItemIndex > -1) {
      // Increment quantity if item already exists
      cart[existingItemIndex].quantity += 1;
    } else {
      // Add new item to cart
      cart.push({ name: itemName, price: itemPrice, quantity: 1 });
    }

    // Save cart to localStorage
    localStorage.setItem("cart", JSON.stringify(cart));

    // Render cart again to update the side cart
    renderCart();

    // Show the side cart
    document.getElementById("side-cart").classList.add("active");
    document.getElementById("overlay").classList.add("active");
  });
});

// Toggle side cart visibility
document.getElementById("cart-button").addEventListener("click", function () {
  document.getElementById("side-cart").classList.toggle("active");
  document.getElementById("overlay").classList.toggle("active");
});

// Close side cart
document
  .getElementById("side-cart-close")
  .addEventListener("click", function () {
    document.getElementById("side-cart").classList.remove("active");
    document.getElementById("overlay").classList.remove("active");
  });

// Close side cart when clicking outside
document.getElementById("overlay").addEventListener("click", function () {
  document.getElementById("side-cart").classList.remove("active");
  document.getElementById("overlay").classList.remove("active");
});

// Checkout with Paystack
document
  .getElementById("checkout-button")
  .addEventListener("click", function () {
    if (cart.length === 0) {
      alert("No items in cart. Please add items before checking out.");
      return;
    }

    // Calculate the total amount
    let totalAmount = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Get the user's email (replace this with actual user email retrieval)
    let userEmail = localStorage.getItem("userEmail") || "user@example.com"; // Replace with actual user email

    // Generate an order ID (this could also be generated on the server)
    let orderId = "ORDER_" + new Date().getTime(); // Example order ID

    // Call the Paystack payment function
    payWithPaystack(totalAmount, userEmail, orderId);
  });
