/* "Is it on the shelf?" finder. Items were read off the shop photos (Oct 2026).
   Add or remove items here: [name, aisle, optional other names to match on]. */
const STOCK = [
  // Whole spices & seeds
  ["Cumin seeds (jeera)", "Whole spices"], ["Kala jeera (black cumin)", "Whole spices", "shahi jeera"],
  ["Fennel seeds", "Whole spices", "saunf"], ["Nigella seeds (kalonji)", "Whole spices", "black onion seed"],
  ["Black mustard seeds", "Whole spices", "rai"], ["Brown mustard seeds", "Whole spices"], ["Yellow mustard seeds", "Whole spices"],
  ["Fenugreek seeds (methi)", "Whole spices"], ["Coriander seeds (dhania)", "Whole spices"],
  ["Green cardamom", "Whole spices", "elaichi"], ["Black cardamom", "Whole spices", "badi elaichi"],
  ["Whole cloves", "Whole spices", "laung"], ["Star anise", "Whole spices"], ["Mace (javitri)", "Whole spices"],
  ["Nutmeg, whole", "Whole spices", "jaiphal"], ["Cinnamon quills", "Whole spices", "dalchini"], ["Cinnamon sticks", "Whole spices"],
  ["Black pepper, whole", "Whole spices"], ["White pepper, whole", "Whole spices"], ["Black pepper, coarse", "Whole spices"],
  ["Ajwain (carom seeds)", "Whole spices"], ["Dill seed", "Whole spices"], ["Poppy seeds", "Whole spices", "khus khus"],
  ["Sesame seeds", "Whole spices", "til"], ["Black sesame seeds", "Whole spices"], ["Linseed", "Whole spices", "flaxseed"],
  ["Panch puran", "Whole spices", "panch phoron five spice"], ["Anardana (pomegranate seeds)", "Whole spices"],
  ["Bajra seeds", "Whole spices", "millet"], ["Pimento seeds (allspice)", "Whole spices"], ["Caraway seeds", "Whole spices"],
  ["Tukmaria (basil seeds)", "Whole spices", "sabja"], ["Amla, whole", "Whole spices"], ["Bay leaves", "Whole spices", "tej patta"],
  ["Dried red chillies, whole", "Whole spices"], ["Birds eye chillies, dried", "Whole spices"], ["Crushed chillies", "Whole spices", "chilli flakes"],
  ["Sugar candy (misri)", "Whole spices"],
  // Ground spices & masalas
  ["Chilli powder", "Ground spices"], ["Chilli powder, extra hot", "Ground spices"], ["Kashmiri chilli powder", "Ground spices"],
  ["Paprika", "Ground spices"], ["Smoked paprika", "Ground spices"], ["Cayenne pepper", "Ground spices"],
  ["Turmeric (haldi) powder", "Ground spices"], ["Coriander powder", "Ground spices"], ["Cumin powder", "Ground spices"],
  ["Garam masala", "Ground spices"], ["Tandoori masala", "Ground spices"], ["Tikka masala", "Ground spices"], ["Korma masala", "Ground spices"],
  ["Madras curry powder, mild", "Ground spices"], ["Madras curry powder, hot", "Ground spices"], ["Spice Box curry mix", "Ground spices", "house blend"],
  ["Kashmiri basar mix", "Ground spices"], ["Ground mixed spice (Pakistani basar)", "Ground spices"], ["Biryani masala", "Ground spices"],
  ["Pickle masala", "Ground spices"], ["All purpose seasoning", "Ground spices"], ["Peri peri rub", "Ground spices"],
  ["Cinnamon powder", "Ground spices"], ["Ginger powder", "Ground spices"], ["Garlic powder", "Ground spices"],
  ["White onion powder", "Ground spices"], ["White pepper powder", "Ground spices"], ["Black pepper powder", "Ground spices"],
  ["Ground nutmeg", "Ground spices"], ["Clove powder", "Ground spices"], ["Ground green cardamom", "Ground spices"],
  ["Fenugreek powder", "Ground spices"], ["Mustard powder", "Ground spices"], ["Fennel powder", "Ground spices"],
  ["Amchoor (mango powder)", "Ground spices"], ["Amla powder", "Ground spices"], ["Pimento powder", "Ground spices"],
  ["Garlic granules", "Ground spices"], ["Garlic flakes", "Ground spices"], ["Fried onions", "Ground spices"],
  ["Kasoori methi (dried fenugreek leaves)", "Ground spices"], ["Deggi mirch", "Ground spices", "MDH"],
  ["Citric acid", "Ground spices"], ["MSG", "Ground spices", "monosodium glutamate"], ["Food colour powder", "Ground spices"],
  ["Black rock salt (kala namak)", "Ground spices"], ["Himalayan pink salt", "Ground spices"], ["Sea salt", "Ground spices"],
  // Herbs & Middle Eastern
  ["Mixed herbs", "Herbs"], ["Dried mint", "Herbs"], ["Thyme", "Herbs"], ["Oregano", "Herbs"], ["Basil", "Herbs"],
  ["Rosemary", "Herbs"], ["Sage", "Herbs"], ["Parsley", "Herbs"], ["Chives", "Herbs"], ["Marjoram", "Herbs"], ["Tarragon", "Herbs"],
  ["Cress seeds", "Herbs"], ["Za'atar", "Herbs", "zaatar"], ["Sumac", "Herbs"], ["Hibiscus flower", "Herbs"],
  ["Thai 7 spice seasoning", "Herbs"], ["Pine nuts", "Herbs"], ["Green peppercorns", "Herbs"],
  // Fresh produce
  ["Fresh coriander", "Fresh produce", "cilantro dhania"], ["Fresh methi", "Fresh produce", "fenugreek leaves"],
  ["Fresh curry leaves", "Fresh produce"], ["Spinach", "Fresh produce"], ["Okra (bhindi)", "Fresh produce", "ladies fingers"],
  ["Karela (bitter gourd)", "Fresh produce"], ["Long aubergines", "Fresh produce", "brinjal eggplant"], ["Mooli (white radish)", "Fresh produce", "daikon"],
  ["Gourds", "Fresh produce", "dudhi lauki"], ["Green finger chillies", "Fresh produce"], ["Long red & green chillies", "Fresh produce"],
  ["Scotch bonnets", "Fresh produce", "hot pepper"], ["Bell peppers", "Fresh produce"], ["Tomatoes", "Fresh produce"],
  ["Garlic", "Fresh produce"], ["Ginger", "Fresh produce"], ["Onions & red onions", "Fresh produce"], ["Limes & lemons", "Fresh produce"],
  ["Yam", "Fresh produce"], ["Eddoes", "Fresh produce", "taro"], ["Sweet potato", "Fresh produce"], ["Pumpkin", "Fresh produce"],
  ["Plantain, green & ripe", "Fresh produce"], ["Elaichi bananas", "Fresh produce"], ["Thai guava", "Fresh produce"],
  ["Papaya", "Fresh produce"], ["Fresh figs", "Fresh produce"], ["Mangoes", "Fresh produce"], ["Coconuts", "Fresh produce"],
  // Poppadoms
  ["Plain poppadoms", "Poppadoms"], ["Cumin poppadoms", "Poppadoms"], ["Red chilli poppadoms", "Poppadoms"],
  ["Green chilli poppadoms", "Poppadoms"], ["Madras poppadoms (200g & 250g)", "Poppadoms"], ["Lijjat papad", "Poppadoms"],
  // Caribbean & African
  ["Dunn's River seasonings", "Caribbean & African", "jerk"], ["Lamb seasoning", "Caribbean & African"], ["Oxtail seasoning", "Caribbean & African"],
  ["Barbecue seasoning", "Caribbean & African"], ["Ground pimento", "Caribbean & African"], ["Garlic salt", "Caribbean & African"],
  ["Suya pepper", "Caribbean & African"], ["Tropical Sun baking powder", "Caribbean & African"], ["Curry pastes, pickles & chutneys", "Caribbean & African", "achar"],
  // Oriental foods
  ["Gochujang", "Oriental foods", "korean chilli paste"], ["Ssamjang", "Oriental foods"], ["Kimchi", "Oriental foods"],
  ["Gochugaru (Korean chilli flakes)", "Oriental foods"], ["Korean BBQ sauces", "Oriental foods"], ["Buldak hot sauce", "Oriental foods"],
  ["Thai curry pastes (red, green, yellow, massaman)", "Oriental foods"], ["Bamboo shoots", "Oriental foods"], ["Bean sprouts", "Oriental foods"],
  ["Canned mushrooms", "Oriental foods"], ["Bean curd", "Oriental foods", "tofu"], ["Mock duck", "Oriental foods"],
  ["Pickled mustard greens", "Oriental foods"], ["Pickled ginger", "Oriental foods"], ["Chilli crisp oil", "Oriental foods", "lao gan ma"],
  ["Sliced rice cake", "Oriental foods", "tteok"], ["Prawn crackers", "Oriental foods", "manora shrimp chips"],
  // Takeaway & trade
  ["Napkins", "Trade & takeaway"], ["Paper plates & bowls", "Trade & takeaway"], ["Disposable cups", "Trade & takeaway"],
  ["Carrier bags", "Trade & takeaway"], ["Kitchen towel", "Trade & takeaway"],
];

