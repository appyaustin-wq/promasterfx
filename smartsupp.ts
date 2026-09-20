// Smartsupp Live Chat Client Integration
// Documentation: https://www.smartsupp.com/help/javascript-api/

declare global {
  interface Window {
    _smartsupp?: {
      key?: string;
      [key: string]: any;
    };
    smartsupp?: {
      (command: string, ...args: any[]): void;
      [key: string]: any;
    };
  }
}

/**
 * Programmatically open the Smartsupp chat widget.
 * Uses Smartsupp JavaScript API: smartsupp('chat:open')
 */
export const openSmartsuppChat = (): void => {
  if (typeof window !== 'undefined' && typeof window.smartsupp === 'function') {
    try {
      window.smartsupp('chat:open');
    } catch (err) {
      console.warn('[Smartsupp] Could not open chat widget:', err);
    }
  } else {
    console.info('[Smartsupp] Chat script is loading or unavailable');
  }
};

/**
 * Programmatically close the Smartsupp chat widget.
 * Uses Smartsupp JavaScript API: smartsupp('chat:close')
 */
export const closeSmartsuppChat = (): void => {
  if (typeof window !== 'undefined' && typeof window.smartsupp === 'function') {
    try {
      window.smartsupp('chat:close');
    } catch (err) {
      console.warn('[Smartsupp] Could not close chat widget:', err);
    }
  }
};

/**
 * Associate authenticated trader profile data with the Smartsupp chat session.
 * This populates customer identity in the Smartsupp agent dashboard.
 */
export const identifySmartsuppUser = (user: {
  uid?: string;
  name?: string;
  email?: string;
  role?: string;
  demoBalance?: number;
}): void => {
  if (typeof window !== 'undefined' && typeof window.smartsupp === 'function') {
    try {
      if (user.name) {
        window.smartsupp('name', user.name);
      }
      if (user.email) {
        window.smartsupp('email', user.email);
      }

      const customVariables: Record<string, string | number> = {};
      if (user.uid) customVariables.traderId = user.uid;
      if (user.role) customVariables.accountRole = user.role;
      if (typeof user.demoBalance === 'number') {
        customVariables.demoBalance = `$${user.demoBalance.toLocaleString()}`;
      }

      if (Object.keys(customVariables).length > 0) {
        window.smartsupp('variables', customVariables);
      }
    } catch (err) {
      console.warn('[Smartsupp] Error syncing user identification:', err);
    }
  }
};
