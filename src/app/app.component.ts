import {Component, OnInit} from "@angular/core";
import {AppService} from './app.service';
import { Forecast } from './models/forecast';
import { City } from './models/city';
import { WebSocketService } from './socket.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [
    './app.component.css',
    'normalize.css'
  ]
})
export class AppComponent implements OnInit{
  title = 'dummyApp-YTIFrameAPI';
  mirror: any;
  /* 1. Some required variables which will be used by YT API*/
  public YT: any;
  public video: any;
  public player: any;
  public reframed: Boolean = false;
  public visibleTime: Boolean = true;
  public visibleNote: Boolean = true;
  public visibleNews: Boolean = true;
  public visibleQuote: Boolean = true;
  public visibleWeather: Boolean = true;
  public visibleVideo: Boolean = true;
  public notes: String[] = [];


  isRestricted = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);


  now: Date = new Date();
  city: City = new City();
  ephemeris: any;
  quote: any;
  index: number;
  headlines: string[];
  headlinesShow: string[];
  sixteenDaysForecast: Forecast[] = [];
  currentWeather: Forecast = new Forecast();
  error: any;

  constructor(
    private appService: AppService,
    private webSocketService: WebSocketService
  ) {}

  init() {
    // Return if Player is already created
    if (window['YT']) {
      this.startVideo();
      return;
    }

    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    /* 3. startVideo() will create an <iframe> (and YouTube player) after the API code downloads. */
    window['onYouTubeIframeAPIReady'] = () => this.startVideo();
  }
  toggleVideo() {
    if (this.visibleVideo)
      this.visibleVideo = false;
    else {
      this.visibleVideo = true;
      setTimeout(() => {
        this.init()
      })
    }
  }

  startVideo() {
    this.reframed = false;
    this.player = new window['YT'].Player('player', {
      videoId: this.video,
      playerVars: {
        autoplay: 1,
        modestbranding: 1,
        controls: 1,
        disablekb: 1,
        rel: 0,
        showinfo: 0,
        fs: 0,
        playsinline: 1

      },
      events: {
        'onStateChange': this.onPlayerStateChange.bind(this),
        'onError': this.onPlayerError.bind(this),
        'onReady': this.onPlayerReady.bind(this),
      }
    });
  }

  /* 4. It will be called when the Video Player is ready */
  onPlayerReady(event) {
    if (this.isRestricted) {
      event.target.mute();
      event.target.playVideo();
    } else {
      event.target.playVideo();
    }
  }

  /* 5. API will call this function when Player State changes like PLAYING, PAUSED, ENDED */
  onPlayerStateChange(event) {
    console.log(event)
    switch (event.data) {
      case window['YT'].PlayerState.PLAYING:
        if (this.cleanTime() == 0) {
          console.log('started ' + this.cleanTime());
        } else {
          console.log('playing ' + this.cleanTime())
        };
        break;
      case window['YT'].PlayerState.PAUSED:
        if (this.player.getDuration() - this.player.getCurrentTime() != 0) {
          console.log('paused' + ' @ ' + this.cleanTime());
        };
        break;
      case window['YT'].PlayerState.ENDED:
        console.log('ended ');
        break;
    };
  };

  cleanTime() {
    return Math.round(this.player.getCurrentTime())
  };

  onPlayerError(event) {
    switch (event.data) {
      case 2:
        console.log('' + this.video)
        break;
      case 100:
        break;
      case 101 || 150:
        break;
    };
  };

  getDate(): void {
    setInterval(() => {
      this.now = new Date();
    }, 1000);
  }
  getNews(): void {
    this.appService.getNews()
    .subscribe((response :any) => {
      var headlines = [];
      let data = response;
      console.log(data)
      data.articles.forEach(element => {
        headlines.push(element.title);
      });
      this.headlines = headlines;
      this.headlinesShow = headlines.slice(0,9);
      console.log(this.headlinesShow)
      this.index = 0;
    })
    setInterval(() => {
      if( this.index + 18 <= this.headlines.length) {
        this.index += 9;
        this.headlinesShow = this.headlines.slice(this.index,this.index+9);
        console.log(this.headlinesShow)
      }
    },30000)
    setInterval(() => {
      this.appService.getNews()
      .subscribe((response :any) => {
        var headlines = [];
        let data = response;
        console.log(data)
        data.articles.forEach(element => {
          headlines.push(element.title);
        });
        this.headlines = headlines;
        this.headlinesShow = headlines.slice(0,9);
        this.index = 0;
;
      })
    }, 3600000);
  }

  getQuote(): void {
    this.appService.getEphemeris().subscribe(res => {
      res.forEach(eph => {
        const day = this.now.getDate();
        const month = this.now.getMonth() + 1;
        if (eph.date.jour === day && eph.date.mois === month) {
          const quotes = eph.quotes;
          this.quote = quotes[Math.floor((Math.random() * quotes.length))];
        }
      });
    }, error => {
      console.log(error);
    });
  }

  getEphemeris():void {
    this.appService.getEphemeris().subscribe(res => {
      res.forEach(eph => {
        const day = this.now.getDate();
        const month = this.now.getMonth() + 1;
        if (eph.date.jour === day && eph.date.mois === month) {
          this.ephemeris = eph.fete;
        }
      });
    }, error => {
      console.log(error);
    });
  }

  getCity(): void {
    this.appService.getCity()
    .subscribe((response : any) => {
      this.city.id = response.city.id;
      this.city.name = response.city.name;
      this.city.country = response.city.country;
      this.city.coord.lon = response.city.coord.lon;
      this.city.coord.lat = response.city.coord.lat;
    });
  }

  getCurrentWeather(): void {
    this.appService.getCurrentWeather()
    .subscribe((response : any) => {
      const data = response
      const currentWeather: Forecast = new Forecast();
      currentWeather.date = new Date(data.dt * 1000).toLocaleDateString('fr-FR', {weekday: 'long', month: 'long', day: 'numeric'});
      currentWeather.weather = data.weather[0].description;
      currentWeather.icon = 'assets/img/weather/' + data.weather[0].icon + '.svg' ;
      currentWeather.clouds = data.clouds.all;
      currentWeather.humidity = data.main.humidity;
      currentWeather.pressure = data.main.pressure;
      currentWeather.windSpeed = data.wind.speed;
      currentWeather.dayTemperature = data.main.temp;
      currentWeather.maxTemperature = data.main.temp_max;
      currentWeather.minTemperature = data.main.temp_min;
      currentWeather.class = 'c' + data.weather[0].icon;
      this.currentWeather = currentWeather;
    });
  }

  getForecasts(): void {
    this.appService.getSixteenDaysForecast()
    .subscribe((response: any) => {
      var i=0;
      var countDays = 0;
      var now = new Date().getDay();
      //La boucle commence à l'indice d'itération 1. L'indice 0 représente le jour actuel, qui ne nous intéresse pas ici
      while( countDays<5 ){
        const element = response.list[i];
        const forecast = new Forecast();
        if( now != new Date(element.dt * 1000).getDay() ){
          forecast.date = new Date(element.dt * 1000).toLocaleDateString('fr-FR', {weekday: 'long'});
          now = new Date(element.dt * 1000).getDay();
          forecast.icon = 'assets/img/weather/' + element.weather[0].icon + '.svg' ;
          forecast.dayTemperature = +element.main.temp - 273.15;
          this.sixteenDaysForecast.push(forecast);
          countDays++;
        }
        i++;
      }
    })
  }

  ngOnInit() {
    
    this.getNews();
    this.getDate();
    this.getEphemeris();
    this.getQuote();
    this.getCity();
    this.getCurrentWeather();
    this.getForecasts();
    setInterval(() => {
      this.getEphemeris();
      this.getQuote();
      this.getCity();
      this.getCurrentWeather();
      this.getForecasts();
    }, 60000);

    this.webSocketService.getMessage().subscribe( (response :any) => {
      this.appService.setPosition(response.longitude,response.latitude);
      this.visibleNews = response.news;
      this.visibleQuote = response.quotes
      this.visibleNote = response.note;
      this.visibleTime = response.timing;
      this.visibleVideo = response.video;
      this.visibleWeather = response.forecast;
      console.log('weather',response.forecast)
      if( this.visibleVideo ){
        this.video = response.searchQuery;
        this.init();
      }
      this.appService.setSearch(response.searchQuery)
      this.notes = response.notesList ? response.notesList : [] ;
      
      this.getNews();
      this.getDate();
      this.getEphemeris();
      this.getQuote();
      this.getCity();
      this.getCurrentWeather();
      this.getForecasts();
      setInterval(() => {
        this.getEphemeris();
        this.getQuote();
        this.getCity();
        this.getCurrentWeather();
        this.getForecasts();
      }, 60000);
    })

  }

  testSocket(){
    this.webSocketService.sendMessage("hello");
  }

}
