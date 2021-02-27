import React from "react";
import MapComponent from "../../components/Map/MapComponent";
import classes from "./MapContainer.module.scss";
import { useStoreActions, useStoreState } from "easy-peasy";

const MapContainer = (props) => {
  const {
    setEndRoute,
    setStartRoute,
    setIsSubmitted,
    setCurrentLocation,
    setWantedLocation,
  } = useStoreActions((actions) => actions.navigationStore);
  const { currentLocation, wantedLocation, heatMapData } = useStoreState(
    (state) => state.navigationStore
  );

  return (
    <div className={classes.Container}>
      <MapComponent
        setEndRoute={setEndRoute}
        setIsSubmitted={setIsSubmitted}
        setStartRoute={setStartRoute}
        setCurrentLocation={setCurrentLocation}
        currentLocation={currentLocation}
        setWantedLocation={setWantedLocation}
        wantedLocation={wantedLocation}
        heatMapData={heatMapData}
      />
    </div>
  );
};

export default MapContainer;
