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

  return fetch(endpointUrl, {
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

let currentPage = 1;
const rowsPerPage = 10;

function fetchAllOrders(page = 1) {
  const endpointUrl = `https://grublanerestaurant.com/api/orders?page=${page}&limit=${rowsPerPage}`;
  const token = localStorage.getItem("token");

  return fetch(endpointUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  })
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      } else {
        throw new Error("Failed to fetch orders.");
      }
    })
    .then((data) => {
      console.log("API Response:", data);

      const orders = data.orders || data;
      return orders;
    })
    .catch((error) => {
      console.error("Error fetching orders:", error.message);
      return [];
    });
}

function populateTable(orders) {
  const tableBody = document.getElementById("order-table-body");
  tableBody.innerHTML = "";

  if (orders.length === 0) {
    tableBody.innerHTML =
      "<tr><td colspan='6' class='text-center'>No orders found.</td></tr>";
  } else {
    orders.forEach((order) => {
      const row = `
                <tr>
                    <td class="text-center">${order.id}</td>
                    <td class="text-center">${order.user_id}</td>
                    <td class="text-center">${new Date(
                      order.date
                    ).toLocaleDateString()}</td>
                    <td class="text-center">${order.order_details}</td>
                    <td class="text-center">${
                      order.status || "In Progress"
                    }</td>
                    <td class="text-center"><button class="btn btn-info btn-sm">View</button></td>
                </tr>
            `;
      tableBody.insertAdjacentHTML("beforeend", row);
    });
  }
}

function updatePaginationControls(currentPage, totalPages) {
  document.getElementById("page-info").textContent = `Page ${currentPage}`;
  document.getElementById("prev-btn").disabled = currentPage === 1;
  document.getElementById("next-btn").disabled = currentPage === totalPages;
}

document.addEventListener("DOMContentLoaded", function () {
  fetchAllOrders(currentPage).then((orders) => {
    populateTable(orders);
    const totalPages = Math.ceil(orders.length / rowsPerPage);
    updatePaginationControls(currentPage, totalPages);
  });

  document.getElementById("prev-btn").addEventListener("click", function () {
    if (currentPage > 1) {
      currentPage--;
      fetchAllOrders(currentPage).then((orders) => {
        populateTable(orders);
        const totalPages = Math.ceil(orders.length / rowsPerPage);
        updatePaginationControls(currentPage, totalPages);
      });
    }
  });

  document.getElementById("next-btn").addEventListener("click", function () {
    currentPage++;
    fetchAllOrders(currentPage).then((orders) => {
      populateTable(orders);
      const totalPages = Math.ceil(orders.length / rowsPerPage);
      updatePaginationControls(currentPage, totalPages);
    });
  });
});
