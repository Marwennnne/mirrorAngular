import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { Forecast } from './models/forecast';
import { City } from './models/city';

@Injectable()
export class AppService {
  private apiKey = '31f7cbea88e9a5833180ba8797abd4d5'
  private apiKeyNews = "dc1c0ee9fbaa40c5a82e125846fd1402";
  private baseURL = 'http://api.openweathermap.org/data/2.5/'
  private long: string ="36.8065";
  private lat: string ="10.1815";
  private city: City = new City();
  private forecasts: Forecast[] = new Array<Forecast>();
  private search: string ="Tunisie"

  private sixteenDaysForecastURL = `${this.baseURL}forecast?lat=${this.lat}&lon=${this.long}&appid=${this.apiKey}&lang=fr`;
  private currentWeatherURL = `${this.baseURL}weather?lat=36.8453878&lon=10.1894707&units=metric&appid=${this.apiKey}&lang=fr`;
  private newsURL = `https://newsapi.org/v2/everything?q=${this.search}&apiKey=${this.apiKeyNews}`;
  constructor(private http: HttpClient) { }

  getEphemeris(): Observable<any> {
    return this.http.get('assets/json/ephemeris.json');
  }

  getNews() {
    return this.http
    .get(this.newsURL)
  }

  setPosition(longitude,latitude){
    this.long = longitude;
    this.lat = latitude;
    this.sixteenDaysForecastURL = `${this.baseURL}forecast?lat=${this.lat}&lon=${this.long}&appid=${this.apiKey}&lang=fr`;
  }

  setSearch(data: string){
    this.search = data;
    this.newsURL = `https://newsapi.org/v2/everything?q=${this.search}&apiKey=${this.apiKeyNews}`;
  }

  getCity(){
    return this.http
      .get(this.sixteenDaysForecastURL)
  }

  getCurrentWeather() {
    return this.http
      .get(this.currentWeatherURL)

  }

  getSixteenDaysForecast() {
    return this.http
      .get(this.sixteenDaysForecastURL)
  }


}
