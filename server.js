var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');

var request = require('request');
var cheerio = require('cheerio');

var Listing = require('./models/Listing.js');
var Note = require('./models/Note.js');

var app = express();
var port = process.env.PORT || 3000;

app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(express.static('public'));

var exphbs = require('express-handlebars');
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// mongoose.connect('mongodb://localhost/jobscraper' || 'mongodb://heroku_g770rdzb:thna8no5fjtu75tf5ggech7et2@ds163301.mlab.com:63301/heroku_g770rdzb');
var databaseUri = 'mongodb://localhost/jobscraper';
if (process.env.MONGODB_URI) {
	mongoose.connect(process.env.MONGODB_URI);
} else {
	mongoose.connect(databaseUri);
}

var db = mongoose.connection;

db.on('error', function(error) {
    console.log('Mongoose Error: ', error);
});

db.once('open', function() {
    console.log('Mongoose connection sucessful.');
});

app.get('/', function(req, res) {
	Listing.find({}, function(err, doc) {
		if (err) {
			console.log(err);
		} else {
			var hbsObject = {
				listings: doc
			}
			console.log(hbsObject);
			res.render('index', hbsObject);
		}
	});
});

app.get('/scrape', function(req, res) {
    request('https://www.indeed.com/jobs?q=%22technical+product+manager%22&l=los+angeles%2C+ca', function(error, response, html) {
        var $ = cheerio.load(html);
        $('div h2').each(function(i, element) {
            var result = {};
            result.title = $(this).children('a').text();
            result.link = 'http://www.indeed.com' + $(this).children('a').attr('href');

            var entry = new Listing(result);

            entry.save(function(err, doc) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(doc);
                }
            });
        });
    });

    res.send('Scrape Complete! =)');
});

app.get('/listings', function(req, res) {
    Listing.find({}, function(error, doc) {
        if (error) {
            console.log(error);
        } else {
            res.json(doc);
        }
    });
});

app.get('listings/:id', function(req, res) {
    Listing.findOne({ _id: req.params.id })
        .populate('note')
        .exec(function(err, doc) {
            if (error) {
                console.log(error);
            } else {
                res.json(doc);
            }
        });
});

app.post('/listings/:id', function(req, res) {
    var newNote = new Note(req.body);
    newNote.save(function(error, doc) {
        if (error) {
            console.log(error);
        } else {
            Listing.findOneAndUpdate({ _id: req.params.id }, { note: doc._id })
                .exec(function(err, doc) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.send(doc);
                    }
                });
        }
    });
});


app.listen(port, function() {
    console.log('App running on port ' + port + ' !');
});
