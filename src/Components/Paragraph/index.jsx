import React from "react";
import { Tag } from "@blueprintjs/core";
import "./Style.css";

import { formatSeconds } from "../../TimeHelper";

const Paragraph = (props) => {
  const { dispatch, start, end, spans, highlightIndex = 0 } = props;

  const handleSeekTo = (seconds) => () => {
    dispatch({ type: "SEEK_TO", value: seconds });
  };

  const getSpanClass = (spanId) => {
    if (highlightIndex === 0) {
      return "Span-Text";
    } else if (highlightIndex === -1) {
      return "Span-Text-Fade";
    } else if (highlightIndex === spanId) {
      return "Span-Highlight";
    } else if (highlightIndex > spanId) {
      return "Span-Text-Fade";
    } else {
      return "Span-Text";
    }
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
            className={getSpanClass(span.id)}
          >{`${span.value.replace(/(\r\n|\n|\r)/gm, "")} `}</span>
        ))}
      </div>
    </div>
  );
};

export default Paragraph;
