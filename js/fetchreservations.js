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

let currentPage = 1;
const rowsPerPage = 10;

function fetchAllReservations(page = 1) {
  const endpointUrl = `https://grublanerestaurant.com/api/reservations?page=${page}&limit=${rowsPerPage}`;

  return fetch(endpointUrl)
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      } else {
        throw new Error("Failed to fetch reservations.");
      }
    })
    .then((data) => {
      console.log("API Response:", data);

      // Assuming data is an array of reservations
      return data;
    })
    .catch((error) => {
      console.error("Error fetching reservations:", error.message);
      return []; // Return an empty array in case of error
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
  // Fetch and display the first page of reservations when the page loads
  fetchAllReservations(currentPage).then((reservations) => {
    populateTable(reservations);
    const totalPages = Math.ceil(reservations.length / rowsPerPage);
    updatePaginationControls(currentPage, totalPages);
  });

  document.getElementById("prev-btn").addEventListener("click", function () {
    if (currentPage > 1) {
      currentPage--;
      fetchAllReservations(currentPage).then((reservations) => {
        populateTable(reservations);
        const totalPages = Math.ceil(reservations.length / rowsPerPage);
        updatePaginationControls(currentPage, totalPages);
      });
    }
  });

  document.getElementById("next-btn").addEventListener("click", function () {
    currentPage++;
    fetchAllReservations(currentPage).then((reservations) => {
      populateTable(reservations);
      const totalPages = Math.ceil(reservations.length / rowsPerPage);
      updatePaginationControls(currentPage, totalPages);
    });
  });
});
