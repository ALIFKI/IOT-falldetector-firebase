
import notificationController from "@/controller/notificationController";
import { Router } from "express";
import { body } from "express-validator";

const router = Router();

router.get("/user/:userId", notificationController.getUserNotifications);
router.get("/:id", notificationController.getNotificationById);
router.post("/", notificationController.createNotification);
router.post("/push-notification", notificationController.sendPushNotification);

export default router;
