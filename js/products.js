/* Edit this file to change product names, images, choices, prices or specs.
   A size's price is the same number in CAD and USD. Use a number without a $. */
const products = [
  {
    id: 1,
    name: "LED Fuel Price Sign",
    description: "An outdoor LED price display for gas stations. Choose the colour, format and size that fit your existing sign or new installation.",
    colours: [
      { id: "red", label: "Red" },
      { id: "green", label: "Green" }
    ],
    formats: [
      { id: "decimal", label: "888.8", description: "Four-digit decimal" },
      { id: "fraction", label: "8.88 9/10", description: "Three digits with a 9/10 fraction" }
    ],
    sizes: [
      { inches: 6, price: 900 },
      { inches: 8, price: 1000, cabinet: "640 × 285 mm" },
      { inches: 10, price: 1100, cabinet: "760 × 300 mm" },
      { inches: 12, price: 1150, cabinet: "980 × 380 mm" },
      { inches: 14, price: 1200 },
      { inches: 15, price: 1250 },
      { inches: 16, price: 1300, cabinet: "1200 × 465 mm" },
      { inches: 18, price: 1400 },
      { inches: 20, price: 1500, cabinet: "1320 × 530 mm" },
      { inches: 24, price: 1950, cabinet: "1560 × 680 mm" }
    ],
    images: {
      "red-decimal": "images/sign-red-decimal.svg",
      "green-decimal": "images/sign-green-decimal.svg",
      "red-fraction": "images/sign-red-fraction.svg",
      "green-fraction": "images/sign-green-fraction.svg"
    },
    specs: [
      ["LED chip", "Epistar DIP 546 lamp"],
      ["Brightness", "Red 3,500 mcd, green 7,500 mcd. Automatic adjustment by light sensor."],
      ["Viewing angle", "140° horizontal and 110° vertical"],
      ["Listed viewing range", "1–500 m"],
      ["Controls", "Wi-Fi app, RF remote, and PC"],
      ["Listed control range", "Wi-Fi up to 200 m, remote up to 100 m"],
      ["Mounting", "Hanging or surface mounting"],
      ["Cabinet", "Steel with UV-resistant protective polycarbonate"],
      ["Weather protection", "IP65"],
      ["AC input", "200–240 V at 3.4 A or 100–120 V at 6.8 A"],
      ["DC output", "12 V at 29 A or 15 V at 23.2 A"],
      ["Operating conditions", "−40 °C to 50 °C, 10–95% relative humidity"],
      ["Listed LED life", "Over 100,000 hours"],
      ["Listed compliance", "FCC, CE, and RoHS"]
    ],
    included: "Remote control and control box included with every sign.",
    warranty: "Two-year warranty with free repair parts for covered issues and telephone assistance."
  }
];