/* eslint-disable object-curly-spacing */
/* eslint-disable max-len */
import { firestore, FieldValue, messaging } from "./admin";

export const checkGuess = async (data: any, context: any) => {
  const GUESS = data.guess;
  const GAME = data.game;
  const USER_NAME = data.name;
  const GUESS_NAME = data.guessName;
  const UID = context.auth.uid;
  let targetID = "";
  // let remaining = 0;
  let positions;
  let playersObject;
  let MODE;
  let GAME_NAME;
  // let data = {};
  let historyData = {};
  // eslint-disable-next-line quotes
  let messageBody = ``;

  const positionRef = firestore.doc(`Games/${GAME}/GameData/Positions`);
  const gameRef = firestore.doc(`Games/${GAME}`);
  const positionDoc = await positionRef.get();
  const gameDoc = await gameRef.get();

  // Positions Document
  if (positionDoc.exists) {
    positions = positionDoc?.data()?.Positions;
    targetID = positions[`${UID}`];
  }

  // Game Document
  if (gameDoc.exists) {
    const gameDocData = gameDoc.data();
    if (gameDocData) {
      MODE = gameDocData.Mode;
      GAME_NAME = gameDocData.Name;
      playersObject = gameDocData.Players;
    }
    // for (const player in playersObject) {
    //   if (playersObject[player].Status === true) {
    //     remaining++;
    //   }
    // }
  }

  // Check the players guess
  if (targetID === GUESS) {
    const newTargert = positions[GUESS];
    positions[UID] = newTargert;
    data = { Player: newTargert, Secret: UID, Eliminated: GUESS, Result: 0 };
    delete positions[GUESS];
    playersObject[GUESS].Status = false;
    messageBody = `${USER_NAME} spooned ${GUESS_NAME}`;
  } else {
    for (const ID in positions) {
      if (positions[ID] === UID) {
        positions[ID] = targetID;
        data = { Player: targetID, Secret: ID, Eliminated: UID, Result: 0 };
        delete positions[UID];
        break;
      }
    }
    playersObject[UID].Status = false;
    messageBody = `${USER_NAME} spooned themselves!`;
  }

  // Set Values in database
  await gameRef.update({
    Players: playersObject,
    TimeStamp: FieldValue.serverTimestamp(),
  });

  // Set Users Secrets and Timestamps
  if (MODE === "Shuffle") {
    const shuffleRef = firestore.doc(`Games/${GAME}/GameData/Shuffle`);
    await shuffleRef.update({
      Count: FieldValue.increment(1),
    });
    await firestore.doc(`Users/${data["Eliminated"]}/Games/${GAME}`).set(
      {
        Secret: "0",
        TimeStamp: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    messageBody += ". Players shuffled!";
  } else {
    for (const player in playersObject) {
      if (player === data["Player"]) {
        await firestore.doc(`Users/${player}/Games/${GAME}`).set(
          {
            Secret: data["Secret"],
            TimeStamp: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      } else if (player === data["Eliminated"]) {
        await firestore.doc(`Users/${player}/Games/${GAME}`).set(
          {
            Secret: "0",
            TimeStamp: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      } else {
        await firestore.doc(`Users/${player}/Games/${GAME}`).set(
          {
            TimeStamp: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }
    }
  }
  // Increment action Count
  const actionRef = firestore.doc(`Games/${GAME}/GameData/Actions`);
  await actionRef.update({
    Count: FieldValue.increment(1),
  });

  // Add to game history
  historyData = { Result: data["Result"], Player: UID, Eliminated: data["Eliminated"] };
  await firestore.collection(`Games/${GAME}/History`).add({
    Info: historyData,
    TimeStamp: FieldValue.serverTimestamp(),
  });

  const message = {
    notification: {
      title: GAME_NAME,
      body: messageBody,
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
    .then((response: any) => {
      // Response is a message ID string.
      console.log("Successfully sent message:", response);
    })
    .catch((error: any) => {
      console.log("Error sending message:", error);
    });
  // console.log(GUESS, GAME, GAME_NAME)
  return GUESS === targetID;
};

module.exports = checkGuess;
