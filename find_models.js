const fs = require("fs");
const content = fs.readFileSync("prisma/schema.prisma", "utf-8");
const models = [];
let currentModel = "";
for (const line of content.split("\n")) {
  if (line.startsWith("model ")) {
    currentModel = line.split(" ")[1];
  }
  if (line.includes("deletedAt ")) {
    models.push(currentModel);
  }
}
console.log(models);