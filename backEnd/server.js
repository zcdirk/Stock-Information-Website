var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var https = require('https');
var parseString = require('xml2js').parseString;
var moment = require('moment');
var momentTZ = require('moment-timezone');

var app = express();

// parse all the request body to json
app.use(bodyParser.json());

// deal with CORS
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

app.use(express.static('public'));

// export
app.post('/export', function (req, res) {
    request({
        url: 'http://export.highcharts.com/',
        method: "POST",
        json: req.body
    }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                res.send(body);
            } else {
                res.send("error");
            }
        }
    );
});

// auto complete
app.get('/auto/:input', function (req, res) {
    let input = req.params.input;
    http.get('http://dev.markitondemand.com/MODApis/Api/v2/Lookup/json?input='
        + input, function (responce) {
        let data = "";
        responce.on('data', (chunk) => {
            data += chunk;
        });
        responce.on('end', () => {
            try {
                res.json(JSON.parse(data));
            } catch (e) {
                res.json("[]");
            }
        });
    }).on('error', (e) => {
        res.json("[]");
    });
});

// refresh the table
app.post('/refresh', function (req, res) {
    let favorites = req.body, len = favorites.length, complete = 0;
    let ans = [];
    for (let fav in favorites) {
        console.log(favorites[fav]["symbol"]);
        https.get("https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=" +
            favorites[fav]["symbol"] + "&apikey=X27HEFVQ75UUT7E1", function (responce) {
            try {
                let json = '';
                responce.setEncoding('utf8');
                responce.on('data', function (d) {
                    json += d;
                });
                responce.on('end', function () {
                    if (json === "{}") return;
                    json = JSON.parse(json);
                    let num = 0, first, second;
                    for (let t in json["Time Series (Daily)"]) {
                        if (num === 0) {
                            first = json["Time Series (Daily)"][t];
                        } else if (num === 1) {
                            second = json["Time Series (Daily)"][t];
                        } else {
                            break;
                        }
                        num++;
                    }

                    favorites[fav]["price"] = parseFloat(parseFloat(first["4. close"]).toFixed(2));
                    favorites[fav]["change"] = parseFloat(parseFloat(first["4. close"] - second["4. close"]).toFixed(2));
                    favorites[fav]["percent"] = parseFloat(parseFloat((first["4. close"] - second["4. close"]) / second["4. close"] * 100).toFixed(2));
                    favorites[fav]["volume"] = parseInt(first["5. volume"]);
                    complete++;
                    if (complete === len) {
                        res.json(favorites);
                    }
                });
            } catch (e) {
                res.json({'error': true});
            }
        }).on('error', function (e) {
            res.json({'error': true});
        });
    }
});

/*
 get stock info, the responce json is in the following format
 {
 table: {symbol: AAPL, price: 73.87....},
 price: {xCategories: [], series: {}},
 sma: {xCategories: [], series: {}},
 ema: {xCategories: [], series: {}},
 stoch: {xCategories: [], series: {}},
 rsi: {xCategories: [], series: {}},
 adx: {xCategories: [], series: {}},
 cci: {xCategories: [], series: {}},
 bbands: {xCategories: [], series: {}},
 macd: {xCategories: [], series: {}},
 historical: {},
 news: [{title: xxx, author: xxx, date: xxx}, {}, {}, ],
 }
 */
