import * as signalR from "@microsoft/signalr";

const SIGNALR_HUB_URL =
  import.meta.env.VITE_SIGNALR_HUB_URL || "http://localhost:5000/signalr";

export class SignalRConnectionManager {
  private connections: Record<string, signalR.HubConnection> = {};

  async connect(
    hubName: string,
    hubPath: string,
    token?: string
  ): Promise<signalR.HubConnection> {
    if (this.connections[hubName]) {
      return this.connections[hubName];
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${SIGNALR_HUB_URL}/${hubPath}`, {
        accessTokenFactory: () => token || localStorage.getItem("token") || "",
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .withHubProtocol(new signalR.JsonHubProtocol())
      .build();

    connection.on("reconnecting", () => {
      console.log(`[${hubName}] Reconnecting...`);
    });

    connection.on("reconnected", () => {
      console.log(`[${hubName}] Reconnected`);
    });

    connection.onclose(() => {
      console.log(`[${hubName}] Connection closed`);
      delete this.connections[hubName];
    });

    try {
      await connection.start();
      console.log(`[${hubName}] Connected`);
      this.connections[hubName] = connection;
      return connection;
    } catch (error) {
      console.error(`[${hubName}] Connection failed:`, error);
      throw error;
    }
  }

  async disconnect(hubName: string): Promise<void> {
    const connection = this.connections[hubName];
    if (connection) {
      await connection.stop();
      delete this.connections[hubName];
    }
  }

  getConnection(hubName: string): signalR.HubConnection | undefined {
    return this.connections[hubName];
  }

  isConnected(hubName: string): boolean {
    const connection = this.connections[hubName];
    return connection?.state === signalR.HubConnectionState.Connected;
  }

  async disconnectAll(): Promise<void> {
    for (const hubName in this.connections) {
      await this.disconnect(hubName);
    }
  }
}

export const connectionManager = new SignalRConnectionManager();
export default connectionManager;
