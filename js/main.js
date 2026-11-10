/* 1. Store settings and helpers */
const storeSettings = {
  email: "info@signagestudio.ca",
  whatsappNumber: "15198689799",
  storageKey: "fuel-display-store-v1",
  maxQuantity: 999
};
const markets = {
  CA: { name: "Canada", currency: "CAD" },
  US: { name: "United States", currency: "USD" }
};
const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const arrowIcon = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>';

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function money(amount) {
  return "$" + numberFormat.format(amount) + " " + markets[state.market].currency;
}

function productUrl(product, options = {}) {
  const params = new URLSearchParams({ id: product.id, ...options });
  return "product.html?" + params;
}

function imageFor(product, colour, format) {
  return product.images[colour.id + "-" + format.id] || Object.values(product.images)[0];
}

function altFor(product, colour, format) {
  return "Illustration of the " + product.name + " with " + colour.label.toLowerCase() +
    " LED digits in the " + format.label + " format";
}

function whatsappUrl(message) {
  return "https://wa.me/" + storeSettings.whatsappNumber + "?text=" + encodeURIComponent(message);
}

/* 2. Cart and currency storage
   Published pages share localStorage. In a file preview, browsers can isolate
   each HTML file, so internal links also carry the cart in a local URL fragment.
   This only contains item choices and country, never checkout form details. */
const isLocalPreview = location.protocol === "file:";
const previewPrefix = "#fd=";
let state = readState();

function resolveItem(item) {
  const product = products.find(entry => entry.id === item?.id);
  if (!product) return null;

  const colour = product.colours.find(option => option.id === item.colour);
  const format = product.formats.find(option => option.id === item.format);
  const size = product.sizes.find(option => option.inches === item.size);
  if (!colour || !format || !size) return null;

  return { product, colour, format, size };
}

function readSnapshot(value) {
  try {
    const snapshot = JSON.parse(value);
    if (!snapshot || !Array.isArray(snapshot.cart)) return null;
    return {
      market: Object.hasOwn(markets, snapshot.market) ? snapshot.market : "CA",
      cart: snapshot.cart.filter(item => resolveItem(item) &&
        Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= storeSettings.maxQuantity),
      updatedAt: Number.isFinite(snapshot.updatedAt) ? snapshot.updatedAt : 0
    };
  } catch {
    return null;
  }
}

function readState() {
  let saved;
  try {
    saved = readSnapshot(localStorage.getItem(storeSettings.storageKey));
  } catch {
    // A private browsing policy can disable storage.
  }

  if (isLocalPreview && location.hash.startsWith(previewPrefix)) {
    try {
      const fromLink = readSnapshot(decodeURIComponent(location.hash.slice(previewPrefix.length)));
      if (fromLink && (!saved || fromLink.updatedAt >= saved.updatedAt)) return fromLink;
    } catch {
      // A malformed preview fragment can be ignored.
    }
  }
  return saved || { market: "CA", cart: [], updatedAt: 0 };
}

function syncPreviewLinks(updateAddress = false) {
  if (!isLocalPreview || !state.updatedAt) return;

  const fragment = previewPrefix + encodeURIComponent(JSON.stringify(state));
  const folder = new URL(".", location.href).href;
  for (const link of document.querySelectorAll("a[href]")) {
    const destination = new URL(link.href, location.href);
    if (destination.protocol === "file:" && new URL(".", destination).href === folder &&
        destination.pathname.endsWith(".html") &&
        (!destination.hash || destination.hash.startsWith(previewPrefix))) {
      destination.hash = fragment;
      link.href = destination.href;
    }
  }

  if (updateAddress && (!location.hash || location.hash.startsWith(previewPrefix))) {
    try {
      history.replaceState(history.state, "", fragment);
    } catch {
      // localStorage still saves changes where the browser supports it.
    }
  }
}

