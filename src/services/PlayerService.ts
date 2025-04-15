import { Player } from "../models/Player";
import { ILogger } from "../interfaces/ILogger";
import { Database } from "../db/Database";

export class PlayerService {
  constructor(private logger: ILogger, private db: Database) {}

  // Add or update a single player.
  public async addOrUpdatePlayer(player: Player): Promise<void> {
    await this.db.saveOrUpdatePlayer(player);
    this.logger.log(`Player updated: ${player.email}`);
  }

  // Add or update multiple players.
  public async addOrUpdatePlayers(players: Player[]): Promise<void> {
    await Promise.all(players.map((player) => this.addOrUpdatePlayer(player)));
  }
}
