import classes from "./App.module.scss";
import Layout from "./components/UI/Layout/Layout";
import Routes from "./components/Routes";
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <div className={classes.App}>
      <BrowserRouter>
        <Layout>
          <Routes />
        </Layout>
      </BrowserRouter>
    </div>
  );
}

export default App;
