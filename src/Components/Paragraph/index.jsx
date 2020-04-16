import React from "react";
import { Tag } from "@blueprintjs/core";
import "./Style.css";

import { formatSeconds } from "../../TimeHelper";

const Paragraph = (props) => {
  const { start, end, spans, highlightIndex = 0 } = props;
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
            className={highlightIndex === span.id ? "Span-Highlight" : ""}
          >{`${span.value.replace(/(\r\n|\n|\r)/gm, "")} `}</span>
        ))}
      </div>
    </div>
  );
};

export default Paragraph;
