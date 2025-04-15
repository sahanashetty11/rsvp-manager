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
    { id: "p5", email: "jessica@outlook.com", name: "Jessica" },
    { id: "p6", email: "john@outlook.com", name: "John" }
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
    rsvpService.addOrUpdateStatus(players[4].id, events[0].id, "Maybe"),
    rsvpService.addOrUpdateStatus(players[5].id, events[0].id, "Yes")
  ]);

  // Retrieve confirmed attendees for ev1
  const confirmedEv1 = await rsvpService.getConfirmedAttendees(events[0].id);
  logger.log(`Confirmed attendees for event- ${events[0].name}: ` + confirmedEv1.map(p => p.email).join(", "));

  // Retrieve confirmed attendees for ev2
  const confirmedEv2 = await rsvpService.getConfirmedAttendees(events[1].id);
  logger.log(`Confirmed attendees for event - ${events[1].name}: ` + confirmedEv2.map(p => p.email).join(", "));

  // Retrieve response counts for ev1
  const countsEv1 = await rsvpService.countResponses(events[0].id);
  logger.log(`Event "${events[0].name}" counts: Total: ${countsEv1.total}, Confirmed: ${countsEv1.confirmed}, Declined: ${countsEv1.declined}`);

  // Retrieve response counts for ev2
  const countsEv2 = await rsvpService.countResponses(events[1].id);
  logger.log(`Event "${events[1].name}" counts: Total: ${countsEv2.total}, Confirmed: ${countsEv2.confirmed}, Declined: ${countsEv2.declined}`);
}

main().catch((error) => console.error(error));
