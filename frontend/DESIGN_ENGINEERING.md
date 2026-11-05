# YemekSepeti dApp — Design Engineering Guidelines

## Non-negotiable constraints
- Work on main only; do not create branches or upgrade dependencies without approval.
- Preserve React 18, Vite 4, ethers 5, wagmi 1, RainbowKit 1 and checked-in package lock.
- Payment network: Hardhat localhost chain ID 31337. Other networks are NOT enabled for checkout.
- Demo restaurant data is for UI exploration only, NEVER for paid orders. Do not enable checkout for sample data.
- Only verified on-chain restaurant walletAddress can be passed to checkout; physical address is not an Ethereum address.
- All wallet transactions require explicit wallet approval. Do not call wallet_switchEthereumChain as an implicit effect of checkout.
- Treat VITE_* settings as public; server must validate authorization.

## Interface system
- Tokens live in src/experience.css; avoid adding a component package or animation runtime.
- Brand: warm orange #F26532, dark slate #172131, warm off-white #FBFAF8.
- Typography: Inter with system fallback. Focus on readability and clear contrast.
- Layout: responsive 4/3/2-column catalog; accessible native button, input, select, dialog.
- Motion: 120–280 ms transform/opacity; no transition: all; respect prefers-reduced-motion.
- Provide loading, empty, failed and demo-data states. Never display fake on-chain success.
- Accessible names for icon-only controls, focus-visible, native dialog focus and Escape handling.
- Never send payment before checkout verifies chain 31337 and validates address.

## Web3 UX
- Display supported chain and payment method before user approval.
- Separate request-in-wallet, pending/confirming, rejection and success states.
- Token transfers can require approval + order transaction; explain both.
- USD total in UI is an estimate; the smart contract determines final amount.
- See EIP-1193 for wallet account/chain events; refresh merchant state on wallet changes.

## References
- https://vercel.com/design/guidelines
- https://shopify.dev/docs/apps/design
- https://m3.material.io/
- https://www.meta.com/design-at-meta/blog/whatsapp-user-interface-update/
- https://www.meta.com/design-at-meta/blog/instagram-lite-a-global-collaboration-between-research-and-design/
- https://rainbowkit.com/en-US/docs/introduction
- https://eips.ethereum.org/EIPS/eip-1193
- https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/

## Validation checklist
1. npm ci --ignore-scripts in frontend (without lockfile changes).
2. npm run build and npm run lint; typecheck with tsc -p tsconfig.app.json --noEmit.
3. With backend offline: demo banner appears, sample restaurants browsable, checkout disabled.
4. With backend online: validated restaurant wallet is used, Hardhat chain required.
5. Keyboard and 390/768/1440px viewport test; verify Escape and focus return for dialogs.
6. Test ETH and FOOD orders on an isolated funded local chain before real use.

## Backend security
- The public browser must never carry OWNER_API_KEY, RESTAURANT_API_KEY, ORACLE_WRITE_API_KEY.
- Protected backend API endpoints now fail closed until strong 32+ character keys are set in the backend environment.
- The Graph subgraph catalog is read-only and does not need privileged backend keys.
- Backend role keys are a temporary server-side protection; owner-scoped wallet authorization still needs real cryptographic wallet signature verification before production.
- Contract deployment addresses differ across historical script outputs. Before a purchase, the client verifies contract bytecode and restaurant registration on the selected chain. Configure and verify the actual deployment addresses for your local node.
