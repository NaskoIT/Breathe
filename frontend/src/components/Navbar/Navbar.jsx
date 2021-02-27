import React, { useRef } from "react";
import classes from "./NavBar.module.scss";
import {NavLink, useHistory} from "react-router-dom";
import {ABOUT_PATH, MAIN_PAGE_PATH, AUTH_PATH, LOGOUT_PATH, REGISTER_PATH} from "../../config/constants";

import {auth} from '../../firebase';

import {useStoreActions, useStoreState} from 'easy-peasy';

const NavBar = (props) => {
  const sideBarRef = useRef(null);

  const history = useHistory();

  const { isLoggedIn } = useStoreState(store => store.user);

  const dispatchLogout = useStoreActions(actions => actions.user.logout);

  const closeNavbarHandler = () => {
    sideBarRef.current.style.width = "0";
  };

  const openNavbarHandler = () => {
    sideBarRef.current.style.width = "250px";
  };

  const logout = () => {
    auth.signOut().then(async () => {
      await dispatchLogout();
      history.push('/');
    }).catch((error) => {
      console.log(error);
    });
  }

  return (
    <div>
      <div className={classes.Navbar} ref={sideBarRef}>
        <button className={classes.CloseBtn} onClick={closeNavbarHandler}>
          &times;
        </button>
        <NavLink
          to={MAIN_PAGE_PATH}
          exact
          onClick={closeNavbarHandler}
          className={[classes.NavLink, classes.AppLogoNavLink].join(" ")}
        >
          Breathe
        </NavLink>
        <NavLink
          to={ABOUT_PATH}
          onClick={closeNavbarHandler}
          className={classes.NavLink}
          activeClassName={classes.ActiveNavLink}
        >
          About
        </NavLink>
        {!isLoggedIn
            ?
            <>
              <NavLink
                  to={AUTH_PATH}
                  onClick={closeNavbarHandler}
                  className={classes.NavLink}
              >
                Login
              </NavLink>
              <NavLink
                  to={REGISTER_PATH}
                  onClick={closeNavbarHandler}
                  className={classes.NavLink}
              >
                Register
              </NavLink>
            </>
            :  <NavLink
                to={LOGOUT_PATH}
                onClick={logout}
                className={classes.NavLink}
            >
              Log out
            </NavLink>
        }

      </div>
      <button className={classes.NavbarBtn} onClick={openNavbarHandler}>
        &#9776;
      </button>
    </div>
  );
};

export default NavBar;
