"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const tslib_1 = require("tslib");
const bcryptjs_1 = tslib_1.__importDefault(require("bcryptjs"));
const firestore_1 = require("firebase/firestore");
const firestore_2 = require("firebase/firestore");
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
const app_1 = require("firebase/app");
dotenv_1.default.config();
// Initialize Firebase
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
};
const app = (0, app_1.initializeApp)(firebaseConfig);
const db = (0, firestore_1.getFirestore)(app);
const usersCollection = "users";
class UserService {
    // Get all users
    getAllUsers() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const querySnapshot = yield (0, firestore_2.getDocs)((0, firestore_2.collection)(db, usersCollection));
                const users = [];
                querySnapshot.forEach((doc) => {
                    users.push(Object.assign({ id: doc.id }, doc.data()));
                });
                return users;
            }
            catch (error) {
                throw new Error(`Failed to get users: ${error}`);
            }
        });
    }
    // Create new user
    createUser(userData) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const hashedPassword = yield bcryptjs_1.default.hash(userData.password, 10);
                const userRef = (0, firestore_2.doc)((0, firestore_2.collection)(db, usersCollection));
                const newUser = Object.assign(Object.assign({}, userData), { password: hashedPassword, createdAt: new Date(), updatedAt: new Date() });
                yield (0, firestore_2.setDoc)(userRef, newUser);
                return Object.assign({ id: userRef.id }, newUser);
            }
            catch (error) {
                throw new Error(`Failed to create user: ${error}`);
            }
        });
    }
    // Get user by ID
    getUserById(userId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const userDoc = yield (0, firestore_2.getDoc)((0, firestore_2.doc)(db, usersCollection, userId));
                if (!userDoc.exists()) {
                    throw new Error("User not found");
                }
                return Object.assign({ id: userDoc.id }, userDoc.data());
            }
            catch (error) {
                throw new Error(`Failed to get user: ${error}`);
            }
        });
    }
    // Update user
    updateUser(userId, updateData) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const userRef = (0, firestore_2.doc)(db, usersCollection, userId);
                // If updating password, hash it
                if (updateData.password) {
                    updateData.password = yield bcryptjs_1.default.hash(updateData.password, 10);
                }
                updateData.updatedAt = new Date();
                yield (0, firestore_2.updateDoc)(userRef, updateData);
                return this.getUserById(userId);
            }
            catch (error) {
                throw new Error(`Failed to update user: ${error}`);
            }
        });
    }
    // Delete user
    deleteUser(userId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, firestore_2.deleteDoc)((0, firestore_2.doc)(db, usersCollection, userId));
                return true;
            }
            catch (error) {
                throw new Error(`Failed to delete user: ${error}`);
            }
        });
    }
    // Get user by email
    getUserByEmail(email) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const querySnapshot = yield (0, firestore_2.getDocs)((0, firestore_2.collection)(db, usersCollection));
                let user = null;
                querySnapshot.forEach((doc) => {
                    const userData = doc.data();
                    if (userData.email === email) {
                        user = Object.assign({ id: doc.id }, userData);
                    }
                });
                if (!user) {
                    throw new Error("User not found");
                }
                return user;
            }
            catch (error) {
                throw new Error(`Failed to get user by email: ${error}`);
            }
        });
    }
}
exports.UserService = UserService;
const userService = new UserService();
exports.default = userService;
