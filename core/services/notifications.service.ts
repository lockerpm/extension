import * as signalR from '@microsoft/signalr';

import { ApiService } from '../abstractions/api.service';
import { AppIdService } from '../abstractions/appId.service';
import { EnvironmentService } from '../abstractions/environment.service';
import { LogService } from '../abstractions/log.service';
import { NotificationsService as NotificationsServiceAbstraction } from '../abstractions/notifications.service';
import { UserService } from '../abstractions/user.service';
import { VaultTimeoutService } from '../abstractions/vaultTimeout.service';
import { StorageService } from '../abstractions/storage.service';

import ENDPOINT from "@/config/endpoint";

export class NotificationsService implements NotificationsServiceAbstraction {
  private signalrConnection: signalR.HubConnection;
  private url: string;
  private connected = false;
  private inited = false;
  private inactive = false;
  private reconnectTimer: any = null;
  private ws = null;

  constructor(
    private userService: UserService,
    private syncService: any,
    private appIdService: AppIdService,
    private apiService: ApiService,
    private vaultTimeoutService: VaultTimeoutService,
    private environmentService: EnvironmentService,
    private logoutCallback: () => Promise<void>,
    private logService: LogService,
    private storageService: StorageService,
  ) {
    this.environmentService.urls.subscribe(() => {
      if (!this.inited) {
        return;
      }
      this.init();
    });
  }

  async init(): Promise<void> {
    if (await this.isAuthoredAndUnlocked()) {
      await this.connectWebSocket();
    } else {
      this.disconnectSocket();
    }
  }

  async updateConnection(sync = false): Promise<void> {
    if (!this.inited) {
      return;
    }
    try {
      if (await this.isAuthoredAndUnlocked()) {
        await this.reconnect(sync);
      } else {
        await this.signalrConnection.stop();
      }
    } catch (e) {
      this.logService.error(e.toString());
    }
  }

  async reconnectFromActivity(): Promise<void> {
    this.inactive = false;
    if (this.inited && !this.connected) {
      await this.reconnect(true);
    }
  }

  async disconnectFromInactivity(): Promise<void> {
    this.inactive = true;
    if (this.inited && this.connected) {
      await this.signalrConnection.stop();
    }
  }

  private async reconnect(sync: boolean) {
    if (this.reconnectTimer != null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.connected || !this.inited || this.inactive) {
      return;
    }
    const authedAndUnlocked = await this.isAuthoredAndUnlocked();
    if (!authedAndUnlocked) {
      return;
    }

    try {
      await this.signalrConnection.start();
      this.connected = true;
      if (sync) {
        await this.syncService.fullSync(false);
      }
    } catch (e) {
      this.logService.error(e);
    }

    if (!this.connected) {
      this.reconnectTimer = setTimeout(() => this.reconnect(sync), this.random(120000, 300000));
    }
  }

  private async isAuthoredAndUnlocked() {
    if (await this.userService.isAuthenticated()) {
      const locked = await this.vaultTimeoutService.isLocked();
      return !locked;
    }
    return false;
  }

  private random(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async connectWebSocket () {
    const wsUrl = process.env.VUE_APP_WS_URL;
    const token = await this.storageService.get('cs_token');
    this.ws = new WebSocket(`${wsUrl}${ENDPOINT.CYSTACK_PLATFORM_SYNC}?token=${token}`);

    // Listen for messages
    this.ws.addEventListener("message", async (event: any) => {
      const message = JSON.parse(event.data);
      if (message.event === 'sync') {
        await this.syncService.syncWsData(message);
      }
    });
  }

  disconnectSocket () {
    if (this.ws) {
      this.ws.close()
    }
  }
}
