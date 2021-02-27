import { action } from 'easy-peasy';

const initialState = {
    uid: '',
    email: '',
    displayName: '',
    refreshToken: '',
    isLoggedIn: false,
}

export const userStore = {
    ...initialState,

    login: action((state, payload) => {
        return {...payload};
    }),
    register: action((state, payload) => {
        return {...payload};
    }),
    logout: action((state, _) => {
        return initialState;
    }),
};
