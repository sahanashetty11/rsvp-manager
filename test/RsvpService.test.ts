import { RsvpService } from "../src/services/RsvpService";
import { Database } from "../src/db/Database";
import { Logger } from "../src/logger/Logger";
import { Player } from "../src/models/Player";
import { Event } from "../src/models/Event";

describe("RsvpService", () => {
  let database: Database;
  let logger: Logger;
  let rsvpService: RsvpService;

  beforeEach(async () => {
    database = new Database();
    await database.initialize();

    const dbInstance = (database as any).db;
    await dbInstance.run("DELETE FROM rsvp_manager");
    await dbInstance.run("DELETE FROM player");
    await dbInstance.run("DELETE FROM event");

    logger = new Logger();
    rsvpService = new RsvpService(logger, database);
  });

  test("should add a valid RSVP entry (status: 'Yes')", async () => {
    const player: Player = { id: "p1", email: "sahana@gmail.com", name: "Sahana" };
    const event: Event = { id: "ev1", name: "Annual Team Meeting" };

    // Insert player and event first.
    await database.saveOrUpdatePlayer(player);
    await database.saveOrUpdateEvent(event);

    // Add RSVP with a valid status "Yes".
    await rsvpService.addOrUpdateStatus(player.id, event.id, "Yes");
    const counts = await rsvpService.countResponses(event.id);
    expect(counts.total).toBe(1);
    expect(counts.confirmed).toBe(1);
    expect(counts.declined).toBe(0);

    const confirmedAttendees = await rsvpService.getConfirmedAttendees(event.id);
    expect(confirmedAttendees.length).toBe(1);
    expect(confirmedAttendees[0].id).toBe(player.id);
  });

  test("should update an existing RSVP entry", async () => {
    const player: Player = { id: "p2", email: "shivani@gmail.com", name: "Shivani" };
    const event: Event = { id: "ev2", name: "Fun Time" };

    await database.saveOrUpdatePlayer(player);
    await database.saveOrUpdateEvent(event);

    // Initially set status to "Maybe".
    await rsvpService.addOrUpdateStatus(player.id, event.id, "Maybe");
    let counts = await rsvpService.countResponses(event.id);
    expect(counts.total).toBe(1);
    // "Maybe" should not be counted as confirmed.
    expect(counts.confirmed).toBe(0);

    // Now update the RSVP status to "Yes".
    await rsvpService.addOrUpdateStatus(player.id, event.id, "Yes");
    counts = await rsvpService.countResponses(event.id);
    expect(counts.total).toBe(1);
    expect(counts.confirmed).toBe(1);
  });

  test("should throw error for invalid RSVP status", async () => {
    const player: Player = { id: "p3", email: "george@outlook.com", name: "George" };
    const event: Event = { id: "ev3", name: "Fun Time" };

    await database.saveOrUpdatePlayer(player);
    await database.saveOrUpdateEvent(event);

    await expect(
      rsvpService.addOrUpdateStatus(player.id, event.id, "Invalid" as any)
    ).rejects.toThrow(`Invalid RSVP status: Invalid for playerId ${player.id}`);

    const counts = await rsvpService.countResponses(event.id);
    expect(counts.total).toBe(0);
  });

  test("should throw error when player does not exist", async () => {
    const event: Event = { id: "ev4", name: "Game Time" };
    await database.saveOrUpdateEvent(event);

    // Do not insert any player.
    await expect(
      rsvpService.addOrUpdateStatus("nonexistentPlayer", event.id, "Yes")
    ).rejects.toThrow("Player with id nonexistentPlayer does not exist");
  });

  test("should throw error when event does not exist", async () => {
    const player: Player = { id: "p4", email: "jessica@example.com", name: "Jessica" };
    await database.saveOrUpdatePlayer(player);

    // Do not insert any event.
    await expect(
      rsvpService.addOrUpdateStatus(player.id, "nonexistentEvent", "Yes")
    ).rejects.toThrow("Event with id nonexistentEvent does not exist");
  });

  test("should handle multiple RSVP entries for different players", async () => {
    const player1: Player = { id: "p5", email: "kumar@example.com", name: "Kumar" };
    const player2: Player = { id: "p6", email: "frank@example.com", name: "Frank" };
    const event: Event = { id: "ev5", name: "Cricket Catch" };

    await database.saveOrUpdatePlayer(player1);
    await database.saveOrUpdatePlayer(player2);
    await database.saveOrUpdateEvent(event);

    await Promise.all([
      rsvpService.addOrUpdateStatus(player1.id, event.id, "Yes"),
      rsvpService.addOrUpdateStatus(player2.id, event.id, "No")
    ]);

    const counts = await rsvpService.countResponses(event.id);
    expect(counts.total).toBe(2);
    expect(counts.confirmed).toBe(1);
    expect(counts.declined).toBe(1);
  });
});
