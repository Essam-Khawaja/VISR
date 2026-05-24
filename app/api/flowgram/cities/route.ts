/**
 * /api/flowgram/cities
 *
 * Nominatim (OpenStreetMap) proxy used by the city autocomplete in
 * Settings. Keeps the User-Agent and rate limits server-side.
 */
import { NextRequest, NextResponse } from "next/server";
import { CityResult } from "@/lib/flowgram/types";

type NominatimResult = {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  type?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    hamlet?: string;
    municipality?: string;
    state?: string;
    province?: string;
    country?: string;
    country_code?: string;
  };
};

const COUNTRY_NAME_TO_ISO: Record<string, string> = {};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const country = searchParams.get("country");

  if (!q || q.trim().length < 2) {
    return NextResponse.json([]);
  }

  try {
    const params = new URLSearchParams({
      q: q.trim(),
      format: "jsonv2",
      addressdetails: "1",
      limit: "10",
      featuretype: "city",
    });

    if (country && country.length === 2) {
      params.set("countrycodes", country.toLowerCase());
    }

    const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "VISR/1.0 (hackathon student app)",
      },
    });

    if (!res.ok) {
      return NextResponse.json([]);
    }

    const raw: NominatimResult[] = await res.json();

    const seen = new Set<string>();
    const results: CityResult[] = [];

    for (const r of raw) {
      const cityName =
        r.address?.city ??
        r.address?.town ??
        r.address?.village ??
        r.address?.hamlet ??
        r.address?.municipality ??
        r.display_name.split(",")[0];

      const state = r.address?.state ?? r.address?.province;
      const countryName = r.address?.country ?? "";
      const countryCode = (r.address?.country_code ?? "").toUpperCase();

      const dedupeKey = `${cityName}|${state}|${countryCode}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      if (countryName && countryCode) {
        COUNTRY_NAME_TO_ISO[countryName] = countryCode;
      }

      results.push({
        name: cityName,
        state,
        country: countryName,
        country_code: countryCode,
        lat: parseFloat(r.lat),
        lon: parseFloat(r.lon),
      });

      if (results.length >= 8) break;
    }

    return NextResponse.json(results);
  } catch {
    return NextResponse.json([]);
  }
}
