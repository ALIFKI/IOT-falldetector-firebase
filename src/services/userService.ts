import bcrypt from "bcryptjs";
import { getFirestore } from "firebase/firestore";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import dotenv from "dotenv";
import { initializeApp } from "firebase/app";


dotenv.config();

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const usersCollection = "users";

interface UserData {
  id?: string;
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserService {
  // Get all users
  public async getAllUsers() {
    try {
      const querySnapshot = await getDocs(collection(db, usersCollection));
      const users: UserData[] = [];
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() } as UserData);
      });
      return users;
    } catch (error) {
      throw new Error(`Failed to get users: ${error}`);
    }
  }

  // Create new user
  public async createUser(userData: UserData) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const userRef = doc(collection(db, usersCollection));

      const newUser = {
        ...userData,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(userRef, newUser);
      return { id: userRef.id, ...newUser };
    } catch (error) {
      throw new Error(`Failed to create user: ${error}`);
    }
  }

  // Get user by ID
  public async getUserById(userId: string) {
    try {
      const userDoc = await getDoc(doc(db, usersCollection, userId));
      if (!userDoc.exists()) {
        throw new Error("User not found");
      }
      return { id: userDoc.id, ...userDoc.data() } as UserData;
    } catch (error) {
      throw new Error(`Failed to get user: ${error}`);
    }
  }

  // Update user
  public async updateUser(userId: string, updateData: Partial<UserData>) {
    try {
      const userRef = doc(db, usersCollection, userId);

      // If updating password, hash it
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      updateData.updatedAt = new Date();
      await updateDoc(userRef, updateData);

      return this.getUserById(userId);
    } catch (error) {
      throw new Error(`Failed to update user: ${error}`);
    }
  }

  // Delete user
  public async deleteUser(userId: string) {
    try {
      await deleteDoc(doc(db, usersCollection, userId));
      return true;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error}`);
    }
  }

  // Get user by email
  public async getUserByEmail(email: string) {
    try {
      const querySnapshot = await getDocs(collection(db, usersCollection));
      let user = null;

      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.email === email) {
          user = { id: doc.id, ...userData };
        }
      });

      if (!user) {
        throw new Error("User not found");
      }

      return user as UserData;
    } catch (error) {
      throw new Error(`Failed to get user by email: ${error}`);
    }
  }
}

const userService = new UserService();
export default userService;
