import { Request, Response, NextFunction } from "express";
import notificationService from "../services/notificationService";

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
    console.log('dsadsadad');
    try {
      const notification = await notificationService.createNotification(
        {
          ...req.body,
          createdAt : new Date()
        }
      );
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
}

const notificationController = new NotificationController();
export default notificationController;
