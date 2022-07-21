var express = require("express");
var mysql = require("mysql")
var cors = require("cors");
var router = express.Router();
const mongoose = require('mongoose');
const siteViews = require("./public/models/visits");
var SiteViewsUp = require('./public/src/visitsUp');
var app = express();

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log(1);
    SiteViewsUp.siteViewsUp('confusion', 'visits', 'home');
    console.log(2);

});

app.use(express.static('public'));

//make way for some custom css, js and images
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/images', express.static(__dirname + '/public/images'));

var server = app.listen(80, function () {
    var port = server.address().port;
    console.log("Server started at http://localhost:%s", port);
});

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:80');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use(cors())

var dataCache = {}
var connection = mysql.createConnection({
    host: "REDACTED",
    user: "REDACTED",
    password: "REDACTED",
    database: "REDACTED",
    port: "REDACTED"
});

function fetchMysql() {
    connection.connect(function (err) {
        if (err) throw err;
        console.log("Connected!");
        connection.query("SELECT * FROM places", function (err, result) {
            app.get('/data', function (req, res) {

                if (err) throw err;
                for (var i = 0; i < result.length; i++) {
                    var item = result[i];
                    dataCache[item.iid] = [item.pname, item.address, item.phone, item.link, item.zip, item.lat, item.lng] // item.long, item.lat
                }
                res.send(dataCache);
                console.log("Sending location information")
            })
        });

        console.log("Running 2 query")
        connection.query("SELECT * FROM vaccine_data", function (err, result1) {
            console.log("INside query")
            app.get('/vdata', function (req, res) {
                console.log("here")
                if (err) {
                    throw err;
                }
                var toSend = result1;
                console.log("Sending vaccine data information")
                res.send(toSend)
            })
        });

        connection.query("SELECT * FROM zip_loc", function (err, result2) {
            app.get('/zips', function (req, res) {
                console.log("here")
                if (err) {
                    throw err;
                }
                var toSend = result2;
                console.log("Sending zipcode information")
                res.send(toSend)
            })
        });

        connection.end()
        connection = mysql.createConnection({
            host: "REDACTED",
            user: "REDACTED",
            password: "REDACTED",
            database: "REDACTED",
            port: "REDACTED"
        });
    });
}

fetchMysql();
// cron.schedule('0 0-23 * * *', () =>{
//     fetchMysql()
// }, {
//     timeZone: "America/New_York"
// });

module.exports = {
    dataCache: dataCache
}



