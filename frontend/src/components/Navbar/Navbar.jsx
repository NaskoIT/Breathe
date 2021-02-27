import React, { useRef, useEffect } from "react";
import classes from "./NavBar.module.scss";
import {NavLink, useHistory} from "react-router-dom";
import {ABOUT_PATH, MAIN_PAGE_PATH, AUTH_PATH, LOGOUT_PATH, REGISTER_PATH} from "../../config/constants";
import {auth} from '../../firebase';
import {useStoreActions, useStoreState} from 'easy-peasy';

const NavBar = (props) => {
  const { isSubmitted, startRoute, endRoute } = useStoreState(
    (state) => state.navigationStore
  );
  const { setIsSubmitted } = useStoreActions(
    (actions) => actions.navigationStore
  );

  const sideBarRef = useRef(null);
  const history = useHistory();

  const { isLoggedIn } = useStoreState(store => store.user);
  const dispatchLogout = useStoreActions(actions => actions.user.logout);
  
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
    if(isSubmitted){
     return (
      <React.Fragment>
        <form>
          <input value={startRoute} />
          <input value={endRoute} />
        </form>
      </React.Fragment>
    ); 
    }
    if(!isLoggedIn){
      <React.Fragment>
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
      </React.Fragment>
    }else{
      return (
        <React.Fragment>
          <NavLink
                to={LOGOUT_PATH}
                onClick={logout}
                className={classes.NavLink}
            >
              Log out
            </NavLink>
        </React.Fragment>
      );
    }
  };
}

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
        {renderContent()}
      </div>
      <button className={classes.NavbarBtn} onClick={openNavbarHandler}>
        &#9776;
      </button>
    </div>
  );
};

export default NavBar;
