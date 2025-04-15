export class InvalidRsvpStatusError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "InvalidRsvpStatusError";
    }
  }
  
  export class PlayerNotFoundError extends Error {
    constructor(playerId: string) {
      super(`Player with id ${playerId} does not exist`);
      this.name = "PlayerNotFoundError";
    }
  }
  
  export class EventNotFoundError extends Error {
    constructor(eventId: string) {
      super(`Event with id ${eventId} does not exist`);
      this.name = "EventNotFoundError";
    }
  }
  
  export class DatabaseError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "DatabaseError";
    }
  }