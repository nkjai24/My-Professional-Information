// src/WeatherDashboard.tsx
import React, { useEffect, useRef, useState } from "react";
import { MonumentPhoto } from "../MonumentPhotoAndSky";

// (keep your WeatherData / types — unchanged)
interface WeatherData {
  name: string;
  main: { temp: number; humidity: number; feels_like?: number };
  weather: { description: string; icon: string; main?: string }[];
  wind?: { speed?: number; deg?: number };
  clouds?: { all?: number };
}

type CardStateLoaded = { loading: false; data?: WeatherData; error?: string; cached?: boolean };
type CardStateLoading = { loading: true };
type CardState = CardStateLoading | CardStateLoaded;

const STORAGE_KEY = "gc_weather:v1";
const CACHE_KEY = "gc_weather_cache_v1";
const CACHE_TTL = 60_000;

const HISTORY_KEY = "gc_weather_history_v1";
const HISTORY_MAX_SLOTS = 24;

type HourEntry = { ts: string; temp: number; humidity: number };
type CityHistory = Record<string, HourEntry[]>;

const iconToEmoji: Record<string, string> = {
  "01d": "☀️",
  "01n": "🌙",
  "02d": "🌤️",
  "02n": "☁️",
  "03d": "☁️",
  "03n": "☁️",
  "04d": "☁️",
  "04n": "☁️",
  "09d": "🌧️",
  "09n": "🌧️",
  "10d": "🌦️",
  "10n": "🌧️",
  "11d": "⛈️",
  "11n": "⛈️",
  "13d": "❄️",
  "13n": "❄️",
  "50d": "🌫️",
  "50n": "🌫️",
};

// Add the missing skyGradientFor function
const skyGradientFor = (weatherCondition: string | null, iconCode: string) => {
  const isNight = iconCode?.includes('n');
  const condition = weatherCondition?.toLowerCase() || 'clear';
  
  const gradients = {
    day: {
      clear: 'linear-gradient(to bottom, #87CEEB 0%, #98D8E8 100%)',
      clouds: 'linear-gradient(to bottom, #A0A0A0 0%, #C0C0C0 100%)',
      rain: 'linear-gradient(to bottom, #4A4A4A 0%, #6A6A6A 100%)',
      drizzle: 'linear-gradient(to bottom, #4A4A4A 0%, #6A6A6A 100%)',
      thunderstorm: 'linear-gradient(to bottom, #2F2F2F 0%, #4F4F4F 100%)',
      snow: 'linear-gradient(to bottom, #E6E6FA 0%, #F0F8FF 100%)',
      mist: 'linear-gradient(to bottom, #B0B0B0 0%, #D0D0D0 100%)',
      fog: 'linear-gradient(to bottom, #B0B0B0 0%, #D0D0D0 100%)',
      default: 'linear-gradient(to bottom, #87CEEB 0%, #98D8E8 100%)'
    },
    night: {
      clear: 'linear-gradient(to bottom, #191970 0%, #000080 100%)',
      clouds: 'linear-gradient(to bottom, #2F2F2F 0%, #4F4F4F 100%)',
      rain: 'linear-gradient(to bottom, #1A1A1A 0%, #3A3A3A 100%)',
      drizzle: 'linear-gradient(to bottom, #1A1A1A 0%, #3A3A3A 100%)',
      thunderstorm: 'linear-gradient(to bottom, #0F0F0F 0%, #2F2F2F 100%)',
      snow: 'linear-gradient(to bottom, #4B0082 0%, #6A5ACD 100%)',
      mist: 'linear-gradient(to bottom, #1F1F1F 0%, #3F3F3F 100%)',
      fog: 'linear-gradient(to bottom, #1F1F1F 0%, #3F3F3F 100%)',
      default: 'linear-gradient(to bottom, #191970 0%, #000080 100%)'
    }
  };

  const timeOfDay = isNight ? 'night' : 'day';
  return gradients[timeOfDay][condition] || gradients[timeOfDay].default;
};

