const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });
const admin = require("firebase-admin");
const serviceAccount = require("./service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://examplechatbot-99651-default-rtdb.europe-west1.firebasedatabase.app/",
});

const { SessionsClient } = require("dialogflow");

exports.dialogflowGateway = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    const { queryInput, sessionsId } = request.body;
    const sessionsClient = new SessionsClient({ credentials: serviceAccount });
    const session = sessionsClient.sessionPath("ExampleChatbot", sessionsId);

    const responses = await sessionsClient.detectIntent({
      session,
      queryInput,
    });

    const result = responses[0].queryResult;

    result.fulfillmentText;

    response.send(result);
  });
});

const { WebhookClient } = require("dialogflow-fulfillment");

exports.dialogflowWebhook = functions.https.onRequest(
  async (request, response) => {
    const agent = new WebhookClient({ response, response });

    console.log(JSON.stringify(request.body));

    const result = request.body.queryResult;

    async function userOnboardingHandler(agent) {
      const db = admin.firestore();

      const profile = db.collection("users").doc("jeffd23");

      const { name, color } = result.parameters;

      await profile.set({ name, color });
      agent.add(`Welcome abroad my friend!`);
    }
    let intentMap = new Map();
    intentMap.set("UserOnboarding", userOnboardingHandler);
    agent.handleRequest(intentMap);
  }
);
