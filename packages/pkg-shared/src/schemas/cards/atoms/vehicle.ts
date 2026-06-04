import { z } from "zod";
import { BaseCardSchema } from "../base-card/base-card.js";

export const VEHICLE_SUB_TYPE_VALUES = [
  "car",
  "van",
  "truck",
  "motorcycle",
  "bike",
  "bus",
  "train",
  "plane",
  "helicopter",
  "boat",
  "ship",
  "submarine",
  "spaceship",
  "mount",
  "drone",
  "other",
] as const;

export const VehicleSubTypeSchema = z.enum(VEHICLE_SUB_TYPE_VALUES);

export type VehicleSubType = z.infer<typeof VehicleSubTypeSchema>;

export const VEHICLE_SUB_TYPE_LABELS: Record<VehicleSubType, string> = {
  car: "Car",
  van: "Van",
  truck: "Truck",
  motorcycle: "Motorcycle",
  bike: "Bicycle",
  bus: "Bus",
  train: "Train",
  plane: "Plane",
  helicopter: "Helicopter",
  boat: "Boat",
  ship: "Ship",
  submarine: "Submarine",
  spaceship: "Spaceship",
  mount: "Mount",
  drone: "Drone",
  other: "Other",
};

export const VehicleCardSchema = BaseCardSchema.extend({
  card_type: z.literal("vehicle"),
  sub_type: VehicleSubTypeSchema,
  max_speed: z.string().optional(),
});

export type VehicleCard = z.infer<typeof VehicleCardSchema>;
