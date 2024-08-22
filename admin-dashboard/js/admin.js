$(document).ready(function () {
  // Remove all previous click handlers
  $("#sidebarCollapse").off("click");

  // Attach the click handler to toggle the sidebar and change the icon color
  $("#sidebarCollapse").on("click", function () {
    console.log("Sidebar toggle clicked");
    $("#sidebar").toggleClass("active");
    $("#content").toggleClass("active");

    // Toggle the color of the hamburger menu icon
    $(this).toggleClass("hamburger-active");
  });
});
