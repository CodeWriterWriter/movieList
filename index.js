var omdb = require('omdb');

var movieToSearch = process.argv[2];

if (movieToSearch != undefined && movieToSearch != null ) {
  var sameTitle =[];
  omdb.search(movieToSearch, function(err, movies) {
    if (err) {
      console.log(err)
    }
    if (movies.length < 1) {
      return console.log("no movies");
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
  })
}
else {
  console.log("Enter a search term")
}
