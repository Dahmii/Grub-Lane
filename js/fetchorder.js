function createOrder(
  userId,
  amountPaid,
  orderNumber,
  date,
  paystackReference = "",
  orderDetails = ""
) {
  const endpointUrl = `https://grublanerestaurant.com/api/orders`;
  const orderData = {
    user_id: userId,
    amount_paid: amountPaid,
    order_number: orderNumber,
    date: date,
    paystack_reference: paystackReference,
    order_details: orderDetails,
  };

  fetch(endpointUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  })
    .then((response) => {
      if (response.status === 201) {
        return response.json();
      } else if (response.status === 409) {
        throw new Error("Order already exists.");
      } else {
        throw new Error("Failed to create order.");
      }
    })
    .then((data) => {
      console.log("Order created successfully with ID:", data.id);
    })
    .catch((error) => {
      console.error("Error creating order:", error.message);
    });
}

function fetchAllOrders() {
  const endpointUrl = `https://grublanerestaurant.com/api/orders`;

  fetch(endpointUrl)
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      } else {
        throw new Error("Failed to fetch orders.");
      }
    })
    .then((data) => {
      const orders = data.orders;
      console.log("Fetched orders:", orders);
      // Optionally, render orders to the DOM
    })
    .catch((error) => {
      console.error("Error fetching orders:", error.message);
    });
}

document
  .getElementById("createOrderForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const userId = document.getElementById("user_id").value;
    const amountPaid = document.getElementById("amount_paid").value;
    const orderNumber = document.getElementById("order_number").value;
    const date = document.getElementById("date").value;
    const paystackReference =
      document.getElementById("paystack_reference").value;
    const orderDetails = document.getElementById("order_details").value;

    createOrder(
      userId,
      amountPaid,
      orderNumber,
      date,
      paystackReference,
      orderDetails
    );
  });

document.addEventListener("DOMContentLoaded", function () {
  fetchAllOrders();
});
