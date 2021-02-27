import { action } from 'easy-peasy';
import streetData from '../mocks/street_coords.json';
import pointCloudData from '../mocks/point_clouds.json';

export const navigationStore = {
    /**
     * STATE
     */
    startRoute: 'Your location',
    endRoute: '',
    isSubmitted: false,
    currentLocation: '',
    wantedLocation: '',
    heatMapData: { ...streetData, ...pointCloudData },

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
    setHeatMapData: action((state, payload) => {
        state.heatMapData = payload;
    }),
};
