// src/pages/MonumentPhotoAndSky.tsx
import React, { useState } from "react";

type WeatherResp = {
  name: string;
  sys?: { country?: string };
  main: { temp: number; feels_like: number; humidity: number };
  wind?: { speed: number; deg?: number };
  weather?: { description: string }[];
};

export type MetricRowProps = {
  label: string;
  value: string | number;
};

export function MetricRow({ label, value }: MetricRowProps) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
      <div style={{ color: "#9aa" }}>{label}</div>
      <div style={{ fontWeight: 700 }}>{value}</div>
    </div>
  );
}

const WEATHER_KEY = (import.meta.env.VITE_WEATHER_API_KEY as string | undefined) ?? undefined;

async function fetchWeather(city: string): Promise<WeatherResp> {
  if (!WEATHER_KEY) throw new Error("Missing VITE_WEATHER_API_KEY env var");
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&units=metric&appid=${WEATHER_KEY}`;
  const r = await fetch(url);
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Weather API Error ${r.status}: ${text}`);
  }
  return (await r.json()) as WeatherResp;
}

interface MonumentPhotoProps {
  city: string;
  alt: string;
  className?: string;
}

export const MonumentPhoto: React.FC<MonumentPhotoProps> = ({ city, alt, className }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  React.useEffect(() => {
    let mounted = true;
    
    async function loadImage() {
      try {
        console.log(`[MonumentPhoto] Loading image for ${city}`);
        
        // Comprehensive monument images database
        const monumentImages: Record<string, string> = {
          // Europe
          'paris': 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400&h=300&fit=crop&auto=format',
          'london': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop&auto=format',
          'rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=300&fit=crop&auto=format',
          'barcelona': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&h=300&fit=crop&auto=format',
          'berlin': 'https://images.unsplash.com/photo-1587330979470-3016b6702d89?w=400&h=300&fit=crop&auto=format',
          'moscow': 'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=400&h=300&fit=crop&auto=format',
          'amsterdam': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400&h=300&fit=crop&auto=format',
          'madrid': 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=400&h=300&fit=crop&auto=format',
          'vienna': 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=400&h=300&fit=crop&auto=format',
          'prague': 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=400&h=300&fit=crop&auto=format',
          
          // Asia
          'tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop&auto=format',
          'beijing': 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&h=300&fit=crop&auto=format',
          'seoul': 'https://images.unsplash.com/photo-1601972599720-ff48cd635c63?w=400&h=300&fit=crop&auto=format',
          'bangkok': 'https://images.unsplash.com/photo-1563492065-fcfb8afa3d2e?w=400&h=300&fit=crop&auto=format',
          'singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&h=300&fit=crop&auto=format',
          'hong kong': 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=400&h=300&fit=crop&auto=format',
          'shanghai': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&auto=format',
          'kuala lumpur': 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&h=300&fit=crop&auto=format',
          'jakarta': 'https://images.unsplash.com/photo-1555899434-94d1eb5a4e6e?w=400&h=300&fit=crop&auto=format',
          
          // India
          'delhi': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop&auto=format',
          'mumbai': 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop&auto=format',
          'bangalore': 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400&h=300&fit=crop&auto=format',
          'chennai': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&h=300&fit=crop&auto=format',
          'kolkata': 'https://images.unsplash.com/photo-1558431382-27bbae175a70?w=400&h=300&fit=crop&auto=format',
          'agra': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&h=300&fit=crop&auto=format',
          'jaipur': 'https://images.unsplash.com/photo-1599661046827-dacde6976549?w=400&h=300&fit=crop&auto=format',
          'hyderabad': 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop&auto=format',
          'pune': 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400&h=300&fit=crop&auto=format',
          'kochi': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&h=300&fit=crop&auto=format',
          'trichy': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&h=300&fit=crop&auto=format',
          'coimbatore': 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400&h=300&fit=crop&auto=format',
          'salem': 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400&h=300&fit=crop&auto=format',
          'mysore': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&h=300&fit=crop&auto=format',
          'madurai': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&h=300&fit=crop&auto=format',
          
          // Americas  
          'new york': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop&auto=format',
          'los angeles': 'https://images.unsplash.com/photo-1544913503-7ad532c1da22?w=400&h=300&fit=crop&auto=format',
          'san francisco': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=300&fit=crop&auto=format',
          'chicago': 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=400&h=300&fit=crop&auto=format',
          'toronto': 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=400&h=300&fit=crop&auto=format',
          'vancouver': 'https://images.unsplash.com/photo-1527856263669-12c3a0af2aa6?w=400&h=300&fit=crop&auto=format',
          'miami': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&auto=format',
          'las vegas': 'https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=400&h=300&fit=crop&auto=format',
          'washington': 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=400&h=300&fit=crop&auto=format',
          'boston': 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=300&fit=crop&auto=format',
          
          // Middle East & Africa
          'dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop&auto=format',
          'istanbul': 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=400&h=300&fit=crop&auto=format',
          'cairo': 'https://images.unsplash.com/photo-1539650116574-75c0c6930311?w=400&h=300&fit=crop&auto=format',
          'cape town': 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=400&h=300&fit=crop&auto=format',
          'doha': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop&auto=format',
          'riyadh': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&auto=format',
          'tel aviv': 'https://images.unsplash.com/photo-1544996879-1f2effe7b78b?w=400&h=300&fit=crop&auto=format',
          
          // Oceania
          'sydney': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&auto=format',
          'melbourne': 'https://images.unsplash.com/photo-1545044846-351ba102b6d5?w=400&h=300&fit=crop&auto=format',
          'auckland': 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=400&h=300&fit=crop&auto=format',
          'perth': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&auto=format',
          
          // South America
          'rio de janeiro': 'https://images.unsplash.com/photo-1544948503-7ad532c1da22?w=400&h=300&fit=crop&auto=format',
          'sao paulo': 'https://images.unsplash.com/photo-1544948503-7ad532c1da22?w=400&h=300&fit=crop&auto=format',
          'buenos aires': 'https://images.unsplash.com/photo-1544948503-7ad532c1da22?w=400&h=300&fit=crop&auto=format',
          'lima': 'https://images.unsplash.com/photo-1544948503-7ad532c1da22?w=400&h=300&fit=crop&auto=format'
        };

        const cityKey = city.toLowerCase().trim();
        const directImage = monumentImages[cityKey];
        
        if (directImage && mounted) {
          console.log(`[MonumentPhoto] Found direct image for ${city}:`, directImage);
          setImageUrl(directImage);
          setLoading(false);
          setError(false);
          return;
        }

        // Try partial matches for cities not in exact list
        const partialMatch = Object.keys(monumentImages).find(key => 
          cityKey.includes(key) || key.includes(cityKey)
        );
        
        if (partialMatch && mounted) {
          console.log(`[MonumentPhoto] Found partial match for ${city}: ${partialMatch}`);
          setImageUrl(monumentImages[partialMatch]);
          setLoading(false);
          setError(false);
          return;
        }

        // Fallback: Use a generic architecture image
        const genericImage = 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop&auto=format';
        if (mounted) {
          console.log(`[MonumentPhoto] Using generic fallback for ${city}`);
          setImageUrl(genericImage);
          setLoading(false);
          setError(false);
        }

      } catch (err) {
        console.error(`[MonumentPhoto] Failed to load image for ${city}:`, err);
        if (mounted) {
          setImageUrl(null);
          setLoading(false);
          setError(true);
        }
      }
    }

    loadImage();
    
    return () => {
      mounted = false;
    };
  }, [city]);

  if (loading) {
    return (
      <div 
        className={className}
        style={{
          background: 'linear-gradient(45deg, #1a1a1a 25%, transparent 25%), linear-gradient(-45deg, #1a1a1a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1a1a 75%), linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666',
          fontSize: '12px'
        }}
      >
        Loading {city}...
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div 
        className={className}
        style={{
          background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '14px',
          textAlign: 'center',
          padding: '12px',
          position: 'relative'
        }}
      >
        <div>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏛️</div>
          <div>{city}</div>
        </div>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        filter: 'brightness(0.8) contrast(1.1)'
      }}
      onError={(e) => {
        console.error(`[MonumentPhoto] Image failed to load for ${city}:`, imageUrl);
        setError(true);
        setImageUrl(null);
      }}
      onLoad={() => {
        console.log(`[MonumentPhoto] Image loaded successfully for ${city}`);
      }}
    />
  );
};

