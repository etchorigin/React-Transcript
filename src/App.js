import React from "react";
import {
  Button,
  Card,
  Elevation,
  FocusStyleManager,
  H6,
  H4,
  Icon,
  Slider,
  Spinner,
} from "@blueprintjs/core";
import ReactPlayer from "react-player";
import ReactWaves from "@dschoon/react-waves";
import PerfectScrollbar from "react-perfect-scrollbar";

import "./App.css";

import SelectButton from "./Components/SelectButton";
import PopSlider from "./Components/PopSlider";
import Paragraph from "./Components/Paragraph";

import { formatSeconds, formatProgressToSeconds } from "./TimeHelper";

import { TRANSCRIPT_SOURCE_ONE, TRANSCRIPT_SOURCE_TWO } from "./Transcripts";

FocusStyleManager.onlyShowFocusOnTabs();
document.body.className = "bp3-dark";

const SOURCES = {
  1: {
    url:
      "https://download.ted.com/talks/GeorgeZaidan_Aphids_2019E.mp4?apikey=TEDDOWNLOAD",
    author: "George Zaidan | TED-Ed",
    title: "The bug that poops candy",
  },
  2: {
    url:
      "https://dschoon.github.io/react-waves/static/media/africa.5aa39e77.mp3",
    author: "Toto",
    title: "Africa",
  },
};

const INITIAL_STATE = {
  source: 1,
  sourceType: "VIDEO",
  channels: 1,
  url: SOURCES[1].url,
  playing: false,
  played: 0,
  playedSeconds: 0,
  durationSeconds: 0,
  playBackRate: 1,
  volume: 0.5,
  volumeLeft: 0.5,
  volumeRight: 0.5,
  seeking: false,
  waveSurfer: null,
  reactPlayer: null,
  leftGain: null,
  rightGain: null,
};

const reducer = (state, action) => {
  const loaded = state.reactPlayer && state.waveSurfer;

  switch (action.type) {
    case "SET_SOURCE":
      return {
        ...INITIAL_STATE,
        source: action.value,
        url: SOURCES[action.value].url,
      };
    case "PLAY":
      if (loaded) {
        state.reactPlayer.seekTo(state.playedSeconds, "seconds");
        return { ...state, playing: true };
      }
      return state;
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
    case "SET_PLAYED_SECONDS":
      return { ...state, playedSeconds: action.value };
    case "SET_PLAYED":
      return { ...state, played: action.value };
    case "SET_SEEKING":
      return { ...state, seeking: false, playing: true };
    case "SET_PLAY_BACK_RATE":
      return { ...state, playBackRate: action.value };
    case "SET_VOLUME":
      state.leftGain.gain.value = action.value;
      state.rightGain.gain.value = action.value;
      return { ...state, volume: action.value };
    case "SET_VOLUME_LEFT":
      state.leftGain.gain.value = action.value;
      return { ...state, volumeLeft: action.value };
    case "SET_VOLUME_RIGHT":
      state.rightGain.gain.value = action.value;
      return { ...state, volumeRight: action.value };
    case "SET_WAVESURFER":
      return {
        ...state,
        waveSurfer: action.value,
        leftGain: action.left,
        rightGain: action.right,
        channels: action.channels,
      };
    case "SET_REACTPLAYER":
      return {
        ...state,
        sourceType: action.sourceType,
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

  const { author, title } = SOURCES[state.source];
  const loading = !state.reactPlayer || !state.waveSurfer;

  const handleOnWaveformReady = ({ wavesurfer }) => {
    console.log("Loaded Wavesurfer: ", wavesurfer);

    const numberOfChannels = wavesurfer.backend.splitPeaks.length;

    const splitter = wavesurfer.backend.ac.createChannelSplitter(2);
    const merger = wavesurfer.backend.ac.createChannelMerger(2);
    const leftGain = wavesurfer.backend.ac.createGain();
    const rightGain = wavesurfer.backend.ac.createGain();

    splitter.connect(leftGain, numberOfChannels === 2 ? 0 : 1);
    splitter.connect(rightGain, 1);
    leftGain.connect(merger, 0, numberOfChannels === 2 ? 0 : 1);
    rightGain.connect(merger, 0, 1);

    wavesurfer.backend.setFilters([splitter, leftGain, merger]);

    leftGain.gain.value = state.volume;
    rightGain.gain.value = state.volume;

    dispatch({
      type: "SET_WAVESURFER",
      value: wavesurfer,
      left: leftGain,
      right: rightGain,
      channels: numberOfChannels,
    });
  };

  const handleDurationLoad = (duration) => {
    seekingRef.current = state.seeking;
    dispatch({
      type: "SET_REACTPLAYER",
      sourceType: reactPlayer.current.player.player.player.tagName,
      player: reactPlayer.current,
      duration: duration,
    });
    setTranscript(
      processTranscript(
        state.source === 1 ? TRANSCRIPT_SOURCE_ONE : TRANSCRIPT_SOURCE_TWO,
        duration
      )
    );
  };

  const handleEnded = () => {
    dispatch({ type: "PAUSE" });
  };

  const handleOnPosChange = (pos) => {
    //console.log("POS: ", pos);
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

  const handleChangeSource = () => {
    dispatch({ type: "SET_SOURCE", value: state.source + 1 > 2 ? 1 : 2 });
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
          url={state.url}
          height="300px"
          width={state.sourceType === "VIDEO" ? "200px" : "0px"}
          progressInterval={100}
          playing={state.playing}
          playbackRate={state.playBackRate}
          volume={0}
          onProgress={handleProgress}
          onDuration={handleDurationLoad}
          onEnded={handleEnded}
          className="Player"
        />
        <div className="Details-Container">
          <H6 className="Light-Font">{author}</H6>
          <H4>{title}</H4>
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
            <Button icon="reset" onClick={handleReset} disabled={loading} />
            <Button
              icon="step-backward"
              onClick={handleStepBack}
              disabled={loading}
            />
            <Button
              icon={state.playing ? "pause" : "play"}
              onClick={handlePlayPause}
              disabled={loading}
            />
            <Button
              icon="step-forward"
              onClick={handleStepForward}
              disabled={loading}
            />
            <PopSlider
              channels={state.channels}
              volumeProps={{
                volume: state.volume,
                volumeLeft: state.volumeLeft,
                volumeRight: state.volumeRight,
              }}
              dispatch={dispatch}
              disabled={loading}
            />
            <SelectButton
              playBackRate={state.playBackRate}
              dispatch={dispatch}
              disabled={loading}
            />
            <Button
              text="Source"
              onClick={handleChangeSource}
              disabled={loading}
            />
          </div>
          <div className="Wave-Container">
            {state.channels === 2 && (
              <div className="Wave-Container-Labels">
                <span>L</span>
                <span>R</span>
              </div>
            )}
            <div className="Wave-Container-Wave-And-Bar">
              <ReactWaves
                audioFile={state.url}
                onPosChange={handleOnPosChange}
                options={{
                  backend: "WebAudio",
                  audioRate: state.playBackRate,
                  splitChannels: true,
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
                zoom={1}
                playing={state.playing}
                pos={state.playedSeconds}
                onReady={handleOnWaveformReady}
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
                disabled={loading}
              />
            </div>
          </div>
        </div>
      </Card>
      <Card elevation={Elevation.TWO} className="Bottom-Container">
        {loading ? (
          <Spinner size={Spinner.SIZE_STANDARD} className="Spinner" />
        ) : (
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
        )}
      </Card>
    </div>
  );
}

export default App;