function saveState() {
  state.updatedAt = Math.max(Date.now(), state.updatedAt + 1);
  try {
    localStorage.setItem(storeSettings.storageKey, JSON.stringify(state));
  } catch {
    // The in-memory cart and file-preview links remain usable.
  }
  syncPreviewLinks(true);
  updateCartBadge();
}

function itemKey(item) {
  return [item.id, item.colour, item.format, item.size].join(":");
}

function itemSubtotal() {
  return state.cart.reduce((total, item) => total + resolveItem(item).size.price * item.quantity, 0);
}

function updateCartBadge() {
  const total = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelector("[data-cart-count]").textContent = total;
  document.querySelector("[data-cart-link]").setAttribute("aria-label", "Cart, " + total + (total === 1 ? " item" : " items"));
}

function refreshMarket() {
  for (const selector of document.querySelectorAll("[data-market]")) selector.value = state.market;
  for (const price of document.querySelectorAll("[data-price]")) price.textContent = money(Number(price.dataset.price));
}

function setMarket(market) {
  if (!Object.hasOwn(markets, market) || state.market === market) return;
  state.market = market;
  saveState();
  refreshMarket();
  clearCheckoutMessage();
}

/* 3. Shared navigation and format cards */
function setupNavigation() {
  document.documentElement.classList.add("js");
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#main-nav");
  toggle.hidden = false;

  function setOpen(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") === "false"));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      setOpen(false);
      toggle.focus();
    }
  });
  for (const selector of document.querySelectorAll("[data-market]")) {
    selector.addEventListener("change", () => setMarket(selector.value));
  }
}

function renderFormatCards() {
  const grid = document.querySelector("[data-format-grid]");
  if (!grid) return;

  grid.innerHTML = products.flatMap(product => {
    const startingPrice = Math.min(...product.sizes.map(size => size.price));
    return product.formats.map((format, index) => {
      const colour = product.colours[index % product.colours.length];
      return `<article class="format-card">
        <img src="${escapeHtml(imageFor(product, colour, format))}" alt="${escapeHtml(altFor(product, colour, format))}" width="880" height="550" loading="lazy">
        <div class="format-content">
          <p class="eyebrow">${escapeHtml(product.name)}</p>
          <h3>${escapeHtml(format.label)}</h3>
          <p>${escapeHtml(format.description)}. Available in red or green.</p>
          <div class="format-actions">
            <span class="starting-price">From <strong data-price="${startingPrice}">${money(startingPrice)}</strong></span>
            <a class="button button-dark" href="${escapeHtml(productUrl(product, { colour: colour.id, format: format.id }))}" aria-label="Configure ${escapeHtml(format.label)} display">Configure ${arrowIcon}</a>
          </div>
        </div>
      </article>`;
    });
  }).join("");
}

/* 4. Product detail and configurator */
function optionGroup(name, step, label, options, selected, extraClass = "") {
  return `<fieldset class="option-group">
    <legend><span>${step}.</span> ${label}</legend>
    <div class="option-grid ${extraClass}">${options.map(option => `
      <label class="choice">
        <input class="sr-only" type="radio" name="${name}" value="${escapeHtml(option.id)}"${option.id === selected ? " checked" : ""}>
        <span>${name === "colour" ? '<i class="choice-dot ' + escapeHtml(option.id) + '" aria-hidden="true"></i>' : ""}${escapeHtml(option.label)}</span>
      </label>`).join("")}
    </div>
  </fieldset>`;
}

