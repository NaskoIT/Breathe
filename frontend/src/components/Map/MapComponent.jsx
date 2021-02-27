import React, { Component } from "react";
import classes from "./Map.module.scss";
import { API_KEY } from "../../config/constants";
import tt from "@tomtom-international/web-sdk-maps";
import SearchBox from "@tomtom-international/web-sdk-plugin-searchbox";
import { services } from "@tomtom-international/web-sdk-services";
import { bboxPolygon, lineString, length } from "@turf/turf";

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
    this.findMarker = null;
    this.avoidAreas = {};
  }

  componentDidMount() {
    const {
      setEndRoute,
      setIsSubmitted,
      setCurrentLocation,
      setStartRoute,
      setWantedLocation,
      heatMapData,
    } = this.props;

    this.mapRef.current = tt.map({
      key: API_KEY,
      container: "map",
    });

    this.mapRef.current.addControl(new tt.FullscreenControl());
    this.mapRef.current.addControl(new tt.NavigationControl());
    this.mapRef.current.addControl(ttSearchBox, "top-left");

    const features = [];
    Object.keys(heatMapData).forEach((name) => {
      const dataLength = heatMapData[name].length;
      const line = lineString([
        heatMapData[name][0],
        heatMapData[name][dataLength - 1],
      ]);
      const lineLength = parseInt(length(line, { units: "kilometers" }) * 10);
      let span = 1;
      if (lineLength > 0) span = parseInt(dataLength / lineLength);
      for (let i = 0; i <= dataLength - span; i += span) {
        this.avoidAreas[name + "-" + i] = {
          southWestCorner: {
            latitude: heatMapData[name][i][1],
            longitude: heatMapData[name][i][0],
          },
          northEastCorner: {
            latitude: heatMapData[name][i + span - 1][1],
            longitude: heatMapData[name][i + span - 1][0],
          },
        };
      }
      heatMapData[name].forEach((obj) => {
        features.push({
          geometry: {
            type: "Point",
            coordinates: obj,
          },
          properties: {},
        });
      });
    });

    const geoJson = {
      type: "FeatureCollection",
      features: features,
    };

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
          zoom: 12,
        });
        new tt.Marker()
          .setLngLat([longitude, latitude])
          .addTo(self.mapRef.current);

        ttSearchBox.on("tomtom.searchbox.resultscleared", function () {
          self.findMarker?.remove();
        });

        ttSearchBox.on("tomtom.searchbox.resultsfound", async function (data) {
          self.findMarker?.remove();
          const coords = data?.data?.results?.fuzzySearch?.summary;
          if (coords) {
            services
              .fuzzySearch({
                key: API_KEY,
                query: coords.query,
              })
              .then((res) => {
                self.findMarker = new tt.Marker()
                  .setLngLat(res.results[0].position)
                  .addTo(self.mapRef.current);
                self.mapRef.current.flyTo({
                  center: res.results[0].position,
                  zoom: 11,
                });
                const wanted = res.results[0].position;
                setEndRoute(coords.query);
                setWantedLocation(wanted);
                setIsSubmitted(true);
              });
          }
        });
      });

      self.mapRef.current.addLayer({
        id: "heatmap",
        type: "heatmap",
        source: {
          type: "geojson",
          data: geoJson,
        },
        paint: {
          "heatmap-weight": {
            type: "exponential",
            property: "density",
            stops: [
              [1, 0],
              [10000, 1],
            ],
          },
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 10, 9, 20],
        },
      });
    });

    this.mapRef.current.on("click", function (event) {
      const position = event.lngLat;
      console.log(position);
      services
        .reverseGeocode({
          key: API_KEY,
          position: position,
        })
        .then(function (results) {
          self.drawPassengerMarkerOnMap(results);
        });
    });

    this.mapRef.current.on("click", function (event) {
      const position = event.lngLat;
      services
        .reverseGeocode({
          key: API_KEY,
          position: position,
        })
        .then(function (results) {
          self.drawPassengerMarkerOnMap(results);
        });
    });
  }

  drawPassengerMarkerOnMap(geoResponse) {
    if (
      geoResponse &&
      geoResponse.addresses &&
      geoResponse.addresses[0].address.freeformAddress
    ) {
      this.findMarker?.remove();
      this.findMarker = new tt.Marker()
        .setLngLat(geoResponse.addresses[0].position)
        .addTo(this.mapRef.current);
      this.props.setEndRoute(geoResponse.addresses[0].address.freeformAddress);
      this.props.setWantedLocation(geoResponse.addresses[0].position);
      this.props.setIsSubmitted(true);
    }
  }

  drawAreas() {
    const self = this;
    Object.keys(this.avoidAreas).forEach(function (key) {
      if (!self.mapRef.current.getLayer(key)) {
        self.drawAreaPolygon(key);
      }
    });
  }

  getChosenAreas() {
    var areasArray = [];

    const self = this;
    Object.keys(this.avoidAreas).forEach(function (key) {
      if (key.includes("kitka") || key.includes("DOGECOIN"))
        areasArray.push(self.avoidAreas[key]);
    });
    return areasArray;
  }

  serviceCall(currentLocation, wantedLocation) {
    this.removeLayer("route");
    const self = this;

    services
      .calculateRoute({
        key: API_KEY,
        traffic: false,
        locations: [currentLocation, wantedLocation],
        avoidAreas: self.getChosenAreas(),
      })
      .then(function (response) {
        const geojson = response.toGeoJson();

        self.mapRef.current.addLayer({
          id: "route",
          type: "line",
          source: {
            type: "geojson",
            data: geojson,
          },
          paint: {
            "line-color": "blue",
            "line-width": 6,
          },
        });

        self.drawAreas();

        const bounds = new tt.LngLatBounds();
        geojson.features[0].geometry.coordinates.forEach(function (point) {
          bounds.extend(tt.LngLat.convert(point));
        });

        self.mapRef.current.fitBounds(bounds, {
          duration: 0,
          padding: { left: 350, bottom: 50, top: 50, right: 50 },
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  drawAreaPolygon(areaName) {
    var area = this.avoidAreas[areaName];

    var areaPolygon = bboxPolygon([
      area.southWestCorner.longitude,
      area.southWestCorner.latitude,
      area.northEastCorner.longitude,
      area.northEastCorner.latitude,
    ]);

    this.mapRef.current.addLayer({
      id: areaName,
      type: "fill",
      source: {
        type: "geojson",
        data: areaPolygon,
      },
      paint: {
        "fill-color": "blue",
        "fill-opacity": 0.5,
      },
    });
    this.mapRef.current.addLayer({
      id: areaName + "-border",
      type: "line",
      source: {
        type: "geojson",
        data: areaPolygon,
      },
      paint: {
        "line-color": "blue",
        "line-width": 2,
      },
    });
  }

  removeLayer(layerId) {
    if (this.mapRef.current.getLayer(layerId)) {
      this.mapRef.current.removeLayer(layerId);
      this.mapRef.current.removeSource(layerId);
    }
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
    // this.callMatrix();
    this.serviceCall(
      [this.props.currentLocation.lng, this.props.currentLocation.lat],
      [this.props.wantedLocation.lng, this.props.wantedLocation.lat]
    );
  };

  render() {
    return (
      <div className={classes.MapContainer}>
        <div id="map" className={classes.Map}></div>
        <div
          className={classes.RouteButton}
          style={
            this.props.isSubmitted ? { display: "block" } : { display: "none" }
          }
        >
          <button id="submit-button" onClick={this.submitClickedHandler}>
            Find route
          </button>
        </div>
      </div>
    );
  }
}

export default MapComponent;
