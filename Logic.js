//Defines Tile object. Takes a tile index and a tile value and returns a tile.
function Tile(i,value){
  this.ref = $("#tile" + i);
  this.ref.data("index",i);
  this.ref.data("value",value);
  this.ref.data("flipped",false);
  this.ref.data("matched",false)
}

//Main function. On page load, run game. Takes nothing and returns nothing.
window.onload = function() {
  game();
}

//Main game logic. Takes nothing and returns nothing.
function game(){

    //Intializes variables and sets initial values to them.
    count = 16;                   //(int), number of tiles
    moveCount = 0;                //(int), number of moves user has made
    timeCount = 0;                //(int) seconds, amount of tile that has elasped since user began game.
    started = false;              //(bool), has game started?
    finished = false;             //(bool), has game ended?
    starCount = 0;                //(int), number of stars user has
    stopTrigger = false;          //(bool), should the clock stop?
    delay = 500;                  //(int) ms, delay between tile selection and tile match or tile flip.

    //Intializes tile array of length "count"
    tiles = new Array(count);

    //Constructs jQuery object references to the stat html elements.
    moveCounter = $("#moveCounter");
    timeCounter = $("#timeCounter");
    button = $("#resetButton");

    //Calls randomizer function and assigns its output to a variable
    results = randomizer(count);

    //Constructs a new tile with an increment index value and a corresponding results value
    //and assigns it to its respective spot in the tile array
    for (i = 0; i < count ; i++){
      tiles[i] = new Tile(i,results[i]);
    }

    //Assigns click logic to each tile
    for (i = 0; i < count ; i++){
      tiles[i].ref.click(function() {

        //If game hasn't been already won, proceed
        if(isWon()===false){

          //If clock hasn't already been started, start it
          if (started === false){
            clockStart();
            started = true;
          }

          //If two tiles have been flipped, but delay is in effect, do not allow
          //more tiles to be flipped
          if (twoFlipped() === false) {

            //If the tile isn't already matched, allow it to be clicked
            if ($(this).data("matched") === false){

              //If another tile is flipped, run match logic, else just flip tile
              if(isTileFlipped()===true){
                flip(this);

                //Update game stats
                moveCount = moveCount + 1;
                moveCounter.text(moveCount);
                starCount = starMeter(moveCount);

                //Core game logic. Runs after the specified delay
                setTimeout(function(){

                  //If two flipped tiles are a match, run match function
                  if (isMatch()){
                    match();

                    //If the game is won, run won function
                    if (isWon()===true){
                      won();
                    }
                  }

                  //If tiles aren't match, run reset logic
                  else{
                    reset();
                  }
                },delay)
              }
              else{
                flip(this);
              }
            }
          }
        }
      })
    }

    //Assigns click logic to reset button. If clicked, reset game.
    button.on("click", function(){
      resetGame();
    });

    //Function that resets game if the reset button is clicked. Takes nothing and
    //returns nothing.
    function resetGame(){

      //Return all variables to their original values
      moveCount = 0;
      timeCount = 0;
      started = false;
      finished = false;
      starCount = 0;
      stopTrigger = true;

      //Get a new results array from the randomizer function and reassign it to the
      //results array
      results = randomizer(count);

      //Construct a new set of tiles and assign them to their respective spots in the
      //tiles array
      for (i = 0; i < count ; i++){
        tiles[i] = new Tile(i,results[i]);
      }

      //Update the stats display elements
      moveCounter.text(moveCount);
      timeCounter.text(timeCount);
      starReset = starMeter(moveCount);

      //Unmatch and unflip all tiles
      resetAll();
    }

    //This function reads the board and sees if there is a match. Takes nothing
    //returns true if there is a match, and false otherwise
    function isMatch(){

      //Loop through every tile pair combination, excluding self to self comparision
      for (i=0; i < count; i++){
        for (j=0; j<count; j++){
          if (i !== j){

            //If both tiles are flipped and both tiles have the same value, return true
            if(tiles[i].ref.data("value") == tiles[j].ref.data("value")){
              if(tiles[i].ref.data("flipped")==true && tiles[j].ref.data("flipped")==true){
                return true;
              }
            }
          }
        }
      }
      return false;
    }

    //This function starts and also end the clock. Takes nothing and returns nothing
    function clockStart(){

      //Repeat time update code once every 1000 milliseconds, or 1 second.
      interval = window.setInterval(function() {

        //Increment time count and display results
        timeCount = timeCount + 1;
        timeCounter.text(timeCount);

        //If either the game is one, or the reset button flips the stopTrigger
        //stop the interval from repeating and reset the time display to 0
        if (isWon() === true){
          clearInterval(interval);
          timeCounter.text("0");
        }
        if (stopTrigger === true){
          clearInterval(interval);
          stopTrigger = false;
          timeCounter.text("0");
        }

      },1000)
    }

    //This function checks if two tiles are flipped. Takes nothing and returns
    //true if two tiles are flipped on the board and false otherwise
    function twoFlipped(){
      flippedcount = 0;   //(int), number of tiles flipped

      //Checks every tile to see if it is flipped and increments the flippedcount
      for (i=0; i < count; i++){
        if(tiles[i].ref.data("flipped")==true){
          flippedcount = flippedcount + 1;
        }
      }

      //If two tiles or more are flipped, return true, else return false
      if (flippedcount >= 2){
        return true;
      }
      else{
        return false;
      }
    }

    //This function updates the stars graphics to reflect the amount of
    //moves made. Takes a move count and returns the number of stars associated
    //with the amount of moves made.
    function starMeter(moveCount){

      //Assign jQuery refrences
      star1 = $("#star1");
      star2 = $("#star2");
      star3 = $("#star3");

      //Initial set star div images to display stars
      star1.attr("src","Star.bmp");
      star2.attr("src","Star.bmp");
      star3.attr("src","Star.bmp");

      //If 16 moves are made, set a star div to show a blank, and if 24 moves
      //are made turn another star into a blank.
      if (moveCount >= 16){
        star3.attr("src","Blank.bmp");
        if (moveCount >= 24){
          star2.attr("src","Blank.bmp");
          return 1;
        }
        return 2;
      }
      return 3;
    }

    //This function checks to see if a tile is flipped on the board. Takes nothing
    //and returns nothing
    function isTileFlipped(){

      //Loop through every tile. If any tile is flipped, return true, else return false.
      for (i=0; i < count; i++){
        if(tiles[i].ref.data("flipped")==true){
          return true;
        }
      }
      return false;
    }

    //This function checks to see if the game is won. Takes nothing and returns
    //nothing.
    function isWon(){

      //Loop through every tile. If any tile is not matched, return false, else
      //return true.
      for (i=0; i < count; i++){
        if(tiles[i].ref.data("matched")===false){
          return false;
        }
      }
      return true;
    }

    //This function creates the win modal when the game is won. Takes nothing and
    //returns nothing
    function won(){

      //Assign jQuery object
      body = $("body");

      //HTML code to add that creates a background 'blur' and the dialog box with
      //stats and a reset button
      popUpHTML = '<div id="blur"></div>'+
                  '<div id="winPop">'+
                    '<h2 class="black"> Congrats! You Won! </h2>'+
                    '<h3> Your Stats: </h3>'+
                    '<h5 id="winMoves"></h5>'+
                    '<h5 id="winTime"></h5>'+
                    '<h5 id="winStars"></h5>'+
                    '<button id="winResetButton">Play Again?</button>'+
                  '</div>'

      //Add in HTML code
      body.prepend(popUpHTML);

      //Create jQuery objects representing stats in the modal pop up
      winResetButton = $("#winResetButton");
      winMoves = $("#winMoves");
      winStars = $("#winStars");
      winTime = $("#winTime");

      //Update stats sections with game data
      winStars.text("Stars: " + starCount);
      winMoves.text("Moves: " + moveCount);
      winTime.text("Time: " + timeCount);

      //Program button such that when clicked, the game resets, the clock stops
      //and the modal popup and background blur disappear
      winResetButton.on("click", function(){
        resetGame();
        stopTrigger = false;
        $("#blur").remove();
        $("#winPop").remove();
      });

    }

    //This function 'flips' a tile between a blank state and a flipped state.
    //Takes a tileref number and returns nothing
    function flip(tileref){

      //If not flipped, change color to purple and display tile content
      if ($(tileref).data("flipped") == false) {
        $(tileref).css("background-color","purple");
        $(tileref).data("flipped",true);
        $(tileref).append("<h4>"+ $(tileref).data("value") + "</h4>");
      }

      //If flipped, delete tile content and set color back to yellow
      else{
        $(tileref).css("background-color","yellow");
        $(tileref).data("flipped",false);
        $(tileref).children().remove();
      }
    }

    //This function creates matched tiles. It takes nothing and returns nothing
    function match(){

      //loop through all tiles. If the tile is already flipped, change background
      //color to red and update relevant variables
      for (i=0; i < count; i++){
        if(tiles[i].ref.data("flipped")===true){
          tiles[i].ref.css("background-color","red");
          tiles[i].ref.data("matched",true);
          tiles[i].ref.data("flipped",false);
        }
      }
    }

    //This function resets the board to all blank tiles, but only works on flipped
    //tiles, not matched tiles. Takes nothing and returns nothing
    function reset(){

      //Loop through all tiles. If a tile is flipped, unflip it
      for (i=0; i < count; i++){
        if(tiles[i].ref.data("flipped")===true){
          flip(tiles[i].ref);
        }
      }
    }

    //This function resets the board to all blanks tiles, and works on all tiles,
    //flipped and matched. Takes nothing and returns nothing
    function resetAll(){

      //Loop through all tiles and sets the relevant variables to a blank state
      //and makes the tile look blank
      for (i=0; i < count; i++){
          tiles[i].ref.data("matched")===false;
          tiles[i].ref.data("flipped")===false;
          tiles[i].ref.css("background-color","yellow");
          tiles[i].ref.children().remove();
      }
    }

};

