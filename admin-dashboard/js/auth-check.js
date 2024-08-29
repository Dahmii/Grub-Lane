(function () {
  const token = localStorage.getItem("token"); // Replace 'token' with the actual key used to store the JWT
  if (!token) {
    // Redirect immediately if no token is found
    window.location.href = "index.html";
  }
})();
