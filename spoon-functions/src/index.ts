/* eslint-disable max-len */
/* eslint object-curly-spacing: ["error", "always"] */

import * as functions from "firebase-functions";
import { checkGuess } from "./checkGuess";
import { shufflePlayers } from "./shufflePlayers";
import { countPlayers } from "./countPlayers";
import { createGame } from "./createGame";
import { startGame } from "./startGame";
import { askToPlayAgain } from "./askToPlayAgain";
import { changeGameName } from "./changeGameName";
import { helloWorld } from "./helloWorld";

module.exports = {
  checkGuess: functions.https.onCall(checkGuess),
  shufflePlayers: functions.firestore.document("Games/{GameID}/GameData/Shuffle").onUpdate(shufflePlayers),
  countPlayers: functions.firestore.document("Games/{GameID}/GameData/Actions").onUpdate(countPlayers),
  createGame: functions.https.onCall(createGame),
  startGame: functions.https.onCall(startGame),
  askToPlayAgain: functions.https.onCall(askToPlayAgain),
  changeGameName: functions.https.onCall(changeGameName),
  helloWorld: functions.https.onRequest(helloWorld),
};
// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
