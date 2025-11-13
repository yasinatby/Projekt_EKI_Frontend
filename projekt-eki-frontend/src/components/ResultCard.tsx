'use client';

import { motion } from "framer-motion";

export interface SearchResult {
  title: string;
  price: number;
  platform: string;
  url: string;
  margin: number;
  score: number;
}

interface ResultCardProps {
  result: SearchResult;
  index: number;
}

const platformColors: Record<string, string> = {
  ebay: "bg-blue-500/20 text-blue-300 border-blue-400/40",
  kleinanzeigen: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
  vinted: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
  amazon: "bg-amber-500/20 text-amber-300 border-amber-400/40",
};

export function ResultCard({ result, index }: ResultCardProps) {
  const platformKey = result.platform?.toLowerCase() ?? "default";
  const badgeClasses =
    platformColors[platformKey] ??
    "bg-slate-600/30 text-slate-200 border-slate-500/50";

  const scoreWidth = Math.min(100, Math.max(0, result.score));

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 120 }}
      className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-5 shadow-lg shadow-slate-900/40 backdrop-blur"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-sky-300/70">
            DealHawk Empfehlung
          </p>
          <h3 className="mt-1 text-lg font-semibold text-slate-50">
            {result.title}
          </h3>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeClasses}`}
        >
          {result.platform}
        </span>
      </div>

      <dl className="mt-6 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
        <div>
          <dt className="text-xs uppercase tracking-wider text-slate-500">
            Preis
          </dt>
          <dd className="text-xl font-semibold text-white">
            {result.price.toFixed(2)} €
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-slate-500">
            Marge
          </dt>
          <dd
            className={`text-xl font-semibold ${
              result.margin >= 0 ? "text-emerald-300" : "text-rose-300"
            }`}
          >
            {result.margin.toFixed(1)}%
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-slate-500">
            Score
          </dt>
          <dd className="text-xl font-semibold text-sky-200">
            {Math.round(result.score)}
          </dd>
        </div>
      </dl>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
          <span>Deal Score</span>
          <span>{scoreWidth}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-300 transition-[width]"
            style={{ width: `${scoreWidth}%` }}
          />
        </div>
      </div>

      <a
        href={result.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500/80 px-4 py-2 font-semibold text-slate-900 shadow-lg shadow-sky-500/30 transition hover:bg-sky-400"
      >
        Zum Angebot
        <span aria-hidden className="text-lg">
          ↗
        </span>
      </a>
    </motion.article>
  );
}
