import { UserManager, WebStorageStateStore } from './core';

const isBrowser = typeof window !== 'undefined';

export const oidcSettings = {
  authority: process.env.NEXT_PUBLIC_SSO_API!,
  client_id: process.env.NEXT_PUBLIC_SSO_CLIENT_ID!,
  redirect_uri: process.env.NEXT_PUBLIC_SSO_LOGIN_REDIRECT_URI!,
  post_logout_redirect_uri: process.env.NEXT_PUBLIC_SSO_LOGOUT_REDIRECT_URI!,
  response_type: 'code',
  scope: 'openid offline email profile offline_access',
  loadUserInfo: false,
  userStore: isBrowser
    ? new WebStorageStateStore({ store: window.localStorage })
    : undefined,
};

export class Oidc {
  private oidcUser: UserManager | null = null;
  private phoneNumber: string;

  constructor({ phoneNumber }: { phoneNumber: string }) {
    this.phoneNumber = phoneNumber;
  }

  private getUserManager() {
    if (!this.oidcUser) {
      this.oidcUser = new UserManager(oidcSettings);
    }
    return this.oidcUser;
  }

  /**
   * Redirect to OIDC provider with phone number
   */
  async loginWithOidc() {
    if (!this.phoneNumber) return;

    const manager = this.getUserManager();
    await manager.signinRedirect({
      extraQueryParams: {
        u: this.phoneNumber, // truyền số điện thoại
      },
    });
  }

  /**
   * Handle redirect callback after login
   */
  async handleSigninCallback() {
    const manager = this.getUserManager();
    return await manager.signinCallback(); // lấy token, lưu session
  }

  /**
   * Get current logged-in user
   */
  async getUserOidC() {
    const manager = this.getUserManager();
    return await manager.getUser(); // option: { raiseEvent: false } nếu muốn
  }

  /**
   * Sign out via OIDC provider
   */
  async logoutOidc() {
    const manager = this.getUserManager();
    return await manager.signoutRedirect();
  }
}
