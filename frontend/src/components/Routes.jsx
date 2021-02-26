import React, { useEffect, useState } from "react";
import {
  Redirect,
  withRouter,
  Route,
  Switch,
  useHistory,
} from "react-router-dom";
import { RouteOptions } from "../utils/enums";
import { MAIN_PAGE_PATH, ABOUT_PATH } from "../config/constants";
import About from "./About/About";

const Routes = (props) => {
  const history = useHistory();

  const [route, setRoute] = useState(null);

  useEffect(() => {
    setRoute(resolveNavigationRoute());

    // eslint-disable-next-line
  }, [history.location.pathname]);

  const resolveNavigationRoute = () => {
    switch (true) {
      case history.location.pathname === ABOUT_PATH:
        return RouteOptions.GO_TO_ABOUT;
      default:
        return RouteOptions.GO_TO_HOME;
    }
  };

  switch (route) {
    case RouteOptions.GO_TO_PROFILE:
      return <p>profile</p>;
    case RouteOptions.GO_TO_ABOUT:
      return (
        <Switch>
          <Route to={ABOUT_PATH} component={About} />;
          <Redirect to={ABOUT_PATH} />
        </Switch>
      );
    default:
      return (
        <Switch>
          <Redirect to={MAIN_PAGE_PATH} />
        </Switch>
      );
  }
};

export default withRouter(Routes);
