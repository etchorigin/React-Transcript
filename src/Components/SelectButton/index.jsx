import React from "react";
import { Button, Menu } from "@blueprintjs/core";
import { Select } from "@blueprintjs/select";

import "./Style.css";

const PLAY_BACK_RATE = [0.5, 1, 1.5, 2];

const RenderPlayBackRateMenu = ({
  items,
  itemsParentRef,
  query,
  renderItem,
}) => {
  const renderedItems = items.map(renderItem);
  return (
    <Menu ulRef={itemsParentRef} className="Menu">
      {renderedItems}
    </Menu>
  );
};

const RenderPlayBackRateItem = (value, { handleClick }) => (
  <Menu.Item
    key={value}
    label={`${value}x`}
    onClick={handleClick}
    shouldDismissPopover
  />
);

const SelectButton = (props) => {
  const { playBackRate, handleSelect } = props;

  return (
    <Select
      items={PLAY_BACK_RATE}
      filterable={false}
      itemListRenderer={RenderPlayBackRateMenu}
      itemRenderer={RenderPlayBackRateItem}
      onItemSelect={handleSelect}
    >
      <Button text={`${playBackRate}x`} className="Select-Button" />
    </Select>
  );
};

export default SelectButton;
