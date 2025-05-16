import { Request, Response, NextFunction } from "express";
import deviceStatusService from "../services/devicesStatusService";

export class DeviceController {
  // Get all devices
  public async getAllDevices(req: Request, res: Response, next: NextFunction) {
    try {
      const devices = await deviceStatusService.getAllDevices();
      res.status(200).json({
        success: true,
        data: devices,
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new device
  public async createDevice(req: Request, res: Response, next: NextFunction) {
    console.log("Creating device", req.body);
    try {
      // Check if device already exists by deviceId
      const existingDevices = await deviceStatusService.getDevicesByType(
        req.body.device_id
      );
      const existingDevice = existingDevices.length > 0 ? existingDevices[0] : null;

      let device;
      if (existingDevice) {
        // Update existing device
        device = await deviceStatusService.updateDeviceStatus(
          existingDevice.id!,
          {
            ...req.body,
            lastPing: new Date(),
            updatedAt: new Date(),
          }
        );
      } else {
        // Create new device
        device = await deviceStatusService.createDevice(req.body);
      }

      res.status(201).json({
        success: true,
        data: device,
        message: existingDevice ? "Device updated" : "Device created",
      });
    } catch (error) {
      next(error);
    }
  }

  // Get device by ID
  public async getDeviceById(req: Request, res: Response, next: NextFunction) {
    try {
      const device = await deviceStatusService.getDeviceById(req.params.id);
      res.status(200).json({
        success: true,
        data: device,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update device status
  public async updateDeviceStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const device = await deviceStatusService.updateDeviceStatus(
        req.params.id,
        req.body
      );
      res.status(200).json({
        success: true,
        data: device,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update device metrics
  public async updateDeviceMetrics(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const device = await deviceStatusService.updateDeviceMetrics(
        req.params.id,
        req.body.metrics
      );
      res.status(200).json({
        success: true,
        data: device,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete device
  public async deleteDevice(req: Request, res: Response, next: NextFunction) {
    try {
      await deviceStatusService.deleteDevice(req.params.id);
      res.status(200).json({
        success: true,
        message: "Device deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // Get devices by status
  public async getDevicesByStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const devices = await deviceStatusService.getDevicesByStatus(
        req.params.status
      );
      res.status(200).json({
        success: true,
        data: devices,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get devices by type
  public async getDevicesByType(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const devices = await deviceStatusService.getDevicesByType(
        req.params.type
      );
      res.status(200).json({
        success: true,
        data: devices,
      });
    } catch (error) {
      next(error);
    }
  }
}

const deviceController = new DeviceController();
export default deviceController;
