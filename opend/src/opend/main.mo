import Principal "mo:base/Principal";
import NFTActorClass "../NFT/nft";
import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import List "mo:base/List";
import Iter "mo:base/Iter";
import Bool "mo:base/Bool";

actor OpenD {
    // hashmap to store all the NFT's which maps principal with NFT canister
    // Principal - key,  NFTActorClass.NFT - value
    var mapOfNFTs = HashMap.HashMap<Principal, NFTActorClass.NFT>(1, Principal.equal, Principal.hash);

    // hashmap to store owner id's & List of thier minted nft's
    var mapOfOwners = HashMap.HashMap<Principal, List.List<Principal>>(1, Principal.equal, Principal.hash);

    // Listing type which stores id & price of listed NFT
    private type Listing = {
        itemOwner : Principal;
        itemPrice : Nat;
    };
    // hashmap to keep track of all the listings
    var mapOfListings = HashMap.HashMap<Principal, Listing>(1, Principal.equal, Principal.hash);

    public shared (msg) func mint(imgData : [Nat8], name : Text) : async Principal {

        // Principal Id of owner
        let owner : Principal = msg.caller;

        Debug.print(debug_show (Cycles.balance()));

        // Specifying 100 billion + 500 million experimental cycles
        Cycles.add(100_500_000_000);

        // Create NFT based on the parameter's entered
        let newNFT = await NFTActorClass.NFT(name, owner, imgData);

        Debug.print(debug_show (Cycles.balance()));

        // Get hold of the canister id of newly minted NFT
        let newNFTPrincipal = await newNFT.getCanisterId();

        // Add NFT in mapofNFT's
        mapOfNFTs.put(newNFTPrincipal, newNFT);

        // Trigger below function whenever a new minting happens
        // Passing in the owner id & cannister id of NFT
        addToOwnershipMap(owner, newNFTPrincipal);

        return newNFTPrincipal;

    };

    // function to add item in mapOfOwners hashmap
    private func addToOwnershipMap(owner : Principal, nftId : Principal) {
        // Return ownedNFT's of a particular owner, through owner's principal id
        var ownedNFTs : List.List<Principal> = switch (mapOfOwners.get(owner)) {
            case null List.nil<Principal>(); // return empty list id owner id not found
            case (?result) result;
        };

        // Add specified NFT(nftId) to the ownedNFT's list
        ownedNFTs := List.push(nftId, ownedNFTs);

        // Add owner & it's List of NFT's in mapOfOwners Hashmap
        mapOfOwners.put(owner, ownedNFTs);
    };

    public query func getOwnedNFTs(user : Principal) : async [Principal] {
        // Retrive list of owned NFT's by user
        var userNFTs : List.List<Principal> = switch (mapOfOwners.get(user)) {
            case null List.nil<Principal>();
            case (?result) result;
        };

        // Convert userNFT's List to array
        return List.toArray(userNFTs);

    };

    // Retrive list of all listed NFT's
    public query func getListedNFTs() : async [Principal] {
        // Convert keys in mapOfListings hashmap into an array
        let ids = Iter.toArray(mapOfListings.keys());
        return ids;
    };

    public shared (msg) func listItem(id : Principal, price : Nat) : async Text {
        // Return NFT if it exists or return NFT does not exist
        var item : NFTActorClass.NFT = switch (mapOfNFTs.get(id)) {
            case null return "NFT does not exist.";
            case (?result) result;
        };

        // get stored owner of NFT
        let owner = await item.getOwner();

        // check if the owner is same as msg.caller
        // to check if right owner is calling the func & not some one else
        if (Principal.equal(owner, msg.caller)) {
            // Add NFT is & it's price in mapOfListings Hashmap
            let newListing : Listing = {
                itemOwner = owner;
                itemPrice = price;
            };
            mapOfListings.put(id, newListing);
            return "Success";

        } else {
            return "You don't own the NFT.";
        };
    };

    // Return Principal id of OpenD cannister
    public query func getOpenDCanisterID() : async Principal {
        return Principal.fromActor(OpenD);
    };

    // Function to check if NFT was listed
    public query func isListed(id : Principal) : async Bool {
        if (mapOfListings.get(id) == null) {
            return false;
        } else {
            return true;
        };
    };

    // function to check if the listed NFT belongs to the given owner
    // if true then return the principal id of owner else return null
    public query func getOriginalOwner(id : Principal) : async Principal {
        var listing : Listing = switch (mapOfListings.get(id)) {
            case null return Principal.fromText("");
            case (?result) result;
        };

        return listing.itemOwner;
    };

    // Function which returns price of listed NFT
    // return 0 in case of null, else return the actual price
    public query func getListedNFTPrice(id : Principal) : async Nat {
        var listing : Listing = switch (mapOfListings.get(id)) {
            case null return 0;
            case (?result) result;
        };

        return listing.itemPrice;
    };

    // Function to complete the NFT purchase
    // Which will transfer the ownership from the curent owner id to the new owner id
    public shared (msg) func completePurchase(id : Principal, ownerId : Principal, newOwnerid : Principal) : async Text {
        // get NFT id from mapOfNFTs
        var purchasedNFT : NFTActorClass.NFT = switch (mapOfNFTs.get(id)) {
            case null return "NFT does not exist";
            case (?result) result;
        };

        // Transfer ownership to new owner
        let transferResult = await purchasedNFT.transferOwnership(newOwnerid);

        if (transferResult == "Success") {
            // remove NFT from listed NFT's
            mapOfListings.delete(id);

            //Get the list of NFT's that the previous owner owned
            var ownedNFTs : List.List<Principal> = switch (mapOfOwners.get(ownerId)) {
                case null List.nil<Principal>();
                case (?result) result;
            };

            // List.filter will return a new list of NFT's which does not contain the purchased NFT
            // & will update the owned NFTs list
            ownedNFTs := List.filter(
                ownedNFTs,
                func(listItemId : Principal) : Bool {
                    return listItemId != id;
                },
            );

            // Add to the Ownership map that the new Owner owns the NFT
            addToOwnershipMap(newOwnerid, id);
            return "Success";
        } else {
            return transferResult;
        };
    };

};
