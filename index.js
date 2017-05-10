var omdb = require('omdb');
var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var scopes = ['https://www.googleapis.com/auth/spreadsheets'];

var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';
var sheetId;

fs.readFile('client_secret.json', function processClientSecrets(err, content) {
   if (err) {
     console.log(err)
   }
   fs.readFile("spreadSheetId.txt", function (err, id) {
     sheetId = id.toString().trim();
     authorize(JSON.parse(content), searchMovie);
   })
})

function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      oauth2Client.getRequestMetadata(redirectUrl, function(err, headers, response) {
        if (err) {
          console.log("err: " + err)
          console.log("response: " + response)
        }
      });
      callback(oauth2Client);
    }
  })
}


function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes
  });
  console.log("Authorize at this url: \n" + authUrl);
  var rl = readline.createInterface ({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from the page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, tokens) {
      if (err) {
        console.log("Error getting token: " + err );
        return;
      }
      oauth2Client.credentials = tokens;
      storeToken(tokens);
      callback(oauth2Client);
    });
  });
}

function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != "EEXIST") {
      throw err;
    }
  }
  console.log(JSON.stringify(token))
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

function testSheet(auth) {
  var sheets = google.sheets('v4');
  var request = {
    auth: auth,
    spreadsheetId: "1bcIq0H31aC65vAuOWndj52WDNwa5aR5BP1K_XQGPG8o",
    range: "sheet1",
    includeValuesInResponse: true,
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [
        ["gnat"]
      ]
    }
  }
  sheets.spreadsheets.values.append(request, function(err, response) {
    if (err) {
      console.log("The api returned error: " + err);
    } else {
      console.log("Data Succesfully Written");
    }
  })
  /*sheets.spreadsheets.values.get({
    auth: auth,
    spreadsheetId: '1bcIq0H31aC65vAuOWndj52WDNwa5aR5BP1K_XQGPG8o',
    range: 'Sheet1', //Change Sheet1 if your worksheet's name is something else
  }, (err, response) => {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var rows = response.values;
    if (rows.length === 0) {
      console.log('No data found.');
    } else {
      console.log(rows)
    }
  });*/
}

function searchMovie(auth){
  var movieToSearch = process.argv[2];
  var movieToSearchYear = process.argv[3];

  if (movieToSearch == "-r") {
    randomMovie(auth, movieToSearchYear);
  } else if (movieToSearch != undefined && movieToSearch != null ) {
    var sameTitle =[];
    var searchObject = {
      terms: movieToSearch,
      type: "movie"
    }
    omdb.search(searchObject, function(err, movies) {
      if (err) {
        return console.log(err)
      }
      if (movies.length < 1) {
        return console.log("Couldn't find a movie with that title");
      }
      movies.forEach(function(movie){
        //console.log(movie.title + "  " + movie.year)
        if (movie.title.toUpperCase() === movieToSearch.toUpperCase()) {
          sameTitle.push(movie);
        }
      })
      if (sameTitle.length == 1) {
        omdb.get(sameTitle[0].imdb, function(err, movie) {
          console.log(movie.title);
          console.log(movie.genres);
          console.log(movie.runtime);
          console.log(movie.director);
          console.log(movie.plot);
          movieWrite(auth, movie);
        })
      }
      else if (sameTitle.length == 0) {
        console.log("Couldn't find a movie with that exact title")
        console.log("Did you mean one of these?")
        movies.forEach(function(movie) {
          console.log(movie.title)
        })
      }
      else {
        if (movieToSearchYear != undefined && movieToSearchYear != null ) {
          var exactMatch;
          sameTitle.forEach(function(movie){
            if (movie.year == movieToSearchYear) {
              exactMatch = movie;
            }
          })
          if (exactMatch == undefined) {
            console.log("Couldn't fine a movie of that name and year")
          }
          else {
            omdb.get(exactMatch.imdb, function(err, movie) {
              console.log(movie.title);
              console.log(movie.genres);
              console.log(movie.runtime);
              console.log(movie.director);
              console.log(movie.plot);
              movieWrite(auth, movie)
            })
          }
        }
        else {
          console.log("Found multiple movies of that name")
          console.log("Did you mean one of these?")
          sameTitle.forEach(function(movie){
            console.log(movie.title + " " + movie.year)
          })
        }
      }
    })
  }
  else {
    console.log("Enter a search term")
  }
}
function randomMovie(auth, options) {
  var option = options;
  var sheets = google.sheets('v4');
  var request = {
    spreadsheetId: sheetId,
    valueRenderOption: 'FORMATTED_VALUE',
    dateTimeRenderOption: 'FORMATTED_STRING',
    range: "sheet1",
    auth: auth
  }
  sheets.spreadsheets.values.get(request, function(err, response) {
    if (err) {
      console.log("The api returned error: " + err);
    } else {
      var rows = response.values;
      if (rows.length == 0) {
        console.log("No data found");
      } else {
        //console.log(rows[3][0])
        var found = false;
        var pos;
        if  (option == "-a" || option == "-s" || option == "-u") {
          while (!found) {
            pos = Math.round(Math.random() * (rows.length))
            //console.log(rows[pos][0])
            if (option == "-a") {
              found = true;
            } else if (option == "-s") {
              if (rows[pos][4] == "yes") {
                found = true;
              }
            } else if (option == "-u") {
              if (rows[pos][4] != "yes") {
                found = true;
              }
            }
          }
          console.log(rows[pos][0]);
          console.log(rows[pos][1]);
          console.log(rows[pos][2]);
          console.log(rows[pos][3]);
          console.log(rows[pos][5]);
        } else {
          console.log("pick option: Any -a, Seen -s, Unseen -u")
        }
      }
    }
  })
}


function movieWrite(auth, movie) {
  var sheets = google.sheets('v4');
  var genreList = "";
  movie.genres.forEach(function(genre) {
    genreList += genre.toString()+", ";
  })
  var request = {
    auth: auth,
    spreadsheetId: sheetId,
    range: "sheet1!A1:A",
    includeValuesInResponse: true,
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [
        [movie.title, genreList, movie.runtime, movie.director, "", movie.plot ]
      ]
    }
  }
  sheets.spreadsheets.values.append(request, function(err, response) {
    if (err) {
      console.log("The api returned error: " + err);
    } else {
      console.log("Data Succesfully Written");
    }
  })
}
