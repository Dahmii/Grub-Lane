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
let nextUrl = null;
let prevUrl = null;
const rowsPerPage = 10;

function fetchAllReservations(url = null) {
  const endpointUrl =
    url ||
    `https://grublanerestaurant.com/api/reservations?page=${currentPage}&pageSize=${rowsPerPage}`;

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
        throw new Error("Failed to fetch reservations.");
      }
    })
    .then((data) => {
      console.log("API Response:", data);

      nextUrl = data.pagination.nextUrl;
      prevUrl = data.pagination.prevUrl;

      return data.data;
    })
    .catch((error) => {
      console.error("Error fetching reservations:", error.message);
      return [];
    });
}

function populateTable(reservations) {
  const tableBody = document.getElementById("reservation-table-body");
  tableBody.innerHTML = "";

  if (reservations.length === 0) {
    tableBody.innerHTML =
      "<tr><td colspan='7' class='text-center'>No reservations found.</td></tr>";
  } else {
    reservations.forEach((reservation) => {
      const row = `
                <tr>
                    <td class="text-center">${reservation.id}</td>
                    <td class="text-center">${reservation.user_name}</td>
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
                    
                    <td class="text-center">
                        <button class="btn btn-info btn-sm">View</button>
                    </td>
                </tr>
            `;
      tableBody.insertAdjacentHTML("beforeend", row);
    });
  }
}

function updatePaginationControls() {
  document.getElementById("page-info").textContent = `Page ${currentPage}`;
  document.getElementById("prev-btn").disabled = !prevUrl;
  document.getElementById("next-btn").disabled = !nextUrl;
}

document.addEventListener("DOMContentLoaded", function () {
  fetchAllReservations().then((reservations) => {
    populateTable(reservations);
    updatePaginationControls();
  });

  document.getElementById("prev-btn").addEventListener("click", function () {
    if (prevUrl) {
      currentPage--;
      fetchAllReservations(prevUrl).then((reservations) => {
        populateTable(reservations);
        updatePaginationControls();
      });
    }
  });

  document.getElementById("next-btn").addEventListener("click", function () {
    if (nextUrl) {
      currentPage++;
      fetchAllReservations(nextUrl).then((reservations) => {
        populateTable(reservations);
        updatePaginationControls();
      });
    }
  });
});
