import React, { useRef } from "react";
import classes from "./NavBar.module.scss";
import { NavLink } from "react-router-dom";
import { ABOUT_PATH, MAIN_PAGE_PATH, AUTH_PATH } from "../../config/constants";

const NavBar = (props) => {
  const sideBarRef = useRef(null);

  const closeNavbarHandler = () => {
    sideBarRef.current.style.width = "0";
  };

  const openNavbarHandler = () => {
    sideBarRef.current.style.width = "250px";
  };

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
        <NavLink
            to={AUTH_PATH}
            onClick={closeNavbarHandler}
            className={classes.NavLink}
        >
          Login
        </NavLink>
        <NavLink
            to={AUTH_PATH}
            onClick={closeNavbarHandler}
            className={classes.NavLink}
        >
          Register
        </NavLink>
      </div>
      <button className={classes.NavbarBtn} onClick={openNavbarHandler}>
        &#9776;
      </button>
    </div>
  );
};

export default NavBar;
