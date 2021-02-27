import React, { useRef, useEffect } from "react";
import classes from "./NavBar.module.scss";
import { NavLink } from "react-router-dom";
import { ABOUT_PATH, MAIN_PAGE_PATH } from "../../config/constants";
import { useStoreState, useStoreActions } from "easy-peasy";

const NavBar = (props) => {
  const { isSubmitted, startRoute, endRoute } = useStoreState(
    (state) => state.navigationStore
  );
  const { setIsSubmitted } = useStoreActions(
    (actions) => actions.navigationStore
  );

  const sideBarRef = useRef(null);

  useEffect(() => {
    if (isSubmitted) {
      openNavbarHandler();
    }
  }, [isSubmitted]);

  const closeNavbarHandler = () => {
    sideBarRef.current.style.width = "0";
    setIsSubmitted(false);
  };

  const openNavbarHandler = () => {
    sideBarRef.current.style.width = "250px";
  };

  const renderContent = () => {
    if (!isSubmitted) {
      return (
        <React.Fragment>
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
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <form>
          <input value={startRoute} />
          <input value={endRoute} />
        </form>
      </React.Fragment>
    );
  };

  return (
    <div>
      <div className={classes.Navbar} ref={sideBarRef}>
        <button className={classes.CloseBtn} onClick={closeNavbarHandler}>
          &times;
        </button>
        {renderContent()}
      </div>
      <button className={classes.NavbarBtn} onClick={openNavbarHandler}>
        &#9776;
      </button>
    </div>
  );
};

export default NavBar;
