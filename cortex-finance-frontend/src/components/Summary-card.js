// src/components/SummaryCard.js

import React from "react";

function SummaryCard(props) {

  return (

    <div className="summary-card">

      <h3>
        {props.title}
      </h3>

      <p>
        {props.amount}
      </p>

    </div>
  );
}

export default SummaryCard;