//This function takes a total tile count and returns an array with random numbers
//such that every number has exactly one match throughout the entire array
function randomizer(total){

  //Initialize variables
  randCount = 1;                //(int), number of random numbers assigned
  toPrint = 1;                  //(int), number to print to array
  firstTile = true;             //(bool), is it the first number, and thus needs a match?
  results = new Array(total);   //(array of ints), results

  //Set new array to be blank
  results.fill("");

  //Ensure that the tile count requested is even, else throw an error
  if (total % 2 == 0) {

    //Continue until array is filled with numbers
    while (randCount <= total) {

      //Generate new random number and assign it to index variable
      index = randomInt(total);

      //If the array spot represented by the index variable is empty, assign
      //toPrint number to that spot. Else, loop back around. Itterate the count
      //variable every time a number is assigned. If the added number the second instance of a
      //given toPrint number, itterate the toPrint number
      if (results[index] == "") {
        results[index] = toPrint;
        randCount = randCount + 1;
        if (firstTile === true) {
          firstTile = false;
        }
        else{
          firstTile = true;
          toPrint = toPrint + 1;
        }
      }
    }
    return results;
  }
  else {
    console.log("Error, noneven tile amount");
  }
}

//This function takes a total number and return a random integer between 0 and 
//the input number - 1
function randomInt(total){
  return Math.floor(Math.random()*total);
}
