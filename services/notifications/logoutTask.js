/**
 * A one-slot registry that lets the logout flow detach this device from push
 * notifications without Api.js having to import the notifications module.
 *
 * Api.js is imported *by* the notifications module, so importing it back would
 * create a require cycle. This module deliberately has no imports of its own.
 */
let task = null;

/** Called once by the notifications module as it loads. */
export const setLogoutTask = (fn) => {
  task = fn;
};

/**
 * Runs the registered task, if any. Never throws: detaching the device must not
 * be able to block or fail a logout.
 */
export const runLogoutTask = async (authToken) => {
  if (!task) return false;

  try {
    return await task(authToken);
  } catch (error) {
    console.log('[notifications] logout task failed:', error?.message ?? error);
    return false;
  }
};
