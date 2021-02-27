import { action } from 'easy-peasy';

export const navigationStore = {
    /**
     * STATE
     */
    startRoute: 'Your location',
    endRoute: '',
    isSubmitted: false,
    currentLocation: '',
    wantedLocation: '',

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
    setCurrentLocation: action((state, payload) => {
        state.currentLocation = payload;
    }),
    setWantedLocation: action((state, payload) => {
        state.wantedLocation = payload;
    }),
};
