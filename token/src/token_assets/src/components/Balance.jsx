import React, {useState} from "react";
import {Principal} from "@dfinity/principal";
import {token} from "../../../declarations/token"

function Balance() {

  // hook to save value entered in input box
  const [inputValue, setInput] = useState("");

  // hook to save balance value
  const [balanceResult, setBalance] = useState("");

  // hook to save token symbol
  const [symbol, setSymbol] = useState("");

  const [isHidden, setHidden] = useState(true);
  
  async function handleClick() {
    console.log(inputValue);
    // Convert input into principal data type
    const principal = Principal.fromText(inputValue);

    // symbol of token
    setSymbol(await token.getSymbol());

    // Pass value into balanceOf function
    const balance = await token.balanceOf(principal);
    setBalance(balance.toLocaleString());

    setHidden(false)
  }


  return (
    <div className="window white">
      <label>Check account token balance:</label>
      <p>
        <input
          id="balance-principal-id"
          type="text"
          placeholder="Enter a Principal ID"
          value={inputValue}
          onChange={(e)=> setInput(e.target.value)}
        />
      </p>
      <p className="trade-buttons">
        <button
          id="btn-request-balance"
          onClick={handleClick}
        >
          Check Balance
        </button>
      </p>
      {/* Display the balance */}
      <p hidden={isHidden}>This account has a balance of {balanceResult} {symbol}.</p>
    </div>
  );
}

export default Balance;
