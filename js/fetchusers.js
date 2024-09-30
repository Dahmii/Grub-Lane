function createUser(email, name, address = "", phoneNumber = "") {
  const endpointUrl = `https://grublanerestaurant.com/api/users`;
  const userData = {
    email: email,
    name: name,
    address: address,
    phone_number: phoneNumber,
  };

  return fetch(endpointUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  })
    .then((response) => {
      console.error(response.status);
      if (response.status === 200) {
        return response.json();
      } else if (response.status === 409) {
        return response.json().then((data) => {
          return { userId: data.id }; 
        });
      } else {
        throw new Error("Failed to create user.");
      }
    })
    .catch((error) => {
      console.error("Error creating user:", error.message);
      throw error;
    });
}



function fetchAllUsers() {
  const endpointUrl = `https://grublanerestaurant.com/api/users`;

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
