const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp();

const firestore = admin.firestore();
const FieldValue = admin.firestore.FieldValue
const messaging = admin.messaging()
module.exports = {
  firestore,
  FieldValue,
  messaging,
};