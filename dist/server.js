"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const app_1 = tslib_1.__importDefault(require("./app"));
const config_1 = tslib_1.__importDefault(require("./config/config"));
const admin = tslib_1.__importStar(require("firebase-admin"));
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
dotenv_1.default.config();
const startServer = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Initialize Firebase Admin SDK if not already initialized
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: (_a = process.env.FIREBASE_PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, "\n"),
                }),
            });
        }
        // Verify Firebase connection
        yield admin.auth().listUsers(1);
        console.log("Firebase Admin SDK initialized successfully");
        // Start Express server
        app_1.default.listen(config_1.default.port, () => {
            console.log(`Express server running on port ${config_1.default.port}`);
            console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
        });
    }
    catch (error) {
        console.error("Server initialization failed:", error);
        process.exit(1);
    }
});
startServer();
