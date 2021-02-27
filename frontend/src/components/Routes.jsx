import React, { useEffect, useState } from "react";
import {
  Redirect,
  withRouter,
  Route,
  Switch,
  useHistory,
} from "react-router-dom";
import { useStoreState } from 'easy-peasy';

import { RouteOptions } from "../utils/enums";
import { MAIN_PAGE_PATH, ABOUT_PATH, AUTH_PATH } from "../config/constants";

import About from "./About/About";
import AuthenticationModal from "./AuthenticationModal/AuthenticationModal";
import Map from "./Map/Map";

const Routes = (props) => {
  const history = useHistory();

  const [route, setRoute] = useState(null);

  const { isLoggedIn } = useStoreState(store => store.user);

  useEffect(() => {
    setRoute(resolveNavigationRoute());

    // eslint-disable-next-line
  }, [history.location.pathname]);

  const resolveNavigationRoute = () => {
    switch (true) {
      case history.location.pathname === ABOUT_PATH:
        return RouteOptions.GO_TO_ABOUT;
      case !isLoggedIn:
        return RouteOptions.GO_TO_AUTH;
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
          <Route exact path={ABOUT_PATH} component={About} />;
          <Redirect exact path={ABOUT_PATH} />
        </Switch>
      );
    case RouteOptions.GO_TO_AUTH:
      return (
          <Switch>
            <Route exact path={MAIN_PAGE_PATH} component={Map} />;
            <Route exact path={ABOUT_PATH} component={About} />;
            <Route exact path={AUTH_PATH} component={AuthenticationModal} />;
            <Redirect to={AUTH_PATH} />
          </Switch>
      );
    default:
      return (
        <Switch>
          <Route exact path={MAIN_PAGE_PATH} component={Map} />
          <Redirect exact path={MAIN_PAGE_PATH} />
        </Switch>
      );
  }
};

export default withRouter(Routes);
