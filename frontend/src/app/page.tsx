const features = [
  { icon: "📡", title: "Real-Time Monitoring", desc: "Register any smart contract and get continuous on-chain security monitoring with instant alerts." },
  { icon: "🚨", title: "Smart Alert System", desc: "Detect reentrancy, flash loans, large withdrawals, price manipulation, and access control issues." },
  { icon: "📊", title: "Dynamic Security Score", desc: "Live 0-100 security score that updates based on detected threats and alert severity." },
  { icon: "✅", title: "Alert Acknowledgement", desc: "Contract owners can acknowledge and respond to alerts, creating an auditable security timeline." },
  { icon: "🔍", title: "Severity Breakdown", desc: "Visual breakdown of Critical, High, Medium, Low, and Info alerts per contract." },
  { icon: "⚡", title: "Batch Queries", desc: "Monitor multiple contracts simultaneously with batch score lookups." },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 via-gray-950 to-blue-900/20" />
        <div className="relative mx-auto max-w-5xl px-6 py-24 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-400">
            🛡️ Built for the Scroll Security Subsidy Program
          </div>
          <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl">
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">Scroll Sentinel</span>
          </h1>
          <p className="mx-auto mb-4 max-w-2xl text-lg text-gray-400">
            On-chain security monitoring and alerting for smart contracts. Register, monitor, and protect your protocols in real-time.
          </p>
          <div className="flex items-center justify-center gap-4 mt-8">
            <a href="/dashboard" className="rounded-lg bg-emerald-500 px-8 py-3 font-semibold text-white transition hover:bg-emerald-400">Launch Dashboard</a>
            <a href="https://github.com/bigguybobby/scroll-sentinel" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-gray-700 px-8 py-3 font-semibold text-gray-300 transition hover:border-gray-500">GitHub</a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold">Features</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 transition hover:border-emerald-500/40">
              <div className="mb-3 text-3xl">{f.icon}</div>
              <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
              <p className="text-sm text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="mb-8 text-center text-3xl font-bold">How It Works</h2>
        <div className="grid gap-4 text-center md:grid-cols-4">
          {[
            { step: "1", label: "Register", desc: "Add contract address" },
            { step: "2", label: "Monitor", desc: "Automated scanning" },
            { step: "3", label: "Alert", desc: "Threats detected" },
            { step: "4", label: "Respond", desc: "Acknowledge & fix" },
          ].map((s) => (
            <div key={s.step} className="rounded-lg border border-gray-700 p-6">
              <div className="mb-1 text-2xl font-bold text-emerald-400">{s.step}</div>
              <div className="font-semibold">{s.label}</div>
              <div className="text-xs text-gray-500">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-800 py-8 text-center text-sm text-gray-500">
        Built by <a href="https://github.com/bigguybobby" className="text-emerald-400 hover:underline" target="_blank" rel="noopener noreferrer">bigguybobby</a> for the Scroll Security Subsidy Program
      </footer>
    </main>
  );
}
