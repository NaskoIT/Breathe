import React, { Component } from "react";
import classes from "./Map.module.scss";
import { API_KEY } from "../../config/constants";
import { isMobile, isTablet } from "react-device-detect";
import tt from "@tomtom-international/web-sdk-maps";
import SearchBox from "@tomtom-international/web-sdk-plugin-searchbox";
import { services } from "@tomtom-international/web-sdk-services";

const ttSearchBox = new SearchBox(services, {
  idleTimePress: 100,
  minNumberOfCharacters: 2,
  searchOptions: {
    key: API_KEY,
    language: "en-GB",
  },
  showSearchButton: true,
  noResultsMessage: "No results found.",
});

class Map extends Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
  }

  componentDidMount() {
    window.handleEnterSubmit =
      window.handleEnterSubmit || this.handleEnterSubmit;
    this.mapRef.current = tt.map({
      key: API_KEY,
      container: "map",
      dragPan: !(isMobile || isTablet),
    });

    this.mapRef.current.addControl(new tt.FullscreenControl());
    this.mapRef.current.addControl(new tt.NavigationControl());
    this.mapRef.current.addControl(ttSearchBox, "top-left");

    const self = this;
    this.mapRef.current.on("load", () => {
      let position = null;
      navigator.geolocation.getCurrentPosition(function (pos) {
        position = pos;
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        self.mapRef.current.flyTo({
          center: [longitude, latitude],
          zoom: 11,
        });
        new tt.Marker()
          .setLngLat([longitude, latitude])
          .addTo(self.mapRef.current);

        let findMarker = null;

        ttSearchBox.on("tomtom.searchbox.resultsfound", async function (data) {
          findMarker?.remove();
          const coords = data?.data?.results?.fuzzySearch?.summary?.geoBias;
          if (coords) {
            services
              .fuzzySearch({
                key: API_KEY,
                //   position: [coords.lng, coords.lat],
                query: data.data.results.fuzzySearch.summary.query,
              })
              .then((res) => {
                findMarker = new tt.Marker()
                  .setLngLat(res.results[0].position)
                  .addTo(self.mapRef.current);
              });
          }
        });
      });
    });
  }

  render() {
    return (
      <div className={classes.MapContainer}>
        <div id="map" className={classes.Map}></div>
      </div>
    );
  }
}

export default Map;
