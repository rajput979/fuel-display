# Fuel Display

Confirmed project brief for an ecommerce site serving Canada and the United States.

## Brand and customers

- Store name: Fuel Display
- Preferred domain: `fueldisplay.com` (availability and ownership to be confirmed)
- Primary audience: independent gas station owners
- Growth goal: become a preferred vendor for sign companies and major fuel and convenience chains in both countries. Prospects include Petro-Canada, Esso, Shell Canada, Circle K, Parkland, Irving Oil, Suncor, Imperial Oil, 7-Eleven, Speedway, Chevron, ExxonMobil, Pilot Flying J, Love's and Costco Gasoline.

## Catalog and pricing

One configurable LED fuel price sign with 40 combinations. The selection order is colour, display format, size, and quantity. Both colours (red and green) are available in both formats (`888.8` and `8.88 9/10`) and all 10 sizes. Price depends on size. Use the same numerical price in CAD for Canada and USD for the United States.

| Size | CAD price | USD price |
| --- | ---: | ---: |
| 6″ | $900 | $900 |
| 8″ | $1,000 | $1,000 |
| 10″ | $1,100 | $1,100 |
| 12″ | $1,150 | $1,150 |
| 14″ | $1,200 | $1,200 |
| 15″ | $1,250 | $1,250 |
| 16″ | $1,300 | $1,300 |
| 18″ | $1,400 | $1,400 |
| 20″ | $1,500 | $1,500 |
| 24″ | $1,950 | $1,950 |

## Design and product content

Premium technical look, deep navy and silver, and crisp lettering. Include a size chart, shipping information, warranty, FAQs, and a bulk quote request. The supplier reference PDF at `C:/Users/15198/Downloads/9dc96b9f17c56fc932d8d146e534827a.pdf` covers 8″, 10″, 12″, 16″, 20″ and 24″. Use it and the supplied specifications as visual references for the missing 6″, 14″, 15″ and 18″ sizes. The static site starts with illustrated placeholders.

| Specification | Details supplied |
| --- | --- |
| LED chip and brightness | Epistar DIP 546 lamp. Red 3,500 mcd, green 7,500 mcd, automatic adjustment by light sensor. |
| Viewing | 140° horizontal and 110° vertical. Listed visibility range of 1–500 m. |
| Control | Wi-Fi app, RF remote, and PC. Listed Wi-Fi range 200 m and remote range 100 m. |
| Installation and housing | Hanging or mounting, steel cabinet, UV-resistant protective polycarbonate, IP65. |
| Power input | AC 200–240 V at 3.4 A or 100–120 V at 6.8 A. |
| Power output | DC 12 V at 29 A or 15 V at 23.2 A. |
| Operating conditions | −40 °C to 50 °C, 10–95% relative humidity. Listed LED life over 100,000 hours. |
| Included equipment | Remote and control box included with each sign. |
| Warranty | Two years, with free repair parts for covered issues and telephone assistance. |
| Listed compliance | FCC, CE, and RoHS. |

## Contact and shipping

- Business email and contact form recipient: info@signagestudio.ca
- Calls, SMS and WhatsApp: +1 519-868-9799
- Shipping destinations: Canada and the United States. Rates and delivery times are to be supplied.

## Static implementation update

The latest build request calls for Home, Shop, Product, Cart with checkout, About, and Contact. Use only plain HTML, CSS and JavaScript, with all product data in `js/products.js`. The site opens directly from `index.html`. Checkout collects name, phone and shipping address, then prepares a WhatsApp order for the customer to review and send. The original discovery brief specified card payment, invoice emails and a thank-you SMS. Those are separate from this WhatsApp checkout release.