app.get('/getstock/table/:input', function (req, res) {
    let input = req.params.input;
    let ans = {};
    // request for TIME_SERIES_DAILY
    // generate table, price and historical
    https.get("https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=" +
        input + "&outputsize=full&apikey=X27HEFVQ75UUT7E1", function (responce) {
        let json = '';
        responce.setEncoding('utf8');
        responce.on('data', function (d) {
            json += d;
        });
        responce.on('end', function () {
            // generate the price chart here
            try {
                json = JSON.parse(json);
                let arr = json["Time Series (Daily)"];
                if (arr === undefined) {
                    res.json({"error": true});
                    return;
                }
                let name = json["Meta Data"]["2. Symbol"];
                let d1 = [], d2 = [], i = 0, xTitle = [], historical = [];
                for (let k in arr) {
                    if (i++ < 120) {
                        let sa = k.split(/[- ]/);
                        xTitle.push(sa[1] + "/" + sa[2]);
                        d1.push(parseFloat(parseFloat(arr[k]["4. close"]).toFixed(2)));
                        d2.push(parseFloat(parseFloat(arr[k]["5. volume"]).toFixed(2)));
                    }
                    historical.push([Date.parse(new Date(k)), parseFloat(parseFloat(arr[k]["4. close"]).toFixed(2))]);
                    if (i > 1000) break;
                }
                ans["historical"] = {
                    rangeSelector: {
                        buttons: [{
                            type: 'week',
                            count: 1,
                            text: '1w'
                        }, {
                            type: 'month',
                            count: 1,
                            text: '1m'
                        }, {
                            type: 'month',
                            count: 3,
                            text: '3m'
                        }, {
                            type: 'month',
                            count: 6,
                            text: '6m'
                        }, {
                            type: 'ytd',
                            text: 'YTD'
                        }, {
                            type: 'year',
                            count: 1,
                            text: '1y'
                        }, {
                            type: 'all',
                            text: 'All'
                        }],
                        selected: 0
                    },
                    tooltip: {
                        split: false
                    },
                    title: {
                        text: 'AAPL Stock Value'
                    },
                    subtitle: {
                        useHTML: true,
                        text: '<a target="_blank" href="https://www.alphavantage.co/">Source: Alpha Vantage</a>'
                    },
                    series: [{
                        name: 'AAPL',
                        type: 'area',
                        data: historical.reverse(),
                        tooltip: {
                            valueDecimals: 2
                        }
                    }]
                };
                ans["price"] = {
                    chart: {zoomType: 'x'},
                    title: {text: name + " Stock Price and Volume"},
                    subtitle: {
                        useHTML: true,
                        text: '<a target="_blank" href="https://www.alphavantage.co/">Source: Alpha Vantage</a>'
                    },
                    xAxis: {tickInterval: 5, tickWidth: 0, categories: xTitle.reverse()},
                    yAxis: [{
                        labels: {format: '{value}',},
                        title: {text: 'Stock Price',},
                        minPadding: 0.2,
                        maxPadding: 0.01
                    },
                        {
                            title: {text: 'Volumn',}, maxPadding: 2, labels: {}, opposite: true
                        }],
                    series: [{
                        name: name,
                        type: 'area',
                        threshold: null,
                        tooltip: {valueDecimals: 2,},
                        fillOpacity: 0.5,
                        data: d1,
                        lineWidth: 1
                    },
                        {name: name + ' Volumn', type: 'column', yAxis: 1, data: d2}]
                };


                // generate the table
                let meta = json["Meta Data"], series = json["Time Series (Daily)"];
                let count = 0, first = null, second = null, stockTable = {};
                stockTable["symbol"] = meta["2. Symbol"];
                for (let d in series) {
                    if (count === 0) {
                        first = series[d];
                        stockTable["price"] = parseFloat(parseFloat(first["4. close"]).toFixed(2));
                        stockTable["open"] = parseFloat(parseFloat(first["1. open"]).toFixed(2));
                        stockTable["range"] = parseFloat(parseFloat(first["3. low"]).toFixed(2)) + " - " + parseFloat(parseFloat(first["2. high"]).toFixed(2));
                        stockTable["volume"] = parseInt(first["5. volume"]);
                        count++;
                    } else if (count === 1) {
                        second = series[d];
                        break;
                    }
                }

                // change(change percentage)
                let change = parseFloat(first["4. close"]) - parseFloat(second["4. close"]);
                stockTable["change"] = parseFloat(change.toFixed(2));
                stockTable["percent"] = parseFloat((100 * change / parseFloat(second["4. close"])).toFixed(2));

                // deal with the time zone here
                let originTime = meta["3. Last Refreshed"];
                if (originTime.length > 10) {
                    stockTable["time"] = momentTZ.tz(originTime, 'America/New_York').format("YYYY-MM-DD HH:mm z");
                    stockTable["close"] = parseFloat(parseFloat(second["4. close"]).toFixed(2));
                } else {
                    stockTable["time"] = momentTZ.tz(originTime + " 16:00:00", 'America/New_York').format("YYYY-MM-DD HH:mm z");
                    stockTable["close"] = parseFloat(parseFloat(first["4. close"]).toFixed(2));
                }

                ans["table"] = stockTable;

                res.json(ans);
                //generateSMA(res);
            } catch (e) {
                console.log(json);
                res.json({'error': true});
            }
        });
    }).on('error', function (e) {
        res.json({"error": true});
    });
});