const AISLES = ["All", ...new Set(STOCK.map((i) => i[1]))];
const $ = (id) => document.getElementById(id);
const q = $("q"), list = $("list"), chips = $("chips"), count = $("count"), empty = $("empty");
let aisle = "All";

const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[^a-z0-9 ]/g, "");

chips.innerHTML = AISLES.map((a) =>
  `<button type="button" class="chip" aria-pressed="${a === "All"}" data-aisle="${a}">${a}</button>`).join("");

chips.addEventListener("click", (e) => {
  const b = e.target.closest(".chip");
  if (!b) return;
  aisle = b.dataset.aisle;
  chips.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", c === b));
  render();
});
q.addEventListener("input", render);

function render() {
  const words = norm(q.value).split(" ").filter(Boolean);
  const hits = STOCK.filter(([name, a, alt = ""]) => {
    if (aisle !== "All" && a !== aisle) return false;
    const hay = norm(`${name} ${alt} ${a}`);
    return words.every((w) => hay.includes(w));
  }).sort((x, y) => x[0].localeCompare(y[0]));
  list.innerHTML = hits.map(([name, a]) => `<li><span>${name}</span><small>${a}</small></li>`).join("");
  count.textContent = `${hits.length} item${hits.length === 1 ? "" : "s"}`;
  empty.hidden = hits.length > 0;
}
render();

/* Reveal sections as they scroll in. */
if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { rootMargin: "0px 0px -10% 0px" });
  document.querySelectorAll(".aisle, .section-head, .band, .wholesale > *, .visit > *").forEach((el) => {
    el.classList.add("reveal"); io.observe(el);
  });
}
