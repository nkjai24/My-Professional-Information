import React from "react";

export type TinyCardData = {
  city: string;
  temp?: number | null;
  desc?: string | null;
  iconCode?: string | null;
  loading?: boolean;
  error?: string | null;
  photoUrl?: string | null;
};

type Props = {
  data: TinyCardData;
  onClick?: () => void;
  onRemove?: () => void;
  onPin?: () => void;
  pinned?: boolean;
};

const iconToEmoji: Record<string, string> = {
  "01d": "☀️", "01n": "🌙",
  "02d": "🌤️", "02n": "☁️",
  "03d": "☁️", "03n": "☁️",
  "04d": "☁️", "04n": "☁️",
  "09d": "🌧️", "09n": "🌧️",
  "10d": "🌦️", "10n": "🌧️",
  "11d": "⛈️", "11n": "⛈️",
  "13d": "❄️", "13n": "❄️",
  "50d": "🌫️", "50n": "🌫️",
};

export default function TinyWeatherCard({ data, onClick, onRemove, onPin, pinned }: Props) {
  const { city, temp, desc, iconCode, loading, error, photoUrl } = data;

  const bg = photoUrl ?? `https://source.unsplash.com/800x600/?${encodeURIComponent(city)}`;

  return (
    <div
      role="article"
      aria-label={`Weather card for ${city}`}
      className="relative w-64 rounded-xl overflow-hidden shadow-md bg-slate-800 text-white"
    >
      {/* background */}
      <div
        className="h-36 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.06) 30%, rgba(0,0,0,0.55) 100%), url(${bg})`,
        }}
      />

      <div className="p-3 flex items-start gap-3">
        <div className="flex-shrink-0">
          {/* icon or skeleton */}
          {loading ? (
            <div className="w-12 h-12 rounded-lg bg-slate-700 animate-pulse" />
          ) : error ? (
            <div className="w-12 h-12 rounded-lg bg-red-600 flex items-center justify-center text-sm">!</div>
          ) : iconCode ? (
            <img
              src={`https://openweathermap.org/img/wn/${iconCode}@2x.png`}
              alt={desc ?? city}
              className="w-12 h-12 select-none"
              width={48}
              height={48}
              onError={(e) => ((e.target as HTMLImageElement).src = "")}
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center text-xl">
              {iconToEmoji[iconCode ?? "01d"] ?? "🌤️"}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <button
            onClick={onClick}
            className="text-left w-full"
            title={`Open ${city}`}
            aria-label={`Open details for ${city}`}
          >
            <div className="font-semibold truncate">{city}</div>
            <div className="text-sm text-slate-200 truncate">
              {loading ? "Loading..." : error ? error : `${Math.round(temp ?? 0)}°C · ${desc ?? "-"}`}
            </div>
          </button>
        </div>

        <div className="flex flex-col items-end gap-2">
          <button
            onClick={onPin}
            title={pinned ? "Unpin city" : "Pin city"}
            className="p-1 rounded hover:bg-slate-700"
            aria-pressed={pinned}
          >
            {pinned ? "📌" : "📍"}
          </button>

          <button
            onClick={onRemove}
            title="Remove city"
            className="p-1 rounded hover:bg-slate-700 text-slate-300"
          >
            ✖
          </button>
        </div>
      </div>
    </div>
  );
}
