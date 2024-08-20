function createReservation(userId, numberOfGuests, dateTime, tableNumber) {
  const endpointUrl = `https://grublanerestaurant.com/api/reservations`;
  const reservationData = {
    user_id: userId,
    number_of_guests: numberOfGuests,
    date_time: dateTime,
    table_number: tableNumber,
  };

  return fetch(endpointUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reservationData),
  })
    .then((response) => {
      if (response.status === 201) {
        return response.json();
      } else if (response.status === 409) {
        throw new Error("Reservation already exists.");
      } else {
        throw new Error("Failed to create reservation.");
      }
    })
    .catch((error) => {
      console.error("Error creating reservation:", error.message);
      return null;
    });
}

// Form submission handler
document.addEventListener("DOMContentLoaded", function () {
  const createReservationForm = document.getElementById(
    "createReservationForm"
  );
  if (createReservationForm) {
    createReservationForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const userId = document.getElementById("user_id").value;
      const numberOfGuests = document.getElementById("number_of_guests").value;
      const dateTime = document.getElementById("date_time").value;
      const tableNumber = document.getElementById("table_number").value; // Capture the table number

      createReservation(userId, numberOfGuests, dateTime, tableNumber);
    });
  }

  // Initialize reservation table on page load
  fetchAllReservations();

  // Pagination controls
  document.getElementById("prev-btn").addEventListener("click", function () {
    if (currentPage > 1) {
      currentPage--;
      fetchAllReservations(currentPage);
    }
  });

  document.getElementById("next-btn").addEventListener("click", function () {
    currentPage++;
    fetchAllReservations(currentPage);
  });
});

let currentPage = 1;
const rowsPerPage = 10;

function fetchAllReservations(page = 1) {
  const endpointUrl = `https://grublanerestaurant.com/api/reservations?page=${page}&limit=${rowsPerPage}`;

  fetch(endpointUrl)
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      } else {
        throw new Error("Failed to fetch reservations.");
      }
    })
    .then((data) => {
      console.log("API Response:", data);

      // Since the response is an array, assign it directly to reservations
      const reservations = data;

      // If your API does not provide a total count for pagination, we'll assume only one page
      const totalPages = Math.ceil(reservations.length / rowsPerPage);

      populateTable(reservations);
      updatePaginationControls(page, totalPages);
    })
    .catch((error) => {
      console.error("Error fetching reservations:", error.message);
    });
}

function populateTable(reservations) {
  const tableBody = document.getElementById("reservation-table-body");
  tableBody.innerHTML = ""; // Clear existing rows

  if (reservations.length === 0) {
    tableBody.innerHTML =
      "<tr><td colspan='7' class='text-center'>No reservations found.</td></tr>";
  } else {
    reservations.forEach((reservation) => {
      const row = `
                <tr>
                    <td class="text-center">${reservation.id}</td>
                    <td class="text-center">${reservation.user_id}</td>
                    <td class="text-center">${new Date(
                      reservation.date_time
                    ).toLocaleDateString()}</td>
                    <td class="text-center">${new Date(
                      reservation.date_time
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}</td>
                    <td class="text-center">${reservation.number_of_guests}</td>
                    <td class="text-center">Confirmed</td> <!-- Assuming status is always 'Confirmed' as it's not in the structure -->
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
  fetchAllReservations();

  document.getElementById("prev-btn").addEventListener("click", function () {
    if (currentPage > 1) {
      currentPage--;
      fetchAllReservations(currentPage);
    }
  });

  document.getElementById("next-btn").addEventListener("click", function () {
    currentPage++;
    fetchAllReservations(currentPage);
  });
});
