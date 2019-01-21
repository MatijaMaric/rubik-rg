import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import Rubik from "./Rubik";

const canvas = document.getElementById("canvas");
const rubik = new Rubik(canvas);
window.addEventListener("resize", ev => {
  rubik.setSize(canvas.clientWidth, canvas.clientHeight);
});

export const RubikContext = React.createContext();
ReactDOM.render(
  <RubikContext.Provider value={rubik}>
    <App />
  </RubikContext.Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
