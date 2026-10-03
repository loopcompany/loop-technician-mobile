import * as NavigationService from './NavigationService';
import { logoutTechnician } from './Api';
import { setToken } from '../slices/authSlice';
import { emptyUser } from '../slices/userSlice';

/**
 * Signs the technician out of this device: leaves the protected screens right
 * away instead of waiting on the network (and skips the intro video on
 * Welcome), then revokes the session on the server in the background. Local
 * session data is cleared regardless of the server's answer.
 */
export const signOut = (dispatch) => {
  NavigationService.reset({
    index: 0,
    routes: [{ name: 'SignInLanding' }],
  });

  dispatch(setToken(null));
  dispatch(emptyUser());

  logoutTechnician().catch((error) => {
    console.log('Error during logout:', error);
  });
};
