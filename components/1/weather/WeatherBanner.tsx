"use client";

import { WeatherData, WeatherAdvice } from "@/lib/1/types";
import { Cloud, Droplets, Snowflake, Sun, Wind, CloudOff, Loader2 } from "lucide-react";

type WeatherBannerProps = {
  weather: WeatherData | null;
  advice: WeatherAdvice[];
  city: string;
  label?: string;
  loading?: boolean;
  unavailableReason?: string | null;
};

function pickWeatherIcon(weather: WeatherData) {
  if (weather.snow) return Snowflake;
  if (weather.rain_probability > 50) return Droplets;
  if (/cloud|overcast/i.test(weather.description)) return Cloud;
  return Sun;
}

export default function WeatherBanner({
  weather,
  advice,
  city,
  label,
  loading,
  unavailableReason,
}: WeatherBannerProps) {
  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center shrink-0">
          <Loader2 className="w-5 h-5 text-stone-400 animate-spin" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="h-3 w-24 rounded-full shimmer mb-1.5" />
          <div className="h-2.5 w-40 rounded-full shimmer" />
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center shrink-0">
          <CloudOff className="w-5 h-5 text-stone-400" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-stone-700">
            Forecast unavailable
          </p>
          <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
            {unavailableReason ?? "No weather data for this day."}
          </p>
        </div>
      </div>
    );
  }

  const Icon = pickWeatherIcon(weather);
  const forecast = weather.is_forecast;
  const captionExtra = label
    ? ` · ${label}`
    : forecast
      ? " · forecast"
      : "";

  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-thulian via-amaranth to-amaranth flex items-center justify-center shadow-soft shrink-0">
          <Icon className="w-5 h-5 text-white" strokeWidth={2} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <p className="text-2xl font-semibold tabular-nums leading-none">
              {Math.round(weather.temp)}°
            </p>
            <p className="text-xs text-stone-500 capitalize truncate">
              {weather.description} · {city}
              {captionExtra}
            </p>
            {forecast && (
              <span className="text-[10px] uppercase tracking-wider font-semibold text-brook bg-brook/[0.10] px-1.5 py-0.5 rounded-full border border-brook/30">
                forecast
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-stone-500 flex-wrap">
            <span className="flex items-center gap-1">
              <Droplets className="w-3 h-3" />
              {weather.rain_probability}%
            </span>
            <span className="flex items-center gap-1">
              <Wind className="w-3 h-3" />
              {Math.round(weather.wind_speed)} km/h
            </span>
            <span>feels {Math.round(weather.feels_like)}°</span>
          </div>
        </div>
      </div>

      {advice.length > 0 && (
        <div className="mt-3 pt-3 border-t border-stone-200/60 space-y-1.5">
          {advice.map((a, i) => (
            <p
              key={i}
              className={`text-xs flex items-start gap-2 ${
                a.severity === "warning"
                  ? "text-amaranth"
                  : "text-secondary"
              }`}
            >
              <span
                className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                  a.severity === "warning" ? "bg-amaranth" : "bg-pomelo"
                }`}
              />
              <span className="leading-relaxed">{a.message}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
