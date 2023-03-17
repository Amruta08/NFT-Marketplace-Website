import React, { useEffect, useState } from "react";
import Item from "./Item";
import { Principal } from "@dfinity/principal";

function Gallery(props) {
  const [items, setItems] = useState();

  // Function which creates a new Item component for each Nft id
  function fetchNFTs() {
    if (props.ids != undefined) {
      setItems(
        props.ids.map((NFTId) => <Item id={NFTId} key={NFTId.toText()} role={props.role}/>)
      );
    }
  }

  // call fetchNFT's function only when component is rendered
  useEffect(() => {
    fetchNFTs();
  }, []);

  return (
    <div className="gallery-view">
      <h3 className="makeStyles-title-99 Typography-h3">{props.title}</h3>
      <div className="disGrid-root disGrid-container disGrid-spacing-xs-2">
        <div className="disGrid-root disGrid-item disGrid-grid-xs-12">
          <div className="disGrid-root disGrid-container disGrid-spacing-xs-5 disGrid-justify-content-xs-center">
            {/* <Item id="rrkah-fqaaa-aaaaa-aaaaq-cai" /> */}
            {items}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Gallery;
