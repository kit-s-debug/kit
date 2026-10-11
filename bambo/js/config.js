/* Shop settings for online orders. Fill in ONE way for orders to reach the shop.
   Checked in this order: orderEndpoint, then orderWhatsApp, then orderEmail.
   Leave all three empty and checkout runs in preview mode (nothing is sent). */
window.BAMBO_CONFIG = {
  // A form service URL that accepts JSON POSTs, e.g. https://formspree.io/f/xxxxxxx
  orderEndpoint: "",
  // Shop mobile in international format, digits only, e.g. "447700900123"
  orderWhatsApp: "",
  // Shop email address, e.g. "orders@bambo.shop"
  orderEmail: "",
  // How long a click & collect order is held before going back on the shelf
  holdHours: 48,
  shopName: "Bambo Shop",
  address: "3 Castle Square, Haverfordwest",
};
