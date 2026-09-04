export interface ISessionContext {
  isSessionExpired: boolean;
  triggerSessionExpired: () => void;
  dismissSessionExpired: () => void;
}