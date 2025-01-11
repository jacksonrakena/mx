export type RouteData = typeof routeTable;

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
    title: "Home",
    url: "/",
    items: [],
  },
  { title: "Assets & liabilities", url: "assets", items: [] },
  // liabilitiesRoute,
];
