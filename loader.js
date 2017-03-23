/*
loader.js
variable 'app' is in global scope - i.e. a property of window.
app is our single global object literal - all other functions and properties of 
the game will be properties of app.
*/

"use strict";

const main = require('./main.js');

window.addEventListener('load', function () {
  console.log("window.onload ran");
    let run = main.init();
})