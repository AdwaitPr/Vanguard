import Dashboard from '@/components/Dashboard';

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900 font-sans p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-end border-b border-neutral-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Vanguard</h1>
            <p className="text-neutral-500 text-sm mt-1">Intelligent BOM Architect</p>
          </div>
        </header>
        <Dashboard />
      </div>
    </main>
  );
}
