/* eslint-disable max-len */
const functions = require("firebase-functions");
const checkGuess = require("./checkGuess");
const shufflePlayers = require("./shufflePlayers");
const countPlayers = require("./countPlayers");
const createGame = require("./createGame");
const startGame = require("./startGame");
const askToPlayAgain = require("./askToPlayAgain");
const changeGameName = require("./changeGameName");

module.exports = {
  "checkGuess": functions.https.onCall(checkGuess),
  "shufflePlayers": functions.firestore.document("Games/{GameID}/GameData/Shuffle").onUpdate(shufflePlayers),
  "countPlayers": functions.firestore.document("Games/{GameID}/GameData/Actions").onUpdate(countPlayers),
  "createGame": functions.https.onCall(createGame),
  "startGame": functions.https.onCall(startGame),
  "askToPlayAgain": functions.https.onCall(askToPlayAgain),
  "changeGameName": functions.https.onCall(changeGameName),
};
