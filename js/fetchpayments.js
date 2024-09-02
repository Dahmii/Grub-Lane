let currentPage = 1;
const pageSize = 10;
let currentPayments = []; // To store the current page's payments for export

function fetchPayments(page = 1, status = "") {
  const endpointUrl = `https://grublanerestaurant.com/api/payments/getPayments?page=${page}&pageSize=${pageSize}&status=${status}`;
  const token = localStorage.getItem("token");

  fetch(endpointUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch payments.");
      }
      return response.json();
    })
    .then((data) => {
      currentPayments = data.data; // Store the payments for export
      displayPayments(data.data);
      setupPagination(data.pagination);
    })
    .catch((error) => console.error("Error:", error));
}

function displayPayments(payments) {
  const tableBody = document.getElementById("payment-table-body");

  tableBody.innerHTML = "";

  if (payments.length === 0) {
    tableBody.innerHTML =
      "<tr><td colspan='6' class='text-center'>No payments found.</td></tr>";
  } else {
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
  fetchPayments(currentPage, document.getElementById("filter").value);
}

function viewPaymentDetails(paymentId) {
  // Implement this function to show detailed payment information
  console.log("Viewing details for payment:", paymentId);
}

document.getElementById("filter").addEventListener("change", function () {
  fetchPayments(1, this.value);
});

document.getElementById("export").addEventListener("click", function () {
  exportToCSV(currentPayments, "payments");
});

function exportToCSV(data, filename) {
  // Define the fields you want to include in the CSV
  const fields = [
    "id",
    "order_id",
    "amount",
    "payment_date",
    "payment_method",
    "status",
    "paystack_refnumber",
  ];

  // Create CSV header row
  let csv = fields.join(",") + "\n";

  // Add data rows
  data.forEach((item) => {
    let row = fields
      .map((field) => {
        let value = item[field];
        // Handle special cases
        if (field === "payment_date") {
          value = new Date(value).toLocaleString();
        } else if (field === "amount") {
          value = parseFloat(value).toFixed(2);
        }
        // Escape commas and wrap in quotes if necessary
        if (value && value.toString().includes(",")) {
          value = `"${value}"`;
        }
        return value;
      })
      .join(",");
    csv += row + "\n";
  });

  // Create a Blob with the CSV data
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  // Create a download link
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${filename}_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Initial fetch
fetchPayments();
