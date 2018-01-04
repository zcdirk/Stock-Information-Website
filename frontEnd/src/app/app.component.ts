import {Component, OnInit } from '@angular/core';
import {Http} from '@angular/http';
import {Chart} from 'angular-highcharts';
import {ChartComponent} from 'angular2-highcharts';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

// const AUTO_URL = 'http://zcstock.us-east-1.elasticbeanstalk.com/auto/';
// const GET_QUOTE_URL = 'http://zcstock.us-east-1.elasticbeanstalk.com/getstock/';
const AUTO_URL = 'http://zcstock.us-east-1.elasticbeanstalk.com/auto/';
const GET_QUOTE_URL = 'http://zcstock.us-east-1.elasticbeanstalk.com/getstock/';
const REFRESH_URL = 'http://zcstock.us-east-1.elasticbeanstalk.com/refresh/';
const EXPORT_URL = 'http://zcstock.us-east-1.elasticbeanstalk.com/export/';

declare var FB: any;
var autoCompleteEnable: boolean;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('stepTransition', [
      state('previous', style({transform: 'translate3d(-100%, 0, 0)', visibility: 'hidden'})),
      state('current', style({transform: 'none', visibility: 'visible'})),
      state('next', style({transform: 'translate3d(100%, 0, 0)', visibility: 'hidden'})),
      transition('* => *', animate('500ms cubic-bezier(0.35, 0, 0.25, 1)'))
    ])
  ]
})


export class AppComponent implements OnInit {
  stockSymbol = "";            // the quote input
  left = 'current';       // animation state of the left panel
  right = 'previous';     // animation state of the right panel
  leftDisplay = 'block';  // display stype of the left panel
  rightDisplay = 'none';  // display stype of the right panel
  options;                // options of the autocomplete
  ascend = 'true';        // record ascending or descending
  ascendDisable = true;
  currentStock = {};           // all the current stock information
  favoriteList = [];
  inputValid = true;
  quoteDisable = true;
  autoRefresh = false;
  refreshHandler;
  ind = "price";

  constructor(private http: Http) {
    (<any>window).fbAsyncInit = function () {
      FB.init({
        appId: '1901222133529504',
        xfbml: true,
        version: 'v2.5'
      });
    };
  }

  ngOnInit() {
    /*let parent = document.querySelector("mat-tab-group");
     let child = document.querySelector("mat-tab-header");
     parent.removeChild(child);*/
    autoCompleteEnable = true;

    if (localStorage.getItem('favorites') == null) {
      localStorage.setItem('favorites', '[]');
    } else {
      this.favoriteList = JSON.parse(localStorage.getItem('favorites'));
    }

    var js, id = 'facebook-jssdk', ref = document.getElementsByTagName('script')[0];
    if (document.getElementById(id)) return;
    js = document.createElement('script');
    js.id = id;
    js.async = true;
    js.src = '//connect.facebook.net/en_US/sdk.js';
    ref.parentNode.insertBefore(js, ref);
  }

  login() {
    FB.login(function (response) {
      if (response.authResponse) {
        FB.api('/me', function (response) {
          this.name = response.name;
          this.isUser = true
        });
      } else {
        console.log('User cancelled login or did not fully authorize.');
      }
    });
  }

  autoComplete() {
    if (this.stockSymbol === undefined || this.stockSymbol.trim() === "") {
      this.quoteDisable = true;
    } else {
      this.quoteDisable = false;
    }

    if (autoCompleteEnable === false) {
      let that = this;
      setTimeout(function() { that.autoComplete(); }, 800);
      return;
    }
    if (this.stockSymbol.trim() === "" || this.stockSymbol === undefined) {
      this.inputValid = false;
      this.options = [];
    } else {
      this.inputValid = true;
      this.http.get(AUTO_URL + this.stockSymbol).subscribe(res => {
          this.options = res.json();
        },
        () => {
          console.log('Unable to get the messages');
        });
    }
    autoCompleteEnable = false;
    setTimeout(function() {
      autoCompleteEnable = true;
    }, 800);
  }

  checkFav() {
    let favorites = JSON.parse(localStorage.getItem('favorites'));
    this.currentStock["favorite"] = false;
    for (let i in favorites) {
      if (favorites[i].symbol === this.stockSymbol) {
        this.currentStock["favorite"] = true;
        break;
      }
    }
  }

  getQuote() {
    this.currentStock = {};
    this.moveRight();

    this.checkFav();

    this.http.get(GET_QUOTE_URL + 'table/' + this.stockSymbol.toUpperCase()).subscribe(res => {
        let data = res.json();
        if (data.error === true) {
          this.currentStock["price"] = {"error" : true};
          this.currentStock["historical"] = {"error" : true};
          this.currentStock["table"] = {"error" : true};
          return;
        }
        this.currentStock["price"] = data["price"];
        this.currentStock["historical"] = data["historical"];
        this.currentStock["table"] = data["table"];
        // price
        this.currentStock["price"].yAxis[1].labels['formatter'] = function () {
          return this.value / 1000000 + 'M';
        };
        this.currentStock['indicator'] = 'price';
      },
      () => {
        this.currentStock["price"] = {"error" : true};
        this.currentStock["historical"] = {"error" : true};
        this.currentStock["table"] = {"error" : true};
      });

    let that = this;
    this.getChart(that, 'sma', 500);
    this.getChart(that, 'ema', 1000);
    this.getChart(that, 'stoch', 1500);
    this.getChart(that, 'rsi', 2000);
    this.getChart(that, 'adx', 2500);
    this.getChart(that, 'cci', 3000);
    this.getChart(that, 'bbands', 3500);
    this.getChart(that, 'macd', 4000);
    this.getChart(that, 'news', 4500);
  }

