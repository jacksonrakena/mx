export type RouteData = typeof routeTable;

export const assetsRoute = {
  title: "Assets",
  url: "assets",
  items: [
    {
      title: "Securities",
      url: "securities",
    },
    {
      title: "Property",
      url: "property",
    },
    {
      title: "Cash and equivalents",
      url: "cash",
    },
    {
      title: "Credits",
      url: "credits",
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
    },
    {
      title: "Credit lines",
      url: "credit",
    },
    {
      title: "Other debts",
      url: "other",
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
