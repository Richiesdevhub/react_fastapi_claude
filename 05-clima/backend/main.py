"""Clima actual de una ciudad usando la API gratuita de Open-Meteo (sin API key).

Ejecutar:   uv run fastapi dev main.py
Docs:       http://localhost:8000/docs
"""

import httpx
from fastapi import APIRouter, FastAPI, HTTPException, Query
from pydantic import BaseModel

app = FastAPI(title="API del Clima")
router = APIRouter(prefix="/api")

GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"

# Códigos WMO que devuelve Open-Meteo -> texto en español.
WEATHER_CODES = {
    0: "Despejado",
    1: "Mayormente despejado",
    2: "Parcialmente nublado",
    3: "Nublado",
    45: "Niebla",
    48: "Niebla con escarcha",
    51: "Llovizna ligera",
    53: "Llovizna moderada",
    55: "Llovizna intensa",
    56: "Llovizna helada ligera",
    57: "Llovizna helada intensa",
    61: "Lluvia ligera",
    63: "Lluvia moderada",
    65: "Lluvia fuerte",
    66: "Lluvia helada ligera",
    67: "Lluvia helada fuerte",
    71: "Nieve ligera",
    73: "Nieve moderada",
    75: "Nieve fuerte",
    77: "Granos de nieve",
    80: "Chubascos ligeros",
    81: "Chubascos moderados",
    82: "Chubascos violentos",
    85: "Chubascos de nieve ligeros",
    86: "Chubascos de nieve fuertes",
    95: "Tormenta",
    96: "Tormenta con granizo ligero",
    99: "Tormenta con granizo fuerte",
}


class Weather(BaseModel):
    city: str
    country: str
    temperature_c: float
    wind_kmh: float
    description: str


# PASO CLAVE 1: el backend actúa como intermediario (proxy) de la API externa.
# Ventajas: el navegador no llama directo a terceros (sin problemas de CORS), podrías
# esconder una API key y puedes dar a tu frontend un formato simple y estable.
async def get_json(client: httpx.AsyncClient, url: str, params: dict) -> dict:
    response = await client.get(url, params=params)
    response.raise_for_status()
    return response.json()


@router.get("/weather")
# PASO CLAVE 2: Query(min_length=2) valida el parámetro ?city=... automáticamente.
async def weather(city: str = Query(min_length=2, max_length=80)) -> Weather:
    try:
        # PASO CLAVE 3: httpx.AsyncClient + await = no bloqueamos el servidor mientras
        # esperamos a la API externa. timeout evita quedarnos esperando para siempre.
        async with httpx.AsyncClient(timeout=10) as client:
            geo = await get_json(
                client,
                GEOCODING_URL,
                {"name": city.strip(), "count": 1, "language": "es", "format": "json"},
            )
            # Si no hay coincidencias, Open-Meteo omite la clave "results".
            if not geo.get("results"):
                raise HTTPException(status_code=404, detail="Ciudad no encontrada")
            place = geo["results"][0]

            forecast = await get_json(
                client,
                FORECAST_URL,
                {
                    "latitude": place["latitude"],
                    "longitude": place["longitude"],
                    "current": "temperature_2m,wind_speed_10m,weather_code",
                },
            )
    except httpx.HTTPError:
        # PASO CLAVE 4: 502 = "Bad Gateway": falló un servicio externo, no tu código.
        raise HTTPException(status_code=502, detail="No se pudo consultar el servicio del clima")

    current = forecast["current"]
    return Weather(
        city=place["name"],
        country=place.get("country", ""),
        temperature_c=current["temperature_2m"],
        wind_kmh=current["wind_speed_10m"],
        description=WEATHER_CODES.get(current["weather_code"], "Desconocido"),
    )


app.include_router(router)
