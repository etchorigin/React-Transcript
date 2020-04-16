import React from "react";
import { Tag } from "@blueprintjs/core";
import "./Style.css";

import { formatSeconds } from "../../TimeHelper";

const Paragraph = (props) => {
  const { dispatch, start, end, spans, highlightIndex = 0 } = props;

  const handleSeekTo = (seconds) => () => {
    dispatch({ type: "SEEK_TO", value: seconds });
  };

  return (
    <div className="Paragraph-Container">
      <div className="Paragraph-Time">
        <span>{formatSeconds(start)}</span>
        <span>{formatSeconds(end)}</span>
        <Tag icon="person" className="Speaker-Tag" round>
          Narrator
        </Tag>
      </div>
      <div className="Paragraph-Content">
        {spans.map((span) => (
          <span
            key={span.id}
            onClick={handleSeekTo(span.start)}
            className={
              highlightIndex === span.id ? "Span-Highlight" : "Span-Text"
            }
          >{`${span.value.replace(/(\r\n|\n|\r)/gm, "")} `}</span>
        ))}
      </div>
    </div>
  );
};

export default Paragraph;
