const {
    firestore,
    FieldValue,
    messaging,
} = require('./admin');

const shufflePlayers = async (change, context) => {
    const VALUE = change.after.data();
    const GAME = context.params.GameID;
    let array = [];
    let eliminated_array = [];

    const gameRef = firestore.doc(`Games/${GAME}`);
    const positionRef = firestore.doc(`Games/${GAME}/GameData/Positions`);

    const gameDoc = await gameRef.get();
    if (gameDoc.exists){
        let gameDocData = gameDoc.data();
        let playersObject = gameDocData.Players;
        //Set Both Arrays with active and nonactive players
        for(let player in playersObject){
            if(playersObject[player].Status === true){
                array.push(player)
            }
            else{
                eliminated_array.push(player)
            }
        }
        //Randomize array
        for(let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * i)
            const temp = array[i]
            array[i] = array[j]
            array[j] = temp
        }
        let secondArray = array.slice();
        secondArray.push(array[0])
        secondArray.shift();
        let data = {};

        //Set active players secrets & Timestamps
        for (let j = 0; j < array.length; j++){
            data[array[j]] = secondArray[j]
            await firestore.doc(`Users/${secondArray[j]}/Games/${GAME}`).set({
                Secret: array[j],
                TimeStamp: FieldValue.serverTimestamp()
            }, {merge: true});
        }
        //Set nonactive players Timestamps
        for(let i = 0; i < eliminated_array.length; i++){
            await firestore.doc(`Users/${eliminated_array[i]}/Games/${GAME}`).set({
                TimeStamp: FieldValue.serverTimestamp()
            }, {merge: true});
        }
        //Set player positions
        const res = await positionRef.update({
            Positions: data
        });
        //Set Game Timestamp
        await gameRef.update({
            TimeStamp: FieldValue.serverTimestamp()
        });
        //Set Game History
        historyData = {"Result" : 2, "Player": null, "Eliminated": null}
        await firestore.collection(`Games/${GAME}/History`).add({
            "Info" : historyData,
            "TimeStamp" : FieldValue.serverTimestamp()
        })
        //functions.logger.info(data, array, {structuredData: true});
    }
};

module.exports = shufflePlayers;
