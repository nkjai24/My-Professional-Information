// src/components/CitySearch.tsx
import React, { useEffect, useMemo, useState } from "react";

/**
 * CitySearch
 * - Env: VITE_WEATHER_API_KEY must be set
 * - Usage: <CitySearch />
 *
 * Behavior:
 * - search by city name (string)
 * - calls OpenWeather Current Weather API
 * - chooses a stable Unsplash photo via source.unsplash.com (deterministic sig)
 * - caches responses in sessionStorage for 30 minutes
 * - displays image, name, temp, humidity, wind, sky description, and a small sky-colored gradient
 */

/* ---------- Types ---------- */
type WeatherAPIResponse = {
  name: string;
  sys?: { country?: string };
  main: { temp: number; feels_like?: number; humidity: number; pressure?: number };
  weather: { id?: number; main?: string; description?: string; icon?: string }[];
  wind?: { speed?: number; deg?: number };
  clouds?: { all?: number };
};

type CityResult =
  | { status: "ok"; data: WeatherAPIResponse; photoUrl: string }
  | { status: "error"; message: string }
  | { status: "idle" };

/* ---------- Config ---------- */
const CACHE_KEY = "gc:city_search_cache_v1";
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/* ---------- Helpers ---------- */

// deterministic hash for Unsplash sig so each city gets stable image
function hashCode(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

// stable Unsplash source URL for a query (city + monument/landmark)
const cityPhotoUrl = (city: string) => {
  const query = encodeURIComponent(`${city} landmark skyline city`);
  const sig = hashCode(city) % 10000;
  return `https://source.unsplash.com/1200x800/?${query}&sig=${sig}`;
};

// map weather.main or icon to a pleasant sky gradient
function skyGradientFor(main?: string, icon?: string) {
  const m = (main || "").toLowerCase();
  if (m.includes("clear") || (icon || "").endsWith("d")) {
    return "linear-gradient(180deg,#0f2b1f 0%, #0b2b1a 60%, rgba(16,185,129,0.06) 100%)";
  }
  if (m.includes("cloud")) {
    return "linear-gradient(180deg,#0b2430 0%, #0f2933 60%, rgba(100,116,139,0.06) 100%)";
  }
  if (m.includes("rain") || m.includes("drizzle")) {
    return "linear-gradient(180deg,#06212a 0%, #09272f 60%, rgba(14,165,233,0.04) 100%)";
  }
  if (m.includes("snow")) {
    return "linear-gradient(180deg,#06222a 0%, #0b2434 60%, rgba(255,255,255,0.04) 100%)";
  }
  if (m.includes("mist") || m.includes("fog") || m.includes("haze")) {
    return "linear-gradient(180deg,#04191d 0%, #071e22 60%, rgba(148,163,184,0.04) 100%)";
  }
  return "linear-gradient(180deg,#081a19 0%, #0c221f 60%, rgba(16,185,129,0.03) 100%)";
}

/* ---------- Cache helpers (sessionStorage) ---------- */
function readCache(): Record<string, { ts: number; payload: CityResult }> {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
function writeCache(obj: Record<string, { ts: number; payload: CityResult }>) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(obj));
  } catch {}
}

