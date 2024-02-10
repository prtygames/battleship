/* eslint-disable @typescript-eslint/no-explicit-any */

import Peer, { DataConnection } from "peerjs";
import {
  CONNECTION__DISCONNECT_EVENT,
  CONNECTION__JOIN_EVENT,
  CONNECTION__MAKE_SHOT_EVENT,
  CONNECTION__MAKE_SHOT_RESULT_EVENT,
  CONNECTION__READY_EVENT,
  CONNECTION__TAKE_SHOT_EVENT,
  CONNECTION__TAKE_SHOT_RESULT_EVENT,
  ConnectionJoinEvent,
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
      connection.peer = new Peer({
        pingInterval: 1000,
      });

      connection.peer.on("open", (id) => {
        connection.peerId = id;
        resolve(connection);
      });
      connection.peer.on("disconnected", () => connection.disconnect());

      connection.peer.on("connection", (conn: DataConnection) => {
        connection.eventEmitter.on(
          CONNECTION__READY_EVENT,
          (event: ConnectionJoinEvent) => {
            conn.send({
              type: "ready",
              isNeedToMakeShot: event.isNeedToMakeShot,
            });
          },
        );
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
        conn.on("iceStateChanged", (state: RTCIceConnectionState) => {
          if (["closed", "disconnected", "failed"].includes(state)) {
            connection.disconnect();
          }
        });
        conn.on("close", () => connection.disconnect());

        conn.on("data", (data: any) => {
          switch (data.type) {
            case "join":
              const joinEvent: ConnectionJoinEvent = {
                isNeedToMakeShot: data.isNeedToMakeShot,
              };
              connection.eventEmitter.emit(CONNECTION__JOIN_EVENT, joinEvent);
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

      connection.peer.on("disconnected", () => connection.disconnect());

      connection.peer.on("open", (id) => {
        connection.peerId = id;

        connection.eventEmitter.on(CONNECTION__JOIN_EVENT, () => {
          const isNeedToMakeShot = Math.random() >= 0.5;

          conn.send({ type: "join", isNeedToMakeShot });
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
              const readyEvent: ConnectionJoinEvent = {
                isNeedToMakeShot: data.isNeedToMakeShot,
              };
              connection.eventEmitter.emit(CONNECTION__READY_EVENT, readyEvent);
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
        conn.on("iceStateChanged", (state: RTCIceConnectionState) => {
          if (["closed", "disconnected", "failed"].includes(state)) {
            connection.disconnect();
          }
        });
        conn.on("close", () => connection.disconnect());
      });
    });
  }

  getId(): string {
    return this.peerId;
  }

  close() {
    this.peer?.disconnect();
  }

  private disconnect() {
    this.eventEmitter.emit(CONNECTION__DISCONNECT_EVENT);
    this.close();
  }
}
