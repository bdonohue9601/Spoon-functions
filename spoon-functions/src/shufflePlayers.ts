/* eslint-disable object-curly-spacing */
import { firestore, FieldValue } from "./admin";

export const shufflePlayers = async (change: any, context: any) => {
  // const VALUE = change.after.data();
  const GAME = context.params.GameID;
  const array = [];
  const eliminatedArray = [];

  const gameRef = firestore.doc(`Games/${GAME}`);
  // const positionRef = firestore.doc(`Games/${GAME}/GameData/Positions`);

  const gameDoc = await gameRef.get();
  if (gameDoc.exists) {
    const gameDocData = gameDoc.data();
    const playersObject = gameDocData?.Players;
    // Set Both Arrays with active and nonactive players
    for (const player in playersObject) {
      if (playersObject[player].Status === true) {
        array.push(player);
      } else {
        eliminatedArray.push(player);
      }
    }
    // Randomize array
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * i);
      const temp: string = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    const secondArray = array.slice();
    secondArray.push(array[0]);
    secondArray.shift();
    const data: { [x: string]: string } = {};

    // Set active players secrets & Timestamps
    for (let j = 0; j < array.length; j++) {
      data[array[j]] = secondArray[j];
      await firestore.doc(`Users/${secondArray[j]}/Games/${GAME}`).set(
        {
          Secret: array[j],
          TimeStamp: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }
    // Set nonactive players Timestamps
    for (let i = 0; i < eliminatedArray.length; i++) {
      await firestore.doc(`Users/${eliminatedArray[i]}/Games/${GAME}`).set(
        {
          TimeStamp: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }
    // Set player positions
    // Set Game Timestamp
    await gameRef.update({
      TimeStamp: FieldValue.serverTimestamp(),
    });
    // Set Game History
    const historyData = { Result: 2, Player: null, Eliminated: null };
    await firestore.collection(`Games/${GAME}/History`).add({
      Info: historyData,
      TimeStamp: FieldValue.serverTimestamp(),
    });
    // functions.logger.info(data, array, {structuredData: true});
  }
};

module.exports = shufflePlayers;
