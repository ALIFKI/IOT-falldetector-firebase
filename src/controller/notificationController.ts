import { Request, Response, NextFunction } from "express";
import notificationService from "../services/notificationService";
import Expo from "expo-server-sdk";
import { collection, getDoc, getFirestore, query, where,getDocs } from "firebase/firestore";
import config from "@/config/config";
const expo = new Expo();
const db = getFirestore(config.firebase.app);

export class NotificationController {
  // Get all notifications for a user
  public async getUserNotifications(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.params.userId;
      const notifications = await notificationService.getUserNotifications(
        userId
      );
      res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new notification
  public async createNotification(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const tokenDoc = query(
        collection(db, "expoTokens"),
        where("device_id", "==", "wheelchair_sensor_01")
      );

      const querySnapshot = await getDocs(tokenDoc);

      if (querySnapshot.empty) {
        return res.status(404).json({
          success: false,
          message: "Device token not found",
        });
      }

      const token = querySnapshot.docs[0].data().token;
      console.log(token)
      console.log("snap", querySnapshot.docs);
      const notification = await notificationService.createNotification({
        ...req.body,
        createdAt: new Date(),
      });

      if (token) {
        // Check if the token is valid
        if (!Expo.isExpoPushToken(token)) {
          return res.status(400).json({
            success: false,
            message: "Invalid Expo push token",
          });
        }

        // Create the message
        const message = {
          to: token,
          sound: "default",
          title : "Notification",
          body : req.body.message,
        };

        try {
          const ticket = await expo.sendPushNotificationsAsync([message]);

          // Update notification status to sent
          await notificationService.updateNotification(notification.id, {
            status: "sent",
          });

          return res.status(201).json({
            success: true,
            data: { notification, pushTicket: ticket },
          });
        } catch (error) {
          // Update notification status to failed
          await notificationService.updateNotification(notification.id, {
            status: "failed",
          });
          throw new Error("Error sending push notification");
        }
      }
      res.status(201).json({
        success: true,
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get notification by ID
  public async getNotificationById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const notification = await notificationService.getNotificationById(
        req.params.id
      );
      res.status(200).json({
        success: true,
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update notification
  public async updateNotification(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const notification = await notificationService.updateNotification(
        req.params.id,
        req.body
      );
      res.status(200).json({
        success: true,
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete notification
  public async deleteNotification(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      await notificationService.deleteNotification(req.params.id);
      res.status(200).json({
        success: true,
        message: "Notification deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // Mark notification as read
  public async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const notification = await notificationService.markAsRead(req.params.id);
      res.status(200).json({
        success: true,
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get unread notifications count
  public async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const count = await notificationService.getUnreadCount(req.params.userId);
      res.status(200).json({
        success: true,
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  }

  // Mark all notifications as read
  public async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.markAllAsRead(req.params.userId);
      res.status(200).json({
        success: true,
        message: "All notifications marked as read",
      });
    } catch (error) {
      next(error);
    }
  }

  public async sendPushNotification(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { token, title, body, data } = req.body;

      // Check if the token is valid
      if (!Expo.isExpoPushToken(token)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Expo push token",
        });
      }

      // Create the message
      const message = {
        to: token,
        sound: "default",
        title,
        body,
        data: data || {},
      };

      try {
        const ticket = await expo.sendPushNotificationsAsync([message]);

        // Store notification in database
        // await notificationService.createNotification({
        //   userId: req.body.userId,
        //   title,
        //   createdAt: new Date(),
        //   pushToken: token,
        //   status: "sent",
        // });

        res.status(200).json({
          success: true,
          data: ticket,
        });
      } catch (error) {
        throw new Error("Error sending push notification");
      }
    } catch (error) {
      next(error);
    }
  }
}

const notificationController = new NotificationController();
export default notificationController;
