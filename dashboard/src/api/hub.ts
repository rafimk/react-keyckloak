import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr'

/**
 * SignalR connection to the dashboard hub. The token goes in the query string (browsers can't
 * set headers on WebSockets); `getToken` refreshes it first, so every (re)connect uses a valid one.
 */
export function createDashboardConnection(getToken: () => Promise<string>) {
  return new HubConnectionBuilder()
    .withUrl(import.meta.env.VITE_API_URL + '/hubs/dashboard', { accessTokenFactory: getToken })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build()
}
