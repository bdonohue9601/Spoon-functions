/* eslint-disable object-curly-spacing */
import { firestore } from "./admin";

export const changeGameName = async (data: any) => {
  const GAMEID = data.gameID;
  const players = data.playersID;
  const newGameName = data.newGameName;
  // const UID = context.auth.uid;

  for (const id of players) {
    await firestore.doc(`Users/${id}/Games/${GAMEID}`).update({
      Name: newGameName,
    });
  }
  firestore.doc(`Games/${GAMEID}`).update({
    Name: newGameName,
  });
};

module.exports = changeGameName;
