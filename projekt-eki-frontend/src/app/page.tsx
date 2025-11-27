'use client';

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ResultCard, type SearchResult } from "@/components/ResultCard";

const PLATFORM_OPTIONS = [
  { label: "eBay", value: "ebay" },
  { label: "Kleinanzeigen", value: "kleinanzeigen" },
  { label: "Vinted", value: "vinted" },
  { label: "Amazon", value: "amazon" },
] as const;

type PlatformValue = (typeof PLATFORM_OPTIONS)[number]["value"];
type SortKey = "score" | "margin";

type PlatformFeeBreakdown = {
  platform: string;
  fee: number;
  net_proceeds?: number;
  currency?: string;
};

type AnalysisSummary = {
  avg_price?: number;
  median_price?: number;
  min_price?: number;
  max_price?: number;
  suggested_vkp?: number;
  weighted_average?: number;
  target_margin_vkp?: number;
  manual_vkp_margin?: number;
  manual_vkp_net?: number;
  cheapest_price?: number;
  highest_price?: number;
  total_results?: number;
  currency?: string;
  platform_fees?: PlatformFeeBreakdown[];
};

type SearchResponse =
  | SearchResult[]
  | {
      results?: SearchResult[];
      analysis?: AnalysisSummary | null;
      message?: string;
    };

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/search";

