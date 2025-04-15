import { RsvpStatus } from "../models/RsvpStatus";
import { ILogger } from "../interfaces/ILogger";
import { Database } from "../db/Database";
import { Player } from "../models/Player";
import { InvalidRsvpStatusError, PlayerNotFoundError, EventNotFoundError } from "../errors/CustomErrors";

export class RsvpService {
  constructor(private logger: ILogger, private db: Database) {}

  // Adds or updates the RSVP status.
  public async addOrUpdateStatus(playerId: string, eventId: string, status: RsvpStatus): Promise<void> {
    try {
      // Check that the status is valid.
      if (!["Yes", "No", "Maybe"].includes(status)) {
        const errMsg = `Invalid RSVP status: ${status} for playerId ${playerId}`;
        this.logger.log(errMsg);
        throw new InvalidRsvpStatusError(errMsg);
      }
  
      // Verify that the player exists.
      if (!(await this.db.playerExists(playerId))) {
        const errMsg = `Player with id ${playerId} does not exist`;
        this.logger.log(errMsg);
        throw new PlayerNotFoundError(playerId);
      }
  
      // Verify that the event exists.
      if (!(await this.db.eventExists(eventId))) {
        const errMsg = `Event with id ${eventId} does not exist`;
        this.logger.log(errMsg);
        throw new EventNotFoundError(eventId);
      }
  
      await this.db.saveOrUpdateRsvpStatus(playerId, eventId, status);
      this.logger.log(`RSVP updated for playerId ${playerId} to ${status} for eventId "${eventId}"`);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.log(`Error in addOrUpdateStatus: ${error.message}`);
        throw error;
      } else {
        this.logger.log("Error in addOrUpdateStatus");
        throw new Error("Error in addOrUpdateStatus: Unknown error occurred");
      }
    }
  }

  // Retrieves confirmed attendees for a specific event.
  public async getConfirmedAttendees(eventId: string): Promise<Player[]> {
    try {
      return await this.db.getConfirmedAttendeesByEvent(eventId);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.log(`Error retrieving confirmed attendees for eventId ${eventId}: ${error.message}`);
        throw error;
      } else {
        this.logger.log("Error retrieving confirmed attendees.");
        throw new Error("Error retrieving confirmed attendees: Unknown error occurred");
      }
    }
  }

  // Counts the RSVP responses for a specific event.
  public async countResponses(eventId: string): Promise<{ total: number; confirmed: number; declined: number }> {
    try {
      return await this.db.countResponsesByEvent(eventId);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.log(`Error counting responses for eventId ${eventId}: ${error.message}`);
        throw error;
      } else {
        this.logger.log("Error counting responses.");
        throw new Error("Error counting responses: Unknown error occurred");
      }
    }
  }
}
