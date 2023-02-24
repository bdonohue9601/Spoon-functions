const {
    firestore,
    FieldValue,
    messaging,
} = require('./admin');

const createGame = async (data, context) => {
    const GAMENAME = data.Name
    const players = data.Players
    const UID = context.auth.uid

    //Set Players
    var setPlayers = {}
    const creator = await firestore.doc(`Users/${UID}`).get();
    const creatorName = creator.data().First + " " + creator.data().Last
    setPlayers[UID] = {"Name" : creatorName, "Score" : 0, "Status": true}
    for (let id in players){
        setPlayers[id] = {"Name" : players[id], "Score" : 0, "Status": true}
    }
    //Create Game Document
    const newGame = await firestore.collection(`Games`).add({
        Admin: UID,
        Mode: "Standard",
        Name: `${GAMENAME}`,
        Players: setPlayers,
        Status: true,
        TimeStamp: FieldValue.serverTimestamp()
    })
    //Set 'Game Created' in History
    let info = {"Eliminated": null, "Player": UID, "Result": 3}
    await firestore.collection(`Games/${newGame.id}/History`).add({
        Info: info,
        TimeStamp: FieldValue.serverTimestamp()
    })
    //Set game in each players game list
    for(let id in setPlayers){
        await firestore.doc(`Users/${id}/Games/${newGame.id}`).set({
            Mode: "Standard",
            Name: GAMENAME,
            Secret: "0",
            Status: true,
            TimeStamp: FieldValue.serverTimestamp()
        })
        //await firestore.doc
    }
    //Start Game
    await firestore.doc(`Games/${newGame.id}/GameData/Positions`).set({
        "Positions" : {}
    })
    await firestore.doc(`Games/${newGame.id}/GameData/Shuffle`).set({
        "Count" : 0
    })
    await firestore.doc(`Games/${newGame.id}/GameData/Actions`).set({
        "Count" : 0
    })
    await firestore.doc(`Games/${newGame.id}/GameData/Shuffle`).update({
        "Count" : FieldValue.increment(1)
    })
    let mytoken = 'e8A9vmcyTEMMpQbUPM9LPq:APA91bHHE6Rmj4tQchm9ardhhuWzAh463WvBR82R8ZxujkShMyawstC0Uh1nc8OifdO1RdQNAuveLpfDroS3KYgKHNOXp1Zrcbfb92PAbKYrzC_tFHS9BiKJ188UiJ6G93PfbIizxZH4'
    
    //await messaging().subscribeToTopic(tokens, newGame.id)

    var message = {
        "token": mytoken,
        "notification":{
          "title": GAMENAME,
          "body": `${creatorName} created a new game!`
        },
        
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
    //console.log("Game Name: ", GAMENAME, "Players: ", players)
    return(newGame.id)
}
module.exports = createGame;