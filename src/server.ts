import app from "./app";
import config from "./config/config";
import * as admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const startServer = async () => {
  try {
    // Initialize Firebase Admin SDK if not already initialized
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      });
    }

    // Verify Firebase connection
    await admin.auth().listUsers(1);
    console.log("Firebase Admin SDK initialized successfully");

    // Start Express server
    app.listen(config.port, () => {
      console.log(`Express server running on port ${config.port}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Server initialization failed:", error);
    process.exit(1);
  }
};

startServer();
