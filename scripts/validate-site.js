const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const htmlFiles = [
  "index.html",
  "admin/index.html",
  "admin/notices/index.html",
  "calculators/index.html",
  "calculators/finance/index.html",
  "calculators/life/index.html",
  "calculators/shopping/index.html",
  "calculators/business/index.html",
  "calculators/search/index.html",
  "notices/index.html",
  "about/index.html",
  "privacy/index.html",
  "contact/index.html",
  "calculators/salary/index.html",
  "calculators/loan/index.html",
  "calculators/date/index.html",
  "calculators/bmi/index.html",
  "calculators/age/index.html",
  "calculators/percent/index.html",
  "calculators/discount/index.html",
  "calculators/freelance/index.html",
  "calculators/vat/index.html",
  "calculators/margin/index.html",
  "calculators/breakeven/index.html",
  "calculators/settlement/index.html",
  "calculators/estimate/index.html",
  "calculators/fixedcost/index.html",
];

const issues = [];
const noticesDataPath = path.join(root, "data", "notices.json");

if (!fs.existsSync(noticesDataPath)) {
  issues.push("data/notices.json: missing");
}

for (const file of htmlFiles) {
  const fullPath = path.join(root, file);
  const contents = fs.readFileSync(fullPath, "utf8");

  if (!contents.includes("theme.js")) {
    issues.push(`${file}: theme.js not included`);
  }

  if (contents.includes("app.js") || contents.includes("detail.js")) {
    issues.push(`${file}: legacy script reference remains`);
  }
}

const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
for (const page of [
  "/calculators/",
  "/calculators/finance/",
  "/calculators/life/",
  "/calculators/shopping/",
  "/calculators/business/",
  "/calculators/search/",
  "/notices/",
  "/calculators/age/",
  "/calculators/percent/",
  "/calculators/discount/",
  "/calculators/freelance/",
  "/calculators/vat/",
  "/calculators/margin/",
  "/calculators/breakeven/",
  "/calculators/settlement/",
  "/calculators/estimate/",
  "/calculators/fixedcost/",
]) {
  if (!sitemap.includes(page)) {
    issues.push(`sitemap.xml: missing ${page}`);
  }
}

if (issues.length) {
  console.error("Site validation failed:");
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

console.log("Site validation passed");
