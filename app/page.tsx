"use client";

import { useMemo, useState } from "react";
import ResultCard, { SearchResult } from "../components/ResultCard";
import { AnimatePresence, motion } from "framer-motion";

const PLATFORM_OPTIONS = ["eBay", "Kleinanzeigen", "Vinted", "Amazon"] as const;
type Platform = (typeof PLATFORM_OPTIONS)[number];
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/search";

type SortKey = "score" | "margin";

export default function HomePage() {
  const getNumericValue = (value: string): number | undefined => {
    if (value.trim() === "") return undefined;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  };

  const [query, setQuery] = useState("");
  const [manualVkp, setManualVkp] = useState("");
  const [targetMargin, setTargetMargin] = useState("25");
  const [platforms, setPlatforms] = useState<Record<Platform, boolean>>({
    eBay: true,
    Kleinanzeigen: true,
    Vinted: false,
    Amazon: false,
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("score");
  const [hasSearched, setHasSearched] = useState(false);

  const activePlatforms = useMemo<Platform[]>(
    () => PLATFORM_OPTIONS.filter((platform) => platforms[platform]),
    [platforms]
  );

  const sortedResults = useMemo(() => {
    const sorted = [...results];
    sorted.sort((a, b) =>
      sortBy === "score" ? b.score - a.score : b.margin - a.margin
    );
    return sorted;
  }, [results, sortBy]);

  const handlePlatformToggle = (platform: Platform) => {
    setPlatforms((prev) => ({ ...prev, [platform]: !prev[platform] }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSearched(true);
    setError(null);
    setLoading(true);

    try {
      const payload = {
        query: query.trim(),
        manual_vkp: getNumericValue(manualVkp),
        target_margin: getNumericValue(targetMargin),
        platforms: activePlatforms,
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data: SearchResult[] = await response.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Beim Abrufen der Ergebnisse ist ein Fehler aufgetreten.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300">
      <div className="mx-auto max-w-6xl px-4 pb-20">
        <header className="py-10 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm uppercase tracking-[0.5em] text-sky-300/70"
          >
            Projekt_EKI · DealHawk
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-3xl font-bold text-slate-50 sm:text-4xl"
          >
            Finde in Sekunden die profitabelsten Deals
          </motion.h1>
          <p className="mt-3 text-base text-slate-400 sm:text-lg">
            Analysiere eBay, Kleinanzeigen, Vinted und Amazon parallel. Bewerte
            Margen, Profite und Scores in einer klaren Oberfläche.
          </p>
        </header>

        <motion.section
          layout
          className="sticky top-4 z-40 mb-10 rounded-3xl border border-slate-700/70 bg-slate-900/80 p-5 shadow-xl shadow-slate-900/50 backdrop-blur"
        >
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6 text-sm text-slate-200 lg:flex-row lg:items-end"
          >
            <div className="flex-1">
              <label className="text-xs uppercase tracking-[0.4em] text-slate-500">
                Suchbegriff
              </label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                required
                placeholder="z. B. iPhone 14, Sneaker, Kamera"
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-base text-slate-100 outline-none transition focus:border-sky-400"
              />
            </div>

            <div className="flex-1">
              <label className="text-xs uppercase tracking-[0.4em] text-slate-500">
                Verkaufspreis (VKP)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={manualVkp}
                onChange={(e) => setManualVkp(e.target.value)}
                placeholder="z. B. 650"
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-base text-slate-100 outline-none transition focus:border-sky-400"
              />
            </div>

            <div className="w-full max-w-[160px]">
              <label className="text-xs uppercase tracking-[0.4em] text-slate-500">
                Zielmarge %
              </label>
              <input
                type="number"
                min="0"
                max="80"
                step="1"
                value={targetMargin}
                onChange={(e) => setTargetMargin(e.target.value)}
                placeholder="25"
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-base text-slate-100 outline-none transition focus:border-sky-400"
              />
            </div>

            <div className="w-full lg:max-w-[220px]">
              <label className="text-xs uppercase tracking-[0.4em] text-slate-500">
                Sortieren nach
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-base text-slate-100 outline-none transition focus:border-sky-400"
              >
                <option value="score">Score</option>
                <option value="margin">Marge</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-sky-500 px-6 py-3 text-base font-semibold text-slate-900 shadow-lg shadow-sky-500/40 transition hover:bg-sky-400 lg:w-auto"
            >
              Deals finden
            </button>
          </form>

          <div className="mt-5 grid gap-3 text-xs uppercase tracking-[0.3em] text-slate-500 sm:grid-cols-4">
            {PLATFORM_OPTIONS.map((platform) => (
              <label
                key={platform}
                className="flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-700/70 bg-slate-900/40 px-4 py-3 text-[0.7rem] font-semibold transition hover:border-sky-400 hover:text-sky-200"
              >
                <input
                  type="checkbox"
                  checked={platforms[platform]}
                  onChange={() => handlePlatformToggle(platform)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-sky-400 focus:ring-sky-500"
                />
                {platform}
              </label>
            ))}
          </div>
        </motion.section>

        <main>
          {loading && (
            <div className="mb-8 rounded-3xl border border-slate-700/70 bg-slate-900/60 px-6 py-10 text-center text-sky-200">
              <p className="text-sm uppercase tracking-[0.4em] text-slate-500">
                Status
              </p>
              <p className="mt-2 text-2xl font-semibold">Suche läuft…</p>
            </div>
          )}

          {error && (
            <div className="mb-8 rounded-3xl border border-rose-500/60 bg-rose-500/10 px-6 py-5 text-rose-100">
              <p className="font-semibold">Oops!</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && hasSearched && sortedResults.length === 0 && (
            <div className="mb-8 rounded-3xl border border-slate-700/70 bg-slate-900/60 px-6 py-10 text-center text-slate-400">
              <p className="text-sm uppercase tracking-[0.4em] text-slate-600">
                Keine Ergebnisse
              </p>
              <p className="mt-3 text-lg text-slate-300">
                Keine Deals gefunden. Passe Suchbegriff, Plattformen oder Marge an.
              </p>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            <div className="grid gap-6 md:grid-cols-2">
              {sortedResults.map((result, index) => (
                <ResultCard key={`${result.url}-${index}`} result={result} index={index} />
              ))}
            </div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
