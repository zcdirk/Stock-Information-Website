webpackJsonp([1,5],{

/***/ 121:
/***/ (function(module, exports) {

function webpackEmptyContext(req) {
	throw new Error("Cannot find module '" + req + "'.");
}
webpackEmptyContext.keys = function() { return []; };
webpackEmptyContext.resolve = webpackEmptyContext;
module.exports = webpackEmptyContext;
webpackEmptyContext.id = 121;


/***/ }),

/***/ 122:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser_dynamic__ = __webpack_require__(154);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__app_app_module__ = __webpack_require__(157);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__environments_environment__ = __webpack_require__(158);




if (__WEBPACK_IMPORTED_MODULE_3__environments_environment__["a" /* environment */].production) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["enableProdMode"])();
}
__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__angular_platform_browser_dynamic__["a" /* platformBrowserDynamic */])().bootstrapModule(__WEBPACK_IMPORTED_MODULE_2__app_app_module__["a" /* AppModule */]);
//# sourceMappingURL=main.js.map

/***/ }),

/***/ 156:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_http__ = __webpack_require__(59);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_animations__ = __webpack_require__(14);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



// const AUTO_URL = 'http://zcstock.us-east-1.elasticbeanstalk.com/auto/';
// const GET_QUOTE_URL = 'http://zcstock.us-east-1.elasticbeanstalk.com/getstock/';
var AUTO_URL = 'http://zcstock.us-east-1.elasticbeanstalk.com/auto/';
var GET_QUOTE_URL = 'http://zcstock.us-east-1.elasticbeanstalk.com/getstock/';
var REFRESH_URL = 'http://zcstock.us-east-1.elasticbeanstalk.com/refresh/';
var autoCompleteEnable;
var AppComponent = (function () {
    function AppComponent(http) {
        this.http = http;
        this.stockSymbol = ""; // the quote input
        this.left = 'current'; // animation state of the left panel
        this.right = 'previous'; // animation state of the right panel
        this.leftDisplay = 'block'; // display stype of the left panel
        this.rightDisplay = 'none'; // display stype of the right panel
        this.ascend = 'true'; // record ascending or descending
        this.ascendDisable = true;
        this.currentStock = {}; // all the current stock information
        this.favoriteList = [];
        this.inputValid = true;
        this.quoteDisable = true;
        this.autoRefresh = false;
        this.ind = "price";
        window.fbAsyncInit = function () {
            FB.init({
                appId: '1901222133529504',
                xfbml: true,
                version: 'v2.5'
            });
        };
    }
    AppComponent.prototype.ngOnInit = function () {
        /*let parent = document.querySelector("mat-tab-group");
         let child = document.querySelector("mat-tab-header");
         parent.removeChild(child);*/
        autoCompleteEnable = true;
        if (localStorage.getItem('favorites') == null) {
            localStorage.setItem('favorites', '[]');
        }
        else {
            this.favoriteList = JSON.parse(localStorage.getItem('favorites'));
        }
        var js, id = 'facebook-jssdk', ref = document.getElementsByTagName('script')[0];
        if (document.getElementById(id))
            return;
        js = document.createElement('script');
        js.id = id;
        js.async = true;
        js.src = '//connect.facebook.net/en_US/sdk.js';
        ref.parentNode.insertBefore(js, ref);
    };
    AppComponent.prototype.login = function () {
        FB.login(function (response) {
            if (response.authResponse) {
                FB.api('/me', function (response) {
                    this.name = response.name;
                    this.isUser = true;
                });
            }
            else {
                console.log('User cancelled login or did not fully authorize.');
            }
        });
    };
    AppComponent.prototype.autoComplete = function () {
        var _this = this;
        if (this.stockSymbol === undefined || this.stockSymbol.trim() === "") {
            this.quoteDisable = true;
        }
        else {
            this.quoteDisable = false;
        }
        if (autoCompleteEnable === false) {
            var that_1 = this;
            setTimeout(function () { that_1.autoComplete(); }, 800);
            return;
        }
        if (this.stockSymbol.trim() === "" || this.stockSymbol === undefined) {
            this.inputValid = false;
            this.options = [];
        }
        else {
            this.inputValid = true;
            this.http.get(AUTO_URL + this.stockSymbol).subscribe(function (res) {
                _this.options = res.json();
            }, function () {
                console.log('Unable to get the messages');
            });
        }
        autoCompleteEnable = false;
        setTimeout(function () {
            autoCompleteEnable = true;
        }, 800);
    };
    AppComponent.prototype.checkFav = function () {
        var favorites = JSON.parse(localStorage.getItem('favorites'));
        this.currentStock["favorite"] = false;
        for (var i in favorites) {
            if (favorites[i].symbol === this.stockSymbol) {
                this.currentStock["favorite"] = true;
                break;
            }
        }
    };
    AppComponent.prototype.getQuote = function () {
        var _this = this;
        this.currentStock = {};
        this.moveRight();
        this.checkFav();
        this.http.get(GET_QUOTE_URL + 'table/' + this.stockSymbol.toUpperCase()).subscribe(function (res) {
            var data = res.json();
            if (data.error === true) {
                _this.currentStock["price"] = { "error": true };
                _this.currentStock["historical"] = { "error": true };
                _this.currentStock["table"] = { "error": true };
                return;
            }
            _this.currentStock["price"] = data["price"];
            _this.currentStock["historical"] = data["historical"];
            _this.currentStock["table"] = data["table"];
            // price
            _this.currentStock["price"].yAxis[1].labels['formatter'] = function () {
                return this.value / 1000000 + 'M';
            };
            _this.currentStock['indicator'] = 'price';
        }, function () {
            _this.currentStock["price"] = { "error": true };
            _this.currentStock["historical"] = { "error": true };
            _this.currentStock["table"] = { "error": true };
        });
        var that = this;
        this.getChart(that, 'sma', 500);
        this.getChart(that, 'ema', 1000);
        this.getChart(that, 'stoch', 1500);
        this.getChart(that, 'rsi', 2000);
        this.getChart(that, 'adx', 2500);
        this.getChart(that, 'cci', 3000);
        this.getChart(that, 'bbands', 3500);
        this.getChart(that, 'macd', 4000);
        this.getChart(that, 'news', 4500);
    };
    AppComponent.prototype.getChart = function (that, str, time) {
        setTimeout(function () {
            var _this = this;
            that.http.get(GET_QUOTE_URL + str + '/' + that.stockSymbol).subscribe(function (res) {
                if (res["error"] === true) {
                    _this.currentStock[str] = { "error": true };
                    return;
                }
                that.currentStock[str] = res.json();
            }, function () {
                that.currentStock[str] = { "error": true };
            });
        }, time);
    };
    AppComponent.prototype.sortFavorites = function () {
        var _this = this;
        var sortBy = document.querySelector("#sortBy")["value"];
        if (sortBy === 'default') {
            this.ascendDisable = true;
            this.favoriteList = JSON.parse(localStorage.getItem('favorites'));
            if (this.ascend == 'false')
                this.favoriteList.reverse();
        }
        else if (sortBy === 'symbol') {
            this.ascendDisable = false;
            var favorites = JSON.parse(localStorage.getItem('favorites'));
            favorites.sort(function (a, b) {
                var aU = a.symbol.toUpperCase(), bU = b.symbol.toUpperCase();
                if (aU > bU) {
                    return _this.ascend == 'true' ? 1 : -1;
                }
                else if (aU < bU) {
                    return _this.ascend === 'true' ? -1 : 1;
                }
                return 0;
            });
            this.favoriteList = favorites;
        }
        else {
            this.ascendDisable = false;
            var favorites = JSON.parse(localStorage.getItem('favorites'));
            favorites.sort(function (a, b) {
                return _this.ascend == 'true' ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy];
            });
            this.favoriteList = favorites;
        }
    };
    AppComponent.prototype.clear = function () {
        this.moveLeft();
        this.stockSymbol = "";
        this.currentStock = {};
        this.options = [];
        this.inputValid = true;
    };
    AppComponent.prototype.deleteRow = function (row) {
        var favorites = JSON.parse(localStorage.getItem('favorites'));
        if (this.stockSymbol === row["symbol"]) {
            this.currentStock["favorite"] = false;
        }
        for (var i = 0; i < favorites.length; i++) {
            if (favorites[i]["symbol"] === row["symbol"]) {
                favorites.splice(i, 1);
                break;
            }
        }
        this.favoriteList = favorites;
        localStorage.setItem('favorites', JSON.stringify(favorites));
    };
    AppComponent.prototype.moveRight = function () {
        this.leftDisplay = 'none';
        this.rightDisplay = 'block';
        this.left = 'next';
        this.right = 'current';
    };
    AppComponent.prototype.moveLeft = function () {
        this.leftDisplay = 'block';
        this.rightDisplay = 'none';
        this.left = 'current';
        this.right = 'previous';
    };
    AppComponent.prototype.shareOnFacebook = function () {
        var ind = document.querySelector("#indicator .active a").innerHTML.toLowerCase();
        var current = this.currentStock[ind];
        var exportUrl = 'http://export.highcharts.com/';
        var data = {
            async: true,
            type: 'png',
            width: 400,
            options: current
        };
        this.http.post(exportUrl, data).subscribe(function (res) {
            var path = res['_body'];
            FB.ui({
                method: 'feed',
                picture: exportUrl + path,
            }, function (response) {
            });
        }, function () {
            console.log('Unable to get the messages');
        });
    };
    AppComponent.prototype.addToFavorite = function () {
        var favorites = JSON.parse(localStorage.getItem('favorites'));
        if (this.currentStock["favorite"] === true) {
            this.currentStock["favorite"] = false;
            for (var i = 0; i < favorites.length; i++) {
                if (favorites[i]["symbol"] === this.stockSymbol) {
                    favorites.splice(i, 1);
                    break;
                }
            }
        }
        else {
            this.currentStock["favorite"] = true;
            favorites.push({
                symbol: this.stockSymbol,
                price: this.currentStock["table"].price,
                change: this.currentStock["table"].change,
                percent: this.currentStock["table"].percent,
                volume: this.currentStock["table"].volume,
            });
        }
        this.favoriteList = favorites;
        localStorage.setItem('favorites', JSON.stringify(favorites));
    };
    AppComponent.prototype.validationCheck = function () {
        if (this.stockSymbol === undefined || this.stockSymbol.trim() === "") {
            this.inputValid = false;
        }
        else {
            this.inputValid = true;
        }
    };
    AppComponent.prototype.setAutoRefresh = function (event) {
        if (event.srcElement.classList[0] !== 'btn')
            return;
        if (this.autoRefresh === true) {
            this.autoRefresh = false;
            clearInterval(this.refreshHandler);
        }
        else {
            this.autoRefresh = true;
            this.refreshOnce();
            var that_2 = this;
            this.refreshHandler = setInterval(function () {
                var favorites = JSON.parse(localStorage.getItem('favorites'));
                that_2.http.post(REFRESH_URL, favorites).subscribe(function (res) {
                    that_2.favoriteList = res.json();
                    localStorage.setItem('favorites', JSON.stringify(that_2.favoriteList));
                    that_2.sortFavorites();
                }, function () {
                    console.log("error");
                });
            }, 5000);
        }
    };
    AppComponent.prototype.refreshOnce = function () {
        var _this = this;
        var favorites = JSON.parse(localStorage.getItem('favorites'));
        this.http.post(REFRESH_URL, favorites).subscribe(function (res) {
            _this.favoriteList = res.json();
            localStorage.setItem('favorites', JSON.stringify(_this.favoriteList));
            _this.sortFavorites();
        }, function () {
            console.log("error");
        });
    };
    AppComponent.prototype.moveTo = function (symbol) {
        this.inputValid = true;
        if (this.stockSymbol === symbol) {
            this.moveRight();
        }
        else {
            this.stockSymbol = symbol;
            this.getQuote();
        }
    };
    AppComponent.prototype.isEmpty = function (obj) {
        return Object.keys(obj).length === 0;
    };
    AppComponent.prototype.changeTo = function (str) {
        this.ind = str;
    };
    return AppComponent;
}());
AppComponent = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
        selector: 'app-root',
        template: __webpack_require__(224),
        styles: [__webpack_require__(220)],
        animations: [
            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__angular_animations__["a" /* trigger */])('stepTransition', [
                __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__angular_animations__["b" /* state */])('previous', __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__angular_animations__["c" /* style */])({ transform: 'translate3d(-100%, 0, 0)', visibility: 'hidden' })),
                __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__angular_animations__["b" /* state */])('current', __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__angular_animations__["c" /* style */])({ transform: 'none', visibility: 'visible' })),
                __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__angular_animations__["b" /* state */])('next', __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__angular_animations__["c" /* style */])({ transform: 'translate3d(100%, 0, 0)', visibility: 'hidden' })),
                __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__angular_animations__["d" /* transition */])('* => *', __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__angular_animations__["e" /* animate */])('500ms cubic-bezier(0.35, 0, 0.25, 1)'))
            ])
        ]
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__angular_http__["b" /* Http */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_http__["b" /* Http */]) === "function" && _a || Object])
], AppComponent);

