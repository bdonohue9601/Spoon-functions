// import functions from "firebase-functions";
import admin = require("firebase-admin");
admin.initializeApp();
export const firestore = admin.firestore();
export const FieldValue = admin.firestore.FieldValue;
export const messaging = admin.messaging();
module.exports = {
  firestore,
  FieldValue,
  messaging,
};
