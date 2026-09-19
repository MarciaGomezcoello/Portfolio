const ICON_CHOICES = [
    { value: "youtube", label: "YouTube" },
    { value: "facebook", label: "Facebook" },
    { value: "instagram", label: "Instagram" },
    { value: "x", label: "X" },
    { value: "linkedin", label: "LinkedIn" },
    { value: "amazon", label: "Amazon" },
    { value: "globe", label: "Un mundito (cualquier otra)" },
];

/* What appears on every page: her name and the footer. The tabs in the bar
   are fixed in the site's code (src/components/tabs.js) and are not edited. One section,
   shown as the last tab of the Portada page — it is one thing, and it edits
   site.json rather than home.json, which is what `file` says. */
export const MENU_Y_PIE = {
    file: "site",
    find: ".siteFooter",
    label: "Nombre y redes",
    help: "Lo que sale en todas las páginas: su nombre, arriba y al final de la página, y las redes.",
    fields: [
        { name: "honorific", kind: "text", label: "Título antes del nombre" },
        { name: "name", kind: "text", label: "Su nombre" },
        {
            name: "tagline", kind: "text", label: "Frase corta",
            help: "Sale debajo de su nombre en el pie de página y en el menú del teléfono.",
        },
        {
            name: "footer", kind: "group", label: "Pie de página", flat: true,
            fields: [
                { name: "note", kind: "prose", label: "Línea debajo del nombre" },
                { name: "socialTitle", kind: "text", label: "Título de las redes" },
                {
                    name: "social", kind: "list", label: "Las redes",
                    itemTitle: "label", itemNoun: "red",
                    fields: [
                        { name: "label", kind: "text", label: "Nombre de la red" },
                        { name: "icon", kind: "choice", label: "Dibujito", options: ICON_CHOICES },
                        {
                            name: "url", kind: "url", label: "Dirección de la cuenta",
                            help: "Vacía, el nombre sale igual, en gris y sin enlace.",
                        },
                    ],
                },
            ],
        },
    ],
};
