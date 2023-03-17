import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import { BrowserRouter, Link, Switch, Route } from "react-router-dom";
import homeImage from "../../assets/home-img.png";
import Minter from "./Minter";
import Gallery from "./Gallery";
import { opend } from "../../../declarations/opend";
import CURRENT_USER_ID from "../index";

function Header() {
  const [userOwnedGallery, setOwnedGallery] = useState();
  const [listingGallery, setListingGallery] = useState();

  // Get NFT's of a particular user id
  // for simplicity sake we will use CURRENT_USER_ID defined in index.jsx
  // the role prop will keep track whether it's a collection or discover
  async function getNFTs() {
    const userNFTIds = await opend.getOwnedNFTs(CURRENT_USER_ID);
    console.log(userNFTIds);
    setOwnedGallery(<Gallery title="My NFT's" ids={userNFTIds} role="collection"/>);

    const listedNFTIds = await opend.getListedNFTs();
    console.log(listedNFTIds);
    setListingGallery(<Gallery title="Discover" ids={listedNFTIds} role="discover"/>);
  }

  // Call getNFT's component only once header componet is rendered
  useEffect(() => {
    getNFTs();
  }, []);

  // Wrapping our html code inside <BrowserRouter> will help us to define links in it
  // Wrapping text inside <Link> will help us to turn text into link
  // Route's can be provided in <Link> by using the to = "/route" attribute
  // Inside <Switch> we specify which component to render or html for the specified routes
  // keyword exact wil not make the router confused if it encounter's the "/"
  // forceRefresh={true} will refresh due to which our getNFT's will be called again & our NFT's will be fetched again
  // & the updated collection will be passed to the galley component
  return (
    <BrowserRouter forceRefresh={true}>
      <div className="app-root-1">
        <header className="Paper-root AppBar-root AppBar-positionStatic AppBar-colorPrimary Paper-elevation4">
          <div className="Toolbar-root Toolbar-regular header-appBar-13 Toolbar-gutters">
            <div className="header-left-4"></div>
            <img className="header-logo-11" src={logo} />
            <div className="header-vertical-9"></div>
            <Link to="/">
              <h5 className="Typography-root header-logo-text">OpenD</h5>
            </Link>
            <div className="header-empty-6"></div>
            <div className="header-space-8"></div>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/discover">Discover</Link>
            </button>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/minter">Minter</Link>
            </button>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/collection">My NFTs</Link>
            </button>
          </div>
        </header>
      </div>
      <Switch>
        <Route exact path="/">
          <img className="bottom-space" src={homeImage} />
        </Route>
        <Route path="/discover">
          {/* <h1>Discover</h1> */}
          {listingGallery}
        </Route>
        <Route path="/minter">
          <Minter />
        </Route>
        <Route path="/collection">
          {/* <Gallery title="My NFT's" /> */}
          {userOwnedGallery}
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default Header;
