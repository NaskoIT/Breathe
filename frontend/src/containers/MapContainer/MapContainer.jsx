import React, { useState } from "react";
import Map from "../../components/Map/Map";
import classes from "./MapContainer.module.scss";
import { useStoreActions } from "easy-peasy";
import { InputGroup, FormControl } from "react-bootstrap";

const MapContainer = (props) => {
  const { setEndRoute, setStartRoute, setIsSubmitted } = useStoreActions(
    (actions) => actions.navigationStore
  );
  const [inputValue, setInputValue] = useState("");

  const inputSubmitHandler = (e) => {
    const value = e.target.value;
    setInputValue(value);
  };

  const inputClearHandler = () => {
    setInputValue("");
    setEndRoute("");
  };

  const keyPressHandler = (e) => {
    if (e.key === "Enter") {
      setEndRoute(inputValue);
      setIsSubmitted(true);
    }
  };

  return (
    <div className={classes.Container}>
      <InputGroup className={classes.InputGroup}>
        <FormControl
          value={inputValue}
          onChange={inputSubmitHandler}
          onKeyPress={keyPressHandler}
          className={classes.Input}
          placeholder="Enter destination"
          aria-label="REnter destination"
          aria-describedby="destination-input"
        />
        <InputGroup.Append className={classes.InputAppend}>
          <InputGroup.Text id="destination-input" onClick={inputClearHandler}>
            &times;
          </InputGroup.Text>
        </InputGroup.Append>
      </InputGroup>
      <Map />
    </div>
  );
};

export default MapContainer;
