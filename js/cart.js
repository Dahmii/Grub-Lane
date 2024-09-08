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
      <button class="decrease-quantity" data-index="${index}">-</button>
      <button class="increase-quantity" data-index="${index}">+</button>
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

  // Add event listeners for decrease quantity buttons
  document.querySelectorAll(".decrease-quantity").forEach((button) => {
    button.addEventListener("click", function () {
      const itemIndex = this.getAttribute("data-index");
      if (cart[itemIndex].quantity > 1) {
        cart[itemIndex].quantity -= 1;
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart(); // Re-render cart after quantity is decreased
      }
    });
  });

  // Add event listeners for increase quantity buttons
  document.querySelectorAll(".increase-quantity").forEach((button) => {
    button.addEventListener("click", function () {
      const itemIndex = this.getAttribute("data-index");
      cart[itemIndex].quantity += 1;
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart(); // Re-render cart after quantity is increased
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

// Paystack payment integration
function payWithPaystack(totalAmount, userEmail, orderId) {
  const handler = PaystackPop.setup({
    key: "pk_test_8168df975740a7daac50c926c60f4a4694fc9d50", // Replace with your Paystack public key
    email: userEmail,
    amount: totalAmount * 100, // Convert to kobo
    currency: "NGN",
    ref: orderId, // Use generated order ID
    callback: function (response) {
      recordPayment(response.reference, userEmail, totalAmount);
    },
    onClose: function () {
      alert("Transaction was not completed, window closed.");
    },
  });
  handler.openIframe();
}

// Function to record payment details
function recordPayment(reference, email, amount) {
  const paymentDetails = {
    order_id: reference,
    amount: amount,
    payment_date: new Date().toISOString().slice(0, 10), // Format as YYYY-MM-DD
    payment_method: "Paystack",
    status: "Completed",
    paystack_refnumber: reference,
  };

  // Send the payment details to your backend API
  $.ajax({
    url: "https://grublanerestaurant.com/api/payments/createPayments",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(paymentDetails),
    success: function (response) {
      alert("Payment recorded successfully!");
      localStorage.removeItem("cart"); // Clear the cart after successful payment
      window.location.href = `order-confirmation.html?orderId=${reference}`; // Redirect to a thank-you page or order confirmation
    },
    error: function (xhr) {
      alert("Failed to record payment. Please contact support.");
    },
  });
}

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
