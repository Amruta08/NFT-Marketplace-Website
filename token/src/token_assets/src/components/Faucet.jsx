import React, { useState } from "react";
import { Token } from "../../../declarations/token";
import {
  token,
  canisterId,
  createActor,
} from "../../../declarations/token/index";
import { AuthClient } from "@dfinity/auth-client";

function Faucet() {
  // hook for managing state of button
  const [isDisabled, setDisable] = useState(false);

  //hook for managing state of text in button
  const [buttonText, setText] = useState("Gimme gimme");

  // Call the payout success function, when the gimme button is clicked
  // declared in main.mo
  async function handleClick(event) {
    setDisable(true);

    // // Create new auth client object
    // const authClient = await AuthClient.create();

    // // Get Identity of user
    // const identity = await authClient.getIdentity();

    // // Create actor
    // const authenticatedCanister = createActor(canisterId, {
    //   agentOptions: {
    //     identity,
    //   },
    // });

    const result = await token.payOut()

    // // call payout method on autheticated cannister
    // const result = await authenticatedCanister.payOut();
    setText(result);
  }

  return (
    <div className="blue window">
      <h2>
        <span role="img" aria-label="tap emoji">
          🚰
        </span>
        Faucet
      </h2>
      <label>
        Get your free Vortex here! Claim 10,000 VO coins to your account.
      </label>
      <p className="trade-buttons">
        <button id="btn-payout" onClick={handleClick} disabled={isDisabled}>
          {buttonText}
        </button>
      </p>
    </div>
  );
}

export default Faucet;
