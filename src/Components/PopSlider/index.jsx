import React from "react";
import { Button, Slider, Popover, PopoverPosition } from "@blueprintjs/core";

import "./Style.css";

const PopSlider = (props) => {
  const { volume, dispatch } = props;

  const handleChange = (value) => {
    dispatch({ type: "SET_Volume", value: value / 10 });
  };

  const volumeIcon = () => {
    switch (volume) {
      case 1:
        return "volume-up";
      case 0:
        return "volume-off";
      default:
        return "volume-down";
    }
  };

  return (
    <Popover position={PopoverPosition.BOTTOM} enforceFocus={false}>
      <Button icon={volumeIcon()} />
      <div className="Slider-Container">
        <Slider
          min={0}
          max={10}
          onChange={handleChange}
          value={volume * 10}
          labelRenderer={false}
          vertical
        />
      </div>
    </Popover>
  );
};

export default PopSlider;