function MonumentPhotoAndSky(): JSX.Element {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<WeatherResp | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setWeather(null);
    setImageUrl(null);

    try {
      const [w, img] = await Promise.all([
        fetchWeather(q).catch((err) => {
          throw err;
        }),
        // Use a simple fallback for the main search component
        Promise.resolve('https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop&auto=format'),
      ]);
      setWeather(w);
      setImageUrl(img);
    } catch (err: any) {
      setError(err?.message ?? "Unknown error while fetching data");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="monument-wrapper" style={{ maxWidth: 980, margin: "24px auto", padding: 16 }}>
      <h2>City weather + landmark</h2>

      {!WEATHER_KEY && (
        <div style={{ marginBottom: 12, color: "#b23" }}>
          Warning: missing <code>VITE_WEATHER_API_KEY</code> in your .env — weather requests will fail until you set it.
        </div>
      )}

      <form onSubmit={onSearch} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="e.g. Paris, Tokyo, Salem"
          aria-label="city"
          style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: "1px solid #2d3748" }}
        />
        <button type="submit" disabled={loading} style={{ padding: "10px 14px", borderRadius: 8 }}>
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {error && <div style={{ color: "crimson", marginBottom: 12 }}>Error: {error}</div>}

      {weather ? (
        <div className="card" style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #233" }}>
          <div style={{ display: "flex", padding: 16, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>
                {weather.name} {weather.sys?.country ? `, ${weather.sys.country}` : ""}
              </div>
              <div style={{ color: "#9aa" }}>{weather.weather?.[0]?.description ?? ""}</div>
            </div>

            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{Math.round(weather.main.temp)}°C</div>
              <div style={{ color: "#9aa", fontSize: 13 }}>Feels like {Math.round(weather.main.feels_like)}°C</div>
            </div>
          </div>

          <div style={{ padding: 12 }}>
            <MetricRow label="Humidity" value={`${weather.main.humidity}%`} />
            <MetricRow label="Wind" value={`${weather.wind?.speed ?? "—"} m/s`} />
          </div>

          <div style={{ height: 320, position: "relative", background: "#111" }}>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={`${weather.name} landmark`}
                style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.75)" }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#9aa",
                }}
              >
                No landmark image found — showing weather only.
              </div>
            )}

            <div
              style={{
                position: "absolute",
                left: 12,
                bottom: 12,
                background: "rgba(0,0,0,0.5)",
                color: "#fff",
                padding: "6px 8px",
                borderRadius: 8,
                fontSize: 13,
              }}
            >
              Humidity: {weather.main.humidity}% • Wind: {weather.wind?.speed ?? "—"} m/s
            </div>
          </div>
        </div>
      ) : (
        <div style={{ color: "#9aa" }}>Enter a city and press Search to fetch weather and a monument photo.</div>
      )}
    </div>
  );
}

export default MonumentPhotoAndSky;