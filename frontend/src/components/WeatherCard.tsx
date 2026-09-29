import { Cloud, CloudRain, CloudSnow, Droplets, Sun, Wind, Zap } from 'lucide-react'
import { useWeather } from '../hooks/useWeather'
import type { Weather } from '../types.weather'

const weatherIcons = {
  sunny: <Sun size={16} />,
  cloudy: <Cloud size={16} />,
  rain: <CloudRain size={16} />,
  snow: <CloudSnow size={16} />,
  thunder: <Zap size={16} />,
}

function WeatherScene({ type }: { type: Weather['weather_type'] }) {
  return (
    <div className={`weather-scene scene-${type}`} aria-hidden>
      {/* 太阳 + 旋转光线 */}
      <span className="w-sun">
        <span className="w-sun-core" />
        <span className="w-sun-rays" />
      </span>
      {/* 云朵飘动 */}
      <span className="w-cloud w-cloud-a" />
      <span className="w-cloud w-cloud-b" />
      <span className="w-cloud w-cloud-c" />
      {/* 雨滴 */}
      {type === 'rain' || type === 'thunder'
        ? Array.from({ length: 9 }, (_, i) => <span key={i} className="w-drop" style={{ left: `${8 + i * 10}%`, animationDelay: `${i * 0.28}s` }} />)
        : null}
      {/* 雪花 */}
      {type === 'snow'
        ? Array.from({ length: 8 }, (_, i) => <span key={i} className="w-flake" style={{ left: `${6 + i * 12}%`, animationDelay: `${i * 0.9}s` }} />)
        : null}
      {/* 闪电 */}
      {type === 'thunder' ? <span className="w-bolt">⚡</span> : null}
    </div>
  )
}

export function WeatherCard({ city = '上海' }: { city?: string }) {
  const { weather, loading, error } = useWeather(city)

  return (
    <div className={`weather-card live-card ${weather ? `wt-${weather.weather_type}` : ''}`}>
      <div className="weather-top">
        <div>
          <span className="tiny-cap">{weather ? `${weather.city} · 实时天气` : 'WEATHER · LIVE'}</span>
          {loading ? (
            <h3 className="weather-loading">
              正在读取天空<span className="w-dots"><i /><i /><i /></span>
            </h3>
          ) : error || !weather ? (
            <h3>天气<br /><em>暂时离线。</em></h3>
          ) : (
            <h3>
              {weather.temperature}°<br />
              <em>{weather.condition}。</em>
            </h3>
          )}
        </div>
        <div className="weather-badge">{weather ? weather.icon : '☀️'}</div>
      </div>

      {weather && (
        <>
          <WeatherScene type={weather.weather_type} />
          <div className="weather-meta">
            <span><Droplets size={13} /> 湿度 {weather.humidity}%</span>
            <span><Wind size={13} /> {weather.wind_speed} km/h</span>
            <span>体感 {weather.feels_like}°</span>
          </div>
          <div className="weather-forecast">
            {weather.forecast.map((day) => (
              <div key={day.date} className="forecast-day">
                <span className="forecast-label">{day.day_label}</span>
                <span className="forecast-icon">{day.icon}</span>
                <span className="forecast-temp">{Math.round(day.temp_min)}° / {Math.round(day.temp_max)}°</span>
                <span className="forecast-cond">{day.condition}</span>
              </div>
            ))}
          </div>
          <div className="weather-bottom">
            <span>{weather.weather_type === 'sunny' ? '今天宜出门走走' : weather.weather_type === 'rain' || weather.weather_type === 'thunder' ? '记得带伞出门' : weather.weather_type === 'snow' ? '注意保暖防滑' : '适合慢慢来'}</span>
            <span className="weather-source">{weather.source === 'offline-fallback' ? '离线数据' : 'open-meteo'}</span>
          </div>
          <div className="weather-lines" />
        </>
      )}
      {!weather && <div className="weather-lines" />}
    </div>
  )
}

export { weatherIcons }
