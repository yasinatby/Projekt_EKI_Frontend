'use client';

import Image from "next/image";
import { motion } from "framer-motion";

export interface SearchResult {
  title: string;
  price: number;
  platform: string;
  url: string;
  image?: string | null;
  location?: string | null;
  condition?: string | null;
  seller?: string | null;
  margin?: number | null;
  score?: number | null;
  currency?: string | null;
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

  const currencySymbol = result.currency ?? "€";
  const marginValue =
    typeof result.margin === "number" ? result.margin : undefined;
  const scoreValue = typeof result.score === "number" ? result.score : 0;
  const scoreWidth = Math.min(100, Math.max(0, scoreValue));

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 120 }}
      className="flex flex-col gap-5 rounded-2xl border border-slate-700/60 bg-slate-900/70 p-5 shadow-lg shadow-slate-900/40 backdrop-blur"
    >
      {result.image && (
        <div className="relative h-48 overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/60">
          <Image
            src={result.image}
            alt={result.title}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover object-center"
            unoptimized
            priority={index < 2}
          />
        </div>
      )}

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
            {result.price.toFixed(2)} {currencySymbol}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-slate-500">
            Marge
          </dt>
          <dd
            className={`text-xl font-semibold ${
              marginValue === undefined
                ? "text-slate-300"
                : marginValue >= 0
                  ? "text-emerald-300"
                  : "text-rose-300"
            }`}
          >
            {marginValue === undefined ? "–" : `${marginValue.toFixed(1)}%`}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-slate-500">
            Score
          </dt>
          <dd className="text-xl font-semibold text-sky-200">
            {Math.round(scoreValue)}
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

      <ul className="grid gap-3 text-sm text-slate-400 sm:grid-cols-3">
        {result.location && (
          <li className="rounded-xl border border-slate-800/80 bg-slate-900/60 px-3 py-2">
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-500">
              Standort
            </p>
            <p className="mt-1 text-sm text-slate-200">{result.location}</p>
          </li>
        )}
        {result.condition && (
          <li className="rounded-xl border border-slate-800/80 bg-slate-900/60 px-3 py-2">
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-500">
              Zustand
            </p>
            <p className="mt-1 text-sm text-slate-200">{result.condition}</p>
          </li>
        )}
        {result.seller && (
          <li className="rounded-xl border border-slate-800/80 bg-slate-900/60 px-3 py-2">
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-500">
              Verkäufer
            </p>
            <p className="mt-1 text-sm text-slate-200">{result.seller}</p>
          </li>
        )}
      </ul>

      <a
        href={result.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500/80 px-4 py-2 font-semibold text-slate-900 shadow-lg shadow-sky-500/30 transition hover:bg-sky-400"
      >
        Listing öffnen
        <span aria-hidden className="text-lg">
          ↗
        </span>
      </a>
    </motion.article>
  );
}
