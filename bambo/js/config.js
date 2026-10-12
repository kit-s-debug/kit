/* Shop settings for online orders. Fill in ONE way for orders to reach the shop.
   Checked in this order: orderEndpoint, then orderWhatsApp, then orderEmail.
   Leave all three empty and checkout runs in preview mode (nothing is sent). */
window.BAMBO_CONFIG = {
  // FormSubmit emails each order to the shop. The first order sends an activation
  // email to the address; click "Activate" in it once and orders arrive from then on.
  // Afterwards FormSubmit gives a random alias: swap it in for the address here to
  // keep the address out of the page source.
  orderEndpoint: "https://formsubmit.co/ajax/rajab.ark@gmail.com",
  // Shop mobile in international format, digits only, e.g. "447700900123"
  orderWhatsApp: "",
  // Shop email address, e.g. "orders@bambo.shop"
  orderEmail: "rajab.ark@gmail.com",
  // How long a click & collect order is held before going back on the shelf
  holdHours: 48,
  shopName: "Bambo Shop",
  address: "3 Castle Square, Haverfordwest",
};