app.get('/getstock/sma/:input', function (req, res) {
    let input = req.params.input;
    // request for SMA
    https.get("https://www.alphavantage.co/query?function=SMA&symbol=" + input +
        "&interval=daily&time_period=10&series_type=close&apikey=X27HEFVQ75UUT7E1",
        function (responce) {
            let json = '';
            responce.setEncoding('utf8');
            responce.on('data', function (d) {
                json += d;
            });
            responce.on('end', function () {
                try {
                    json = JSON.parse(json);
                    if (json.information) console.log(json);
                    let arr = json["Technical Analysis: SMA"];
                    if (arr === undefined) {
                        res.json({"error": true});
                        return;
                    }
                    let name = json["Meta Data"]["1: Symbol"];
                    let dataArray = [], i = 0, xTitle = [];
                    for (let k in arr) {
                        if (i++ > 120) break;
                        let sa = k.split(/[- ]/);
                        xTitle.push(sa[1] + "/" + sa[2]);
                        dataArray.push(parseFloat(parseFloat(arr[k]["SMA"]).toFixed(2)));
                    }
                    res.json({
                        chart: {zoomType: 'x'},
                        title: {text: "Simple Moving Average (SMA)"},
                        subtitle: {
                            useHTML: true,
                            text: '<a target="_blank" href="https://www.alphavantage.co/">Source: Alpha Vantage</a>'
                        },
                        xAxis: {tickInterval: 5, tickWidth: 0, categories: xTitle.reverse()},
                        yAxis: {labels: {format: '{value}',}, title: {text: "SMA",}},
                        tooltip: {valueDecimals: 2,},
                        series: [{
                            name: name,
                            color: '#eb2f18',
                            data: dataArray.reverse(),
                            lineWidth: 1,
                            marker: {radius: 2}
                        }]
                    });
                } catch (e) {
                    console.log(json);
                    res.json({'error': true});
                }
            });
        }).on('error', function (e) {
        res.json({"error": true});
    });
});

