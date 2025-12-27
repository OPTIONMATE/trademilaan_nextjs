import { BackgroundRipple } from './components/BackgroundRipple';
import TextPara from './components/TextPara';
import Cards from './components/Cards';
import { RevealBento } from './components/Blocks';

export default function Home() {
  return (
    <>
      <BackgroundRipple />
      <TextPara />
      <Cards />
      <RevealBento />
    </>
  );
}