// Add the missing MetricRow component
const MetricRow: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  return (
    <div className="text-xs">
      <div className="text-slate-400">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
};

function readStorage(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return ["London"];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.cities) && parsed.cities.length ? parsed.cities : ["London"];
  } catch {
    return ["London"];
  }
}

function writeStorage(cities: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ cities }));
  } catch {
    // ignore write errors
  }
}

function readHistory(): CityHistory {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeHistory(h: CityHistory) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
  } catch {
    // ignore write errors
  }
}

function pushHistory(city: string, entry: HourEntry) {
  const key = city;
  const h = readHistory();
  const arr = (h[key] || []).slice();
  if (arr.length && arr[arr.length - 1].ts === entry.ts) {
    arr[arr.length - 1] = entry;
  } else {
    arr.push(entry);
  }
  if (arr.length > HISTORY_MAX_SLOTS) arr.splice(0, arr.length - HISTORY_MAX_SLOTS);
  h[key] = arr;
  writeHistory(h);
}

/** type guard for loaded state */
function isLoadedState(s: CardState | undefined): s is CardStateLoaded {
  return !!s && (s as CardStateLoaded).loading === false;
}

/** WeatherIcon unchanged */
function WeatherIcon({ iconCode, desc }: { iconCode: string; desc: string }) {
  const [broken, setBroken] = useState(false);
  const src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  if (!iconCode || broken) {
    return (
      <span className="text-2xl" aria-hidden title={desc}>
        {iconToEmoji[iconCode ?? "01d"] ?? "🌤️"}
      </span>
    );
  }
  return (
    <img
      src={src}
      alt={desc}
      width={48}
      height={48}
      className="w-12 h-12 select-none"
      onError={() => setBroken(true)}
      loading="lazy"
    />
  );
}