function renderProduct() {
  const region = document.querySelector("[data-product]");
  if (!region) return;

  const params = new URLSearchParams(location.search);
  const requestedId = params.get("id");
  const product = requestedId === null ? products[0] : products.find(entry => String(entry.id) === requestedId);

  if (!product) {
    document.title = "Product Not Found | Fuel Display";
    document.querySelector("[data-product-extras]").hidden = true;
    region.innerHTML = '<div class="empty-cart"><h1>Sign not found</h1><p>Browse the catalogue to find an available display.</p><a class="button button-dark" href="shop.html">Go to shop</a></div>';
    return;
  }

  const initialColour = product.colours.find(option => option.id === params.get("colour")) || product.colours[0];
  const initialFormat = product.formats.find(option => option.id === params.get("format")) || product.formats[0];
  const initialSize = product.sizes.find(option => String(option.inches) === params.get("size")) || product.sizes[0];
  const sizeOptions = product.sizes.map(size => ({ id: size.inches, label: size.inches + "″" }));
  document.title = product.name + " | Fuel Display";
  document.querySelector(".breadcrumb [aria-current]").textContent = product.name;
  document.querySelector("[data-included]").textContent = product.included;
  document.querySelector("[data-warranty]").textContent = product.warranty;

  region.innerHTML = `<div class="product-layout">
    <figure class="product-visual">
      <img data-sign-image src="${escapeHtml(imageFor(product, initialColour, initialFormat))}" alt="${escapeHtml(altFor(product, initialColour, initialFormat))}" width="880" height="550">
      <figcaption>PRODUCT ILLUSTRATION · <span data-sign-caption>${escapeHtml(initialColour.label + " " + initialFormat.label)}</span></figcaption>
    </figure>
    <div class="product-info">
      <p class="eyebrow">Configurable outdoor display</p>
      <h1>${escapeHtml(product.name)}</h1>
      <p class="product-intro">${escapeHtml(product.description)}</p>
      <div class="product-jump"><a href="#size-chart">Size chart</a><a href="#specifications">Specifications</a><a href="contact.html?topic=bulk">Bulk quote</a></div>
      <p class="product-price"><span data-price="${initialSize.price}" data-unit-price aria-live="polite">${money(initialSize.price)}</span> <span class="small-copy">per sign</span></p>
      <form class="configurator" data-configurator>
        ${optionGroup("colour", 1, "LED colour", product.colours, initialColour.id)}
        ${optionGroup("format", 2, "Display format", product.formats, initialFormat.id)}
        ${optionGroup("size", 3, "Digit size", sizeOptions, initialSize.inches, "sizes")}
        <div class="order-controls">
          <label>4. Quantity<input name="quantity" type="number" inputmode="numeric" min="1" max="${storeSettings.maxQuantity}" value="1" required></label>
          <button type="submit" class="button button-primary">Add to cart ${arrowIcon}</button>
        </div>
        <p class="add-status" data-add-status role="status" hidden><span></span><a href="cart.html">View cart</a></p>
      </form>
    </div>
  </div>
  <div class="spec-grid">
    <section class="spec-panel" id="size-chart">
      <p class="eyebrow">Find the right fit</p>
      <h2>Size chart</h2>
      <table class="table size-table" aria-label="Digit sizes, cabinet dimensions and prices">
        <thead><tr><th scope="col">Digits</th><th scope="col">Cabinet (W × H)</th><th scope="col">Price</th></tr></thead>
        <tbody>${product.sizes.map(size => `<tr><th scope="row">${size.inches}″</th><td>${escapeHtml(size.cabinet || "Ask us")}</td><td data-price="${size.price}">${money(size.price)}</td></tr>`).join("")}</tbody>
      </table>
      <p class="small-copy">Cabinet dimensions shown are for the reference units. Confirm the fit for your configuration before ordering.</p>
    </section>
    <section class="spec-panel" id="specifications">
      <p class="eyebrow">Technical details</p>
      <h2>Specifications</h2>
      <table class="table" aria-label="Technical specifications"><tbody>${product.specs.map(([label, value]) =>
        `<tr><th scope="row">${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`).join("")}</tbody></table>
    </section>
  </div>`;

  const form = region.querySelector("[data-configurator]");
  const unitPrice = region.querySelector("[data-unit-price]");
  const image = region.querySelector("[data-sign-image]");
  const caption = region.querySelector("[data-sign-caption]");
  const status = region.querySelector("[data-add-status]");
  const statusText = status.querySelector("span");

  function selectedItem() {
    const fields = new FormData(form);
    return {
      id: product.id,
      colour: fields.get("colour"),
      format: fields.get("format"),
      size: Number(fields.get("size")),
      quantity: Number(fields.get("quantity"))
    };
  }

  form.addEventListener("change", () => {
    const selection = resolveItem(selectedItem());
    const { colour, format, size } = selection;
    unitPrice.dataset.price = size.price;
    unitPrice.textContent = money(size.price);
    image.src = imageFor(product, colour, format);
    image.alt = altFor(product, colour, format);
    caption.textContent = colour.label + " " + format.label;
    status.hidden = true;
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    const item = selectedItem();
    const existing = state.cart.find(entry => itemKey(entry) === itemKey(item));
    if (existing && existing.quantity + item.quantity > storeSettings.maxQuantity) {
      statusText.textContent = "This configuration is limited to " + storeSettings.maxQuantity + " per cart line.";
    } else {
      if (existing) existing.quantity += item.quantity;
      else state.cart.push(item);
      saveState();
      statusText.textContent = item.quantity + (item.quantity === 1 ? " sign added." : " signs added.");
    }
    status.hidden = false;
  });
}

/* 5. Cart and WhatsApp checkout */
function renderCart() {
  const list = document.querySelector("[data-cart-items]");
  if (!list) return;

  const panel = document.querySelector("[data-checkout-panel]");
  panel.hidden = !state.cart.length;
  document.querySelector("[data-cart-total]").dataset.price = itemSubtotal();
  if (!state.cart.length) {
    list.innerHTML = '<div class="empty-cart"><p>Your cart is empty.</p><a class="button button-dark" href="shop.html">Explore signs</a></div>';
    return;
  }

  list.innerHTML = '<ul class="cart-items">' + state.cart.map(item => {
    const { product, colour, format, size } = resolveItem(item);
    const label = colour.label + " · " + format.label + " · " + size.inches + "″";
    const url = productUrl(product, { colour: item.colour, format: item.format, size: item.size });
    return `<li class="cart-item">
      <img src="${escapeHtml(imageFor(product, colour, format))}" alt="${escapeHtml(altFor(product, colour, format))}" width="880" height="550">
      <div>
        <h3><a href="${escapeHtml(url)}">${escapeHtml(product.name)}</a></h3>
        <p class="small-copy">${escapeHtml(label)}</p>
        <p class="small-copy"><span data-price="${size.price}">${money(size.price)}</span> per sign</p>
        <strong data-price="${size.price * item.quantity}">${money(size.price * item.quantity)}</strong>
      </div>
      <form class="cart-item-controls" data-item="${escapeHtml(itemKey(item))}">
        <label>Qty<input name="quantity" type="number" min="1" max="${storeSettings.maxQuantity}" inputmode="numeric" value="${item.quantity}" aria-label="Quantity for ${escapeHtml(label)}" required></label>
        <button class="button button-outline" type="submit">Update</button>
        <button class="remove-button" type="button" data-remove aria-label="Remove ${escapeHtml(label)}">Remove</button>
      </form>
    </li>`;
  }).join("") + "</ul>";
}

function clearCheckoutMessage() {
  const message = document.querySelector("[data-checkout-status]");
  if (message) {
    message.hidden = true;
    message.querySelector("a").removeAttribute("href");
  }
}

function requireNonBlank(form, names) {
  for (const name of names) {
    const field = form.elements[name];
    if (!field.value.trim()) {
      field.setCustomValidity("Please fill in this field.");
      field.reportValidity();
      return false;
    }
  }
  return true;
}

function setupCart() {
  const list = document.querySelector("[data-cart-items]");
  if (!list) return;
  const status = document.querySelector("[data-cart-status]");
  const form = document.querySelector("[data-checkout-form]");

  function refreshCart(message) {
    saveState();
    renderCart();
    refreshMarket();
    syncPreviewLinks();
    clearCheckoutMessage();
    status.textContent = message;
  }

  list.addEventListener("submit", event => {
    event.preventDefault();
    const row = event.target;
    const item = state.cart.find(entry => itemKey(entry) === row.dataset.item);
    if (!item) return;

    item.quantity = row.elements.quantity.valueAsNumber;
    refreshCart("Quantity updated.");
    const updatedRow = Array.from(list.querySelectorAll("[data-item]")).find(entry => entry.dataset.item === row.dataset.item);
    updatedRow.querySelector('[type="submit"]').focus();
  });

  list.addEventListener("click", event => {
    const button = event.target.closest("[data-remove]");
    if (!button) return;

    state.cart = state.cart.filter(item => itemKey(item) !== button.form.dataset.item);
    refreshCart("Sign removed from cart.");
    list.querySelector("button, a.button").focus();
  });

  form.addEventListener("input", event => {
    event.target.setCustomValidity("");
    clearCheckoutMessage();
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!state.cart.length || !requireNonBlank(form, ["name", "phone", "address"])) return;

    const fields = new FormData(form);
    const lines = state.cart.map(item => {
      const { product, colour, format, size } = resolveItem(item);
      return item.quantity + " × " + product.name + " — " + colour.label + ", " + format.label +
        ", " + size.inches + "″ — " + money(size.price * item.quantity);
    });
    const message = [
      "Hello Fuel Display, I'd like to order:",
      "",
      ...lines,
      "",
      "Items subtotal: " + money(itemSubtotal()),
      "Name: " + fields.get("name").trim(),
      "Phone: " + fields.get("phone").trim(),
      "Shipping address: " + fields.get("address").trim(),
      "Country: " + markets[state.market].name,
      "",
      "Please confirm shipping, applicable taxes, and next steps."
    ].join("\n");

    const url = whatsappUrl(message);
    const fallback = document.querySelector("[data-checkout-status]");
    fallback.querySelector("a").href = url;
    fallback.hidden = false;
    window.open(url, "_blank", "noopener,noreferrer");
  });
  renderCart();
}

