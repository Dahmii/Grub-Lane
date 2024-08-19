
$(document).ready(function () {
  // Sidebar toggle functionality
  $("#sidebarCollapse").on("click", function () {
    $("#sidebar").toggleClass("active");
    $("#content").toggleClass("active");
  });

  // Ensure the sidebar can be toggled on mobile devices
  $(".hamburger-menu").on("click", function () {
    $("#sidebar").toggleClass("active");
    $("#content").toggleClass("active");
  });
});
