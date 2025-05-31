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
const devicesCollection = "devices";

export interface DeviceStatus {
  id?: string;
  deviceId: string;
  name: string;
  type: string;
  status: "online" | "offline" | "maintenance";
  lastPing?: Date;
  metrics?: {
    temperature?: number;
    humidity?: number;
    battery?: number;
    [key: string]: any;
  };
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export class DeviceStatusService {
  // Create new device
  public async createDevice(
    deviceData: Omit<DeviceStatus, "id" | "createdAt" | "updatedAt">
  ) {
    try {
      const deviceRef = doc(collection(db, devicesCollection));

      const newDevice = {
        ...deviceData,
        lastPing: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(deviceRef, newDevice);
      return { id: deviceRef.id, ...newDevice };
    } catch (error) {
      throw new Error(`Failed to create device: ${error}`);
    }
  }

  // Get all devices
  public async getAllDevices() {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, devicesCollection), orderBy("createdAt", "desc"))
      );

      const devices: DeviceStatus[] = [];
      querySnapshot.forEach((doc) => {
        devices.push({ id: doc.id, ...doc.data() } as DeviceStatus);
      });

      return devices;
    } catch (error) {
      throw new Error(`Failed to get devices: ${error}`);
    }
  }

  // Get device by ID
  public async getDeviceById(deviceId: string) {
    try {
      const deviceDoc = await getDoc(doc(db, devicesCollection, deviceId));

      if (!deviceDoc.exists()) {
        throw new Error("Device not found");
      }

      return { id: deviceDoc.id, ...deviceDoc.data() } as DeviceStatus;
    } catch (error) {
      throw new Error(`Failed to get device: ${error}`);
    }
  }

  // Update device status
  public async updateDeviceStatus(
    deviceId: string,
    updateData: Partial<DeviceStatus>
  ) {
    try {
      const deviceRef = doc(db, devicesCollection, deviceId);

      const updates = {
        ...updateData,
        updatedAt: new Date(),
      };

      await updateDoc(deviceRef, updates);
      return this.getDeviceById(deviceId);
    } catch (error) {
      throw new Error(`Failed to update device: ${error}`);
    }
  }

  // Update device metrics
  public async updateDeviceMetrics(
    deviceId: string,
    metrics: DeviceStatus["metrics"]
  ) {
    try {
      return this.updateDeviceStatus(deviceId, {
        metrics,
        lastPing: new Date(),
      });
    } catch (error) {
      throw new Error(`Failed to update device metrics: ${error}`);
    }
  }

  // Delete device
  public async deleteDevice(deviceId: string) {
    try {
      await deleteDoc(doc(db, devicesCollection, deviceId));
      return true;
    } catch (error) {
      throw new Error(`Failed to delete device: ${error}`);
    }
  }

  // Get devices by status
  public async getDevicesByStatus(status: DeviceStatus["status"]) {
    try {
      const q = query(
        collection(db, devicesCollection),
        where("status", "==", status),
        orderBy("lastPing", "desc")
      );

      const querySnapshot = await getDocs(q);
      const devices: DeviceStatus[] = [];

      querySnapshot.forEach((doc) => {
        devices.push({ id: doc.id, ...doc.data() } as DeviceStatus);
      });

      return devices;
    } catch (error) {
      throw new Error(`Failed to get devices by status: ${error}`);
    }
  }

  private async isCollectionEmpty(): Promise<boolean> {
    try {
      const snapshot = await getDocs(collection(db, devicesCollection));
      return snapshot.empty;
    } catch (error) {
      throw new Error(`Failed to check collection: ${error}`);
    }
  }

  // Get devices by type
  public async getDevicesByType(type: string) {
    try {
      if (await this.isCollectionEmpty()) {
        return [];
      }
      const q = query(
        collection(db, devicesCollection),
        where("device_id", "==", type),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const devices: DeviceStatus[] = [];

      querySnapshot.forEach((doc) => {
        devices.push({ id: doc.id, ...doc.data() } as DeviceStatus);
      });

      return devices;
    } catch (error) {
      throw new Error(`Failed to get devices by type: ${error}`);
    }
  }
}

const deviceStatusService = new DeviceStatusService();
export default deviceStatusService;