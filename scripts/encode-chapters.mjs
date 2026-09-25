import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
for (const name of ["depths", "currents", "journal", "reef", "horizon"]) {
  await sharp("public/chapters/" + name + ".png").webp({ quality: 88 }).toFile("public/chapters/" + name + ".webp");
}
const path = "components/ocean-chapters.tsx";
await writeFile(path, (await readFile(path, "utf8")).replaceAll(/\/chapters\/(\w+)\.png/g, "/chapters/$1.webp"));