app.get('/getstock/ema/:input', function (req, res) {
    let input = req.params.input;
    // request for EMA
    https.get("https://www.alphavantage.co/query?function=EMA&symbol=" + input +
        "&interval=daily&time_period=10&series_type=close&apikey=X27HEFVQ75UUT7E1",
        function (responce) {
            let json = '';
            responce.setEncoding('utf8');
            responce.on('data', function (d) {
                json += d;
            });
            responce.on('end', function () {
                try {
                    json = JSON.parse(json);
                    if (json.information) console.log(json);

                    let arr = json["Technical Analysis: EMA"];
                    if (arr === undefined) {
                        res.json({"error": true});
                        return;
                    }
                    let name = json["Meta Data"]["1: Symbol"];
                    let dataArray = [], i = 0, xTitle = [];
                    for (let k in arr) {
                        if (i++ > 120) break;
                        let sa = k.split(/[- ]/);
                        xTitle.push(sa[1] + "/" + sa[2]);
                        dataArray.push(parseFloat(parseFloat(arr[k]["EMA"]).toFixed(2)));
                    }
                    res.json({
                        chart: {zoomType: 'x'},
                        title: {text: "Exponential Moving Average (EMA)"},
                        subtitle: {
                            useHTML: true,
                            text: '<a target="_blank" href="https://www.alphavantage.co/">Source: Alpha Vantage</a>'
                        },
                        xAxis: {tickInterval: 5, tickWidth: 0, categories: xTitle.reverse()},
                        yAxis: {labels: {format: '{value}',}, title: {text: "EMA",}},
                        tooltip: {valueDecimals: 2,},
                        series: [{
                            name: name,
                            color: '#eb2f18',
                            data: dataArray.reverse(),
                            lineWidth: 1,
                            marker: {radius: 2}
                        }]
                    });
                } catch (e) {
                    console.log(json);
                    res.json({'error': true});
                }
            });
        }).on('error', function (e) {
        res.json({"error": true});
    });
});

app.get('/getstock/stoch/:input', function (req, res) {
    let input = req.params.input;
    // request for STOCH
    https.get("https://www.alphavantage.co/query?function=STOCH&symbol=" + input +
        "&interval=daily&slowkmatype=1&slowdmatype=1&series_type=close&apikey=X27HEFVQ75UUT7E1",
        function (responce) {
            let json = '';
            responce.setEncoding('utf8');
            responce.on('data', function (d) {
                json += d;
            });
            responce.on('end', function () {
                try {
                    json = JSON.parse(json);
                    if (json.information) console.log(json);
                    let arr = json["Technical Analysis: STOCH"];
                    if (arr === undefined) {
                        res.json({"error": true});
                        return;
                    }
                    let name = json["Meta Data"]["1: Symbol"];
                    let d1 = [], d2 = [], i = 0, xTitle = [];
                    for (let k in arr) {
                        if (i++ > 120) break;
                        let sa = k.split(/[- ]/);
                        xTitle.push(sa[1] + "/" + sa[2]);
                        d1.push(parseFloat(parseFloat(arr[k]["SlowK"]).toFixed(2)));
                        d2.push(parseFloat(parseFloat(arr[k]["SlowD"]).toFixed(2)));
                    }
                    res.json({
                        chart: {zoomType: 'x'},
                        title: {text: "Stochastic Oscillator (STOCH)"},
                        subtitle: {
                            useHTML: true,
                            text: '<a target="_blank" href="https://www.alphavantage.co/">Source: Alpha Vantage</a>'
                        },
                        xAxis: {tickInterval: 5, tickWidth: 0, categories: xTitle.reverse()},
                        yAxis: {labels: {format: '{value}',}, title: {text: "STOCH",}},
                        tooltip: {valueDecimals: 2,},
                        series: [{
                            name: name + ' SlowK',
                            color: '#eb2f18',
                            data: d1.reverse(),
                            lineWidth: 1,
                            marker: {radius: 2}
                        },
                            {name: name + ' SlowD', data: d2.reverse(), lineWidth: 1, marker: {radius: 2}}]
                    });
                } catch (e) {
                    console.log(json);
                    res.json({'error': true});
                }
            });
        }).on('error', function (e) {
        res.json({"error": true});
    });
});