/* 6. Contact form and bulk enquiry link */
function setupContact() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  const topic = form.elements.topic;
  const topics = { general: "General enquiry", bulk: "Bulk quote", support: "Product support" };
  const heading = document.querySelector("[data-contact-heading]");
  const intro = document.querySelector("[data-contact-intro]");
  const message = document.querySelector("[data-contact-message]");

  function updateTopic() {
    const bulk = topic.value === "bulk";
    heading.textContent = bulk ? "Request a bulk quote" : "Send a message";
    intro.textContent = bulk
      ? "Share your sign sizes, quantities, and delivery destinations so we can prepare a quote."
      : "Tell us about your station and what you’d like help with.";
    message.placeholder = bulk ? "Sign sizes, quantities, and delivery destinations" : "How can we help?";
  }

  if (new URLSearchParams(location.search).get("topic") === "bulk") topic.value = "bulk";
  topic.addEventListener("change", updateTopic);
  updateTopic();

  form.addEventListener("input", event => event.target.setCustomValidity(""));
  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!requireNonBlank(form, ["name", "message"])) return;

    const fields = new FormData(form);
    const subject = "Fuel Display — " + topics[topic.value];
    const body = ["Name: " + fields.get("name").trim(), "Reply email: " + fields.get("email").trim(),
      "", fields.get("message").trim()].join("\r\n");
    location.href = "mailto:" + storeSettings.email + "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);
  });
}

/* 7. Start the page and refresh stale cart views after navigation. */
setupNavigation();
renderFormatCards();
renderProduct();
setupCart();
setupContact();
refreshMarket();
updateCartBadge();
syncPreviewLinks();

function refreshSavedCart() {
  state = readState();
  renderCart();
  refreshMarket();
  updateCartBadge();
  syncPreviewLinks();
  clearCheckoutMessage();
}

window.addEventListener("pageshow", event => {
  if (event.persisted) refreshSavedCart();
});
window.addEventListener("storage", event => {
  if (!isLocalPreview && event.key === storeSettings.storageKey) refreshSavedCart();
});
