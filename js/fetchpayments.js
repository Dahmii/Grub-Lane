let currentPage = 1;
const pageSize = 10;

function fetchPayments(page = 1, status = "") {
  fetch(
    `https://grublanerestaurant.com/api/payments/getPayments?page=${page}&pageSize=${pageSize}&status=${status}`
  )
    .then((response) => response.json())
    .then((data) => {
      displayPayments(data.data);
      setupPagination(data.pagination);
    })
    .catch((error) => console.error("Error:", error));
}

function displayPayments(payments) {
  const tableBody = document.getElementById("payments-body");
  tableBody.innerHTML = "";

  payments.forEach((payment) => {
    const row = `
            <tr>
                <td>${payment.id}</td>
                <td>${payment.order_id}</td>
                <td>₦${payment.amount.toFixed(2)}</td>
                <td>${new Date(payment.payment_date).toLocaleString()}</td>
                <td>${payment.status}</td>
                <td>
                    <button onclick="viewPaymentDetails(${
                      payment.id
                    })">View</button>
                </td>
            </tr>
        `;
    tableBody.insertAdjacentHTML("beforeend", row);
  });
}

function setupPagination(pagination) {
  const paginationElement = document.getElementById("pagination");
  paginationElement.innerHTML = "";

  if (pagination.prevUrl) {
    paginationElement.insertAdjacentHTML(
      "beforeend",
      `<button onclick="changePage(${
        pagination.currentPage - 1
      })">Previous</button>`
    );
  }

  paginationElement.insertAdjacentHTML(
    "beforeend",
    `<span>Page ${pagination.currentPage} of ${pagination.totalPages}</span>`
  );

  if (pagination.nextUrl) {
    paginationElement.insertAdjacentHTML(
      "beforeend",
      `<button onclick="changePage(${
        pagination.currentPage + 1
      })">Next</button>`
    );
  }
}

function changePage(page) {
  currentPage = page;
  fetchPayments(currentPage, document.getElementById("status-filter").value);
}

function viewPaymentDetails(paymentId) {
  // Implement this function to show detailed payment information
  console.log("Viewing details for payment:", paymentId);
}

document
  .getElementById("status-filter")
  .addEventListener("change", function () {
    fetchPayments(1, this.value);
  });

document.getElementById("export-csv").addEventListener("click", function () {
  // Implement CSV export functionality
  console.log("Exporting to CSV");
});

// Initial fetch
fetchPayments();
