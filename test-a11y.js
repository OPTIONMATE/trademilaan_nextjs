const { AxeBuilder } = require("@axe-core/playwright");
const { chromium } = require("playwright");

const pagesToTest = [
  { url: "http://localhost:3000/", name: "Homepage" },
  { url: "http://localhost:3000/services", name: "Services" },
  { url: "http://localhost:3000/contact", name: "Contact" },
  { url: "http://localhost:3001/", name: "Homepage" },
  { url: "http://localhost:3001/services", name: "Services" },
  { url: "http://localhost:3001/contact", name: "Contact" },
  { url: "http://localhost:3001/complaint-board", name: "Complaint Board" },
  { url: "http://localhost:3001/login", name: "Login" },
  { url: "http://localhost:3001/register", name: "Register" },
];

(async () => {
  const browser = await chromium.launch();

  console.log("\n🔍 ACCESSIBILITY AUDIT REPORT\n");
  console.log("=".repeat(60));

  let totalViolations = 0;
  let totalPasses = 0;

  for (const pageConfig of pagesToTest) {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await page.goto(pageConfig.url, { waitUntil: "networkidle" });

      const results = await new AxeBuilder({ page }).analyze();

      const violationCount = results.violations.length;
      const passCount = results.passes.length;

      totalViolations += violationCount;
      totalPasses += passCount;

      console.log(`\n📄 ${pageConfig.name}`);
      console.log(`   URL: ${pageConfig.url}`);
      console.log(`   ❌ Violations: ${violationCount}`);
      console.log(`   ✅ Passes: ${passCount}`);

      if (results.violations.length > 0) {
        console.log(`\n   Violations found:`);
        results.violations.forEach((violation, idx) => {
          console.log(`   ${idx + 1}. ${violation.id} (${violation.impact})`);
          console.log(`      Description: ${violation.description}`);
          console.log(`      Help: ${violation.help}`);
          if (violation.nodes.length > 0) {
            console.log(`      Affected elements: ${violation.nodes.length}`);
            violation.nodes.slice(0, 2).forEach((node) => {
              console.log(`        - ${node.html.substring(0, 80)}...`);
            });
          }
        });
      }
    } catch (error) {
      console.log(`   ⚠️  Error: ${error.message}`);
    }

    await page.close();
    await context.close();
  }

  console.log("\n" + "=".repeat(60));
  console.log(`\n📊 SUMMARY`);
  console.log(`   Total Pages Tested: ${pagesToTest.length}`);
  console.log(`   Total Violations: ${totalViolations}`);
  console.log(`   Total Passes: ${totalPasses}`);

  if (totalViolations === 0) {
    console.log("\n✅ All accessibility checks passed!");
  } else {
    console.log(
      `\n⚠️  Found ${totalViolations} accessibility issue(s) requiring attention.`,
    );
  }

  console.log("\n" + "=".repeat(60) + "\n");

  await browser.close();
  process.exit(totalViolations > 0 ? 1 : 0);
})();
