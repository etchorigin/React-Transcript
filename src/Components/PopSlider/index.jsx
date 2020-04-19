import React from "react";
import { Button, Slider, Popover, PopoverPosition } from "@blueprintjs/core";

import "./Style.css";

const SingleChannelVolumeButton = (props) => {
  const { volume, disabled } = props;
  switch (volume) {
    case 5:
      return <Button icon="volume-up" disabled={disabled} />;
    case 0:
      return <Button icon="volume-off" disabled={disabled} />;
    default:
      return <Button icon="volume-down" disabled={disabled} />;
  }
};

const DoubleChannelVolumeButton = (props) => {
  const { volumeLeft, volumeRight, disabled } = props;

  if (volumeLeft === 5 && volumeRight === 5) {
    return <Button icon="volume-up" disabled={disabled} />;
  }

  if (volumeLeft === 0 && volumeRight === 0) {
    return <Button icon="volume-off" disabled={disabled} />;
  }

  if (volumeRight === 0) {
    return <Button text="L" disabled={disabled} />;
  }

  if (volumeLeft === 0) {
    return <Button text="R" disabled={disabled} />;
  }

  return <Button icon="volume-down" disabled={disabled} />;
};

const PopSlider = (props) => {
  const { channels, volumeProps, disabled, dispatch } = props;
  const { volume, volumeLeft, volumeRight } = volumeProps;

  const handleSingleChannelChange = (value) => {
    dispatch({ type: "SET_VOLUME", value: value });
  };

  const handleDoubleChannelsLeftChange = (value) => {
    dispatch({ type: "SET_VOLUME_LEFT", value: value });
  };

  const handleDoubleChannelsRightChange = (value) => {
    dispatch({ type: "SET_VOLUME_RIGHT", value: value });
  };

  switch (channels) {
    case 1:
      return (
        <Popover
          position={PopoverPosition.BOTTOM}
          enforceFocus={false}
          disabled={disabled}
        >
          <SingleChannelVolumeButton volume={volume} disabled={disabled} />
          <div className="Slider-Container-One">
            <Slider
              min={0}
              max={5}
              stepSize={0.1}
              onChange={handleSingleChannelChange}
              value={volume}
              labelRenderer={false}
              vertical
            />
          </div>
        </Popover>
      );
    case 2:
      return (
        <Popover position={PopoverPosition.BOTTOM} enforceFocus={false}>
          <DoubleChannelVolumeButton
            volumeLeft={volumeLeft}
            volumeRight={volumeRight}
            disabled={disabled}
          />
          <div className="Slider-Container-Two">
            <div className="Slider-Inner-Container">
              <Slider
                min={0}
                max={5}
                stepSize={0.1}
                onChange={handleDoubleChannelsLeftChange}
                value={volumeLeft}
                labelRenderer={false}
                vertical
              />
              <span className="Channel-Label">L</span>
            </div>
            <div className="Slider-Inner-Container">
              <Slider
                min={0}
                max={5}
                stepSize={0.1}
                onChange={handleDoubleChannelsRightChange}
                value={volumeRight}
                labelRenderer={false}
                vertical
              />
              <span className="Channel-Label">R</span>
            </div>
          </div>
        </Popover>
      );
    default:
      throw new Error();
  }
};

export default PopSlider;
