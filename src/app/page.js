
import { BackgroundRipple } from "./components/BackgroundRipple";
import TextPara from "./components/TextPara";
import Cards from "./components/Cards";
import ScrollAuthGate from "./components/ScrollAuthGate";
import { RevealBento } from "./components/Blocks";


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