export default function WeatherDashboard(): JSX.Element {
  const [search, setSearch] = useState("");
  const [cities, setCities] = useState<string[]>(() => readStorage());
  const [weatherMap, setWeatherMap] = useState<Record<string, CardState>>({});
  const [globalLoading, setGlobalLoading] = useState(false);
  const apiKey = (import.meta.env as any).VITE_WEATHER_API_KEY as string | undefined;

  const [historyMap, setHistoryMap] = useState<CityHistory>(() => readHistory());
  const cacheRef = useRef<Map<string, { ts: number; state: CardState }>>(new Map());

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, { ts: number; state: CardState }>;
        const map = new Map<string, { ts: number; state: CardState }>();
        Object.entries(parsed).forEach(([k, v]) => map.set(k, v));
        cacheRef.current = map;
      }
    } catch {}
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      try {
        const obj: Record<string, { ts: number; state: CardState }> = {};
        cacheRef.current.forEach((v, k) => {
          if (isLoadedState(v.state)) obj[k] = v;
        });
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(obj));
      } catch {}
    }, 400);
    return () => clearTimeout(id);
  }, [weatherMap]);

  function topOfHourISO(date = new Date()) {
    const d = new Date(date);
    d.setMinutes(0, 0, 0);
    return d.toISOString();
  }

  // ---------- verbose fetchCity (diagnostic + stable caching) ----------
  async function fetchCity(cityName: string): Promise<CardState> {
    const key = cityName.trim().toLowerCase();
    const now = Date.now();

    const cachedEntry = cacheRef.current.get(key);
    if (cachedEntry && now - cachedEntry.ts < CACHE_TTL) {
      const cachedState = cachedEntry.state;
      if (isLoadedState(cachedState)) {
        const returned: CardStateLoaded = { ...cachedState, cached: true };
        return returned;
      }
    }

    if (!apiKey) {
      const err: CardStateLoaded = { loading: false, error: "Missing VITE_WEATHER_API_KEY" };
      cacheRef.current.set(key, { ts: now, state: err });
      console.warn("[fetchCity] Missing VITE_WEATHER_API_KEY");
      return err;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      cityName
    )}&units=metric&appid=${apiKey}`;

    try {
      const res = await fetch(url, { method: "GET" });

      if (!res) {
        const errState: CardStateLoaded = { loading: false, error: "No response from weather API" };
        cacheRef.current.set(key, { ts: now, state: errState });
        console.error("[fetchCity] No response object received");
        return errState;
      }

      if (!res.ok) {
        let serverMsg = res.statusText || `HTTP ${res.status}`;
        try {
          const body = await res.json();
          if (body && body.message) serverMsg = `${body.message} (cod=${body.cod ?? res.status})`;
        } catch {
          /* ignore parse errors */
        }
        const errState: CardStateLoaded = { loading: false, error: `Error ${res.status}: ${serverMsg}` };
        cacheRef.current.set(key, { ts: now, state: errState });
        console.warn(`[fetchCity] ${url} -> ${res.status} ${serverMsg}`);
        return errState;
      }

      const data = (await res.json()) as WeatherData;

      if (!data || !data.main) {
        const errState: CardStateLoaded = { loading: false, error: "Malformed API response" };
        cacheRef.current.set(key, { ts: now, state: errState });
        console.error("[fetchCity] Malformed API response", data);
        return errState;
      }

      // push history (top-of-hour)
      const entry: HourEntry = { ts: topOfHourISO(), temp: data.main.temp, humidity: data.main.humidity };
      try {
        pushHistory(data.name, entry);
        setHistoryMap((prev) => {
          const copy = { ...prev };
          copy[data.name] = (copy[data.name] || []).slice();
          if (copy[data.name].length && copy[data.name][copy[data.name].length - 1].ts === entry.ts) {
            copy[data.name][copy[data.name].length - 1] = entry;
          } else {
            copy[data.name].push(entry);
            if (copy[data.name].length > HISTORY_MAX_SLOTS) copy[data.name].splice(0, copy[data.name].length - HISTORY_MAX_SLOTS);
          }
          writeHistory(copy);
          return copy;
        });
      } catch {
        /* ignore history errors */
      }

      const state: CardStateLoaded = { loading: false, data };
      cacheRef.current.set(key, { ts: now, state });
      console.log(`[fetchCity] fetched ${cityName}`, { url, data });
      return state;
    } catch (err: any) {
      const msg = err?.message ?? "Network error";
      const errState: CardStateLoaded = { loading: false, error: `Failed to fetch: ${msg}` };
      cacheRef.current.set(key, { ts: now, state: errState });
      console.error("[fetchCity] fetch exception", err);
      return errState;
    }
  }
  // ---------- end fetchCity ----------

  const refreshAll = async (list: string[]) => {
    if (!list || list.length === 0) return;
    setGlobalLoading(true);

    setWeatherMap((prev) => {
      const out = { ...prev };
      list.forEach((c) => (out[c] = { loading: true }));
      return out;
    });

    const promises = list.map((c) => fetchCity(c).then((s) => ({ city: c, state: s })));
    const settled = await Promise.allSettled(promises);

    setWeatherMap((prev) => {
      const out = { ...prev };
      settled.forEach((res, idx) => {
        const city = list[idx];
        if (res.status === "fulfilled") {
          out[city] = res.value.state;
        } else {
          out[city] = prev[city] ?? { loading: false, error: "Failed to fetch" };
        }
      });
      return out;
    });

    setGlobalLoading(false);
  };

  useEffect(() => {
    refreshAll(cities);

    const msUntilNextHour = () => {
      const now = new Date();
      const next = new Date(now);
      next.setMinutes(0, 0, 0);
      next.setHours(next.getHours() + 1);
      return next.getTime() - now.getTime();
    };
    const first = window.setTimeout(() => {
      refreshAll(cities);
      const hourly = window.setInterval(() => refreshAll(cities), 60 * 60 * 1000);
      (window as any).__weather_hourly_interval = hourly;
    }, msUntilNextHour());

    return () => {
      clearTimeout(first);
      const ival = (window as any).__weather_hourly_interval;
      if (ival) clearInterval(ival);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    writeStorage(cities);
    refreshAll(cities);
  }, [cities]);

  const addCity = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = search.trim();
    if (!text) return;
    if (cities.find((c) => c.toLowerCase() === text.toLowerCase())) {
      setSearch("");
      return;
    }
    setCities((prev) => [text, ...prev]);
    setSearch("");
  };

  const removeCity = (city: string) => {
    setCities((prev) => prev.filter((c) => c !== city));
    setWeatherMap((prev) => {
      const copy = { ...prev };
      delete copy[city];
      return copy;
    });
    setHistoryMap((prev) => {
      const copy = { ...prev };
      delete copy[city];
      writeHistory(copy);
      return copy;
    });
  };

  const pinCity = (city: string) => {
    setCities((prev) => [city, ...prev.filter((c) => c !== city)]);
  };

  function HourTimeline({ city }: { city: string }) {
    const list = historyMap[city] || [];
    const nowTop = topOfHourISO();
    const slots: (HourEntry | null)[] = new Array(HISTORY_MAX_SLOTS).fill(null);
    const mapByTs = new Map(list.map((e) => [e.ts, e]));
    for (let i = HISTORY_MAX_SLOTS - 1; i >= 0; i--) {
      const d = new Date(nowTop);
      d.setHours(d.getHours() - (HISTORY_MAX_SLOTS - 1 - i));
      const ts = d.toISOString();
      slots[i] = (mapByTs.get(ts) as HourEntry) ?? null;
    }
    return (
      <div className="mt-3">
        <div className="text-xs text-slate-400 mb-2">Last 24 hours</div>
        <div className="flex gap-1 overflow-x-auto py-1">
          {slots.map((s, idx) => {
            const hourLabel = (() => {
              const d = new Date(new Date(nowTop).setHours(new Date(nowTop).getHours() - (HISTORY_MAX_SLOTS - 1 - idx)));
              return d.toLocaleTimeString([], { hour: "2-digit", hour12: false });
            })();
            if (!s) {
              return (
                <div key={idx} className="min-w-[64px] rounded-md bg-slate-700 p-2 text-center text-xs">
                  <div className="text-[10px] text-slate-400">{hourLabel}</div>
                  <div className="text-[12px] text-slate-300">—</div>
                  <div className="text-[10px] text-slate-500">—</div>
                </div>
              );
            }
            return (
              <div key={idx} className="min-w-[64px] rounded-md bg-slate-700 p-2 text-center text-xs">
                <div className="text-[10px] text-slate-400">{hourLabel}</div>
                <div className="font-medium text-sm">{Math.round(s.temp)}°</div>
                <div className="text-[11px] text-slate-300">{s.humidity}%</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 text-white max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">Weather Dashboard</h2>

      <form onSubmit={addCity} className="flex gap-2 mb-6 justify-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 rounded-md text-black w-72 border border-slate-700"
          placeholder="Add city (e.g. Paris)"
          aria-label="Add city"
        />
        <button type="submit" className="bg-emerald-500 px-4 py-2 rounded-md hover:bg-emerald-600" aria-label="Add city">
          Add
        </button>

        <button
          type="button"
          onClick={() => refreshAll(cities)}
          className="ml-2 px-3 py-2 rounded-md border border-slate-700 text-slate-200 hover:bg-slate-700"
          aria-label="Refresh all cities"
        >
          Refresh
        </button>
      </form>

      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2">
          <span className="text-sm text-slate-300">Saved cities:</span>
          <span className="font-medium">{cities.length}</span>
          {globalLoading && <span className="text-sm text-emerald-300 ml-3">Refreshing…</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {cities.length === 0 && <div className="text-slate-400">No cities yet — add one above.</div>}
        {cities.map((city) => {
          const state = weatherMap[city];
          if (!state || ("loading" in state && state.loading)) {
            return (
              <article
                key={city}
                className="rounded-lg overflow-hidden shadow-md bg-slate-800 p-4"
                role="article"
                aria-label={`Loading weather for ${city}`}
                tabIndex={0}
              >
                <div className="h-36 bg-slate-700 animate-pulse rounded" />
                <div className="mt-3">
                  <div className="h-4 w-32 bg-slate-700 animate-pulse rounded mb-2" />
                  <div className="h-3 w-40 bg-slate-700 animate-pulse rounded" />
                </div>
              </article>
            );
          }
          if (isLoadedState(state)) {
            if (state.error) {
              const skyBg = skyGradientFor(null, "01d");
              return (
                <article
                  key={city}
                  className="rounded-lg overflow-hidden shadow-md bg-slate-800 p-4"
                  role="article"
                  aria-label={`${city} weather error`}
                  tabIndex={0}
                >
                  <div className="relative h-36 w-full overflow-hidden rounded-t" style={{ background: skyBg }}>
                    <MonumentPhoto city={city} alt={`${city} monument`} className="absolute inset-0 w-full h-full" />
                    <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.35) 100%)" }} />
                  </div>

                  <div className="mt-3 flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-lg">{city}</div>
                      <div className="text-sm text-red-400 mt-1">{state.error}</div>
                      {state.cached && <div className="text-xs text-slate-400 mt-1">cached</div>}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => pinCity(city)} title="Pin" aria-label={`Pin ${city}`} className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600">
                        📌
                      </button>
                      <button onClick={() => removeCity(city)} title="Remove" aria-label={`Remove ${city}`} className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600">
                        ✖
                      </button>
                    </div>
                  </div>
                  <HourTimeline city={city} />
                </article>
              );
            }

            const data = state.data!;
            const iconCode = data.weather?.[0]?.icon ?? "01d";
            const desc = data.weather?.[0]?.description ?? "";
            const skyBg = skyGradientFor(data?.weather?.[0]?.main, iconCode);
            return (
              <article key={city} className="rounded-lg overflow-hidden shadow-md bg-slate-800" role="article" aria-label={`Weather card for ${data.name}`} tabIndex={0}>
                <div className="relative h-36 w-full overflow-hidden rounded-t" style={{ background: skyBg }}>
                  <MonumentPhoto city={data.name} alt={`${data.name} monument`} className="absolute inset-0 w-full h-full" />
                  <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.35) 100%)" }} />
                  <div className="absolute left-3 top-3 px-2 py-1 rounded bg-black/30 text-xs text-white">{data.name}</div>
                </div>

                <div className="p-4 flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <WeatherIcon iconCode={iconCode} desc={desc} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-lg truncate">{data.name}</div>
                        <div className="text-sm text-slate-300 mt-1 truncate">
                          {Math.round(data.main.temp)}°C · {desc}
                        </div>
                        <div className="text-sm text-slate-300 mt-1">Humidity: {data.main.humidity}%</div>
                        {state.cached && <div className="text-xs text-slate-400 mt-1">cached</div>}
                      </div>

                      <div className="flex flex-col gap-2 ml-3">
                        <button onClick={() => pinCity(data.name)} title="Pin" aria-label={`Pin ${data.name}`} className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600">
                          📌
                        </button>
                        <button onClick={() => removeCity(data.name)} title="Remove" aria-label={`Remove ${data.name}`} className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600">
                          ✖
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <MetricRow label="Humidity" value={`${data.main.humidity}%`} />
                      <MetricRow label="Wind" value={`${data.wind?.speed ?? "—"} m/s`} />
                      <MetricRow label="Clouds" value={`${data.clouds?.all ?? "—"}%`} />
                      <MetricRow label="Feels like" value={`${Math.round(data.main.feels_like ?? data.main.temp)}°C`} />
                    </div>

                    <HourTimeline city={data.name} />
                  </div>
                </div>
              </article>
            );
          }

          return (
            <article key={city} className="rounded-lg overflow-hidden shadow-md bg-slate-800 p-4" role="article" aria-label={`${city} fallback`} tabIndex={0}>
              <div className="h-36 bg-slate-700 rounded" />
              <div className="mt-3">
                <div className="font-semibold">{city}</div>
                <div className="text-sm text-slate-400">Unavailable</div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}