app.get('/getstock/rsi/:input', function (req, res) {
    let input = req.params.input;
    // request for RSI
    https.get("https://www.alphavantage.co/query?function=RSI&symbol=" + input +
        "&interval=daily&time_period=10&series_type=close&apikey=X27HEFVQ75UUT7E1",
        function (responce) {
            let json = '';
            responce.setEncoding('utf8');
            responce.on('data', function (d) {
                json += d;
            });
            responce.on('end', function () {
                try {
                    json = JSON.parse(json);
                    if (json.information) console.log(json);
                    let arr = json["Technical Analysis: RSI"];
                    if (arr === undefined) {
                        res.json({"error": true});
                        return;
                    }
                    let name = json["Meta Data"]["1: Symbol"];
                    let dataArray = [], i = 0, xTitle = [];
                    for (let k in arr) {
                        if (i++ > 120) break;
                        let sa = k.split(/[- ]/);
                        xTitle.push(sa[1] + "/" + sa[2]);
                        dataArray.push(parseFloat(parseFloat(arr[k]["RSI"]).toFixed(2)));
                    }
                    res.json({
                        chart: {zoomType: 'x'},
                        title: {text: "Relative Strength Index (RSI)"},
                        subtitle: {
                            useHTML: true,
                            text: '<a target="_blank" href="https://www.alphavantage.co/">Source: Alpha Vantage</a>'
                        },
                        xAxis: {tickInterval: 5, tickWidth: 0, categories: xTitle.reverse()},
                        yAxis: {labels: {format: '{value}',}, title: {text: "RSI",}},
                        tooltip: {valueDecimals: 2,},
                        series: [{
                            name: name,
                            color: '#eb2f18',
                            data: dataArray.reverse(),
                            lineWidth: 1,
                            marker: {radius: 2}
                        }]
                    });
                } catch (e) {
                    console.log(json);
                    res.json({"error": true});
                }
            });
        }).on('error', function (e) {
        res.json({"error": true});
    });
});

app.get('/getstock/adx/:input', function (req, res) {
    let input = req.params.input;
    // request for ADX
    https.get("https://www.alphavantage.co/query?function=ADX&symbol=" + input +
        "&interval=daily&time_period=10&series_type=close&apikey=X27HEFVQ75UUT7E1",
        function (responce) {
            let json = '';
            responce.setEncoding('utf8');
            responce.on('data', function (d) {
                json += d;
            });
            responce.on('end', function () {
                try {
                    json = JSON.parse(json);
                    if (json.information) console.log(json);
                    let arr = json["Technical Analysis: ADX"];
                    if (arr === undefined) {
                        res.json({"error": true});
                        return;
                    }
                    let name = json["Meta Data"]["1: Symbol"];
                    let dataArray = [], i = 0, xTitle = [];
                    for (let k in arr) {
                        if (i++ > 120) break;
                        let sa = k.split(/[- ]/);
                        xTitle.push(sa[1] + "/" + sa[2]);
                        dataArray.push(parseFloat(parseFloat(arr[k]["ADX"]).toFixed(2)));
                    }
                    res.json({
                        chart: {zoomType: 'x'},
                        title: {text: "Average Directional Movement Index (ADX)"},
                        subtitle: {
                            useHTML: true,
                            text: '<a target="_blank" href="https://www.alphavantage.co/">Source: Alpha Vantage</a>'
                        },
                        xAxis: {tickInterval: 5, tickWidth: 0, categories: xTitle.reverse()},
                        yAxis: {labels: {format: '{value}',}, title: {text: "ADX",}},
                        tooltip: {valueDecimals: 2,},
                        series: [{
                            name: name,
                            color: '#eb2f18',
                            data: dataArray.reverse(),
                            lineWidth: 1,
                            marker: {radius: 2}
                        }]
                    });
                } catch (e) {
                    console.log(json);
                    res.json({'error': true});
                }
            });
        }).on('error', function (e) {
        res.json({"error": true});
    });
});

