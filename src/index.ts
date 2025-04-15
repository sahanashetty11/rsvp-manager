import { Logger } from "./logger/Logger";
import { Database } from "./db/Database";
import { Player } from "./models/Player";
import { Event } from "./models/Event";
import { PlayerService } from "./services/PlayerService";
import { EventService } from "./services/EventService";
import { RsvpService } from "./services/RsvpService";

async function main() {
  const logger = new Logger();
  const database = new Database();

  await database.initialize();

  // Create service instances.
  const playerService = new PlayerService(logger, database);
  const eventService = new EventService(logger, database);
  const rsvpService = new RsvpService(logger, database);

  const players: Player[] = [
    { id: "p1", email: "sahana@gmail.com", name: "Sahana" },
    { id: "p2", email: "shivani@gmail.com", name: "Shivani" },
    { id: "p3", email: "kumar@yahoo.com", name: "Kumar" },
    { id: "p4", email: "george@outlook.com", name: "George" },
    { id: "p5", email: "jessica@outlook.com", name: "Jessica" }
  ];
  await playerService.addOrUpdatePlayers(players);

  const events: Event[] = [
    { id: "ev1", name: "Annual Team Meeting" },
    { id: "ev2", name: "Fun Time" }
  ];
  await eventService.addOrUpdateEvents(events);

  await Promise.all([
    rsvpService.addOrUpdateStatus(players[0].id, events[0].id, "Yes"),
    rsvpService.addOrUpdateStatus(players[1].id, events[0].id, "No"),
    rsvpService.addOrUpdateStatus(players[2].id, events[1].id, "Yes"),
    rsvpService.addOrUpdateStatus(players[3].id, events[1].id, "No"),
    rsvpService.addOrUpdateStatus(players[4].id, events[0].id, "Maybe")
  ]);

  // Retrieve confirmed attendees.
  const confirmed = await rsvpService.getConfirmedAttendees(events[0].id);
  logger.log("Confirmed attendees: " + confirmed.map(p => p.email).join(", "));

  // Retrieve response counts.
  const counts = await rsvpService.countResponses(events[0].id);
  logger.log(`Event "${events[0].name}" counts: Total: ${counts.total}, Confirmed: ${counts.confirmed}, Declined: ${counts.declined}`);
}

main().catch((error) => console.error(error));