var _a;
//# sourceMappingURL=app.component.js.map

/***/ }),

/***/ 157:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_forms__ = __webpack_require__(18);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_http__ = __webpack_require__(59);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_platform_browser_animations__ = __webpack_require__(155);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__angular_material__ = __webpack_require__(139);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_angular2_highcharts__ = __webpack_require__(165);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_angular2_highcharts___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6_angular2_highcharts__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7_angular2_highcharts_dist_HighchartsService__ = __webpack_require__(61);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7_angular2_highcharts_dist_HighchartsService___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7_angular2_highcharts_dist_HighchartsService__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__app_component__ = __webpack_require__(156);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9_highcharts_modules_exporting_src_js__ = __webpack_require__(222);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9_highcharts_modules_exporting_src_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_9_highcharts_modules_exporting_src_js__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10_highcharts_highstock__ = __webpack_require__(221);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10_highcharts_highstock___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_10_highcharts_highstock__);
/* unused harmony export highstockFactory */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppModule; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};











function highstockFactory() {
    __WEBPACK_IMPORTED_MODULE_9_highcharts_modules_exporting_src_js___default()(__WEBPACK_IMPORTED_MODULE_10_highcharts_highstock__);
    return __WEBPACK_IMPORTED_MODULE_10_highcharts_highstock__;
}
var AppModule = (function () {
    function AppModule() {
    }
    return AppModule;
}());
AppModule = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__angular_core__["NgModule"])({
        declarations: [
            __WEBPACK_IMPORTED_MODULE_8__app_component__["a" /* AppComponent */]
        ],
        imports: [
            __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__["a" /* BrowserModule */],
            __WEBPACK_IMPORTED_MODULE_2__angular_forms__["a" /* FormsModule */],
            __WEBPACK_IMPORTED_MODULE_2__angular_forms__["b" /* ReactiveFormsModule */],
            __WEBPACK_IMPORTED_MODULE_3__angular_http__["a" /* HttpModule */],
            __WEBPACK_IMPORTED_MODULE_4__angular_platform_browser_animations__["a" /* BrowserAnimationsModule */],
            __WEBPACK_IMPORTED_MODULE_5__angular_material__["a" /* MatAutocompleteModule */],
            __WEBPACK_IMPORTED_MODULE_5__angular_material__["b" /* MatTabsModule */],
            __WEBPACK_IMPORTED_MODULE_5__angular_material__["c" /* MatStepperModule */],
            __WEBPACK_IMPORTED_MODULE_6_angular2_highcharts__["ChartModule"],
        ],
        providers: [{
                provide: __WEBPACK_IMPORTED_MODULE_7_angular2_highcharts_dist_HighchartsService__["HighchartsStatic"],
                useFactory: highstockFactory
            }],
        bootstrap: [__WEBPACK_IMPORTED_MODULE_8__app_component__["a" /* AppComponent */]]
    })
], AppModule);

