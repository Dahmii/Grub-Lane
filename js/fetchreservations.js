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
document
  .getElementById("createReservationForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const userId = document.getElementById("user_id").value;
    const numberOfGuests = document.getElementById("number_of_guests").value;
    const dateTime = document.getElementById("date_time").value;
    const tableNumber = document.getElementById("table_number").value; // Capture the table number

    createReservation(userId, numberOfGuests, dateTime, tableNumber);
  });

// Function to fetch all reservations (if needed)
function fetchAllReservations() {
  const endpointUrl = `https://grublanerestaurant.com/api/reservations`;

  fetch(endpointUrl)
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      } else {
        throw new Error("Failed to fetch reservations.");
      }
    })
    .then((data) => {
      const reservations = data.reservations;
      console.log("Fetched reservations:", reservations);
    })
    .catch((error) => {
      console.error("Error fetching reservations:", error.message);
    });
}

document.addEventListener("DOMContentLoaded", function () {
  fetchAllReservations();
});
