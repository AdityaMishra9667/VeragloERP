/** Weather proxy — Open-Meteo (no API key) with optional OpenWeather fallback. */

const cache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000;

function cacheKey(parts) {
  return JSON.stringify(parts);
}

function readCache(key) {
  const row = cache.get(key);
  if (!row) return null;
  if (Date.now() - row.ts > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return row.data;
}

function writeCache(key, data) {
  cache.set(key, { ts: Date.now(), data });
}

function classifyCondition(wmoCode, isDay) {
  const code = Number(wmoCode);
  if (!isDay && code <= 3) return "night";
  if (code === 0) return "clear";
  if (code >= 1 && code <= 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 95) return "storm";
  return "cloudy";
}

function labelForCondition(condition) {
  return {
    clear: "Clear sky",
    cloudy: "Cloudy",
    rain: "Rain",
    fog: "Foggy",
    storm: "Thunderstorm",
    night: "Clear night",
    snow: "Snow",
    default: "Fair",
  }[condition] || "Fair";
}

async function geocodeCity(name) {
  const q = String(name || "").trim();
  if (!q) return null;
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Geocoding failed");
  const data = await res.json();
  const hit = (data.results || [])[0];
  if (!hit) return null;
  return {
    lat: hit.latitude,
    lon: hit.longitude,
    name: [hit.name, hit.admin1, hit.country].filter(Boolean).join(", "),
  };
}

async function fetchOpenMeteo(lat, lon) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day",
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    timezone: "auto",
    forecast_days: "1",
  });
  const url = `https://api.open-meteo.com/v1/forecast?${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather API failed");
  const data = await res.json();
  const cur = data.current || {};
  const daily = data.daily || {};
  const wmo = cur.weather_code ?? 0;
  const isDay = cur.is_day === 1;
  const condition = classifyCondition(wmo, isDay);
  const max = daily.temperature_2m_max && daily.temperature_2m_max[0];
  const min = daily.temperature_2m_min && daily.temperature_2m_min[0];
  let forecastSummary = labelForCondition(condition);
  if (max != null && min != null) {
    forecastSummary += `. High ${Math.round(max)}° · Low ${Math.round(min)}°`;
  }
  const isRaining = condition === "rain";
  const isCloudy = condition === "cloudy" || (wmo >= 1 && wmo <= 3);
  return {
    temperature: cur.temperature_2m != null ? Math.round(cur.temperature_2m) : null,
    humidity: cur.relative_humidity_2m != null ? Math.round(cur.relative_humidity_2m) : null,
    windSpeed: cur.wind_speed_10m != null ? Math.round(cur.wind_speed_10m) : null,
    wmoCode: wmo,
    isDay,
    isRaining,
    isCloudy,
    condition,
    conditionLabel: labelForCondition(condition),
    forecastSummary,
    provider: "open-meteo",
  };
}

function companyCity(state) {
  const c = (state && state.company) || {};
  return (
    c.city
    || (c.registeredAddress && c.registeredAddress.city)
    || (c.officeAddress && c.officeAddress.city)
    || (c.factoryAddress && c.factoryAddress.city)
    || ""
  );
}

export async function resolveLocation(opts) {
  const source = opts.source || "company";
  if (opts.lat != null && opts.lon != null) {
    return {
      lat: Number(opts.lat),
      lon: Number(opts.lon),
      name: opts.city || opts.name || "Your location",
    };
  }
  if (source === "manual" && opts.manualCity) {
    const geo = await geocodeCity(opts.manualCity);
    if (!geo) throw new Error("Could not find city: " + opts.manualCity);
    return geo;
  }
  if (source === "company" && opts.state) {
    const city = companyCity(opts.state);
    if (!city) throw new Error("Company city not set in Admin → Company Profile");
    const geo = await geocodeCity(city);
    if (!geo) throw new Error("Could not geocode company city: " + city);
    return geo;
  }
  if (opts.city) {
    const geo = await geocodeCity(opts.city);
    if (!geo) throw new Error("Could not find city: " + opts.city);
    return geo;
  }
  throw new Error("Location required");
}

export async function getCurrentWeather(opts = {}) {
  const loc = await resolveLocation(opts);
  const key = cacheKey({ lat: loc.lat, lon: loc.lon });
  const cached = readCache(key);
  if (cached) return { ...cached, cached: true };

  const wx = await fetchOpenMeteo(loc.lat, loc.lon);
  const payload = {
    ok: true,
    location: loc.name,
    lat: loc.lat,
    lon: loc.lon,
    updatedAt: new Date().toISOString(),
    cached: false,
    ...wx,
  };
  writeCache(key, payload);
  return payload;
}

export function weatherLoginSettings(state) {
  const s = (state && state.settings && state.settings.weatherLogin) || {};
  return {
    enabled: s.enabled !== false,
    locationSource: s.locationSource || "company",
    manualCity: s.manualCity || "",
    refreshIntervalMins: Number(s.refreshIntervalMins) || 30,
    openWeatherApiKey: s.openWeatherApiKey || process.env.OPENWEATHER_API_KEY || "",
    defaultWallpaper: s.defaultWallpaper || "assets/happy-employees.png",
    wallpapers: s.wallpapers || {},
  };
}
