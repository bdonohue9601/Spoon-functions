/* eslint-disable object-curly-spacing */
import * as functions from "firebase-functions";

export const helloWorld = (request: any, response: any) => {
  functions.logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
};

module.exports = helloWorld;
