import React, { useState } from "react";
import { Token } from "../../../declarations/token";
import { token } from "../../../declarations/token/index";
import {Principal} from "@dfinity/principal";

function Transfer() {

  // hooks for saving id and balance entered in input box
  const [recipientId, setId] = useState("")
  const[amount, setAmount] = useState("")

  //hook for managing state of button
  const[isDisabled, setDisabled] = useState(false);

  const[feedback, setFeedback] = useState("");
  const[isHidden, setHidden] = useState(true);
  
  async function handleClick() {
    setDisabled(true);
    const recipient = Principal.fromText(recipientId);
    const amountToTransfer = Number(amount);
    // call transfer function when button clicked
    const result = await token.transfer(recipient, amountToTransfer);
    setFeedback(result);
    setHidden(false);
    setDisabled(false);
  }

  return (
    <div className="window white">
      <div className="transfer">
        <fieldset>
          <legend>To Account:</legend>
          <ul>
            <li>
              <input
                type="text"
                id="transfer-to-id"
                value={recipientId}
                onChange={(e) => setId(e.target.value)}
              />
            </li>
          </ul>
        </fieldset>
        <fieldset>
          <legend>Amount:</legend>
          <ul>
            <li>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </li>
          </ul>
        </fieldset>
        <p className="trade-buttons">
          <button 
          id="btn-transfer" 
          onClick={handleClick}
          disabled={isDisabled}
          >
            Transfer
          </button>
        </p>
        <p hidden={isHidden}>
          {feedback}
        </p>
      </div>
    </div>
  );
}

export default Transfer;
