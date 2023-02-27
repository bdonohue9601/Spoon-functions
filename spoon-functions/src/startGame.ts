/* eslint-disable object-curly-spacing */
import { firestore, FieldValue } from "./admin";

export const startGame = async (data: any, context: any) => {
  const GAMEID = data.gameID;
  const players = data.playersID;
  const UID = context.auth.uid;
  const setStatus: { [x: string]: { Status: boolean } } = {};
  for (const player of players) {
    setStatus[player] = { Status: true };
  }

  // Update Game Document
  await firestore.collection("Games").doc(GAMEID).set(
    {
      Mode: "Standard",
      Players: setStatus,
      Status: true,
      TimeStamp: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
  // Update each players reference
  for (const id of players) {
    await firestore.doc(`Users/${id}/Games/${GAMEID}`).update({
      Mode: "Standard",
      Status: true,
      TimeStamp: FieldValue.serverTimestamp(),
    });
  }
  // Update Game History
  const info = { Eliminated: null, Player: UID, Result: 4 };
  await firestore.collection(`Games/${GAMEID}/History`).add({
    Info: info,
    TimeStamp: FieldValue.serverTimestamp(),
  });
  // Shuffle players and start
  const shuffleRef = firestore.doc(`Games/${GAMEID}/GameData/Shuffle`);
  await shuffleRef.update({
    Count: FieldValue.increment(1),
  });

  return "Game Started";
};

module.exports = startGame;
