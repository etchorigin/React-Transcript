import React from "react";
import {
  Button,
  Card,
  Elevation,
  FocusStyleManager,
  H6,
  H2,
  Icon,
  Slider,
} from "@blueprintjs/core";
import ReactPlayer from "react-player";
import PerfectScrollbar from "react-perfect-scrollbar";

import "./App.css";

import SelectButton from "./Components/SelectButton";
import PopSlider from "./Components/PopSlider";
import Paragraph from "./Components/Paragraph";

import { formatSeconds, formatProgressToSeconds } from "./TimeHelper";

import Transcript from "./Transcript";

FocusStyleManager.onlyShowFocusOnTabs();
document.body.className = "bp3-dark";

const INITIAL_STATE = {
  playing: false,
  played: 0,
  playedSeconds: 0,
  durationSeconds: 0,
  playBackRate: 1,
  volume: 0.5,
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
    case "SET_PLAYED_AND_SECONDS_AND_SEEKING":
      return {
        ...state,
        played: action.played,
        playedSeconds: action.playedSeconds,
        seeking: true,
      };
    case "SET_PLAYED":
      return { ...state, played: action.value };
    case "SET_SEEKING":
      return { ...state, seeking: action.value };
    case "SET_PLAY_BACK_RATE":
      return { ...state, playBackRate: action.value };
    case "SET_Volume":
      return { ...state, volume: action.value };
    default:
      throw new Error();
  }
};

const processTranscript = (transcript, endtime) => {
  let indexMark = 1;

  const data = transcript.paragraphs.map((para, paraIndex) => {
    const { cues } = para;
    const spans = [];

    cues.forEach((cue, index) => {
      let end;

      if (index + 1 === cues.length) {
        if (paraIndex + 1 === transcript.paragraphs.length) {
          end = endtime;
        } else {
          end = transcript.paragraphs[paraIndex + 1].cues[0].time / 1000;
        }
      } else {
        end = cues[index + 1].time / 1000;
      }

      spans.push({
        id: indexMark,
        start: cue.time / 1000,
        end: end,
        value: cue.text,
      });

      indexMark += 1;
    });

    return {
      id: paraIndex + 1,
      start: spans[0].start,
      spans: [].concat(spans),
      end: spans[spans.length - 1].end,
    };
  });
  return data;
};

function App() {
  const [state, dispatch] = React.useReducer(reducer, INITIAL_STATE);
  const [transcript, setTranscript] = React.useState([]);
  const player = React.useRef();
  const seekingRef = React.useRef();
  React.useEffect(() => {
    seekingRef.current = state.seeking;
  });

  const handleDurationLoad = (duration) => {
    dispatch({ type: "SET_DURATION_SECONDS", value: duration });
    setTranscript(processTranscript(Transcript, duration));
  };

  const handleProgress = (progress) => {
    if (!seekingRef.current) {
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

  const handleStepBack = () => {
    player.current.seekTo(state.playedSeconds - 5, "seconds");
  };

  const handleStepForward = () => {
    player.current.seekTo(state.playedSeconds + 5, "seconds");
  };

  const handlePlayPause = () => {
    console.log("APP: ", state.playing ? "Pausing..." : "Playing...");
    dispatch({ type: state.playing ? "PAUSE" : "PLAY" });
  };

  const handleSliderChange = (step) => {
    dispatch({
      type: "SET_PLAYED_AND_SECONDS_AND_SEEKING",
      played: step,
      playedSeconds: formatProgressToSeconds(step, state.durationSeconds),
    });
  };

  const handleSliderRelease = () => {
    dispatch({ type: "SET_SEEKING", value: false });
    player.current.seekTo(state.played / 1000, "fraction");
  };

  const handlePlayBackRateSelect = (value) => {
    dispatch({ type: "SET_PLAY_BACK_RATE", value });
  };

  const handleVolumeChange = (value) => {
    dispatch({ type: "SET_Volume", value: value / 10 });
  };

  const handleSeekTo = (seconds) => {
    player.current.seekTo(seconds, "seconds");
    dispatch({ type: "PLAY" });
  };

  const checkForHighlight = React.useMemo(
    () => (paragraphID) => {
      const current = state.playedSeconds;
      const spanObj = transcript[paragraphID - 1].spans.find(
        (span) => current >= span.start && current < span.end
      );
      if (spanObj) {
        return spanObj.id;
      }
      return 0;
    },
    [transcript, state.playedSeconds]
  );

  return (
    <div className="App">
      <Card elevation={Elevation.TWO} className="Top-Container">
        <ReactPlayer
          ref={player}
          url="https://download.ted.com/talks/GeorgeZaidan_Aphids_2019E.mp4?apikey=TEDDOWNLOAD"
          height="200px"
          width="200px"
          progressInterval={500}
          playing={state.playing}
          playbackRate={state.playBackRate}
          volume={state.volume}
          onProgress={handleProgress}
          onDuration={handleDurationLoad}
        />
        <div className="Details-Container">
          <H6 className="Light-Font">George Zaidan | TED-Ed</H6>
          <H2>The bug that poops candy</H2>
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
            <Button icon="step-backward" onClick={handleStepBack} />
            <Button
              icon={state.playing ? "pause" : "play"}
              onClick={handlePlayPause}
            />
            <Button icon="step-forward" onClick={handleStepForward} />
            <PopSlider
              volume={state.volume}
              handleChange={handleVolumeChange}
            />
            <SelectButton
              playBackRate={state.playBackRate}
              handleSelect={handlePlayBackRateSelect}
            />
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
      <Card elevation={Elevation.TWO} className="Bottom-Container">
        <PerfectScrollbar>
          {transcript.map((para) => (
            <Paragraph
              key={para.id}
              start={para.start}
              end={para.end}
              spans={para.spans}
              highlightIndex={checkForHighlight(para.id)}
              handleSeekTo={handleSeekTo}
            />
          ))}
        </PerfectScrollbar>
      </Card>
    </div>
  );
}

export default App;
