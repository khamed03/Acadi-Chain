import { createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const config = createConfig({
  chains: [mainnet], // replace with your PoA later
  transports: { [mainnet.id]: http() },
  connectors: [injected()],
});
