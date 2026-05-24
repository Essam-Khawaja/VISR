/**
 * /api/flowgram/weather
 *
 * OpenWeather proxy. Returns either the current conditions (today, with
 * a few hours of POP/precipitation peek) or a forecast slice for a future
 * date. Any past date returns 404 because OpenWeather's free tier does not
 * provide historical data.
 */
import { NextRequest, NextResponse } from "next/server";
import { WeatherData } from "@/lib/flowgram/types";

type ForecastItem = {
  dt: number;
  main: { temp: number; feels_like: number; humidity: number };
  weather: { description: string; icon: string; main: string }[];
  wind: { speed: number };
  pop?: number;
  snow?: unknown;
  rain?: unknown;
};

function buildWeather(
  source: {
    main: { temp: number; feels_like: number; humidity: number };
    weather: { description: string; icon: string; main: string }[];
    wind: { speed: number };
    snow?: unknown;
    rain?: unknown;
  },
  rainProbability: number,
  isForecast: boolean
): WeatherData {
  return {
    temp: Math.round(source.main.temp),
    feels_like: Math.round(source.main.feels_like),
    description: source.weather[0]?.description ?? "",
    icon: source.weather[0]?.icon ?? "",
    rain_probability: rainProbability,
    snow: source.snow != null || source.weather[0]?.main === "Snow",
    wind_speed: Math.round(source.wind.speed * 3.6),
    humidity: source.main.humidity,
    is_forecast: isForecast,
  };
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
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
      { error: "weather API key not configured" },
      { status: 500 }
    );
  }

  const todayStart = startOfDay(new Date());
  let targetDate: Date | null = null;
  if (dateParam) {
    const parsed = new Date(`${dateParam}T12:00:00`);
    if (!isNaN(parsed.getTime())) {
      targetDate = parsed;
    }
  }
  const targetStart = targetDate ? startOfDay(targetDate) : todayStart;
  const isToday = targetStart.getTime() === todayStart.getTime();
  const isPast = targetStart.getTime() < todayStart.getTime();

  if (isPast) {
    return NextResponse.json({ error: "unavailable" }, { status: 404 });
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
        return NextResponse.json({ error: "unavailable" }, { status: 404 });
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

      return NextResponse.json(buildWeather(current, rainProbability, false));
    }

    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&units=metric&appid=${apiKey}`
    );

    if (!forecastRes.ok) {
      return NextResponse.json({ error: "unavailable" }, { status: 404 });
    }

    const forecast = await forecastRes.json();
    const list: ForecastItem[] = forecast.list ?? [];

    const sameDay = list.filter((it) => {
      const d = new Date(it.dt * 1000);
      return startOfDay(d).getTime() === targetStart.getTime();
    });

    if (sameDay.length === 0) {
      return NextResponse.json({ error: "unavailable" }, { status: 404 });
    }

    let best = sameDay[0];
    let bestDelta = Infinity;
    const targetNoon = new Date(targetStart);
    targetNoon.setHours(12, 0, 0, 0);
    const targetTs = targetNoon.getTime();
    for (const item of sameDay) {
      const delta = Math.abs(item.dt * 1000 - targetTs);
      if (delta < bestDelta) {
        best = item;
        bestDelta = delta;
      }
    }

    const maxPop = Math.max(...sameDay.map((it) => it.pop ?? 0));
    return NextResponse.json(
      buildWeather(best, Math.round(maxPop * 100), true)
    );
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 404 });
  }
}
