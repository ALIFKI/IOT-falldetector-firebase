import { Router } from "express";
import deviceController from "../../controller/deviceController";

const router = Router();

// Get all devices
router.get("/", deviceController.getAllDevices);

// Create new device
router.post("/", deviceController.createDevice);

// Get device by ID
router.get("/:id", deviceController.getDeviceById);

// Update device status
router.put("/:id/status", deviceController.updateDeviceStatus);

// Update device metrics
router.put("/:id/metrics", deviceController.updateDeviceMetrics);

// Delete device
router.delete("/:id", deviceController.deleteDevice);

// Get devices by status
router.get("/status/:status", deviceController.getDevicesByStatus);

// Get devices by type
router.get("/type/:type", deviceController.getDevicesByType);

export default router;
