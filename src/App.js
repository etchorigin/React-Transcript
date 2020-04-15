import React from "react";
import {
  Button,
  Card,
  Elevation,
  FocusStyleManager,
  H6,
  H2,
  Icon,
  Intent,
  Switch,
} from "@blueprintjs/core";
import ReactPlayer from "react-player";

import "./App.css";

FocusStyleManager.onlyShowFocusOnTabs();
document.body.className = "bp3-dark";

const initialState = {
  playing: true,
  played: 0,
  playedSeconds: "0:00",
  durationSeconds: "0:00",
};

const reducer = (state, action) => {
  switch (action.type) {
    case "PLAY":
      return { ...state, playing: true };
    case "PAUSE":
      return { ...state, playing: false };
    case "SET_DURATION":
      return { ...state, durationSeconds: action.value };
    default:
      throw new Error();
  }
};

function App() {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const player = React.useRef();

  const handleDurationLoad = (duration) => {
    dispatch({ type: "SET_DURATION", value: duration });
  };

  const handleProgress = (state) => {
    console.log("Progress: ", state);
  };

  const handleReset = () => {
    console.log("APP: ", "Resetting...");
    player.current.seekTo(0, "fraction");
  };

  const handlePlayPause = () => {
    console.log("APP: ", state.playing ? "Pausing..." : "Playing...");
    dispatch({ type: state.playing ? "PAUSE" : "PLAY" });
  };

  return (
    <div className="App">
      <Card elevation={Elevation.TWO} className="Top-Container">
        <ReactPlayer
          ref={player}
          url="https://www.youtube.com/watch?v=ysz5S6PUM-U"
          height="100%"
          width="200px"
          playing={state.playing}
          onProgress={handleProgress}
          onDuration={handleDurationLoad}
        />
        <div className="Details-Container">
          <H6 className="Light-Font">George Zaidan | TED-Ed</H6>
          <H2>The bug that poops canday</H2>
          <div className="Details-Info-Container">
            <div>
              <span>
                {state.playedSeconds} / {state.durationSeconds}
              </span>
            </div>
            <Icon icon="symbol-circle" iconSize={6} className="Icon-Spacer" />
            <span className="Light-Font">1 language</span>
          </div>
          <div className="Details-MediaControls-Container">
            <Button icon="reset" onClick={handleReset} />
            <Button icon="step-backward" />
            <Button
              icon={state.playing ? "pause" : "play"}
              onClick={handlePlayPause}
            />
            <Button icon="step-forward" />
            <Button icon="volume-up" />
            <Button text="1x" />
          </div>
        </div>
      </Card>
    </div>
  );
}

export default App;
