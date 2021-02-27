import React, { Component } from "react";
import classes from "./Map.module.scss";
import { API_KEY } from "../../config/constants";
import tt from "@tomtom-international/web-sdk-maps";
import SearchBox from "@tomtom-international/web-sdk-plugin-searchbox";
import { services } from "@tomtom-international/web-sdk-services";
import bboxPolygon from "@turf/bbox-polygon";

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

    console.log(heatMapData);
    const features = [];
    Object.keys(heatMapData).forEach((name) => {
      const length = heatMapData[name].length;
      const span = parseInt(length / 5 - 1);
      for (let i = 0; i < length - span - 1; i += span) {
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
          zoom: 11,
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
          // Increase the heatmap weight of each point
          "heatmap-weight": 0.6,

          // Increase the heatmap color weight weight by zoom level
          // heatmap-intensity is a multiplier on top of heatmap-weight
          "heatmap-intensity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0,
            1,
            9,
            3,
          ],

          // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
          // Begin color ramp at 0-stop with a 0-transparancy color
          // to create a blur-like effect.
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(49, 150, 251, 0)",
            0.2,
            "rgb(49, 150, 251)",
            0.4,
            "rgb(127, 234, 20)",
            0.6,
            "rgb(251, 251, 49)",
            0.8,
            "rgb(251, 150, 49)",
            1,
            "rgb(251, 49, 49)",
          ],

          // Adjust the heatmap radius by zoom level
          "heatmap-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0,
            2,
            9,
            20, // at zoom level 9 the radius will be 20px
          ],

          // heatmap opacity by zoom level
          "heatmap-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            3,
            0, // at zoom level 3 the opacity will be 0
            5,
            0.5,
            10,
            1, // at zoom level 10 the opacity will be 1
            18,
            0.6,
            20,
            0.1,
          ],
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
