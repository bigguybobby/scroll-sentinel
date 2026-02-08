"use client";

import { useState } from "react";
import { ConnectKitButton } from "connectkit";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { SENTINEL_ADDRESS, SENTINEL_ABI } from "@/config/contract";

const SEVERITY_LABELS = ["Info", "Low", "Medium", "High", "Critical"];
const SEVERITY_COLORS = ["text-blue-400", "text-green-400", "text-yellow-400", "text-orange-400", "text-red-400"];
const ALERT_TYPE_LABELS = ["Reentrancy", "Flash Loan", "Large Withdrawal", "Access Control", "Price Manipulation", "Unusual", "Custom"];

type Tab = "monitors" | "register" | "lookup" | "alerts";

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? "text-green-400 border-green-500/30" : score >= 60 ? "text-yellow-400 border-yellow-500/30" : score >= 40 ? "text-orange-400 border-orange-500/30" : "text-red-400 border-red-500/30";
  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-lg font-bold ${color}`}>{score}</span>;
}

function RegisterContract() {
  const [addr, setAddr] = useState("");
  const [name, setName] = useState("");
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Register Contract for Monitoring</h2>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Contract Name (e.g. MyDeFiProtocol)" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none" />
      <input value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="Contract Address (0x...)" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white font-mono focus:border-emerald-500 focus:outline-none" />
      <button onClick={() => writeContract({ address: SENTINEL_ADDRESS, abi: SENTINEL_ABI, functionName: "registerContract", args: [addr as `0x${string}`, name] })} disabled={isPending || confirming || !addr || !name} className="rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-50">
        {isPending ? "Confirm..." : confirming ? "Registering..." : "Register"}
      </button>
      {isSuccess && <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-green-400">✅ Contract registered! TX: <code className="text-xs">{hash}</code></div>}
    </div>
  );
}

function MonitorLookup() {
  const [id, setId] = useState("");
  const monId = BigInt(id || "0");

  const { data: info } = useReadContract({
    address: SENTINEL_ADDRESS, abi: SENTINEL_ABI, functionName: "getMonitorInfo", args: [monId],
    query: { enabled: id !== "" },
  });
  const { data: breakdown } = useReadContract({
    address: SENTINEL_ADDRESS, abi: SENTINEL_ABI, functionName: "getAlertBreakdown", args: [monId],
    query: { enabled: id !== "" && !!info },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Lookup Monitor</h2>
      <input value={id} onChange={(e) => setId(e.target.value)} placeholder="Monitor ID (0, 1, 2...)" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none" />

      {info && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
              <div className="text-sm text-gray-500 mb-1">Contract</div>
              <div className="font-semibold text-lg">{info[2] as string}</div>
              <code className="text-xs text-gray-400">{(info[0] as string).slice(0, 20)}...</code>
              <div className="mt-2 text-sm">
                <span className={`${info[6] ? "text-green-400" : "text-red-400"}`}>{info[6] ? "● Active" : "● Inactive"}</span>
              </div>
              <div className="text-sm text-gray-500 mt-1">Alerts: <span className="text-white">{Number(info[4])}</span></div>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 flex flex-col items-center justify-center">
              <div className="text-sm text-gray-500 mb-2">Security Score</div>
              <ScoreBadge score={Number(info[5])} />
            </div>
          </div>

          {breakdown && (
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
              <h3 className="text-lg font-semibold mb-4">Alert Breakdown</h3>
              <div className="grid grid-cols-5 gap-3">
                {["Critical", "High", "Medium", "Low", "Info"].map((label, i) => (
                  <div key={label} className="text-center">
                    <div className={`text-2xl font-bold ${SEVERITY_COLORS[4 - i]}`}>{Number(breakdown[i])}</div>
                    <div className="text-xs text-gray-500">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MyMonitors() {
  const { address } = useAccount();
  const { data: ids } = useReadContract({
    address: SENTINEL_ADDRESS, abi: SENTINEL_ABI, functionName: "getOwnerMonitors", args: [address!],
    query: { enabled: !!address },
  });
  const { data: total } = useReadContract({ address: SENTINEL_ADDRESS, abi: SENTINEL_ABI, functionName: "nextMonitorId" });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Monitors</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
          <div className="text-sm text-gray-500">Total Monitors</div>
          <div className="text-3xl font-bold">{total !== undefined ? Number(total) : "..."}</div>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
          <div className="text-sm text-gray-500">Your Monitors</div>
          <div className="text-3xl font-bold">{ids ? (ids as readonly bigint[]).length : "..."}</div>
        </div>
      </div>
      {ids && (ids as readonly bigint[]).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {(ids as readonly bigint[]).map((id) => (
            <span key={id.toString()} className="rounded-full bg-emerald-500/20 text-emerald-400 px-3 py-1 text-sm">Monitor #{id.toString()}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function AlertLookup() {
  const [id, setId] = useState("");
  const { data: info } = useReadContract({
    address: SENTINEL_ADDRESS, abi: SENTINEL_ABI, functionName: "getAlertInfo", args: [BigInt(id || "0")],
    query: { enabled: id !== "" },
  });
  const { writeContract, isPending } = useWriteContract();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Alert Details</h2>
      <input value={id} onChange={(e) => setId(e.target.value)} placeholder="Alert ID" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none" />
      {info && (
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className={`font-semibold ${SEVERITY_COLORS[Number(info[1])]}`}>{SEVERITY_LABELS[Number(info[1])]}</span>
            <span className="text-sm text-gray-500">{ALERT_TYPE_LABELS[Number(info[2])] || "Unknown"}</span>
          </div>
          <p className="text-gray-300">{info[3] as string}</p>
          <div className="text-xs text-gray-500">Monitor: #{Number(info[0])} | Reporter: {(info[7] as string).slice(0, 10)}...</div>
          <div className="flex items-center gap-3">
            <span className={info[6] ? "text-green-400 text-sm" : "text-yellow-400 text-sm"}>
              {info[6] ? "✅ Acknowledged" : "⏳ Pending"}
            </span>
            {!info[6] && (
              <button onClick={() => writeContract({ address: SENTINEL_ADDRESS, abi: SENTINEL_ABI, functionName: "acknowledgeAlert", args: [BigInt(id)] })} disabled={isPending} className="rounded bg-emerald-500/20 text-emerald-400 px-3 py-1 text-sm hover:bg-emerald-500/30">
                Acknowledge
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>("monitors");
  const { isConnected } = useAccount();

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "monitors", label: "My Monitors", icon: "📡" },
    { id: "register", label: "Register", icon: "➕" },
    { id: "lookup", label: "Lookup", icon: "🔍" },
    { id: "alerts", label: "Alerts", icon: "🚨" },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-300 bg-clip-text text-transparent">Scroll Sentinel</span>
          </a>
          <ConnectKitButton />
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex gap-1 mb-8 rounded-lg border border-gray-800 bg-gray-900/50 p-1">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition ${tab === t.id ? "bg-emerald-500 text-white" : "text-gray-400 hover:text-white"}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        {!isConnected ? (
          <div className="text-center py-20"><div className="text-4xl mb-4">🛡️</div><h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2><p className="text-gray-400">Connect to interact with Scroll Sentinel</p></div>
        ) : (
          <>
            {tab === "monitors" && <MyMonitors />}
            {tab === "register" && <RegisterContract />}
            {tab === "lookup" && <MonitorLookup />}
            {tab === "alerts" && <AlertLookup />}
          </>
        )}
      </div>
    </div>
  );
}
