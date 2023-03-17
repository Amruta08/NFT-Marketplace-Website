import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft";
import { idlFactory as tokenIdlFactory } from "../../../declarations/token";
import { Principal } from "@dfinity/principal";
import Button from "./Button";
import { opend } from "../../../declarations/opend";
import CURRENT_USER_ID from "../index";
import PriceLabel from "./PriceLabel";

function Item(props) {
  // hooks for managing name, id  & image of NFT
  const [name, setName] = useState("");
  const [OwnerId, setOwnerId] = useState("");
  const [image, setImage] = useState();

  const [button, setButton] = useState();
  const [priceInput, setPriceInput] = useState();

  // hook for loader
  const [loaderHidden, setLoaderHidden] = useState(true);

  const [blur, setBlur] = useState();

  const [sellStatus, setSellStatus] = useState("");

  const [priceLabel, setPriceLabel] = useState();

  const [shouldDisplay, setDisplay] = useState(true);

  // cannister id
  const id = props.id;
  // localhost url
  const localHost = "http://localhost:8080/";

  //httpAgent -> Run http request to get hold of cannister
  const agent = new HttpAgent({ host: localHost });

  // informs we are working locally & simply just fetch the route key
  // When deploying online, remove the following line
  agent.fetchRootKey();

  let NFTActor;

  async function loadNFT() {
    // Get hold of NFT cannister through agent
    NFTActor = await Actor.createActor(idlFactory, {
      agent,
      canisterId: id,
    });

    const Ownername = await NFTActor.getName();
    setName(Ownername);

    const owner = await NFTActor.getOwner();
    // Converting principal data type to text
    setOwnerId(owner.toText());

    const imageData = await NFTActor.getAsset();
    // Converitng Nat8 array into Uint8 array so that JS can read it
    const imageContent = new Uint8Array(imageData);
    // Converting image content into an image URL
    // createObjectURL() accepts an blob data type
    // Syntax for creating blob data type :- new Blob(array, options)
    // .buffer will convert imageContent to array buffer
    // array buffer represents generic raw binary data buffer
    const image = URL.createObjectURL(
      new Blob([imageContent.buffer], { type: "image/png" })
    );
    setImage(image);

    // Render item based on which collection is belongs to either discover or collection page
    if (props.role == "collection") {
      //check if NFT is listed through isListed defined in main.mo
      const nftIsListed = await opend.isListed(props.id);

      if (nftIsListed) {
        // blur NFT & set owner id as OpenD
        setOwnerId("OpenD");
        setBlur({ filter: "blur(4px)" });
        setSellStatus("Listed");
      } else {
        // Add button
        setButton(<Button handleClick={handleSell} text={"Sell"} />);
      }
    } else if (props.role == "discover") {
      const originalOwner = await opend.getOriginalOwner(props.id);

      // if original owner is not current owner then only show the buy button
      if (originalOwner.toText() != CURRENT_USER_ID.toText()) {
        setButton(<Button handleClick={handleBuy} text={"Buy"} />);
      }

      // get price of NFT
      const price = await opend.getListedNFTPrice(props.id);

      // Add price label component
      setPriceLabel(<PriceLabel sellPrice={price.toString()} />);
    }

    // Add button
    // Trigger handleSell function when sell button clicked
    //setButton(<Button handleClick={handleSell} text={"Sell"} />);
  }

  // Saves input typed in price imput
  let price;

  function handleSell() {
    // add price input when sell button clicked
    setPriceInput(
      <input
        placeholder="Price in Vortex"
        type="number"
        className="price-input"
        value={price}
        onChange={(e) => (price = e.target.value)}
      />
    );

    // Change text of button from sell to confirm & trigger sellItem function
    setButton(<Button handleClick={sellItem} text={"Confirm"} />);
  }

  async function sellItem() {
    // blur NFT
    setBlur({ filter: "blur(4px" });
    setLoaderHidden(false);
    console.log(props);
    console.log("confirm clicked");

    // List NFT using listItem function defined in main.mo
    const listingResult = await opend.listItem(props.id, Number(price));

    console.log(`listing: ${listingResult}`);

    if (listingResult == "Success") {
      // Transfer NFT to openD cannister
      const openDId = await opend.getOpenDCanisterID();
      const transferResult = await NFTActor.transferOwnership(openDId);
      console.log(`transfer ${transferResult}`);

      if (transferResult == "Success") {
        setLoaderHidden(true);
        setButton();
        setPriceInput();
        setOwnerId("OpenD");
        setSellStatus("Listed");
      }
    }
  }
  // call loadNFT function only when the NFT component get's rendered
  // [] function will be only called 1st time when componet get's rendered
  useEffect(() => {
    loadNFT();
  }, []);

  async function handleBuy() {
    console.log("Buy was triggered");
    setLoaderHidden(false);
    // create token actor
    const tokenActor = await Actor.createActor(tokenIdlFactory, {
      agent,
      canisterId: Principal.fromText("qaa6y-5yaaa-aaaaa-aaafa-cai"),
    });

    // get hold of owner id
    const sellerId = await opend.getOriginalOwner(props.id);

    // get hold of NFT price
    const itemPrice = await opend.getListedNFTPrice(props.id);

    // Transfer price amt to owner
    const result = await tokenActor.transfer(sellerId, itemPrice);
    console.log(result);

    if (result == "Success") {
      // Complete & the purchase & transfer the ownership to new owner
      const transferResult = await opend.completePurchase(
        props.id,
        sellerId,
        CURRENT_USER_ID
      );
      console.log("purchase: " + transferResult);
      setLoaderHidden(true);
      setDisplay(false);
    }

    await tokenActor;
  }

  return (
    <div
      style={{ display: shouldDisplay ? "inline" : "none" }}
      className="disGrid-item"
    >
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
          style={blur}
        />

        {/* loader element */}
        <div className="lds-ellipsis" hidden={loaderHidden}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>

        <div className="disCardContent-root">
          {priceLabel}
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}
            <span className="purple-text"> {sellStatus}</span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {OwnerId}
          </p>
          {priceInput}
          {button}
        </div>
      </div>
    </div>
  );
}

export default Item;
