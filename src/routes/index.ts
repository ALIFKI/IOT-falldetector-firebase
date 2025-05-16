import { Router } from "express";
import userRouters from "./user/userRoutes";
import notificationRouters from "./notifications/notificationsRoutes";
import deviceRoutes from "./devices";



const router = Router();
router.use("/users", userRouters);
router.use("/notification", notificationRouters);
router.use("/devices", deviceRoutes);



export default router;
