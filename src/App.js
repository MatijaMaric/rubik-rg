import React, { Component } from "react";
import "./App.css";
import Button from "@material-ui/core/Button";
import { RubikContext } from ".";

class App extends Component {
  render() {
    const { rubik } = this.props;
    console.log(rubik);
    return (
      <div className="App">
        <RubikContext.Consumer>
          {rubik =>
            rubik && (
              <>
                <div className="Moves">
                  <Button onClick={rubik.getDoMove("F")}>Front</Button>
                  <Button onClick={rubik.getDoMove("F'")}>Front R</Button>
                  <Button onClick={rubik.getDoMove("B")}>Back</Button>
                  <Button onClick={rubik.getDoMove("B'")}>Back R</Button>
                  <Button onClick={rubik.getDoMove("L")}>Left</Button>
                  <Button onClick={rubik.getDoMove("L'")}>Left R</Button>
                  <Button onClick={rubik.getDoMove("R")}>Right</Button>
                  <Button onClick={rubik.getDoMove("R'")}>Right R</Button>
                  <Button onClick={rubik.getDoMove("U")}>Up</Button>
                  <Button onClick={rubik.getDoMove("U'")}>Up R</Button>
                  <Button onClick={rubik.getDoMove("D")}>Down</Button>
                  <Button onClick={rubik.getDoMove("D'")}>Down R</Button>

                  <Button
                    onClick={rubik.shuffle()}
                    color="primary"
                    variant="contained"
                  >
                    Shuffle
                  </Button>
                </div>
              </>
            )
          }
        </RubikContext.Consumer>
      </div>
    );
  }
}

export default App;
