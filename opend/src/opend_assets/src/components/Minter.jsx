import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { opend } from "../../../declarations/opend";
import { Principal } from "@dfinity/principal";
import Item from "./Item";

function Minter() {
  // We will use react hook form for working out with forms
  // register -> obj can be used to add inputs that the user creates
  // handleSubmit -> function that's going to be called when form submitted
  const { register, handleSubmit } = useForm();

  const [nftPrincipal, setNFTPrincipal] = useState("");

  const [loaderHidden, setLoaderHidden] = useState(true);

  async function onSubmit(data) {

    setLoaderHidden(false);

    // Accessing name & image properties entered in form
    const name = data.name;
    const image = data.image[0];

    // Converting image to image byte data
    const imageArray = await image.arrayBuffer();
    const imageByteData = [...new Uint8Array(imageArray)];

    const newNFTID = await opend.mint(imageByteData, name);
    console.log(newNFTID.toText());
    setNFTPrincipal(newNFTID);
    setLoaderHidden(true);
  }

  if (nftPrincipal == "") {
    return (
      <div className="minter-container">
        <div  hidden={loaderHidden} className="lds-ellipsis">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
        <h3 className="makeStyles-title-99 Typography-h3 form-Typography-gutterBottom">
          Create NFT
        </h3>
        <h6 className="form-Typography-root makeStyles-subhead-102 form-Typography-subtitle1 form-Typography-gutterBottom">
          Upload Image
        </h6>
        <form className="makeStyles-form-109" noValidate="" autoComplete="off">
          <div className="upload-container">
            {/* register -> register an input element
              register("firstName") -->	{firstName: 'value'} */}
            <input
              {...register("image", { required: true })}
              className="upload"
              type="file"
              accept="image/x-png,image/jpeg,image/gif,image/svg+xml,image/webp"
            />
          </div>
          <h6 className="form-Typography-root makeStyles-subhead-102 form-Typography-subtitle1 form-Typography-gutterBottom">
            Collection Name
          </h6>
          <div className="form-FormControl-root form-TextField-root form-FormControl-marginNormal form-FormControl-fullWidth">
            <div className="form-InputBase-root form-OutlinedInput-root form-InputBase-fullWidth form-InputBase-formControl">
              <input
                {...register("name", { required: true })}
                placeholder="e.g. CryptoDunks"
                type="text"
                className="form-InputBase-input form-OutlinedInput-input"
              />
              <fieldset className="PrivateNotchedOutline-root-60 form-OutlinedInput-notchedOutline"></fieldset>
            </div>
          </div>
          <div className="form-ButtonBase-root form-Chip-root makeStyles-chipBlue-108 form-Chip-clickable">
            {/* handleSubmit -> receive form data, if form validation is successful
            handleSubmit(onSubmit) -> onSubmit will access the data to validate it further */}
            <span onClick={handleSubmit(onSubmit)} className="form-Chip-label">
              Mint NFT
            </span>
          </div>
        </form>
      </div>
    );
  } else {
    return (
      <div className="minter-container">
        <h3 className="Typography-root makeStyles-title-99 Typography-h3 form-Typography-gutterBottom">
          Minted!
        </h3>
        <div className="horizontal-center">
          <Item id={nftPrincipal.toText()} />
        </div>
      </div>
    );
  }
}

export default Minter;
