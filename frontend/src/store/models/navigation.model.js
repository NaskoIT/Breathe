import { action, thunk } from 'easy-peasy';

export const navigationStore = {
    /**
     * STATE
     */
    startRoute: '',
    endRoute: '',
    isSubmitted: false,

    /**
     * ACTIONS
     */
    setStartRoute: action((state, payload) => {
        state.startRoute = payload;
    }),
    setEndRoute: action((state, payload) => {
        state.endRoute = payload;
    }),
    setIsSubmitted: action((state, payload) => {
        state.isSubmitted = payload;
    }),

    /**
     * THUNKS
     */
};
