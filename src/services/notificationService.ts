import { getFirestore } from "firebase/firestore";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import config from "../config/config";

const db = getFirestore(config.firebase.app);
const notificationsCollection = "notifications";

interface NotificationData {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  status?:string
}

export class NotificationService {
  // Create notification
  public async createNotification(
    notificationData: Omit<
      NotificationData,
      "id" | "isRead" | "createdAt" | "updatedAt"
    >
  ) {
    try {
      const notificationRef = doc(collection(db, notificationsCollection));

      const newNotification = {
        ...notificationData,
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(notificationRef, newNotification);
      return { id: notificationRef.id, ...newNotification };
    } catch (error) {
      throw new Error(`Failed to create notification: ${error}`);
    }
  }

  // Get all notifications for a user
  public async getUserNotifications(userId: string) {
    try {
      const q = query(
        collection(db, notificationsCollection),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const notifications: NotificationData[] = [];

      querySnapshot.forEach((doc) => {
        notifications.push({ id: doc.id, ...doc.data() } as NotificationData);
      });

      return notifications;
    } catch (error) {
      throw new Error(`Failed to get notifications: ${error}`);
    }
  }

  // Get notification by ID
  public async getNotificationById(notificationId: string) {
    try {
      const notificationDoc = await getDoc(
        doc(db, notificationsCollection, notificationId)
      );

      if (!notificationDoc.exists()) {
        throw new Error("Notification not found");
      }

      return {
        id: notificationDoc.id,
        ...notificationDoc.data(),
      } as NotificationData;
    } catch (error) {
      throw new Error(`Failed to get notification: ${error}`);
    }
  }

  // Update notification
  public async updateNotification(
    notificationId: string,
    updateData: Partial<NotificationData>
  ) {
    try {
      const notificationRef = doc(db, notificationsCollection, notificationId);

      const updates = {
        ...updateData,
        updatedAt: new Date(),
      };

      await updateDoc(notificationRef, updates);
      return this.getNotificationById(notificationId);
    } catch (error) {
      throw new Error(`Failed to update notification: ${error}`);
    }
  }

  // Mark notification as read
  public async markAsRead(notificationId: string) {
    try {
      return await this.updateNotification(notificationId, { isRead: true });
    } catch (error) {
      throw new Error(`Failed to mark notification as read: ${error}`);
    }
  }

  // Delete notification
  public async deleteNotification(notificationId: string) {
    try {
      await deleteDoc(doc(db, notificationsCollection, notificationId));
      return true;
    } catch (error) {
      throw new Error(`Failed to delete notification: ${error}`);
    }
  }

  // Get unread notifications count
  public async getUnreadCount(userId: string) {
    try {
      const q = query(
        collection(db, notificationsCollection),
        where("userId", "==", userId),
        where("isRead", "==", false)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      throw new Error(`Failed to get unread count: ${error}`);
    }
  }

  // Mark all notifications as read
  public async markAllAsRead(userId: string) {
    try {
      const notifications = await this.getUserNotifications(userId);
      const updatePromises = notifications
        .filter((notification) => !notification.isRead)
        .map((notification) => this.markAsRead(notification.id!));

      await Promise.all(updatePromises);
      return true;
    } catch (error) {
      throw new Error(`Failed to mark all notifications as read: ${error}`);
    }
  }
}

const notificationService = new NotificationService();
export default notificationService;
