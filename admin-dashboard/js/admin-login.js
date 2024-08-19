document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("adminLoginForm");
  const errorMessage = document.getElementById("error-message");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username === "admin" && password === "password123") {
      window.location.href = "index.html"; // Redirect to the admin dashboard page
    } else {
      errorMessage.textContent = "Invalid username or password";
      errorMessage.style.display = "block";
    }
  });
});
