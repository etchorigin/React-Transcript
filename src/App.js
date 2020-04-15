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
  Slider,
  Switch,
} from "@blueprintjs/core";
import ReactPlayer from "react-player";

import "./App.css";

import { formatSeconds, playedProgress } from "./TimeHelper";

FocusStyleManager.onlyShowFocusOnTabs();
document.body.className = "bp3-dark";

const initialState = {
  playing: true,
  played: 0,
  playedSeconds: "",
  durationSeconds: "",
  seeking: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "PLAY":
      return { ...state, playing: true };
    case "PAUSE":
      return { ...state, playing: false };
    case "SET_DURATION_SECONDS":
      return { ...state, durationSeconds: action.value };
    case "SET_PLAYED_AND_SECONDS":
      return {
        ...state,
        playedSeconds: action.seconds,
        played: action.fraction,
      };
    case "SET_PLAYED_AND_SEEKING":
      return { ...state, played: action.value, seeking: true };  
    case "SET_PLAYED":
      return { ...state, played: action.value };
    case "SET_SEEKING":
      return { ...state, seeking: action.value };

    default:
      throw new Error();
  }
};

function App() {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const player = React.useRef();
  const seekingRef = React.useRef();
  React.useEffect(() => {
    seekingRef.current = state.seeking;
  });

  const handleDurationLoad = (duration) => {
    dispatch({ type: "SET_DURATION_SECONDS", value: duration });
  };

  const handleProgress = progress => {
    if(!seekingRef.current) {
      dispatch({
        type: "SET_PLAYED_AND_SECONDS",
        seconds: progress.playedSeconds,
        fraction: progress.played * 1000,
      });
    }
  };

  const handleReset = () => {
    console.log("APP: ", "Resetting...");
    player.current.seekTo(0, "fraction");
  };

  const handlePlayPause = () => {
    console.log("APP: ", state.playing ? "Pausing..." : "Playing...");
    dispatch({ type: state.playing ? "PAUSE" : "PLAY" });
  };

  const handleSliderChange = (step) => {
    dispatch({ type: "SET_PLAYED_AND_SEEKING", value: step });
  };

  const handleSliderRelease = () => {
    dispatch({ type: "SET_SEEKING", value: false });
    player.current.seekTo(state.played / 1000, "fraction");
  };

  return (
    <div className="App">
      <Card elevation={Elevation.TWO} className="Top-Container">
        <ReactPlayer
          ref={player}
          url="https://www.youtube.com/watch?v=ysz5S6PUM-U"
          height="200px"
          width="200px"
          playing={state.playing}
          onProgress={handleProgress}
          onDuration={handleDurationLoad}
        />
        <div className="Details-Container">
          <H6 className="Light-Font">George Zaidan | TED-Ed</H6>
          <H2>The bug that poops canday</H2>
          <div className="Details-Info-Container">
            <span className="Details-Info-Time">
              {formatSeconds(state.playedSeconds)}
            </span>
            <Icon icon="slash" iconSize={16} />
            <span className="Details-Info-Time">
              {formatSeconds(state.durationSeconds)}
            </span>
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
            <Slider
              min={0}
              max={1000}
              stepSize={1}
              value={state.played}
              labelRenderer={false}
              onChange={handleSliderChange}
              onRelease={handleSliderRelease}
              className="Details-MediaControls-Slider-Container"
            />
        </div>
      </Card>
    </div>
  );
}

export default App;