app.get('/getstock/cci/:input', function (req, res) {
    let input = req.params.input;
    // request for CCI
    https.get("https://www.alphavantage.co/query?function=CCI&symbol=" + input +
        "&interval=daily&time_period=10&series_type=close&apikey=X27HEFVQ75UUT7E1",
        function (responce) {
            let json = '';
            responce.setEncoding('utf8');
            responce.on('data', function (d) {
                json += d;
            });
            responce.on('end', function () {
                try {
                    json = JSON.parse(json);
                    if (json.information) console.log(json);
                    let arr = json["Technical Analysis: CCI"];
                    if (arr === undefined) {
                        res.json({"error": true});
                        return;
                    }
                    let name = json["Meta Data"]["1: Symbol"];
                    let dataArray = [], i = 0, xTitle = [];
                    for (let k in arr) {
                        if (i++ > 120) break;
                        let sa = k.split(/[- ]/);
                        xTitle.push(sa[1] + "/" + sa[2]);
                        dataArray.push(parseFloat(parseFloat(arr[k]["CCI"]).toFixed(2)));
                    }
                    res.json({
                        chart: {zoomType: 'x'},
                        title: {text: "Commodity Channel Index (CCI)"},
                        subtitle: {
                            useHTML: true,
                            text: '<a target="_blank" href="https://www.alphavantage.co/">Source: Alpha Vantage</a>'
                        },
                        xAxis: {tickInterval: 5, tickWidth: 0, categories: xTitle.reverse()},
                        yAxis: {labels: {format: '{value}',}, title: {text: "CCI",}},
                        tooltip: {valueDecimals: 2,},
                        series: [{
                            name: name,
                            color: '#eb2f18',
                            data: dataArray.reverse(),
                            lineWidth: 1,
                            marker: {radius: 2}
                        }]
                    });
                } catch (e) {
                    console.log(json);
                    res.json({'error': true});
                }
            });
        }).on('error', function (e) {
        res.json({"error": true});
    });
});

app.get('/getstock/bbands/:input', function (req, res) {
    let input = req.params.input;
    // request for BBANDS
    https.get("https://www.alphavantage.co/query?function=BBANDS&symbol=" + input +
        "&interval=daily&time_period=5&series_type=close&nbdevup=3&nbdevdn=3&apikey=X27HEFVQ75UUT7E1",
        function (responce) {
            let json = '';
            responce.setEncoding('utf8');
            responce.on('data', function (d) {
                json += d;
            });
            responce.on('end', function () {
                try {
                    json = JSON.parse(json);
                    if (json.information) console.log(json);
                    let arr = json["Technical Analysis: BBANDS"];
                    if (arr === undefined) {
                        res.json({"error": true});
                        return;
                    }
                    let name = json["Meta Data"]["1: Symbol"];
                    let d1 = [], d2 = [], d3 = [], i = 0, xTitle = [];
                    for (let k in arr) {
                        if (i++ > 120) break;
                        let sa = k.split(/[- ]/);
                        xTitle.push(sa[1] + "/" + sa[2]);
                        d1.push(parseFloat(parseFloat(arr[k]["Real Middle Band"]).toFixed(2)));
                        d2.push(parseFloat(parseFloat(arr[k]["Real Lower Band"]).toFixed(2)));
                        d3.push(parseFloat(parseFloat(arr[k]["Real Upper Band"]).toFixed(2)));
                    }
                    res.json({
                        chart: {zoomType: 'x'},
                        title: {text: "Bollinger Bands (BBANDS)"},
                        subtitle: {
                            useHTML: true,
                            text: '<a target="_blank" href="https://www.alphavantage.co/">Source: Alpha Vantage</a>'
                        },
                        xAxis: {tickInterval: 5, tickWidth: 0, categories: xTitle.reverse()},
                        yAxis: {labels: {format: '{value}',}, title: {text: "BBANDS",}},
                        tooltip: {valueDecimals: 2,},
                        series: [{name: name + ' Real Middle Band', data: d1.reverse(), lineWidth: 1, marker: {radius: 2}},
                            {name: name + ' Real Upper Band', data: d3.reverse(), lineWidth: 1, marker: {radius: 2}},
                            {name: name + ' Real Lower Band', data: d2.reverse(), lineWidth: 1, marker: {radius: 2}}]
                    });
                } catch (e) {
                    console.log(json);
                    res.json(json);
                }
            });
        }).on('error', function (e) {
        res.json({"error": true});
    });
});

