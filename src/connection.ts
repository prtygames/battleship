/* eslint-disable @typescript-eslint/no-explicit-any */

import Peer from "peerjs";
import {
  CONNECTION__DISCONNECT_EVENT,
  CONNECTION__JOIN_EVENT,
  CONNECTION__MAKE_SHOT_EVENT,
  CONNECTION__MAKE_SHOT_RESULT_EVENT,
  CONNECTION__READY_EVENT,
  CONNECTION__TAKE_SHOT_EVENT,
  CONNECTION__TAKE_SHOT_RESULT_EVENT,
  ConnectionShotEvent,
  ConnectionShotResultEvent,
} from "./events.ts";

export class Connection {
  private peerId: string = "";
  private peer?: Peer;

  private constructor(private eventEmitter: Phaser.Events.EventEmitter) {}

  static createHostConnection(
    eventEmitter: Phaser.Events.EventEmitter,
  ): Promise<Connection> {
    return new Promise((resolve) => {
      const connection = new Connection(eventEmitter);
      connection.peer = new Peer();

      connection.peer.on("open", (id) => {
        connection.peerId = id;
        resolve(connection);
      });

      connection.peer.on("connection", (conn) => {
        connection.eventEmitter.on(CONNECTION__READY_EVENT, () => {
          conn.send({ type: "ready" });
        });
        connection.eventEmitter.on(
          CONNECTION__MAKE_SHOT_EVENT,
          (event: ConnectionShotEvent) => {
            conn.send({ type: "take_shot", x: event.x, y: event.y });
          },
        );
        connection.eventEmitter.on(
          CONNECTION__TAKE_SHOT_RESULT_EVENT,
          (event: ConnectionShotResultEvent) => {
            conn.send({ type: "shot_result", shot: event.shot });
          },
        );
        conn.on("close", () => {
          connection.eventEmitter.emit(CONNECTION__DISCONNECT_EVENT);

          connection.close();
        });

        conn.on("data", (data: any) => {
          switch (data.type) {
            case "join":
              connection.eventEmitter.emit(CONNECTION__JOIN_EVENT);
              break;
            case "take_shot":
              const makeShotEvent: ConnectionShotEvent = {
                x: data.x,
                y: data.y,
              };
              connection.eventEmitter.emit(
                CONNECTION__TAKE_SHOT_EVENT,
                makeShotEvent,
              );
              break;
            case "shot_result":
              const shotResultEvent: ConnectionShotResultEvent = {
                shot: data.shot,
              };
              connection.eventEmitter.emit(
                CONNECTION__MAKE_SHOT_RESULT_EVENT,
                shotResultEvent,
              );
              break;
          }
        });
      });
    });
  }

  static join(
    eventEmitter: Phaser.Events.EventEmitter,
    hostId: string,
  ): Promise<Connection> {
    return new Promise((resolve) => {
      const connection = new Connection(eventEmitter);
      connection.peer = new Peer();

      connection.peer.on("open", (id) => {
        connection.peerId = id;

        connection.eventEmitter.on(CONNECTION__JOIN_EVENT, () => {
          conn.send({ type: "join" });
        });
        connection.eventEmitter.on(
          CONNECTION__MAKE_SHOT_EVENT,
          (event: ConnectionShotEvent) => {
            conn.send({ type: "take_shot", x: event.x, y: event.y });
          },
        );
        connection.eventEmitter.on(
          CONNECTION__TAKE_SHOT_RESULT_EVENT,
          (event: ConnectionShotResultEvent) => {
            conn.send({ type: "shot_result", shot: event.shot });
          },
        );

        const conn = connection.peer!.connect(hostId);
        conn.on("open", () => {
          resolve(connection);
        });
        conn.on("data", (data: any) => {
          switch (data.type) {
            case "ready":
              connection.eventEmitter.emit(CONNECTION__READY_EVENT);
              break;
            case "take_shot":
              const makeShotEvent: ConnectionShotEvent = {
                x: data.x,
                y: data.y,
              };
              connection.eventEmitter.emit(
                CONNECTION__TAKE_SHOT_EVENT,
                makeShotEvent,
              );
              break;
            case "shot_result":
              const shotResultEvent: ConnectionShotResultEvent = {
                shot: data.shot,
              };
              connection.eventEmitter.emit(
                CONNECTION__MAKE_SHOT_RESULT_EVENT,
                shotResultEvent,
              );
              break;
          }
        });
        conn.on("close", () => {
          connection.eventEmitter.emit(CONNECTION__DISCONNECT_EVENT);

          connection.close();
        });
      });
    });
  }

  getId(): string {
    return this.peerId;
  }

  close() {
    this.peer?.disconnect();
  }
}
