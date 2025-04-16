import sqlite3 from 'sqlite3';
import { open, Database as SqliteDatabase } from 'sqlite';
import { Player } from '../models/Player';
import { Event } from '../models/Event';
import { RsvpStatus } from '../models/RsvpStatus';

export class Database {
  private db!: SqliteDatabase<sqlite3.Database, sqlite3.Statement>;

  public async initialize(): Promise<void> {
    this.db = await open({
      filename: './rsvp.db',
      driver: sqlite3.Database
    });

    // Create Player table
    await this.db.run(`
      CREATE TABLE IF NOT EXISTS player (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        gender TEXT NOT NULL,
        lastUpdated TEXT NOT NULL
      )
    `);

    // Create Event table
    await this.db.run(`
      CREATE TABLE IF NOT EXISTS event (
        id TEXT PRIMARY KEY,
        event_name TEXT NOT NULL,
        event_location TEXT NULL,
        event_date DATE NOT NULL,
        lastUpdated TEXT NOT NULL
      )
    `);

    // Create rsvp_manager table
    await this.db.run(`
      CREATE TABLE IF NOT EXISTS rsvp_manager (
        player_id TEXT NOT NULL,
        event_id TEXT NOT NULL,
        status TEXT NOT NULL,
        lastUpdated TEXT NOT NULL,
        PRIMARY KEY (player_id, event_id),
        FOREIGN KEY (player_id) REFERENCES player(id),
        FOREIGN KEY (event_id) REFERENCES event(id)
      )
    `);
  }

  // Upsert a player record.
  public async saveOrUpdatePlayer(player: Player): Promise<void> {
    const timestamp = new Date().toISOString();
    await this.db.run(
      `INSERT INTO player (id, email, name, gender, lastUpdated)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET email = excluded.email, name = excluded.name, gender = excluded.gender, lastUpdated = excluded.lastUpdated`,
      player.id,
      player.email,
      player.name,
      player.gender,
      timestamp
    );
  }

  // Upsert an event record
  public async saveOrUpdateEvent(event: Event): Promise<void> {
    const timestamp = new Date().toISOString();
    await this.db.run(
      `INSERT INTO event (id, event_name, event_location, event_date, lastUpdated)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET event_name = excluded.event_name, event_location = excluded.event_location, event_date = excluded.event_date, lastUpdated = excluded.lastUpdated`,
      event.id,
      event.name,
      event.location,
      event.event_date.toISOString(),
      timestamp
    );
  }

  // Upsert an RSVP status record
  public async saveOrUpdateRsvpStatus(playerId: string, eventId: string, status: RsvpStatus): Promise<void> {
    const timestamp = new Date().toISOString();
    await this.db.run(
      `INSERT INTO rsvp_manager (player_id, event_id, status, lastUpdated)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(player_id, event_id) DO UPDATE SET status = excluded.status, lastUpdated = excluded.lastUpdated`,
      playerId,
      eventId,
      status,
      timestamp
    );
  }

  // Get confirmed attendees for an event
  public async getConfirmedAttendeesByEvent(eventId: string): Promise<Player[]> {
    const rows = await this.db.all(
      `SELECT p.id, p.email, p.name, p.lastUpdated
       FROM player p
       INNER JOIN rsvp_manager r ON p.id = r.player_id
       WHERE r.event_id = ? AND r.status = 'Yes'`,
      eventId
    );
    return rows;
  }

  // Count responses for a specific event
  public async countResponsesByEvent(eventId: string): Promise<{ total: number; confirmed: number; declined: number }> {
    const totalRow = await this.db.get(`SELECT COUNT(*) as total FROM rsvp_manager WHERE event_id = ?`, eventId);
    const confirmedRow = await this.db.get(`SELECT COUNT(*) as confirmed FROM rsvp_manager WHERE event_id = ? AND status = 'Yes'`, eventId);
    const declinedRow = await this.db.get(`SELECT COUNT(*) as declined FROM rsvp_manager WHERE event_id = ? AND status = 'No'`, eventId);
    return {
      total: totalRow.total,
      confirmed: confirmedRow.confirmed,
      declined: declinedRow.declined
    };
  }

  // Check if a player exists in the player table
  public async playerExists(playerId: string): Promise<boolean> {
    const result = await this.db.get("SELECT 1 as result FROM player WHERE id = ?", playerId);
    return !!result;
  }
  
  // Check if an event exists in the event table
  public async eventExists(eventId: string): Promise<boolean> {
    const result = await this.db.get("SELECT 1 as result FROM event WHERE id = ?", eventId);
    return !!result;
  }
}

