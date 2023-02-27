/* eslint-disable object-curly-spacing */
import { firestore, FieldValue, messaging } from "./admin";

export const askToPlayAgain = async (data: any, context: any) => {
  const GAMEID = data.gameID;
  const GAMENAME = data.gameName;
  const uid = context.auth.uid;
  const player = await firestore.doc(`Users/${uid}`).get();
  const playerName = player.data()?.First + " " + player.data()?.Last;

  // Update Game History
  const info = { Eliminated: null, Player: uid, Result: 5 };
  await firestore.collection(`Games/${GAMEID}/History`).add({
    Info: info,
    TimeStamp: FieldValue.serverTimestamp(),
  });
  const message = {
    notification: {
      title: GAMENAME,
      body: `${playerName} wants to play again!`,
    },
    topic: GAMEID,
    apns: {
      payload: {
        aps: {
          sound: "default",
        },
      },
    },
  };
  messaging
    .send(message)
    .then((response) => {
      // Response is a message ID string.
      console.log("Successfully sent message:", response);
    })
    .catch((error) => {
      console.log("Error sending message:", error);
    });
};
module.exports = askToPlayAgain;
