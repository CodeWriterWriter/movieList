# MovieList
## Command Line tool to add movie information to a google spreadsheet
### Requirements
`1. Node.js `

`2.A google sheet`
### Installation instructions
`1. Git clone https://github.com/CodeWriterWriter/movieList `

`2. Npm install`

`3. Write the google sheet id to a file named "spreadSheetId.txt"`

`4. On first time use you'll be given an authorisation link. Click this, allow permissions, paste the verifcation code in the command prompt`

### Usage

`node index.js "Movie Title As String" "Year Movie came out(optional)"`

If a movie isn't found with the entered name, it will return a list of possible movies you meant.

If multiple movies of the same name are found, enter the year to determine which you intend to add.

### TODO
`1. Get API key for movie api / Find new Api`

`2. Add Commander support`

`3. Add getter of movies`

`4. Add "seen" flag`

`5. Add check for movies already in list`

`6. Add random movie from list option`

`7. Add output to csv`

`8. Add  genre filter get movie from list `
