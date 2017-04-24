var omdb = require('omdb');

var movieToSearch = process.argv[2];
var movieToSearchYear = process.argv[3];

if (movieToSearch != undefined && movieToSearch != null ) {
  var sameTitle =[];
  omdb.search(movieToSearch, function(err, movies) {
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
