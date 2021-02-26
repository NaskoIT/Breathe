import React, { Component, useEffect, useState, useRef } from "react";
import classes from "./Map.module.scss";
import { API_KEY } from "../../config/constants";

const Map = (props) => {
  const mapRef = useRef(null);

  useEffect(() => {
    const tt = window.tt;
    mapRef.current = tt.map({
      key: API_KEY,
      container: "map",
    });
    mapRef.current.addControl(new tt.FullscreenControl());
    mapRef.current.addControl(new tt.NavigationControl());

    navigator.geolocation.getCurrentPosition(function (position) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      mapRef.current.on("load", () => {
        console.log("map fly to");
        mapRef.current.flyTo({
          center: [longitude, latitude],
          zoom: 11, // you can also specify zoom level
        });
      });

      new tt.Marker().setLngLat([longitude, latitude]).addTo(mapRef.current);
    });
  }, []);

  return (
    <div className={classes.MapContainer}>
      <div id="map" className={classes.Map}></div>
    </div>
  );
};

export default Map;