/* ---------- Component ---------- */
export default function CitySearch(): JSX.Element {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<CityResult>({ status: "idle" });

  const apiKey = (import.meta.env as any).VITE_WEATHER_API_KEY as string | undefined;

  // when user hits Enter or clicks Search
  async function doSearch(q: string) {
    const city = q.trim();
    if (!city) return;
    setSearching(true);
    setResult({ status: "idle" });

    const key = city.toLowerCase();
    const cache = readCache();
    const cached = cache[key];
    const now = Date.now();
    if (cached && now - cached.ts < CACHE_TTL) {
      setResult(cached.payload);
      setSearching(false);
      return;
    }

    if (!apiKey) {
      const err: CityResult = { status: "error", message: "Missing VITE_WEATHER_API_KEY" };
      setResult(err);
      setSearching(false);
      cache[key] = { ts: now, payload: err };
      writeCache(cache);
      return;
    }

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`
      );
      if (!res.ok) {
        const msg = res.status === 404 ? "City not found" : `Weather API error ${res.status}`;
        const err: CityResult = { status: "error", message: msg };
        setResult(err);
        cache[key] = { ts: now, payload: err };
        writeCache(cache);
        setSearching(false);
        return;
      }

      const data = (await res.json()) as WeatherAPIResponse;
      const photoUrl = cityPhotoUrl(data.name || city);
      const ok: CityResult = { status: "ok", data, photoUrl };
      setResult(ok);
      cache[key] = { ts: now, payload: ok };
      writeCache(cache);
    } catch (err: any) {
      const errState: CityResult = { status: "error", message: err?.message ?? "Network error" };
      setResult(errState);
      cache[key] = { ts: now, payload: errState };
      writeCache(cache);
    } finally {
      setSearching(false);
    }
  }

  // keyboard Enter handler
  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      doSearch(query);
    }
  }

  // prepopulate with a favorite city on mount (optional)
  useEffect(() => {
    // you can comment this out if you don't want an initial fetch
    // doSearch("New York");
  }, []);

  // derived values for rendering
  const skyBg = useMemo(() => {
    if (result.status === "ok") {
      const main = result.data.weather?.[0]?.main;
      const icon = result.data.weather?.[0]?.icon;
      return skyGradientFor(main, icon);
    }
    return undefined;
  }, [result]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Search input */}
      <div className="flex gap-2 items-center mb-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKey}
          placeholder="Search city (e.g. Paris)"
          aria-label="Search city"
          className="flex-1 px-4 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <button
          onClick={() => doSearch(query)}
          disabled={searching}
          className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60"
        >
          {searching ? "Searching…" : "Search"}
        </button>
      </div>

      {/* Result card */}
      <div aria-live="polite">
        {result.status === "idle" && (
          <div className="text-slate-400">Search for a city to view current weather.</div>
        )}

        {result.status === "error" && (
          <div className="rounded-lg p-4 bg-red-900/30 border border-red-800 text-red-100">
            <strong>Error:</strong> {result.message}
          </div>
        )}

        {result.status === "ok" && (
          <article className="rounded-xl overflow-hidden shadow-lg bg-slate-900 border border-slate-800">
            {/* top image + sky gradient overlay */}
            <div className="relative h-44 md:h-56 w-full" style={{ background: skyBg }}>
              {/* photo */}
              <img
                src={result.photoUrl}
                alt={`${result.data.name} photo`}
                className="absolute inset-0 w-full h-full object-cover opacity-100"
                loading="lazy"
                onError={(e) => {
                  // hide image if it fails
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              {/* dark overlay */}
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(0,0,0,0.0) 40%, rgba(0,0,0,0.45) 100%)" }} />
              {/* location label */}
              <div className="absolute left-4 top-4 px-3 py-1 rounded bg-black/30 text-emerald-300 font-medium text-sm">
                {result.data.name}
                {result.data.sys?.country ? `, ${result.data.sys.country}` : ""}
              </div>
            </div>

            {/* metrics */}
            <div className="p-4 md:p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-slate-400">Temperature</div>
                <div className="text-2xl font-semibold">{Math.round(result.data.main.temp)}°C</div>
                {typeof result.data.main.feels_like === "number" && (
                  <div className="text-xs text-slate-400">Feels like {Math.round(result.data.main.feels_like)}°</div>
                )}
              </div>

              <div>
                <div className="text-xs text-slate-400">Humidity</div>
                <div className="text-2xl font-semibold">{result.data.main.humidity}%</div>
              </div>

              <div>
                <div className="text-xs text-slate-400">Wind</div>
                <div className="text-2xl font-semibold">
                  {result.data.wind?.speed ? `${Math.round(result.data.wind.speed * 3.6)} km/h` : "—"}
                </div>
                {typeof result.data.wind?.deg === "number" && (
                  <div className="text-xs text-slate-400">{windDirFromDeg(result.data.wind.deg)}</div>
                )}
              </div>

              <div>
                <div className="text-xs text-slate-400">Sky</div>
                <div className="text-2xl font-semibold capitalize">{result.data.weather?.[0]?.description ?? "—"}</div>
                <div className="text-xs text-slate-400">Clouds: {result.data.clouds?.all ?? "—"}%</div>
              </div>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}

/* ---------- small helper ---------- */
function windDirFromDeg(deg: number) {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const idx = Math.round((deg % 360) / 22.5) % 16;
  return dirs[idx];
}
