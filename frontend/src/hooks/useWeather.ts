import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Weather } from '../types.weather'

export function useWeather(city: string = '上海') {
  const [weather, setWeather] = useState<Weather | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api
      .weather(city)
      .then((data) => {
        if (!cancelled) setWeather(data)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [city])

  return { weather, loading, error }
}