//# sourceMappingURL=app.module.js.map

/***/ }),

/***/ 158:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return environment; });
var environment = {
    production: true
};
//# sourceMappingURL=environment.js.map

/***/ }),

/***/ 220:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(52)();
// imports


// module
exports.push([module.i, ".jumbotron {\n  margin: auto;\n  border-radius: 1rem;\n  background-color: white;\n  padding: 20px 0 65px 0;\n}\n\n.control-label {\n  text-align: left;\n}\n\nform {\n  padding-top: 5px;\n}\n\n.jumbotron .panel {\n  width: 96%;\n  margin: auto;\n}\n\n.red-input {\n  border: 2px solid red;\n}\n\n.panel table {\n  width: 95%;\n  margin: auto;\n  margin-bottom: 20px\n}\n\n.change-up {\n  color: #5be122;\n}\n\n.change-down {\n  color: red;\n}\n\n\ntd img {\n  height: 15px;\n}\n\ntd div {\n  display: inline;\n}\n\n\n.progress-container {\n  padding-top: 150px;\n  padding-bottom: 150px;\n}\n\nchart {\n  display: block;\n  width: 100%;\n}\n\nbutton.plain, .well {\n  background-image: none;\n}\n\n.panel form {\n  padding: 15px 25px 15px 25px;\n}\n\n@media (max-width:500px) {\n  .panel form select{\n    background-image: linear-gradient(to bottom,#fff 0,#e0e0e0 100%);\n    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ffffffff', endColorstr='#ffe0e0e0', GradientType=0);\n    filter: progid:DXImageTransform.Microsoft.gradient(enabled=false);\n    background-repeat: repeat-x;\n  }\n}\n", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ 224:
/***/ (function(module, exports) {

module.exports = "<!-- TODO:\n1. delete css and js before finished.\n2. If click the favorite list, should the input be changed?\n3. select in mobile phone\n4. responsive in ipad\n5. favorite table in mobile\n6. submit ts or js?\n7. select on firefox?\n-->\n<div class=\"container\">\n  <!-- stock search part -->\n  <div class=\"jumbotron\">\n    <h3 align=\"center\">Stock Market Search</h3><br>\n    <label for=\"stockSymbol\" class=\"col-md-3 col-sm-12 control-label\">\n      Enter Stock Ticker Symbol:<label style=\"color: red\">*</label>\n    </label>\n    <div class=\"col-md-6 col-sm-12\">\n      <input type=\"text\" class=\"form-control\" id=\"stockSymbol\" [ngClass]=\"{'red-input': !inputValid }\"\n             placeholder=\"e.g. AAPL\" (keyup)=\"autoComplete()\"\n             [(ngModel)]=\"stockSymbol\" (blur)=\"validationCheck()\" [matAutocomplete]=\"auto\">\n      <div *ngIf=\"!inputValid\">Please enter a stock ticker symbol.</div>\n      <mat-autocomplete #auto=\"matAutocomplete\">\n        <mat-option *ngFor=\"let option of options\" [value]=\"option.Symbol\">\n          {{ option.Symbol }} - {{ option.Name }} ( {{ option.Exchange }} )\n        </mat-option>\n      </mat-autocomplete>\n    </div>\n    <div class=\"col-md-3 col-sm-12\">\n      <button type=\"button\" class=\"btn btn-primary\" (click)=\"getQuote()\" [disabled]=\"quoteDisable\">\n        <span class=\"glyphicon glyphicon-search\" aria-hidden=\"true\"></span>\n        Get Quote\n      </button>\n      <button type=\"button\" class=\"btn btn-default\" (click)=\"clear()\">\n        <span class=\"glyphicon glyphicon-refresh\" aria-hidden=\"true\"></span>\n        Clear\n      </button>\n    </div>\n  </div>\n  <hr>\n\n  <!--info panel part-->\n  <div class=\"jumbotron\" style=\"overflow: hidden\">\n\n    <!--favorite list part-->\n    <div class=\"panel panel-default\" [style.display]=\"leftDisplay\" [@stepTransition]=\"left\">\n\n      <div class=\"panel-heading\">\n        <b class=\"col-sm-8\">Favorit List</b>\n        <label class=\"visible-md visible-lg col-sm-2\" for=\"auto-refresh\">Automatic Refresh:</label>\n        <div style=\"display: inline\" (click)=\"setAutoRefresh($event);\">\n          <input type=\"checkbox\" id=\"auto-refresh\" data-toggle=\"toggle\">\n        </div>\n        <button type=\"button\" class=\"btn btn-default\" (click)=\"refreshOnce();\">\n          <span class=\"glyphicon glyphicon-refresh\" aria-hidden=\"true\"></span>\n        </button>\n        <button type=\"button\" class=\"btn btn-default\" (click)=\"moveRight();\" [disabled]=\"isEmpty(currentStock)\">\n          <span class=\"glyphicon glyphicon-chevron-right\" aria-hidden=\"true\"></span>\n        </button>\n      </div>\n\n      <form class=\"form-horizontal\">\n        <div class=\"form-group col-sm-4\">\n          <label for=\"sortBy\" class=\"col-sm-3 control-label\">Sort By</label>\n          <div class=\"col-sm-9\">\n            <select class=\"form-control\" (change)=\"sortFavorites()\" id=\"sortBy\" name=\"sortBy\">\n              <option selected value=\"default\">Default</option>\n              <option value=\"symbol\">Symbol</option>\n              <option value=\"price\">Price</option>\n              <option value=\"change\">Change</option>\n              <option value=\"percent\">Change Percent</option>\n              <option value=\"volume\">Volume</option>\n            </select>\n          </div>\n        </div>\n        <div class=\"form-group col-sm-4\">\n          <label for=\"order\" class=\"col-sm-3 control-label\">Order</label>\n          <div class=\"col-sm-9\">\n            <select class=\"form-control\" [disabled]=\"ascendDisable\" (change)=\"sortFavorites()\" id=\"order\" [(ngModel)]=\"ascend\" name=\"ascend\">\n              <option selected value=\"true\">Ascending</option>\n              <option value=\"false\">Descending</option>\n            </select>\n          </div>\n        </div>\n      </form>\n\n      <table class=\"table table-striped\">\n        <tr>\n          <th>Symbol</th>\n          <th>Stock Price</th>\n          <th>Change(Change Price)</th>\n          <th>Volume</th>\n          <th></th>\n        </tr>\n        <tr *ngFor=\"let row of favoriteList\">\n          <td><a (click)=\"moveTo(row.symbol)\">{{row.symbol}}</a></td>\n          <td>{{row.price.toFixed(2)}}</td>\n          <td [ngClass]=\"{'change-up': row.change >= 0, 'change-down': row.change < 0 }\">\n            {{row.change.toFixed(2)}}({{row.percent.toFixed(2)}}%)\n            <div *ngIf=\"row.change >= 0\">\n              <img src=\"http://cs-server.usc.edu:45678/hw/hw8/images/Up.png\">\n            </div>\n            <div *ngIf=\"row.change < 0\">\n              <img src=\"http://cs-server.usc.edu:45678/hw/hw8/images/Down.png\">\n            </div>\n          </td>\n          <td>{{row.volume.toLocaleString()}}</td>\n          <td>\n            <button type=\"button\" class=\"btn btn-default\" (click)=\"deleteRow(row)\">\n              <span class=\"glyphicon glyphicon-trash\" aria-hidden=\"true\"></span>\n            </button>\n          </td>\n        </tr>\n      </table>\n    </div>\n\n    <!--stock details part-->\n    <div class=\"panel panel-default\" [style.display]=\"rightDisplay\" [@stepTransition]=\"right\">\n      <div class=\"panel-heading\">\n        <div class=\"row\">\n          <div class=\"col-sm-1\"  style=\"display: inline\">\n            <button type=\"button\" class=\"btn btn-default\" (click)=\"moveLeft();\">\n              <span class=\"glyphicon glyphicon-chevron-left\" aria-hidden=\"true\"></span>\n            </button>\n          </div>\n          <div class=\"col-sm-offset-4 col-sm-6\"  style=\"display: inline\">\n            <b>Stock Detail</b>\n          </div>\n        </div>\n      </div>\n\n      <div style=\"padding: 20px\">\n\n        <!--tab title-->\n        <ul class=\"nav nav-pills\">\n          <li role=\"presentation\" class=\"active\">\n            <a class=\"visible-md visible-lg\" href=\"#current\" data-toggle=\"tab\">\n              <span class=\"glyphicon glyphicon-dashboard\" aria-hidden=\"true\"></span>\n              Current Stock\n            </a>\n            <a class=\"visible-xs visible-sm\" href=\"#current\" data-toggle=\"tab\">\n              <span class=\"glyphicon glyphicon-dashboard\" aria-hidden=\"true\"></span>\n              Current\n            </a>\n          </li>\n          <li role=\"presentation\">\n            <a class=\"visible-md visible-lg\" href=\"#history\" data-toggle=\"tab\">\n              <span class=\"glyphicon glyphicon-stats\" aria-hidden=\"true\"></span>\n              Historical Charts\n            </a>\n            <a class=\"visible-xs visible-sm\" href=\"#history\" data-toggle=\"tab\">\n              <span class=\"glyphicon glyphicon-stats\" aria-hidden=\"true\"></span>\n              Charts\n            </a>\n          </li>\n          <li role=\"presentation\">\n            <a class=\"visible-md visible-lg\" href=\"#news\" data-toggle=\"tab\">\n              <span class=\"glyphicon glyphicon-link\" aria-hidden=\"true\"></span>\n              News Feeds\n            </a>\n            <a class=\"visible-xs visible-sm\" href=\"#news\" data-toggle=\"tab\">\n              <span class=\"glyphicon glyphicon-link\" aria-hidden=\"true\"></span>\n              News\n            </a>\n          </li>\n        </ul>\n        <hr>\n\n        <div class=\"tab-content\">\n          <!-- 1 Current Stock  -->\n          <div class=\"tab-pane active\" id=\"current\">\n            <div class=\"container\">\n\n              <!--left table-->\n              <div class=\"col-md-6 col-sm-12\" style=\"padding-left: 0;padding-right: 0\">\n                <div class=\"row\" style=\"padding-bottom: 10px\">\n                <div class=\"col-sm-9\" style=\"display: inline;padding-left: 36px;\">\n                  <b style=\"left:10px\">Stock Details</b>\n                </div>\n                <div class=\"col-sm-3\" style=\"display: inline\">\n                  <button type=\"button\" class=\"btn btn-default plain\" (click)=\"addToFavorite()\" [disabled]=\"!currentStock['table']\">\n                    <span *ngIf=\"currentStock['favorite'] && currentStock['favorite'] == true\" class=\"glyphicon glyphicon-star\" style=\"color: #fed531;\" aria-hidden=\"true\"></span>\n                    <span *ngIf=\"!currentStock['favorite'] || currentStock['favorite'] == false\" class=\"glyphicon glyphicon-star-empty\" aria-hidden=\"true\"></span>\n                  </button>\n                  <button type=\"button\" class=\"btn btn-default plain\" (click)=\"shareOnFacebook()\" [disabled]=\"!currentStock['table']\">\n                    <!--<span class=\"fa fa-facebook-square\" aria-hidden=\"true\">fb</span>-->\n                    <img width=\"20\" src=\"http://cs-server.usc.edu:45678/hw/hw8/images/facebook.png\">\n                  </button>\n                </div>\n                </div>\n\n                <div *ngIf=\"currentStock['table'] === undefined\" class=\"col-sm-12 progress-container\">\n                  <br><br>\n                  <div class=\"progress\">\n                    <div class=\"progress-bar progress-bar-striped active\" style=\"width: 50%\"></div>\n                  </div>\n                </div>\n\n                <div class=\"col-sm-12\" *ngIf=\"currentStock['table'] && currentStock['table']['error'] === true\">\n                  <br><br>\n                  <div class=\"visible-md visible-lg\">\n                    <br><br>\n                  </div>\n                  <div class=\"alert alert-danger\" role=\"alert\">\n                    Erorr! Failed to get current stock data.\n                  </div>\n                </div>\n\n                <div *ngIf=\"currentStock['table'] && currentStock['table']['error'] !== true\" style=\"padding-top: 10px\">\n                  <table class=\"table table-striped\" *ngIf=\"currentStock\">\n                    <tr>\n                      <th>Stock Ticker Symbol</th>\n                      <td>{{currentStock['table']['symbol']}}</td>\n                    </tr>\n                    <tr>\n                      <th>Last Price</th>\n                      <td>{{currentStock['table']['price'].toFixed(2)}}</td>\n                    </tr>\n                    <tr>\n                      <th>Change (Change Percent)</th>\n                      <td>\n                        <div *ngIf=\"currentStock['table']['change'] >= 0\" class=\"change-up\">\n                          {{currentStock['table']['change'].toFixed(2)}} ({{currentStock['table']['percent'].toFixed(2)}}%)\n                          <img src=\"http://cs-server.usc.edu:45678/hw/hw8/images/Up.png\">\n                        </div>\n                        <div *ngIf=\"currentStock['table']['change'] < 0\" class=\"change-down\">\n                          {{currentStock['table']['change'].toFixed(2)}} ({{currentStock['table']['percent'].toFixed(2)}}%)\n                          <img src=\"http://cs-server.usc.edu:45678/hw/hw8/images/Down.png\">\n                        </div>\n                      </td>\n                    </tr>\n                    <tr>\n                      <th>TimeStamp</th>\n                      <td>{{currentStock['table']['time']}}</td>\n                    </tr>\n                    <tr>\n                      <th>Open</th>\n                      <td>{{currentStock['table']['open'].toFixed(2)}}</td>\n                    </tr>\n                    <tr>\n                      <th>Close</th>\n                      <td>{{currentStock['table']['close'].toFixed(2)}}</td>\n                    </tr>\n                    <tr>\n                      <th>Day’s Range</th>\n                      <td>{{currentStock['table']['range']}}</td>\n                    </tr>\n                    <tr>\n                      <th>Volume</th>\n                      <td>{{currentStock['table']['volume'].toLocaleString()}}</td>\n                    </tr>\n                  </table>\n                </div>\n              </div>\n\n              <!--right chart-->\n              <div class=\"col-sm-6\" style=\"padding-left: 0;padding-right: 0\">\n                <ul class=\"nav nav-tabs\" id=\"indicator\">\n                  <li role=\"presentation\" class=\"active\"><a (click)=\"changeTo('price')\" data-toggle=\"tab\">Price</a></li>\n                  <li role=\"presentation\"><a (click)=\"changeTo('sma')\" data-toggle=\"tab\">SMA</a></li>\n                  <li role=\"presentation\"><a (click)=\"changeTo('ema')\" data-toggle=\"tab\">EMA</a></li>\n                  <li role=\"presentation\"><a (click)=\"changeTo('stoch')\" data-toggle=\"tab\">STOCH</a></li>\n                  <li role=\"presentation\"><a (click)=\"changeTo('rsi')\" data-toggle=\"tab\">RSI</a></li>\n                  <li role=\"presentation\"><a (click)=\"changeTo('adx')\" data-toggle=\"tab\">ADX</a></li>\n                  <li role=\"presentation\"><a (click)=\"changeTo('cci')\" data-toggle=\"tab\">CCI</a></li>\n                  <li role=\"presentation\"><a (click)=\"changeTo('bbands')\" data-toggle=\"tab\">BBANDS</a></li>\n                  <li role=\"presentation\"><a (click)=\"changeTo('macd')\" data-toggle=\"tab\">MACD</a></li>\n                </ul>\n                  <div class=\"tab-content\">\n                      <div class=\"tab-pane active\" [id]=\"ind\">\n                        <div *ngIf=\"currentStock[ind] === undefined\" class=\"col-sm-12 progress-container\">\n                          <div class=\"progress\">\n                            <div class=\"progress-bar progress-bar-striped active\" style=\"width: 50%\"></div>\n                          </div>\n                        </div>\n                        <div class=\"col-sm-12\" *ngIf=\"currentStock[ind] && currentStock[ind].error === true\">\n                          <br><br>\n                          <div class=\"alert alert-danger\" role=\"alert\">\n                            Erorr! Failed to get {{ind}} data.\n                          </div>\n                        </div>\n                        <div *ngIf=\"currentStock[ind] && currentStock[ind].error !== true\">\n                          <chart class=\"absolute\" [options]=\"currentStock[ind]\"></chart>\n                        </div>\n                      </div>\n                  </div>\n              </div>\n            </div>\n          </div>\n\n          <!-- 2 Historical Chart -->\n          <div class=\"tab-pane\" id=\"history\">\n            <div class=\"container\">\n              <div *ngIf=\"currentStock['historical'] === undefined\" class=\"col-sm-12 progress-container\">\n                <div class=\"progress\">\n                  <div class=\"progress-bar progress-bar-striped active\" style=\"width: 50%\"></div>\n                </div>\n              </div>\n\n              <div class=\"col-sm-12\" *ngIf=\"currentStock['historical'] && currentStock['historical']['error'] === true\">\n                <br><br>\n                <div class=\"alert alert-danger\" role=\"alert\">\n                  Erorr! Failed to get historical charts data.\n                </div>\n              </div>\n\n              <div *ngIf=\"currentStock['historical'] && currentStock['historical']['error'] !== true\">\n                <chart type=\"StockChart\" [options]=\"currentStock['historical']\"></chart>\n              </div>\n            </div>\n          </div>\n\n          <!-- 3 News -->\n          <div class=\"tab-pane\" id=\"news\">\n            <div class=\"container\">\n              <div *ngIf=\"currentStock['news'] === undefined\" class=\"col-sm-12 progress-container\">\n                <div class=\"progress\">\n                  <div class=\"progress-bar progress-bar-striped active\" style=\"width: 50%\"></div>\n                </div>\n              </div>\n\n              <div class=\"col-sm-12\" *ngIf=\"currentStock['news'] && currentStock['news']['error'] === true\">\n                <br><br>\n                <div class=\"alert alert-danger\" role=\"alert\">\n                  Erorr! Failed to get news data.\n                </div>\n              </div>\n\n              <div class=\"col-sm-12\" *ngIf=\"currentStock['news'] && currentStock['news']['length'] === 0\">\n                <br><br>\n                <div class=\"alert alert-danger\" role=\"alert\">\n                  There is no news.\n                </div>\n              </div>\n\n              <div  *ngIf=\"currentStock['news'] && currentStock['news'].error !== true\">\n                <div *ngFor=\"let article of currentStock.news\">\n                  <div class=\"well\">\n                    <a target=\"_blank\" href={{article.link}}><p style=\"font-weight: 500;\">{{article.title}}</p></a>\n                    <b>Author: {{article.author}}</b><br>\n                    <b>Date: {{article.date}}</b>\n                  </div>\n                </div>\n              </div>\n            </div>\n          </div>\n        </div>\n\n      </div>\n    </div>\n  </div>\n\n</div>\n\n"

/***/ }),

/***/ 284:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(122);


/***/ })

},[284]);
//# sourceMappingURL=main.bundle.js.map