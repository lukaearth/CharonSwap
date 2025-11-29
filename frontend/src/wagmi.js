import { http, createConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected(),
    walletConnect({ projectId: "7d019a86305c84f7d070fe8784047e20" }),
  ],
  transports: {
    [sepolia.id]: http(),
  },
});





