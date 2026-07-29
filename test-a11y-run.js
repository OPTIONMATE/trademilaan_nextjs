const { AxeBuilder } = require("@axe-core/playwright");
const { chromium } = require("playwright");

const pagesToTest = [
  { url: "http://localhost:3000/", name: "Homepage" },
  { url: "http://localhost:3000/services", name: "Services" },
  { url: "http://localhost:3000/contact", name: "Contact" },
  { url: "http://localhost:3000/complaint-board", name: "Complaint Board" },
  { url: "http://localhost:3000/login", name: "Login" },
  { url: "http://localhost:3000/register", name: "Register" },
  { url: "http://localhost:3000/investor-charter", name: "Investor Charter" },
  { url: "http://localhost:3000/complaint-table", name: "Complaint Table" },
  { url: "http://localhost:3000/disclaimer-disclosure", name: "Disclaimer" },
  { url: "http://localhost:3000/grievance-redressal", name: "Grievance Redressal" },
  { url: "http://localhost:3000/accessibility", name: "Accessibility Statement" },
];

async function launchBrowser() {
  return chromium.launch({ channel: "msedge", headless: true });
}

(async () => {
  const browser = await launchBrowser();

  console.log("\nACCESSIBILITY AUDIT REPORT\n");
  console.log("=".repeat(60));

  let totalViolations = 0;
  let totalPasses = 0;

  for (const pageConfig of pagesToTest) {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await page.goto(pageConfig.url, {
        waitUntil: "domcontentloaded",
        timeout: 45000,
      });
      await page.waitForTimeout(2000);

      const results = await new AxeBuilder({ page }).analyze();
      const violationCount = results.violations.length;
      const passCount = results.passes.length;

      totalViolations += violationCount;
      totalPasses += passCount;

      console.log(`\n${pageConfig.name}`);
      console.log(`   URL: ${pageConfig.url}`);
      console.log(`   Violations: ${violationCount}`);
      console.log(`   Passes: ${passCount}`);

      if (results.violations.length > 0) {
        results.violations.forEach((violation, idx) => {
          console.log(`   ${idx + 1}. ${violation.id} (${violation.impact})`);
          console.log(`      ${violation.help}`);
          console.log(`      Affected elements: ${violation.nodes.length}`);
          violation.nodes.slice(0, 2).forEach((node) => {
            console.log(
              `        - ${node.html.replace(/\s+/g, " ").substring(0, 100)}`,
            );
          });
        });
      }
    } catch (error) {
      console.log(`\n${pageConfig.name}`);
      console.log(`   Error: ${error.message}`);
    }

    await context.close();
  }

  console.log("\n" + "=".repeat(60));
  console.log("\nSUMMARY");
  console.log(`   Total Pages Tested: ${pagesToTest.length}`);
  console.log(`   Total Violations: ${totalViolations}`);
  console.log(`   Total Passes: ${totalPasses}`);

  if (totalViolations === 0) {
    console.log("\nAll accessibility checks passed!");
  } else {
    console.log(`\nFound ${totalViolations} accessibility issue(s).`);
  }

  console.log("\n" + "=".repeat(60) + "\n");

  await browser.close();
  process.exit(totalViolations > 0 ? 1 : 0);
})();
