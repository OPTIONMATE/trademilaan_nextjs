
import { BackgroundRipple } from "./components/BackgroundRipple";
import TextPara from "./components/TextPara";
import Cards from "./components/Cards";
import ScrollAuthGate from "./components/ScrollAuthGate";
import { RevealBento } from "./components/Blocks";

export const metadata = {
  title: "Trademilaan - AI-Powered Market Insights",
  description: "Empowering traders with AI-driven market insights. SEBI-registered research analyst providing expert trading strategies for equity, options, and commodities.",
};

export default function Home() {
  return (
    <ScrollAuthGate>
      <BackgroundRipple />
      
      <TextPara />
      <Cards />
      <RevealBento />
    </ScrollAuthGate>

  );
}
