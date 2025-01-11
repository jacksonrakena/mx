export type RouteData = typeof routeTable;

export const assetsRoute = {
  title: "Assets",
  url: "assets",
  items: [
    {
      title: "Securities",
      url: "securities",
      items: [],
    },
    {
      title: "Property",
      url: "property",
      items: [],
    },
    {
      title: "Cash and equivalents",
      url: "cash",
      items: [],
    },
    {
      title: "Credits",
      url: "credits",
      items: [],
    },
  ],
};
export const liabilitiesRoute = {
  title: "Liabilities",
  url: "liabilities",
  items: [
    {
      title: "Loans & mortgage",
      url: "loans",
      items: [],
    },
    {
      title: "Credit lines",
      url: "credit",
      items: [],
    },
    {
      title: "Other debts",
      url: "other",
      items: [],
    },
  ],
};
export const routeTable = [
  {
    title: "Balance sheet",
    url: "balance-sheet",
    items: [
      {
        title: "Overview",
        url: "",
        items: [],
      },
      assetsRoute,
      liabilitiesRoute,
    ],
  },
];
