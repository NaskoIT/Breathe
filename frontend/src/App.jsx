import classes from "./App.module.scss";
import Layout from "./components/UI/Layout/Layout";
import { BrowserRouter, Switch, Route } from "react-router-dom";

import {useStoreState} from "easy-peasy";

import About from "./components/About/About";
import Profile from "./components/Profile/Profile";
import {ABOUT_PATH, LOGIN_PATH, REGISTER_PATH, LOGOUT_PATH, PROFILE_PATH} from "./config/constants";
import AuthenticationModal from "./components/AuthenticationModal/AuthenticationModal";
import MapContainer from "./containers/MapContainer/MapContainer";

function App() {

    const { isLoggedIn } = useStoreState(state => state.userStore);

  return (
    <div className={classes.App}>
      <BrowserRouter>
        <Layout>
            <Switch>
                <Route exact path="/">
                    <MapContainer />
                </Route>
                <Route exact path={ABOUT_PATH}>
                    <About />
                </Route>
                {isLoggedIn
                    ?  <Route exact path={PROFILE_PATH}>
                            <Profile />
                        </Route>
                    :
                    <>
                        <Route exact path={LOGIN_PATH}>
                            <AuthenticationModal defaultTab="login" />
                        </Route>
                        <Route exact path={REGISTER_PATH}>
                            <AuthenticationModal defaultTab="register" />
                        </Route>
                    </>
                    }


            </Switch>
        </Layout>
      </BrowserRouter>
    </div>
  );
}

export default App;
