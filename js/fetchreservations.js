// Function to create a reservation
function createReservation(
  name,
  date,
  time,
  phoneNumber,
  email,
  numberOfGuests
) {
  const endpointUrl = `https://grublanerestaurant.com/api/reservations`;
  const reservationData = {
    name: name,
    date: date,
    time: time,
    phone_number: phoneNumber,
    email: email,
    number_of_guests: numberOfGuests,
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
      alert("Reservation created successfully!");
    })
    .catch((error) => {
      console.error("Error creating reservation:", error.message);
      alert("Error: " + error.message);
    });
}

// Function to fetch all reservations
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
    })
    .catch((error) => {
      console.error("Error fetching reservations:", error.message);
    });
}

// Event listener for form submission
document
  .getElementById("createReservationForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const phoneNumber = document.getElementById("phone_number").value;
    const email = document.getElementById("email").value;
    const numberOfGuests = document.getElementById("number_of_guests").value;

    createReservation(name, date, time, phoneNumber, email, numberOfGuests);
  });

// Fetch all reservations on page load
document.addEventListener("DOMContentLoaded", function () {
  fetchAllReservations();
});
