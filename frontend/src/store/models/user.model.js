import { action, thunk } from 'easy-peasy';

export const user = {
    uid: '',
    email: '',
    displayName: '',
    refreshToken: '',
    isLoggedIn: false,

    login: action((state, payload) => {
        return {...payload};
    })

    /**
     * THUNKS
     */
};
