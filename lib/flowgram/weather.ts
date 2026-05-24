import { WeatherData, WeatherAdvice } from "@/lib/flowgram/types";

export function getWeatherAdvice(weather: WeatherData): WeatherAdvice[] {
  const advice: WeatherAdvice[] = [];

  if (weather.rain_probability > 40) {
    advice.push({
      message:
        weather.rain_probability > 70
          ? "Rain is very likely today. Bring an umbrella!"
          : "There's a chance of rain. Consider bringing an umbrella.",
      item: "Umbrella",
      severity: weather.rain_probability > 70 ? "warning" : "info",
    });
  }

  if (weather.snow) {
    advice.push({
      message: "Snow expected today. Wear winter boots and dress warmly.",
      item: "Winter boots",
      severity: "warning",
    });
    advice.push({
      message: "Don't forget gloves for the cold!",
      item: "Gloves",
      severity: "warning",
    });
  }

  if (weather.temp < 0) {
    advice.push({
      message: `It's ${weather.temp}°C outside. Bundle up warmly!`,
      item: "Winter jacket",
      severity: "warning",
    });
  } else if (weather.temp < 10) {
    advice.push({
      message: `It's ${weather.temp}°C outside. Bring a warm layer.`,
      item: null,
      severity: "info",
    });
  } else if (weather.temp > 30) {
    advice.push({
      message: `It's ${weather.temp}°C outside. Stay hydrated!`,
      item: "Water bottle",
      severity: "warning",
    });
  }

  if (weather.wind_speed > 40) {
    advice.push({
      message: "Strong winds today. Secure loose items.",
      item: null,
      severity: "warning",
    });
  }

  return advice;
}

export async function fetchWeather(
  city: string,
  countryCode: string
): Promise<WeatherData | null> {
  try {
    const res = await fetch(
      `/api/flowgram/weather?city=${encodeURIComponent(city)}&country=${encodeURIComponent(countryCode)}`
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
