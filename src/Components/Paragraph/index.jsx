import React from "react";
import { Tag } from "@blueprintjs/core";
import "./Style.css";

import { formatSeconds } from "../../TimeHelper";

const Paragraph = (props) => {
  const { start, end, spans, handleSeekTo, highlightIndex = 0 } = props;

  const handleSpanClick = (seconds) => () => handleSeekTo(seconds);

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
            onClick={handleSpanClick(span.start)}
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
