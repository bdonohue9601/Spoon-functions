const {
    firestore,
    FieldValue,
    messaging,
} = require('./admin');

const checkGuess = async (data, context) => {
    const GUESS = data.guess;
    const GAME = data.game;
    const USER_NAME = data.name;
    const GUESS_NAME = data.guessName;
    const UID = context.auth.uid;
    var targetID = "";
    var remaining = 0;
    var positions = {};
    var data = {};
    var historyData = {};
    var messageBody = ``;

    const positionRef = firestore.doc(`Games/${GAME}/GameData/Positions`);
    const gameRef = firestore.doc(`Games/${GAME}`);
    const positionDoc = await positionRef.get();
    const gameDoc = await gameRef.get();

    //Positions Document
    if (positionDoc.exists){
        positions = positionDoc.data().Positions
        targetID = positions[`${UID}`]
    }
    
    //Game Document
    if (gameDoc.exists){
        let gameDocData = gameDoc.data();
        var MODE = gameDocData.Mode;
        var GAME_NAME = gameDocData.Name;
        var playersObject = gameDocData.Players;
        for(let player in playersObject){
            if(playersObject[player].Status === true){
                remaining++;
            }
        }
    }

    //Check the players guess
    if (targetID === GUESS){
        let newTargert = positions[GUESS]
        positions[UID] = newTargert
        data = {"Player" : newTargert, "Secret" : UID, "Eliminated": GUESS, "Result": 0};
        delete positions[GUESS]
        playersObject[GUESS].Status = false;
        messageBody = `${USER_NAME} spooned ${GUESS_NAME}`
    }
    else{
        for(let ID in positions){
            if(positions[ID] === UID){
                positions[ID] = targetID
                data = {"Player" : targetID,  "Secret" : ID, "Eliminated": UID, "Result": 0};
                delete positions[UID]
                break;
            }
        }
        playersObject[UID].Status = false;
        messageBody = `${USER_NAME} spooned themselves!`
    }

    //Set Values in database
    const res = await positionRef.update({
        Positions: positions
    });
    await gameRef.update({
        Players : playersObject,
        TimeStamp: FieldValue.serverTimestamp()
    });

    //Set Users Secrets and Timestamps
    if(MODE === "Shuffle"){
        const shuffleRef = firestore.doc(`Games/${GAME}/GameData/Shuffle`);
        await shuffleRef.update({
            "Count" : FieldValue.increment(1)
        })
        await firestore.doc(`Users/${data["Eliminated"]}/Games/${GAME}`).set({
            Secret: "0",
            TimeStamp: FieldValue.serverTimestamp()
        }, {merge: true});
        messageBody += ". Players shuffled!"
    }
    else{
        for(let player in playersObject){
            if(player === data["Player"]){
                await firestore.doc(`Users/${player}/Games/${GAME}`).set({
                    Secret: data["Secret"],
                    TimeStamp: FieldValue.serverTimestamp()
                }, {merge: true});
            }
            else if(player === data["Eliminated"]){
                await firestore.doc(`Users/${player}/Games/${GAME}`).set({
                    Secret: "0",
                    TimeStamp: FieldValue.serverTimestamp()
                }, {merge: true});
            }
            else{
                await firestore.doc(`Users/${player}/Games/${GAME}`).set({
                    TimeStamp: FieldValue.serverTimestamp()
                }, {merge: true});
            }
        }
    }
    //Increment action Count
    const actionRef = firestore.doc(`Games/${GAME}/GameData/Actions`);
    await actionRef.update({
        "Count" : FieldValue.increment(1)
    })
    
    //Add to game history
    historyData = {"Result" : data["Result"], "Player": UID, "Eliminated": data["Eliminated"]}
    await firestore.collection(`Games/${GAME}/History`).add({
        "Info" : historyData,
        "TimeStamp" : FieldValue.serverTimestamp()
    })
    
    var message = {
        "notification":{
          "title": GAME_NAME,
          "body": messageBody
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
    //console.log(GUESS, GAME, GAME_NAME)
    return (GUESS === targetID);
};

module.exports = checkGuess;
