# RSVP Manager

## Overview

The RSVP Manager is a modular, TypeScript-based application designed to manage RSVP responses for events. The project demonstrates industry-level practices including dependency injection, clear separation of concerns, batch operations, asynchronous operations, and enhanced error handling using custom error classes. SQLite is used as the persistent storage solution, and Jest is used for testing.

-   `index.ts` serves as the main entry point for the application, carrying the initialization of services and startup routines.

## Services

The project includes three primary service modules, each responsible for a specific aspect of the application's business logic:

-   **PlayerService**
    -   **Purpose:** Manages player records in the database.
    -   **Functionality:**
        -   Provides methods to add or update single or multiple player records.
        -   Uses the database layer to upsert data in the `player` table.
        -   Ensures that each player record is stored with important attributes (id, email, name) along with a `lastUpdated` timestamp.
    -   **Usage:**
        -   Use this service whenever you need to import or update a roster of players, for example, when onboarding users into the event system.

-   **EventService**
    -   **Purpose:** Manages event records.
    -   **Functionality:**
        -   Provides methods to add or update single or multiple event records.
        -   Interfaces with the database layer to perform upsert operations on the `event` table.
        -   Maintains event records with a `lastUpdated` timestamp to track when the event information was last modified.
    -   **Usage:**
        -   Use this service to create or modify events. It enables you to ensure that events have the latest details before linking them to RSVP entries.

-   **RsvpService**
    -   **Purpose:** Handles RSVP entries linking players to events.
    -   **Functionality:**
        -   Provides methods to add or update RSVP statuses for players regarding a specific event.
        -   Validates that the RSVP status is one of the allowed values (`"Yes"`, `"No"`, `"Maybe"`).
        -   Checks that the referenced player exists in the `player` table.
        -   Checks that the referenced event exists in the `event` table.
        -   Uses enhanced error handling by throwing custom errors (such as `InvalidRsvpStatusError`, `PlayerNotFoundError`, and `EventNotFoundError`) to enforce data integrity.
        -   Updates the `rsvp_manager` table with a `lastUpdated` timestamp to track when the RSVP status changed.
    -   **Usage:**
        -   Use this service to record or change RSVP statuses. It ensures that the link between players and events remains consistent and valid, supporting robust error handling and data integrity throughout the process.

## Enhanced Error Handling

Custom error classes such as `InvalidRsvpStatusError`, `PlayerNotFoundError`, and `EventNotFoundError` provide clarity on error causes. Each method in `RsvpService` uses try/catch blocks to log detailed error messages and re-throw errors for higher-level handling.

## Logger Integration

-   The project uses a flexible `ILogger` interface to centralize logging across all services.
-   A simple `Logger` implementation is provided for development and debugging.
-   Services inject the logger to record key events and errors, aiding in troubleshooting.
-   This approach enables easy substitution with advanced logging frameworks in production.

## Test Cases

-   The test file (`RsvpService.test.ts`) verifies both positive and negative scenarios for managing RSVP entries.
-   It checks that valid statuses correctly update RSVP counts and confirmed attendee lists.
-   Negative tests ensure that invalid statuses, or missing player/event records, trigger appropriate errors.
-   The asynchronous tests confirm that all operations complete successfully while preserving data integrity.

## How to run the code

-   Clone the repo into your local system
-   npm install -> To install dependencies
-   npm run build -> Build the code
-   node dist/index.js -> To run the code
-   npm test -> To run the test cases

## Project Structure

```text
rsvp-manager/
├── src/
│   ├── db/
│   │   └── Database.ts             # SQLite database module with methods to create, upsert, query, and reset tables
│   ├── errors/
│   │   └── CustomErrors.ts         # Custom error classes for specific error handling
│   ├── interfaces/
│   │   └── ILogger.ts              # Logger interface for dependency injection
│   ├── logger/
│   │   └── ConsoleLogger.ts        # Logger implementation that logs messages to the console
│   ├── models/
│   │   ├── Player.ts               # Player model (id, email, name)
│   │   ├── Event.ts                # Event model (id, name)
│   │   ├── RSVPStatus.ts           # Allowed RSVP statuses ("Yes", "No", "Maybe")
│   │   └── RsvpEntry.ts            # RSVP entry model reflecting the rsvp_manager table structure
│   ├── services/
│   │   ├── PlayerService.ts        # Service to batch add/update players
│   │   ├── EventService.ts         # Service to batch add/update events
│   │   └── RsvpService.ts          # Service to manage RSVP entries
│   └── index.ts                    # Entry point demonstrating workflow: adding players/events then updating RSVP statuses
├── test/
│   └── RsvpService.test.ts         # Jest test suite for RsvpService covering positive and negative scenarios
├── dist/                           # Compiled JavaScript files (generated by TypeScript)
├── package.json                    # Project and dependency configuration
├── tsconfig.json                   # TypeScript configuration file directing source and output directories
└── README.md                       # This documentation file