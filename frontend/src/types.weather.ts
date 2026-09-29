export type ForecastDay = { date: string; day_label: string; temp_max: number; temp_min: number; condition: string; icon: string }
export type Weather = {
  city: string
  temperature: number
  feels_like: number
  condition: string
  icon: string
  wind_speed: number
  humidity: number
  weather_type: 'sunny' | 'cloudy' | 'rain' | 'snow' | 'thunder'
  forecast: ForecastDay[]
  source: string
}

export type Mood = '轻盈' | '平静' | '疲惫' | '期待' | '有点丧'
