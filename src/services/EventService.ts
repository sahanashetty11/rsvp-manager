import { Event } from "../models/Event";
import { ILogger } from "../interfaces/ILogger";
import { Database } from "../db/Database";

export class EventService {
  constructor(private logger: ILogger, private db: Database) {}

  // Add or update a single event.
  public async addOrUpdateEvent(event: Event): Promise<void> {
    await this.db.saveOrUpdateEvent(event);
    this.logger.log(`Event updated: ${event.name}`);
  }

  // Add or update multiple events.
  public async addOrUpdateEvents(events: Event[]): Promise<void> {
    await Promise.all(events.map((event) => this.addOrUpdateEvent(event)));
  }
}