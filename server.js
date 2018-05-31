var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Connect to the Mongo DB
// mongoose.connect("mongodb://localhost/beeScrapper");




// Database configuration with mongoose
if(process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI);

// Connect to the Mongo DB

  mongoose.Promise = Promise;


} else {
  mongoose.connect("mongodb://localhost/beeScrapper");
}
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});



@app.route('/scrape', methods = ['GET', 'POST'])

@app.route('/articles', methods = ['GET', 'POST'])

@app.route('/articles/:id', methods = ['GET', 'POST'])


// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  axios.get("http://www.sacbee.com/news/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("h4.title").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          return res.json(err);
        });
    });

    // If we were able to successfully scrape and save an Article, send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // TODO: Finish the route so it grabs all of the articles

// Grab every doc in the Articles array
  db.Article.find({}).populate("note").exec(function(err, docs) {
    // Log any errors
    if (err) {
      console.log(err);
    }
    // Or send the doc to the browser as a json object
    else {
      // res.json(doc);
      console.log('populating articles with notes...')
      res.json(docs);
    }
  })


});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // TODO
  // ====
  // Finish the route so it finds one article using the req.params.id,
  // and run the populate method with "note",
  // then responds with the article with the note included

// Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ "_id": req.params.id })
  // ..and populate all of the notes associated with it
  .populate("note")
  .populate("favorite")
  
  // now, execute our query
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  })

});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // TODO
  // ====
  // save the new note that gets posted to the Notes collection
  // then find an article from the req.params.id
  // and update it's "note" property with the _id of the new note

// Create a new note and pass the req.body to the entry
  var newNote = new db.Note(req.body);
  

 // var newFavorite = new db.Favorite(req.body);
  // var newFavorite = new db.Favorite(req.body);
 

  // And save the new note the db
  newNote.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the article id to find and update it's note
      db.Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
      // Execute the above query
      .exec(function(err, doc) {
        console.log("req: ",doc);
        // Log any errors
        if (err) {
          console.log(err);
        }
        else {
          // Or send the document to the browser
          console.log("docidin:",doc._id);
          // req.note.push(doc._id);
          res.send(doc);
        }
      });
    }
  })


 // And save the new favorite the db
  // newFavorite.save(function(error, doc) {
  //   // Log any errors
  //   if (error) {
  //     console.log(error);
  //   }
  //   // Otherwise
  //   else {
  //     // Use the article id to find and update it's note
  //     db.Article.findOneAndUpdate({ "_id": req.params.id }, { "favorite": doc._id })
  //     // Execute the above query
  //     .exec(function(err, doc) {
  //       console.log("req: ",doc);
  //       // Log any errors
  //       if (err) {
  //         console.log(err);
  //       }
  //       else {
  //         // Or send the document to the browser
  //         console.log("docidin:",doc._id);
  //         // req.note.push(doc._id);
  //         res.send(doc);
  //       }
  //     });
  //   }
  // })



});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
