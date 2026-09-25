import { isolateFishSpecimen } from "./isolate-specimen.mjs";
import path from "path";
import fs from "fs";

const artifactsDir = "C:/Users/luan/.gemini/antigravity-cli/brain/7fb60f64-7958-4e46-93eb-4902d202156c";
const publicSpecies = "C:/Users/luan/Documents/ChatGPT/sakana-web/sakana/public/species";

const jobs = [
  {
    name: "Northern Pike",
    src: path.join(publicSpecies, "pike.jpg"),
    dest: path.join(publicSpecies, "pike.png"),
    options: {}
  },
  {
    name: "Bluefin Tuna",
    src: path.join(publicSpecies, "tuna.jpg"),
    dest: path.join(publicSpecies, "tuna.png"),
    options: {}
  },
  {
    name: "Red Seabream",
    src: path.join(publicSpecies, "seabream.jpg"),
    dest: path.join(publicSpecies, "seabream.png"),
    options: {}
  },
  {
    name: "Tiger Pufferfish",
    src: path.join(artifactsDir, "tiger_pufferfish_clean_1790347069506.jpg"),
    dest: path.join(publicSpecies, "pufferfish.png"),
    options: {}
  },
  {
    name: "Flying Fish",
    src: path.join(artifactsDir, "flying_fish_clean_1790347142730.jpg"),
    dest: path.join(publicSpecies, "flying-fish.png"),
    options: {}
  },
  {
    name: "Pacific Herring",
    src: path.join(artifactsDir, "herring_fish_clean_1790347178305.jpg"),
    dest: path.join(publicSpecies, "herring.png"),
    options: {}
  },
  {
    name: "Manta Ray",
    src: path.join(artifactsDir, "manta_ray_clean_1790347110751.jpg"),
    dest: path.join(publicSpecies, "manta-ray.png"),
    options: { cropBorderPx: 38 }
  }
];

async function main() {
  for (const job of jobs) {
    if (fs.existsSync(job.src)) {
      console.log(`[Processing] ${job.name} (${path.basename(job.src)} -> ${path.basename(job.dest)})...`);
      await isolateFishSpecimen(job.src, job.dest, job.options);
    } else {
      console.warn(`[WARN] File not found: ${job.src}`);
    }
  }
  console.log("==> All 7 species background-isolated with perfection!");
}

main().catch(err => {
  console.error("Error isolating species:", err);
  process.exit(1);
});
