import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Nat8 "mo:base/Nat8";

// Contract for nft cannister
// actor classes will help create cannisters programmatically
// Each nft will have it's unique principal id

// NFT(data) -> data used to initialize the actor class
// name -> name of NFT item
// owner -> name of NFT owner
// content -> 8 bit Nat array which will store the image bytes or data
actor class NFT(name : Text, owner : Principal, content : [Nat8]) = this {

    private let itemName = name;
    private var nftOwner = owner;
    private let imageBytes = content;

    public query func getName() : async Text {
        return itemName;
    };

    public query func getOwner() : async Principal {
        return nftOwner;
    };

    public query func getAsset() : async [Nat8] {
        return imageBytes;
    };

    // Get hold of the canister ID of a newly minted NFT
    public query func getCanisterId() : async Principal {
        return Principal.fromActor(this);
    };

    public shared (msg) func transferOwnership(newOwner : Principal) : async Text {
        if (msg.caller == nftOwner) {
            nftOwner := newOwner;
            return "Success";
        } else {
            return "Error: Not initiated by NFT Owner";
        };
    };

};