app.get('/getstock/macd/:input', function (req, res) {
    let input = req.params.input;
    // request for MACD
    https.get("https://www.alphavantage.co/query?function=MACD&symbol=" + input +
        "&interval=daily&time_period=10&series_type=close&apikey=X27HEFVQ75UUT7E1",
        function (responce) {
            let json = '';
            responce.setEncoding('utf8');
            responce.on('data', function (d) {
                json += d;
            });
            responce.on('end', function () {
                try {
                    json = JSON.parse(json);
                    if (json.information) console.log(json);
                    let arr = json["Technical Analysis: MACD"];
                    if (arr === undefined) {
                        res.json({"error": true});
                        return;
                    }
                    let name = json["Meta Data"]["1: Symbol"];
                    let d1 = [], d2 = [], d3 = [], i = 0, xTitle = [];
                    for (let k in arr) {
                        if (i++ > 120) break;
                        let sa = k.split(/[- ]/);
                        xTitle.push(sa[1] + "/" + sa[2]);
                        d1.push(parseFloat(parseFloat(arr[k]["MACD"]).toFixed(2)));
                        d2.push(parseFloat(parseFloat(arr[k]["MACD_Hist"]).toFixed(2)));
                        d3.push(parseFloat(parseFloat(arr[k]["MACD_Signal"]).toFixed(2)));
                    }
                    res.json({
                        chart: {zoomType: 'x'},
                        title: {text: "Moving Average Convergence/Divergence (MACD)"},
                        subtitle: {
                            useHTML: true,
                            text: '<a target="_blank" href="https://www.alphavantage.co/">Source: Alpha Vantage</a>'
                        },
                        xAxis: {tickInterval: 5, tickWidth: 0, categories: xTitle.reverse()},
                        yAxis: {labels: {format: '{value}',}, title: {text: "MACD",}},
                        tooltip: {valueDecimals: 2,},
                        series: [{name: name + ' MACD', data: d1.reverse(), lineWidth: 1, marker: {radius: 2}},
                            {name: name + ' MACD_Hist', data: d2.reverse(), lineWidth: 1, marker: {radius: 2}},
                            {name: name + ' MACD_Signal', data: d3.reverse(), lineWidth: 1, marker: {radius: 2}}]
                    });
                } catch (e) {
                    console.log(json);
                    res.json({'error': true});
                }
            });
        }).on('error', function (e) {
        res.json({"error": true});
    });
});

app.get('/getstock/news/:input', function (req, res) {
    let input = req.params.input;
    // request news
    https.get("https://seekingalpha.com/api/sa/combined/" + input + ".xml",
        function (responce) {
            let xml = '';
            responce.setEncoding('utf8');
            responce.on('data', function (d) {
                xml += d.toString();
            });
            responce.on('end', function () {
                try {
                    parseString(xml, function (err, json) {
                        let resNews = [], num = 0;
                        if (json.rss === undefined) {
                            res.json({"error": true});
                            return;
                        }
                        let news = json.rss.channel[0].item;
                        for (let i in news) {
                            if (news[i].link[0].includes("https://seekingalpha.com/article")) {
                                num++;
                                let item = {};
                                item["title"] = news[i].title[0];
                                item["link"] = news[i].link[0];
                                item["author"] = news[i]["sa:author_name"][0];
                                item["date"] = momentTZ.tz(news[i].pubDate[0], 'America/New_York').format("ddd, DD MMM YYYY HH:mm:ss z");
                                resNews.push(item);
                            }
                            if (num === 5) break;
                        }
                        res.json(resNews);
                    });
                } catch (e) {
                    console.log(xml);
                    res.json({'error': true});
                }
            });
        }).on('error', function (e) {
        res.json({"error": true});
    });
});


app.listen(8081);