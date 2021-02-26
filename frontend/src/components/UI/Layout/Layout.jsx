import React from "react";
import NavBar from "../../Navbar/Navbar";
import classes from "./Layout.module.scss";

const Layout = (props) => {
  return (
    <div className={classes.Layout}>
      <NavBar />
      {props.children}
    </div>
  );
};

export default Layout;
