/* Written at packaging time: the folder the app was built from.

   It is only a starting guess. The app checks it really is the site before
   using it, and asks her to find the folder if it is not — so an app built here
   and then moved to another machine degrades into a question rather than an
   error. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const site = path.resolve(HERE, "..", "..");
fs.writeFileSync(
    path.join(HERE, "default-site.json"),
    JSON.stringify({ site }, null, 2) + "\n"
);
console.log(`default-site.json → ${site}`);
