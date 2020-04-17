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
import ReactWaves from "@dschoon/react-waves";
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
  waveSurfer: null,
  reactPlayer: null,
};

const SOURCE_URL =
  "https://download.ted.com/talks/GeorgeZaidan_Aphids_2019E.mp4?apikey=TEDDOWNLOAD";

const reducer = (state, action) => {
  const loaded = state.reactPlayer && state.waveSurfer;

  switch (action.type) {
    case "PLAY":
      return { ...state, playing: true };
    case "PAUSE":
      return { ...state, playing: false };
    case "RESET":
      if (loaded) {
        state.reactPlayer.seekTo(0, "fraction");
        state.waveSurfer.seekTo(0);
      }
      return state;
    case "STEP_BACK":
      if (loaded) {
        state.reactPlayer.seekTo(state.playedSeconds - 5, "seconds");
        state.waveSurfer.seekTo(
          (1 / state.durationSeconds) * (state.playedSeconds - 5)
        );
      }
      return state;
    case "STEP_FORWARD":
      if (loaded) {
        state.reactPlayer.seekTo(state.playedSeconds + 5, "seconds");
        state.waveSurfer.seekTo(
          (1 / state.durationSeconds) * (state.playedSeconds + 5)
        );
      }
      return state;
    case "SEEK_TO":
      if (loaded) {
        state.reactPlayer.seekTo(action.value, "seconds");
        state.waveSurfer.seekTo((1 / state.durationSeconds) * action.value);
      }
      return { ...state, playing: true };
    case "SET_PLAYED_AND_SECONDS":
      return {
        ...state,
        playedSeconds: action.seconds,
        played: action.fraction,
      };
    case "SET_PLAYED_AND_SECONDS_AND_SEEKING":
      if (loaded) {
        state.reactPlayer.seekTo(action.played / 1000, "fraction");
        state.waveSurfer.seekTo(action.played / 1000);
      }
      return {
        ...state,
        played: action.played,
        playedSeconds: action.playedSeconds,
        seeking: true,
      };
    case "SET_PLAYED":
      return { ...state, played: action.value };
    case "SET_SEEKING":
      return { ...state, seeking: false, playing: true };
    case "SET_PLAY_BACK_RATE":
      return { ...state, playBackRate: action.value };
    case "SET_Volume":
      return { ...state, volume: action.value };
    case "SET_WAVESURFER":
      return { ...state, waveSurfer: action.value };
    case "SET_REACTPLAYER":
      return {
        ...state,
        reactPlayer: action.player,
        durationSeconds: action.duration,
      };
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
  const useForceRerender = () => React.useReducer((x) => x + 1, 0)[1];
  const [state, dispatch] = React.useReducer(reducer, INITIAL_STATE);
  const [transcript, setTranscript] = React.useState([]);
  const reactPlayer = React.useRef();
  const seekingRef = React.useRef();
  React.useEffect(() => {
    seekingRef.current = state.seeking;
  });

  const forceRerender = useForceRerender();

  const handleOnWaveformReady = ({ wavesurfer }) => {
    console.log("Load: ", wavesurfer);
    dispatch({ type: "SET_WAVESURFER", value: wavesurfer });
  };

  const handleDurationLoad = (duration) => {
    dispatch({
      type: "SET_REACTPLAYER",
      player: reactPlayer.current,
      duration: duration,
    });
    setTranscript(processTranscript(Transcript, duration));
  };

  const handleEnded = () => {
    dispatch({ type: "PAUSE" });
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
    dispatch({ type: "RESET" });
  };

  const handleStepBack = () => {
    dispatch({ type: "STEP_BACK" });
  };

  const handleStepForward = () => {
    dispatch({ type: "STEP_FORWARD" });
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
    dispatch({ type: "SET_SEEKING" });
  };

  const checkForHighlight = React.useMemo(
    () => (paragraphID) => {
      const current = state.playedSeconds;
      if (transcript[paragraphID - 1].end < state.playedSeconds) {
        // Played
        return -1;
      } else if (transcript[paragraphID - 1].start > state.playedSeconds) {
        // Not Played
        return 0;
      } else {
        // In current Paragraph
        const spanObj = transcript[paragraphID - 1].spans.find(
          (span) => current >= span.start && current < span.end
        );
        if (spanObj) {
          return spanObj.id;
        }
      }
      return 0;
    },
    [transcript, state.playedSeconds]
  );

  return (
    <div className="App">
      {/* <button onClick={forceRerender}>force rerender</button> */}
      <Card elevation={Elevation.TWO} className="Top-Container">
        <ReactPlayer
          ref={reactPlayer}
          url={SOURCE_URL}
          height="250px"
          width="200px"
          progressInterval={100}
          playing={state.playing}
          playbackRate={state.playBackRate}
          volume={state.volume}
          onProgress={handleProgress}
          onDuration={handleDurationLoad}
          onEnded={handleEnded}
          className="Player"
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
            <PopSlider volume={state.volume} dispatch={dispatch} />
            <SelectButton
              playBackRate={state.playBackRate}
              dispatch={dispatch}
            />
          </div>
          <ReactWaves
            audioFile={SOURCE_URL}
            options={{
              backend: "MediaElement",
              audioRate: state.playBackRate,
              barHeight: 2,
              cursorWidth: 0,
              height: 50,
              hideScrollbar: true,
              progressColor: "#317cbd",
              responsive: true,
              waveColor: "#1f2b33",
              fillParent: true,
              interact: false,
            }}
            volume={0}
            zoom={1}
            playing={state.playing}
            pos={state.playedSeconds}
            onWaveformReady={handleOnWaveformReady}
            className="Wave"
          />
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
              dispatch={dispatch}
            />
          ))}
        </PerfectScrollbar>
      </Card>
    </div>
  );
}

export default App;
