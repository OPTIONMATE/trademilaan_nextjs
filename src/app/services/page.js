import ServicesHero from "../components/ServicesHero";
import IndexOptionsPro from "../components/IndexOptionsPro";
import EquityPro from "../components/EquityPro";

export const metadata = {
  title: "Services - Trademilaan",
  description: "Explore our AI-powered trading services including Index Options Pro and Equity Pro for informed trading decisions.",
};

export default function ServicesPage() {
  return (
    <div className="bg-white">
      <ServicesHero />
      <IndexOptionsPro />
      <EquityPro />
    </div>
  );
}
