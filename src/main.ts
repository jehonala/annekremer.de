import "@fontsource-variable/inter";
import { insertRandomFunfact } from "./funfacts.ts";

const element = document.getElementById("quote");

if (element) {
  insertRandomFunfact(element);
}
