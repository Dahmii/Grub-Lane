function payWithPaystack(amount, email, orderId) {
  let handler = PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY, // Replace with your Paystack public key
    email: email,
    amount: amount * 100, // Paystack expects amount in kobo
    currency: "NGN",
    ref: orderId,
    callback: function (response) {
      // This function is called when the payment is successful
      if (response.status === "success") {
        // Send the payment details to your server
        fetch("https://grublanerestaurant.com/api/payments/createPayments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            order_id: orderId,
            amount: amount,
            payment_date: new Date().toISOString(),
            payment_method: "Paystack",
            status: "Success",
            paystack_refnumber: response.reference,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Payment recorded:", data);
            alert("Payment successful!");
            // Redirect to the order confirmation page
            window.location.href = "/order-confirmation.html";
          })
          .catch((error) => {
            console.error("Error recording payment:", error);
            alert(
              "There was an error processing your payment. Please contact support."
            );
          });
      }
    },
    onClose: function () {
      alert("Transaction was not completed, window closed.");
    },
  });
  handler.openIframe();
}
