var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');

var request = require('request');
var cheerio = require('cheerio');

var Listing = require('./models/Listing.js');
var Note = require('./models/Note.js');
var Save = require('./models/Save.js');

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

// begin listings

app.get('/', function(req, res) {
    Listing.find({}, function(err, doc) {
        if (err) {
            console.log(err);
        } else {
            var hbsObject = {
                listings: doc
            }
            res.render('index', hbsObject);
        }
    });
});

app.post('/scrape', function(req, res) {
    Listing.remove({}, function(err) {
        if (err) return err;
    }).then(function() {
        request('https://www.indeed.com/jobs?q=' + req.body.jobTitle + '&l=los+angeles%2C+ca', function(error, response, html) {
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
            res.redirect('/');
        });
    });
});

app.get('/remove/:id', function(req, res) {
    Listing.remove({ _id: req.params.id }, function(err, doc) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
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

app.get('/listings/:id', function(req, res) {
    Listing.findOne({ _id: req.params.id })
        .populate('note')
        .exec(function(err, doc) {
            if (err) {
                console.log(err);
            } else {
                res.json(doc);
            }
        });
});

// begin saves

app.get('/saves', function(req, res) {
    Save.find({}, function(err, doc) {
        if (err) {
            console.log(err);
        } else {
            var hbsObject = {
                saves: doc
            }
            res.render('saves', hbsObject);
        }
    });
});

app.post('/saves/:id', function(req, res) {
    Listing.findOne({ _id: req.params.id }, function(err, doc) {
        if (err) {
            return err;
        } else {
            var result = {};
            result.title = doc.title;
            result.link = doc.link;
            var newSave = new Save(result);
            newSave.save(function(err2, doc2) {
                if (err2) {
                    return err2;
                }
            }).then(function() {
                Listing.remove({ _id: req.params.id }, function(err3, doc3) {
                    if (err3) {
                        return err3;
                    } else {
                        // res.redirect('/');
                    }
                });
            });
        }
    });
});

app.get('/delete/:id', function(req, res) {
    Save.remove({ _id: req.params.id }, function(err) {
        if (err) {
            console.log(err);
        } else {
            // res.redirect('/saves');
        }
    });
});

app.get('/saved', function(req, res) {
    Save.find({}, function(error, doc) {
        if (error) {
            console.log(error);
        } else {
            res.json(doc);
        }
    });
});

app.get('/saved/:id', function(req, res) {
    Save.findOne({ _id: req.params.id })
        .populate('note')
        .exec(function(err, doc) {
            if (err) {
                console.log(err);
            } else {
                res.json(doc);
            }
        });
});

// begin notes

// :id here is id of the listing that the note belongs to
app.post('/notes/:id', function(req, res) {
    var newNote = new Note(req.body);
    newNote.save(function(err, doc) {
        if (err) {
            console.log(err);
        } else {
            Save.findOneAndUpdate({ _id: req.params.id }, { $push: { note: doc._id } }, { new: true })
                .exec(function(err, doc) {
                    if (err) {
                        console.log(err);
                    } else {
                        // res.send(doc);
                        res.redirect('/saves');
                    }
                });
        }
    });
});

app.get('/erase/:id', function(req, res) {
    Note.remove({ _id: req.params.id }, function(err) {
        if (err) {
            console.log(err);
        } else {
            // res.redirect('/saves');
        }
    });
});

app.get('/notes', function(req, res) {
    Note.find({}, function(error, doc) {
        if (error) {
            console.log(error);
        } else {
            res.json(doc);
        }
    });
});

app.get('/notes/:id', function(req, res) {
    Note.findOne({ _id: req.params.id }, function(err, doc) {
        if (err) {
            console.log(err);
        } else {
            res.json(doc);
        }
    });
});

// end routes

app.listen(port, function() {
    console.log('App running on port ' + port + ' !');
});
