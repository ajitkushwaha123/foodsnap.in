export const referenceCategories = [
  {
    label: "Thali",
    value: "thali",
    icon: "/assets/thali/thali1.png",
  },
  {
    label: "Bowl",
    value: "bowl",
    icon: "/presets/bowl1.jpg",
  },
  {
    label: "Combo",
    value: "combo",
    icon: "/presets/combo1.jpg",
  },
];

export const referencePresets = {
  thali: [
    {
      url: "/assets/thali/thali1.png",
      items: ["Jeera Rice", "Dal", "Gulab Jamun"],
    },
    {
      url: "/assets/thali/thali2.png",
      items: [
        "Aloo Matar Sabji",
        "Shahi Paneer",
        "Plain Rice",
        "Dal",
        "Lassi",
        "Green Sauce",
        "Salad",
        "Lachha Paratha",
        "Paitha",
      ],
    },
    { url: "/assets/thali/thali3.png", items: ["rice", "curry", "salad"] },
  ],

  bowl: [
    { url: "/presets/bowl1.jpg", items: ["chole"] },
    { url: "/presets/bowl2.jpg", items: ["rajma"] },
  ],

  combo: [
    { url: "/presets/combo1.jpg", items: ["burger", "fries", "coke"] },
    { url: "/presets/combo2.jpg", items: ["idli", "sambar", "chutney"] },
  ],
};
