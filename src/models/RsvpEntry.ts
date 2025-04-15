import { RsvpStatus } from "./RsvpStatus";

export interface RsvpEntry {
  playerId: string;
  eventId: string;
  status: RsvpStatus;
}