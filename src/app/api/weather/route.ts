import { NextRequest, NextResponse } from "next/server";
import { WeatherData } from "@/types";

type ForecastItem = {
  dt: number;
  main: { temp: number; feels_like: number; humidity: number };
  weather: { description: string; icon: string; main: string }[];
  wind: { speed: number };
  pop?: number;
  snow?: unknown;
  rain?: unknown;
};

function buildWeatherFromCurrent(current: {
  main: { temp: number; feels_like: number; humidity: number };
  weather: { description: string; icon: string; main: string }[];
  wind: { speed: number };
  snow?: unknown;
  rain?: unknown;
}, rainProbability: number, isForecast: boolean): WeatherData {
  return {
    temp: Math.round(current.main.temp),
    feels_like: Math.round(current.main.feels_like),
    description: current.weather[0].description,
    icon: current.weather[0].icon,
    rain_probability: rainProbability,
    snow: current.snow != null || current.weather[0].main === "Snow",
    wind_speed: Math.round(current.wind.speed * 3.6),
    humidity: current.main.humidity,
    is_forecast: isForecast,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");
  const country = searchParams.get("country");
  const dateParam = searchParams.get("date");

  if (!city) {
    return NextResponse.json({ error: "city is required" }, { status: 400 });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Weather API key not configured" },
      { status: 500 }
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let targetDate: Date | null = null;
  if (dateParam) {
    const parsed = new Date(`${dateParam}T12:00:00`);
    if (!isNaN(parsed.getTime())) {
      targetDate = parsed;
    }
  }

  const isToday =
    !targetDate ||
    (targetDate.getFullYear() === today.getFullYear() &&
      targetDate.getMonth() === today.getMonth() &&
      targetDate.getDate() === today.getDate());

  const isPast = targetDate ? targetDate.getTime() < today.getTime() : false;
  const daysAhead = targetDate
    ? Math.round(
        (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0;

  if (isPast) {
    return NextResponse.json({ error: "no past weather data" }, { status: 404 });
  }

  if (daysAhead > 5) {
    return NextResponse.json(
      { error: "forecast only available up to 5 days ahead" },
      { status: 404 }
    );
  }

  try {
    const location = country ? `${city},${country}` : city;

    if (isToday) {
      const [currentRes, forecastRes] = await Promise.all([
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=metric&appid=${apiKey}`
        ),
        fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&units=metric&cnt=8&appid=${apiKey}`
        ),
      ]);

      if (!currentRes.ok) {
        return NextResponse.json(
          { error: "Failed to fetch weather" },
          { status: currentRes.status }
        );
      }

      const current = await currentRes.json();
      const forecast = forecastRes.ok ? await forecastRes.json() : null;

      let rainProbability = 0;
      if (forecast?.list) {
        const maxPop = Math.max(
          ...forecast.list.map((it: { pop?: number }) => it.pop ?? 0)
        );
        rainProbability = Math.round(maxPop * 100);
      }
      if (current.rain != null && rainProbability < 50) rainProbability = 80;

      return NextResponse.json(
        buildWeatherFromCurrent(current, rainProbability, false)
      );
    }

    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&units=metric&appid=${apiKey}`
    );

    if (!forecastRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch forecast" },
        { status: forecastRes.status }
      );
    }

    const forecast = await forecastRes.json();
    const list: ForecastItem[] = forecast.list ?? [];
    if (list.length === 0) {
      return NextResponse.json({ error: "no forecast available" }, { status: 404 });
    }

    const targetMid = new Date(targetDate!);
    targetMid.setHours(12, 0, 0, 0);
    const targetTs = targetMid.getTime();

    let best = list[0];
    let bestDelta = Math.abs(best.dt * 1000 - targetTs);
    for (const item of list) {
      const delta = Math.abs(item.dt * 1000 - targetTs);
      if (delta < bestDelta) {
        best = item;
        bestDelta = delta;
      }
    }

    const sameDay = list.filter((it) => {
      const d = new Date(it.dt * 1000);
      return (
        d.getFullYear() === targetDate!.getFullYear() &&
        d.getMonth() === targetDate!.getMonth() &&
        d.getDate() === targetDate!.getDate()
      );
    });
    const maxPop = sameDay.length
      ? Math.max(...sameDay.map((it) => it.pop ?? 0))
      : (best.pop ?? 0);

    return NextResponse.json(
      buildWeatherFromCurrent(best, Math.round(maxPop * 100), true)
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch weather" },
      { status: 500 }
    );
  }
}
