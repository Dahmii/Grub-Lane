function createReservation(userId, tableNumber, numberOfGuests, dateTime) {
  const endpointUrl = `https://grublanerestaurant.com:3000/reservations`;
  const reservationData = {
    user_id: userId,
    table_number: tableNumber,
    number_of_guests: numberOfGuests,
    date_time: dateTime,
  };

  fetch(endpointUrl, {
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
    .then((data) => {
      console.log("Reservation created successfully with ID:", data.id);
    })
    .catch((error) => {
      console.error("Error creating reservation:", error.message);
    });
}

function fetchAllReservations() {
  const endpointUrl = `https://grublanerestaurant.com:3000/reservations`;

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
      // Optionally, render reservations to the DOM
    })
    .catch((error) => {
      console.error("Error fetching reservations:", error.message);
    });
}

document
  .getElementById("createReservationForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const userId = document.getElementById("user_id").value;
    const tableNumber = document.getElementById("table_number").value;
    const numberOfGuests = document.getElementById("number_of_guests").value;
    const dateTime = document.getElementById("date_time").value;

    createReservation(userId, tableNumber, numberOfGuests, dateTime);
  });

document.addEventListener("DOMContentLoaded", function () {
  fetchAllReservations();
});
