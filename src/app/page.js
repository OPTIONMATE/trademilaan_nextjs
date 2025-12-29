import { BackgroundRipple } from "./components/BackgroundRipple";
import TextPara from "./components/TextPara";
import Cards from "./components/Cards";
import Protected from "./components/Protected";
import LogoutButton from "./components/LogoutButton";

export default function Home() {
  return (
    <Protected>
      <LogoutButton />
      <BackgroundRipple />
      <TextPara />
      <Cards />
    </Protected>
  );
}
