function createUser(email, name, address = "", phoneNumber = "") {
  const endpointUrl = `https://grublanerestaurant.com:3000/users`;
  const userData = {
    email: email,
    name: name,
    address: address,
    phone_number: phoneNumber,
  };

  fetch(endpointUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  })
    .then((response) => {
      if (response.status === 201) {
        return response.json();
      } else if (response.status === 409) {
        throw new Error("User already exists.");
      } else {
        throw new Error("Failed to create user.");
      }
    })
    .then((data) => {
      console.log("User created successfully with ID:", data.id);
    })
    .catch((error) => {
      console.error("Error creating user:", error.message);
    });
}
function fetchAllUsers() {
  const endpointUrl = `https://grublanerestaurant.com:3000/users`;

  fetch(endpointUrl)
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      } else {
        throw new Error("Failed to fetch users.");
      }
    })
    .then((data) => {
      const users = data.users;
      console.log("Fetched users:", users);
      // Optionally, render users to the DOM
    })
    .catch((error) => {
      console.error("Error fetching users:", error.message);
    });
}
document
  .getElementById("createUserForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const name = document.getElementById("name").value;
    const address = document.getElementById("address").value;
    const phoneNumber = document.getElementById("phone_number").value;

    createUser(email, name, address, phoneNumber);
  });

document.addEventListener("DOMContentLoaded", function () {
  fetchAllUsers();
});