  getChart(that, str, time) {
    setTimeout(function(){
      that.http.get(GET_QUOTE_URL + str + '/' + that.stockSymbol).subscribe(res => {
        if (res["error"] === true) {
            this.currentStock[str] = {"error" : true};
            return;
          }
          that.currentStock[str] = res.json();
        },
        () => {
          that.currentStock[str] = {"error" : true};
        });
    }, time);
  }

  sortFavorites() {
    let sortBy = document.querySelector("#sortBy")["value"];
    if (sortBy === 'default') {
      this.ascendDisable = true;
      this.favoriteList = JSON.parse(localStorage.getItem('favorites'));
      if (this.ascend == 'false') this.favoriteList.reverse();
    } else if (sortBy === 'symbol') {
      this.ascendDisable = false;
      let favorites = JSON.parse(localStorage.getItem('favorites'));
      favorites.sort((a, b) => {
        let aU = a.symbol.toUpperCase(), bU = b.symbol.toUpperCase();
        if (aU > bU) {
          return this.ascend == 'true' ? 1 : -1;
        } else if (aU < bU) {
          return this.ascend === 'true' ? -1 : 1;
        }
        return 0;
      });
      this.favoriteList = favorites;
    } else {
      this.ascendDisable = false;
      let favorites = JSON.parse(localStorage.getItem('favorites'));
      favorites.sort((a, b) => {
        return this.ascend == 'true' ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy];
      });
      this.favoriteList = favorites;
    }
  }

  clear() {
    this.moveLeft();
    this.stockSymbol = "";
    this.currentStock = {};
    this.options = [];
    this.inputValid = true;
  }

  deleteRow(row) {
    let favorites = JSON.parse(localStorage.getItem('favorites'));
    if (this.stockSymbol === row["symbol"]) {
      this.currentStock["favorite"] = false;
    }
    for (let i = 0; i < favorites.length; i++) {
      if (favorites[i]["symbol"] === row["symbol"]) {
        favorites.splice(i, 1);
        break;
      }
    }
    this.favoriteList = favorites;
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }

  moveRight() {
    this.leftDisplay = 'none';
    this.rightDisplay = 'block';
    this.left = 'next';
    this.right = 'current';
  }

  moveLeft() {
    this.leftDisplay = 'block';
    this.rightDisplay = 'none';
    this.left = 'current';
    this.right = 'previous';
  }

  shareOnFacebook() {
    let ind = document.querySelector("#indicator .active a").innerHTML.toLowerCase();
    let current = this.currentStock[ind];
    let data = {
      "async": true,
      "type": "png",
      "width": 400,
      "options": current
    };
    this.http.post('http://export.highcharts.com/', data).subscribe(res => {
        let path = res["_body"];
        let exportUrl = 'http://export.highcharts.com/';
        FB.ui({
          method: 'feed',
          picture: exportUrl + path,
        }, function (response) {
          if (response === undefined) {
            alert("Note Posted");
          } else {
            alert("Posted Successfully");
          }
        });
      },
      () => {
        console.log('Unable to get the messages');
      });

  }

  addToFavorite() {
    let favorites = JSON.parse(localStorage.getItem('favorites'));
    if (this.currentStock["favorite"] === true) {
      this.currentStock["favorite"] = false;
      for (let i = 0; i < favorites.length; i++) {
        if (favorites[i]["symbol"] === this.currentStock['table']['symbol']) {
          favorites.splice(i, 1);
          break;
        }
      }
    } else {
      this.currentStock["favorite"] = true;
      favorites.push({
        symbol: this.currentStock['table']['symbol'],
        price: this.currentStock["table"].price,
        change: this.currentStock["table"].change,
        percent: this.currentStock["table"].percent,
        volume: this.currentStock["table"].volume,
      });
    }
    this.favoriteList = favorites;
    let str = JSON.stringify(favorites);
    localStorage.setItem('favorites', str);
  }

  validationCheck() {
    if (this.stockSymbol === undefined || this.stockSymbol.trim() === "") {
      this.inputValid = false;
    } else {
      this.inputValid = true;
    }
  }

  setAutoRefresh(event) {
    if (event.srcElement.classList[0] !== 'btn') return;
    if (this.autoRefresh === true) {
      this.autoRefresh = false;
      clearInterval(this.refreshHandler);
    } else {
      this.autoRefresh = true;
      this.refreshOnce();
      let that = this;
      this.refreshHandler = setInterval(function () {
        let favorites = JSON.parse(localStorage.getItem('favorites'));
        that.http.post(REFRESH_URL, favorites).subscribe(res => {
            that.favoriteList = res.json();
            localStorage.setItem('favorites', JSON.stringify(that.favoriteList));
            that.sortFavorites();
          },
          () => {
            console.log("error");
          });
      }, 5000);
    }
  }

  refreshOnce() {
    let favorites = JSON.parse(localStorage.getItem('favorites'));
    this.http.post(REFRESH_URL, favorites).subscribe(res => {
        this.favoriteList = res.json();
        localStorage.setItem('favorites', JSON.stringify(this.favoriteList));
        this.sortFavorites();
      },
      () => {
        console.log("error");
      });
  }

  moveTo(symbol) {
    this.inputValid = true;
    if (this.stockSymbol === symbol) {
      this.moveRight();
    } else {
      this.stockSymbol = symbol;
      this.getQuote();
    }
  }

  isEmpty(obj) {
    return Object.keys(obj).length === 0;
  }

  changeTo(str) {
    this.ind = str;
  }
}