const DEFAULT_PLATFORM_STATE: Record<PlatformValue, boolean> = {
  ebay: true,
  kleinanzeigen: true,
  vinted: false,
  amazon: false,
};

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [manualVkp, setManualVkp] = useState("");
  const [targetMargin, setTargetMargin] = useState("25");
  const [platforms, setPlatforms] =
    useState<Record<PlatformValue, boolean>>(DEFAULT_PLATFORM_STATE);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisSummary | null>(null);
  const [lastQuery, setLastQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("score");
  const [hasSearched, setHasSearched] = useState(false);

  const activePlatforms = useMemo<PlatformValue[]>(
    () =>
      PLATFORM_OPTIONS.filter((platform) => platforms[platform.value]).map(
        (platform) => platform.value
      ),
    [platforms]
  );

  const sortedResults = useMemo(() => {
    const sorted = [...results];
    sorted.sort((a, b) => {
      const first = sortBy === "score" ? a.score ?? 0 : a.margin ?? 0;
      const second = sortBy === "score" ? b.score ?? 0 : b.margin ?? 0;
      return second - first;
    });
    return sorted;
  }, [results, sortBy]);

  const isSearchDisabled =
    loading || query.trim().length === 0 || activePlatforms.length === 0;

  const handlePlatformToggle = (platform: PlatformValue) => {
    setPlatforms((prev) => ({ ...prev, [platform]: !prev[platform] }));
  };

  const getNumericValue = (value: string): number | undefined => {
    if (value.trim() === "") return undefined;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  };

  const formatPrice = (value?: number | null) => {
    const priceValue = value ?? null;
    if (!isNumber(priceValue)) return "–";
    return `${priceValue.toFixed(0)} ${analysis?.currency ?? "€"}`;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!query.trim()) {
      setError("Bitte einen Suchbegriff eingeben.");
      return;
    }

    if (activePlatforms.length === 0) {
      setError("Bitte mindestens eine Plattform auswählen.");
      return;
    }

    setHasSearched(true);
    setError(null);
    setLoading(true);

    const payload = {
      query: query.trim(),
      manual_vkp: getNumericValue(manualVkp) ?? null,
      target_margin: getNumericValue(targetMargin) ?? null,
      platforms: activePlatforms,
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data: SearchResponse = await response.json();
      let parsedResults: SearchResult[] = [];
      let parsedAnalysis: AnalysisSummary | null = null;

      if (Array.isArray(data)) {
        parsedResults = data;
      } else {
        parsedResults = data.results ?? [];
        parsedAnalysis = data.analysis ?? null;
        if (data.message) {
          setError(data.message);
        }
      }

      setResults(parsedResults);
      setAnalysis(parsedAnalysis);
      setLastQuery(payload.query);
    } catch (err) {
      console.error(err);
      setError("Beim Abrufen der Ergebnisse ist ein Fehler aufgetreten.");
      setResults([]);
      setAnalysis(null);
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
              disabled={isSearchDisabled}
              className="w-full rounded-2xl bg-sky-500 px-6 py-3 text-base font-semibold text-slate-900 shadow-lg shadow-sky-500/40 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
            >
              {loading ? "Wird geladen..." : "Deals finden"}
            </button>
          </form>

          <div className="mt-5 grid gap-3 text-xs uppercase tracking-[0.3em] text-slate-500 sm:grid-cols-2 lg:grid-cols-4">
            {PLATFORM_OPTIONS.map((platform) => (
              <label
                key={platform.value}
                className="flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-700/70 bg-slate-900/40 px-4 py-3 text-[0.7rem] font-semibold transition hover:border-sky-400 hover:text-sky-200"
              >
                <input
                  type="checkbox"
                  checked={platforms[platform.value]}
                  onChange={() => handlePlatformToggle(platform.value)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-sky-400 focus:ring-sky-500"
                />
                {platform.label}
              </label>
            ))}
          </div>
        </motion.section>

        {analysis && (
          <motion.section
            layout
            className="mb-10 rounded-3xl border border-slate-700/60 bg-slate-900/70 p-6 shadow-lg shadow-slate-900/40 backdrop-blur"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                  Marktanalyse
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-50">
                  {lastQuery || "Letzte Suche"}
                </h2>
                {isNumber(analysis.total_results) && (
                  <p className="text-sm text-slate-400">
                    {analysis.total_results} Treffer über alle Plattformen
                  </p>
                )}
              </div>
              {isNumber(analysis.suggested_vkp) && (
                <div className="rounded-2xl border border-sky-500/40 bg-sky-500/10 px-4 py-3 text-right">
                  <p className="text-xs uppercase tracking-[0.3em] text-sky-200">
                    Empfohlener VKP
                  </p>
                  <p className="text-3xl font-semibold text-slate-50">
                    {formatPrice(analysis.suggested_vkp)}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Durchschnitt", value: analysis.avg_price },
                { label: "Median", value: analysis.median_price },
                { label: "Günstigster", value: analysis.min_price ?? analysis.cheapest_price },
                { label: "Teuerster", value: analysis.max_price ?? analysis.highest_price },
                { label: "Weighted Avg", value: analysis.weighted_average },
                { label: "Ziel VKP", value: analysis.target_margin_vkp },
              ]
                .filter((stat) => isNumber(stat.value))
                .map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-slate-800/70 bg-slate-900/60 px-4 py-5"
                  >
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-50">
                      {formatPrice(stat.value)}
                    </p>
                  </div>
                ))}
            </div>

            {analysis.platform_fees && analysis.platform_fees.length > 0 && (
              <div className="mt-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Gebührenabschätzung
                </p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {analysis.platform_fees.map((entry) => (
                    <div
                      key={entry.platform}
                      className="rounded-2xl border border-slate-800/80 bg-slate-900/60 px-4 py-4"
                    >
                      <div className="flex items-center justify-between text-sm text-slate-300">
                        <span className="font-semibold capitalize">
                          {entry.platform}
                        </span>
                        <span className="text-slate-400">
                          Gebühren: {entry.fee.toFixed(2)}{" "}
                          {entry.currency ?? analysis.currency ?? "€"}
                        </span>
                      </div>
                      {isNumber(entry.net_proceeds) && (
                        <p className="mt-1 text-xs text-slate-500">
                          Nettoerlös: {formatPrice(entry.net_proceeds)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(isNumber(analysis.manual_vkp_margin) ||
              isNumber(analysis.manual_vkp_net)) && (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {isNumber(analysis.manual_vkp_margin) && (
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
                      Marge bei manuellem VKP
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-emerald-100">
                      {analysis.manual_vkp_margin.toFixed(1)}%
                    </p>
                  </div>
                )}
                {isNumber(analysis.manual_vkp_net) && (
                  <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">
                      Nettoerlös
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-cyan-100">
                      {formatPrice(analysis.manual_vkp_net)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.section>
        )}

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
                <ResultCard
                  key={`${result.url}-${index}`}
                  result={result}
                  index={index}
                />
              ))}
            </div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
