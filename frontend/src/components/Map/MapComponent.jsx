import React, { Component } from "react";
import classes from "./Map.module.scss";
import { API_KEY } from "../../config/constants";
import { isMobile, isTablet } from "react-device-detect";
import tt from "@tomtom-international/web-sdk-maps";
import SearchBox from "@tomtom-international/web-sdk-plugin-searchbox";
import { services } from "@tomtom-international/web-sdk-services";

const ttSearchBox = new SearchBox(services, {
  idleTimePress: 1000,
  minNumberOfCharacters: 2,
  searchOptions: {
    key: API_KEY,
    language: "en-GB",
  },
  showSearchButton: true,
  noResultsMessage: "No results found.",
});

const routeWeight = 9;
const routeBackgroundWeight = 12;

class MapComponent extends Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
    this.routes = [];
    this.bestRouteIndex = 0;
  }

  componentDidMount() {
    const {
      setEndRoute,
      setIsSubmitted,
      setCurrentLocation,
      setStartRoute,
      setWantedLocation,
    } = this.props;

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

        services
          .reverseGeocode({
            key: API_KEY,
            position: { longitude, latitude },
          })
          .then((res) => {
            setStartRoute("Your location");
            setCurrentLocation(res.addresses[0].position);
          });

        self.mapRef.current.flyTo({
          center: [longitude, latitude],
          zoom: 11,
        });
        new tt.Marker()
          .setLngLat([longitude, latitude])
          .addTo(self.mapRef.current);

        let findMarker = null;
        ttSearchBox.on("tomtom.searchbox.resultscleared", function () {
          findMarker?.remove();
        });

        ttSearchBox.on("tomtom.searchbox.resultsfound", async function (data) {
          findMarker?.remove();
          const coords = data?.data?.results?.fuzzySearch?.summary;
          if (coords) {
            services
              .fuzzySearch({
                key: API_KEY,
                query: coords.query,
              })
              .then((res) => {
                findMarker = new tt.Marker()
                  .setLngLat(res.results[0].position)
                  .addTo(self.mapRef.current);
                self.mapRef.current.flyTo({
                  center: res.results[0].position,
                  zoom: 11,
                });
                setEndRoute(coords.query);
                setWantedLocation(res.results[0].position);
                setIsSubmitted(true);
              });
          }
        });
      });
    });
  }

  processMatrixResponse = (result) => {
    const travelTimeInSecondsArray = [];
    const lengthInMetersArray = [];
    const trafficDelayInSecondsArray = [];
    result.matrix.forEach(function (child) {
      travelTimeInSecondsArray.push(
        child[0].response.routeSummary.travelTimeInSeconds
      );
      lengthInMetersArray.push(child[0].response.routeSummary.lengthInMeters);
      trafficDelayInSecondsArray.push(
        child[0].response.routeSummary.trafficDelayInSeconds
      );
    });

    this.drawAllRoutes();
  };

  drawAllRoutes() {
    const { currentLocation, wantedLocation } = this.props;
    const self = this;
    services
      .calculateRoute({
        batchMode: "sync",
        key: API_KEY,
        batchItems: [
          {
            locations:
              [wantedLocation.lng, wantedLocation.lat] +
              ":" +
              [currentLocation.lng, currentLocation.lat],
          },
        ],
      })
      .then(function (results) {
        results.batchItems.forEach(function (singleRoute, index) {
          const routeGeoJson = singleRoute.toGeoJson();
          const route = [];
          const route_background_layer_id = "route_background_" + index;
          const route_layer_id = "route_" + index;

          self.mapRef.current
            .addLayer(
              self.buildStyle(
                route_background_layer_id,
                routeGeoJson,
                "black",
                routeBackgroundWeight
              )
            )
            .addLayer(
              self.buildStyle(route_layer_id, routeGeoJson, "blue", routeWeight)
            );

          route[0] = route_background_layer_id;
          route[1] = route_layer_id;
          self.routes[index] = route;

          if (index === self.bestRouteIndex) {
            const bounds = new tt.LngLatBounds();
            routeGeoJson.features[0].geometry.coordinates.forEach(function (
              point
            ) {
              bounds.extend(tt.LngLat.convert(point));
            });
            self.mapRef.current.fitBounds(bounds, { padding: 150 });
          }

          self.mapRef.current.on("mouseenter", route_layer_id, function () {
            self.mapRef.current.moveLayer(route_background_layer_id);
            self.mapRef.current.moveLayer(route_layer_id);
          });

          self.mapRef.current.on("mouseleave", route_layer_id, function () {
            self.bringBestRouteToFront();
          });
        });
        self.bringBestRouteToFront();
      });
  }

  bringBestRouteToFront() {
    this.mapRef.current.moveLayer(this.routes[this.bestRouteIndex][0]);
    this.mapRef.current.moveLayer(this.routes[this.bestRouteIndex][1]);
  }

  buildStyle(id, data, color, width) {
    return {
      id: id,
      type: "line",
      source: {
        type: "geojson",
        data: data,
      },
      paint: {
        "line-color": color,
        "line-width": width,
      },
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
    };
  }

  convertToPoint(lat, long) {
    return {
      point: {
        latitude: lat,
        longitude: long,
      },
    };
  }

  buildDestinationsParameter() {
    const { wantedLocation } = this.props;
    return [this.convertToPoint(wantedLocation.lat, wantedLocation.lng)];
  }

  buildOriginsParameter() {
    return [
      this.convertToPoint(
        this.props.currentLocation.lat,
        this.props.currentLocation.lng
      ),
    ];
  }

  callMatrix() {
    this.clear();
    const origins = this.buildOriginsParameter();
    const destinations = this.buildDestinationsParameter();
    services
      .matrixRouting({
        key: API_KEY,
        origins: origins,
        destinations: destinations,
        traffic: true,
      })
      .then(this.processMatrixResponse);
  }

  clear() {
    const self = this;
    this.routes.forEach(function (child) {
      self.mapRef.current.removeLayer(child[0]);
      self.mapRef.current.removeLayer(child[1]);
      self.mapRef.current.removeSource(child[0]);
      self.mapRef.current.removeSource(child[1]);
    });
    this.routes = [];
  }

  submitClickedHandler = () => {
    this.callMatrix();
  };

  render() {
    return (
      <div className={classes.MapContainer}>
        <div id="map" className={classes.Map}></div>
        <div className={classes.RouteButton}>
          <label>Find the taxi that will arrive fastest</label>
          <div id="route-labels"></div>
          <input
            type="button"
            id="submit-button"
            value="Submit"
            onClick={this.submitClickedHandler}
          />
        </div>
      </div>
    );
  }
}

export default MapComponent;
