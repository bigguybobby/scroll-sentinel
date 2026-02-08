# 🛡️ ScrollSentinel — Scroll Security Subsidy Application

## Project: ScrollSentinel — On-Chain Security Monitoring & Alerting

### Overview
ScrollSentinel is an on-chain security monitoring system designed specifically for the Scroll ecosystem. It enables projects to register their contracts for monitoring, receive security alerts, track security scores, and maintain an audit trail of security events.

### Why Scroll Needs This
- **Growing ecosystem** — as more projects deploy on Scroll, monitoring becomes critical
- **Pre-deploy + post-launch security** — not just audits, but continuous monitoring
- **Transparent security posture** — anyone can query a contract's security score
- **Alert system** — proactive notification of potential security issues

### Features
1. **Contract Registration** — register any contract for security monitoring
2. **Alert System** — 5 alert types: reentrancy, flash loans, unusual activity, access control, oracle manipulation
3. **Dynamic Security Scoring** — 0-100 score that adjusts based on alerts and resolutions
4. **Alert Acknowledgement** — projects can acknowledge and resolve alerts
5. **Batch Score Queries** — efficient multi-contract score lookups

### Technical Details
- **Contract:** `0x7197846b689e2FfF2825f7fa62D08ba504933409` (Celo Sepolia — will deploy to Scroll when funded)
- **Tests:** 18/18 passing
- **Coverage:** 100% lines, 100% branches, 100% functions, 100% statements
- **Slither:** No critical/high findings
- **Frontend:** Full interactive dashboard
- **GitHub:** https://github.com/bigguybobby/scroll-sentinel

### What We're Requesting
- **Audit subsidy** — professional security audit of ScrollSentinel contract
- **Scroll deployment** — gas costs for mainnet deployment
- **Integration support** — connecting with Scroll ecosystem projects

### Team
- Smart contract security researcher with audit experience (Pinto, Alchemix, Threshold, SSV)
- Active Immunefi bug bounty hunter
- Full-stack: Solidity + Foundry + Next.js
- Portfolio: 6 deployed contracts, 184 tests, all Slither-clean

### Timeline
1. **Week 1-2:** Deploy to Scroll Sepolia testnet, integrate with Scroll projects
2. **Week 3-4:** Professional audit, fix any findings
3. **Week 5-6:** Deploy to Scroll mainnet, onboard first monitoring clients
4. **Ongoing:** Expand alert types, add automated detection capabilities
