/* eslint-disable object-curly-spacing */
import { firestore, FieldValue, messaging } from "./admin";

export const countPlayers = async (change: any, context: any) => {
  //   const VALUE = change.after.data();
  const GAME = context.params.GameID;
  let GAME_NAME = "";
  let playersObject;

  let remaining = 0;

  const gameRef = firestore.doc(`Games/${GAME}`);
  const gameDoc = await gameRef.get();

  if (gameDoc.exists) {
    const gameDocData = gameDoc.data();
    // const MODE = gameDocData.Mode;
    GAME_NAME = gameDocData?.Name;
    playersObject = gameDocData?.Players;
    for (const player in playersObject) {
      if (playersObject[player].Status === true) {
        remaining++;
      }
    }
  }
  // Game Over
  if (remaining === 3) {
    // Update each players game doc
    // eslint-disable-next-line guard-for-in
    for (const player in playersObject) {
      await firestore.doc(`Users/${player}/Games/${GAME}`).set(
        {
          Mode: "Game Over",
          Secret: "1",
          Status: false,
          TimeStamp: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      if (playersObject[player].Status === true) {
        playersObject[player].Score += 1;
      }
    }
    // Update Game doc
    await gameRef.update({
      Mode: "Game Over",
      Players: playersObject,
      Status: false,
      TimeStamp: FieldValue.serverTimestamp(),
    });
    // Set game history
    const historyData = { Result: 1, Player: null, Eliminated: null };
    await firestore.collection(`Games/${GAME}/History`).add({
      Info: historyData,
      TimeStamp: FieldValue.serverTimestamp(),
    });

    const message = {
      notification: {
        title: GAME_NAME,
        body: "Game is now over!",
      },
      topic: GAME,
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
  }
};

module.exports = countPlayers;
