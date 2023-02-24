const {
    firestore,
    FieldValue,
    messaging,
} = require('./admin');

const changeGameName = async (data, context) => {

    const GAMEID = data.gameID
    const players = data.playersID
    const newGameName = data.newGameName
    const UID = context.auth.uid

    for(let id of players){
        await firestore.doc(`Users/${id}/Games/${GAMEID}`).update({
            Name: newGameName,
        })
    }
    firestore.doc(`Games/${GAMEID}`).update({
        Name : newGameName
    })
}

module.exports = changeGameName;
