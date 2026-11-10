# Fuel Display

Fuel Display is a storefront for outdoor LED fuel price signs in Canada and the United States. Customers choose a colour, display format, size, and quantity, then review their cart and send an order request through WhatsApp.

The site uses plain HTML, CSS, and JavaScript. It runs without an installation, build step, or local server.

## Open the site on your computer

1. Keep all the website files and folders together.
2. Open Chrome or Edge and press **Ctrl+O**.
3. Select `index.html` in the project folder. Choose **Configure your sign** to try the product options and cart.

## Find the files you want to edit

| File or folder | What it contains |
| --- | --- |
| `index.html`, `shop.html`, and `product.html` | Home page, shop, and product details |
| `cart.html` | Cart and WhatsApp checkout |
| `about.html` and `contact.html` | Business information and contact options |
| `css/style.css` | Colours, typography, and page layouts |
| `js/products.js` | Product options, prices, specifications, and image paths |
| `js/main.js` | Menu, currency selection, cart, and forms |
| `images/` | Product illustrations, site icon, and social preview image |

The cart stays in the browser when the page refreshes. Checkout prepares a WhatsApp message for the customer to review and send. The contact form opens an email draft.

## Host the site

Publish the six HTML files and the `css/`, `js/`, and `images/` folders together on a static web host that supports storefronts. Use `index.html` as the home page and leave the build command blank.
