const {
    firestore,
    FieldValue,
    messaging,
} = require('./admin');

const countPlayers = async (change, context) => {
    const VALUE = change.after.data();
    const GAME = context.params.GameID;
    var GAME_NAME = "";
    
    var remaining = 0;
    
    const gameRef = firestore.doc(`Games/${GAME}`);
    const gameDoc = await gameRef.get();

    if (gameDoc.exists){
        let gameDocData = gameDoc.data();
        var MODE = gameDocData.Mode;
        GAME_NAME = gameDocData.Name;
        var playersObject = gameDocData.Players;
        for(let player in playersObject){
            if(playersObject[player].Status === true){
                remaining++;
            }
        }
    }
    //Game Over
    if(remaining === 3){
        //Update each players game doc
        for(let player in playersObject){
            await firestore.doc(`Users/${player}/Games/${GAME}`).set({
                Mode: "Game Over",
                Secret: "1",
                Status: false,
                TimeStamp: FieldValue.serverTimestamp()
            }, {merge: true});
            if(playersObject[player].Status === true){
                playersObject[player].Score += 1
            }
        }
        //Update Game doc
        await gameRef.update({
            Mode: "Game Over",
            Players: playersObject,
            Status: false,
            TimeStamp: FieldValue.serverTimestamp()
        })
        //Set game history
        historyData = {"Result" : 1, "Player": null, "Eliminated": null}
        await firestore.collection(`Games/${GAME}/History`).add({
            "Info" : historyData,
            "TimeStamp" : FieldValue.serverTimestamp()
        })

        var message = {
            "notification":{
            "title": GAME_NAME,
            "body": "Game is now over!"
            },
            topic: GAME,
            "apns": {
            "payload": {
                "aps": {
                    "sound": "default"
                }
            }
        }
        };
        
        messaging.send(message)
        .then((response) => {
            // Response is a message ID string.
            console.log('Successfully sent message:', response);
        })
        .catch((error) => {
            console.log('Error sending message:', error);
        });
    }
    
}

module.exports = countPlayers;