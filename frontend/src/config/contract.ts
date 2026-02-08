export const SENTINEL_ADDRESS = "0x7197846b689e2FfF2825f7fa62D08ba504933409" as const;

export const SENTINEL_ABI = [
  { type: "function", name: "registerContract", inputs: [{ name: "contractAddress", type: "address" }, { name: "name", type: "string" }], outputs: [{ name: "monitorId", type: "uint256" }], stateMutability: "nonpayable" },
  { type: "function", name: "raiseAlert", inputs: [{ name: "monitorId", type: "uint256" }, { name: "severity", type: "uint8" }, { name: "alertType", type: "uint8" }, { name: "description", type: "string" }, { name: "txHash", type: "bytes32" }], outputs: [{ name: "alertId", type: "uint256" }], stateMutability: "nonpayable" },
  { type: "function", name: "acknowledgeAlert", inputs: [{ name: "alertId", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "deactivateMonitor", inputs: [{ name: "monitorId", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "nextMonitorId", inputs: [], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "nextAlertId", inputs: [], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "getMonitorInfo", inputs: [{ name: "monitorId", type: "uint256" }], outputs: [{ name: "contractAddress", type: "address" }, { name: "monitorOwner", type: "address" }, { name: "name", type: "string" }, { name: "registeredAt", type: "uint256" }, { name: "alertCount", type: "uint256" }, { name: "securityScore", type: "uint8" }, { name: "active", type: "bool" }], stateMutability: "view" },
  { type: "function", name: "getAlertInfo", inputs: [{ name: "alertId", type: "uint256" }], outputs: [{ name: "monitorId", type: "uint256" }, { name: "severity", type: "uint8" }, { name: "alertType", type: "uint8" }, { name: "description", type: "string" }, { name: "txHash", type: "bytes32" }, { name: "timestamp", type: "uint256" }, { name: "acknowledged", type: "bool" }, { name: "reporter", type: "address" }], stateMutability: "view" },
  { type: "function", name: "getOwnerMonitors", inputs: [{ name: "monitorOwner", type: "address" }], outputs: [{ name: "", type: "uint256[]" }], stateMutability: "view" },
  { type: "function", name: "getAlertBreakdown", inputs: [{ name: "monitorId", type: "uint256" }], outputs: [{ name: "critical", type: "uint256" }, { name: "high", type: "uint256" }, { name: "medium", type: "uint256" }, { name: "low", type: "uint256" }, { name: "info", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "batchGetScores", inputs: [{ name: "monitorIds", type: "uint256[]" }], outputs: [{ name: "scores", type: "uint8[]" }], stateMutability: "view" },
] as const;

export const CELO_SEPOLIA = {
  id: 11142220,
  name: "Celo Sepolia",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: { default: { http: ["https://celo-sepolia.drpc.org"] } },
  blockExplorers: { default: { name: "CeloScan", url: "https://sepolia.celoscan.io" } },
  testnet: true,
} as const;
