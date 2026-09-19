/* The tabs in the top bar, in order.

   Written here rather than in site.json: the user decided the tab bar is part
   of the site's structure, like the pages themselves, and not something to
   edit. The words come in both languages because the English site is built
   from the content files and these are not in them. */
const TABS = [
    { to: "/tejidos", es: "Tejidos", en: "Knitting" },
    { to: "/libros", es: "Libros", en: "Books" },
    { to: "/arte", es: "Arte", en: "Art" },
    { to: "/eventos", es: "Eventos", en: "Events" },
    { to: "/biografia", es: "Biografía", en: "Biography" },
];

export function siteTabs(lang) {
    return TABS.map((tab) => ({ to: tab.to, label: lang === "en" ? tab.en : tab.es }));
}
