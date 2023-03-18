import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";

actor Token {

    Debug.print("hello");

    // Assigning Principal id to owner
    // : Principal -> Principal data type to owner variable
    // Principal.fromText() -> Converting text to principal id

    var owner : Principal = Principal.fromText("<YOUR-PRINCIPAL-ID>");

    // Supply of our token in 1 billion
    var totalSupply : Nat = 1000000000;

    // Symbol of  our token
    var symbol : Text = "VO";

    // stable array which will contain the entries of the hashmap
    // Since the hashmap can't be made stable
    private stable var balanceEntries : [(Principal, Nat)] = [];

    // Balances will be stored in a Hashmap
    // key - Principal, value - Nat
    // initial size of hashmap - 1
    // Principal.equal - Will check equality of keys
    // Principal.hash - Will hash the Principal's id's
    // Private will make the hashmap available only within the actor
    private var balances = HashMap.HashMap<Principal, Nat>(1, Principal.equal, Principal.hash);

    // Put will insert value v at key k - put(k, v)
    //balances.put(owner, totalSupply);
    
    // if the hashtable contains no entries, then assign total supply to owner
        if (balances.size() < 1) {
            balances.put(owner, totalSupply);
        };

    // Unfortunately hashmap is not stable, so we need to
    // make use of system pre & post upgrade methods
    system func preupgrade() {
        // Iter.toArray() -> Turns an iterator into an array
        // hashmap.entries -> Turns the hashmap into an iterable
        balanceEntries := Iter.toArray(balances.entries());
    };

    system func postupgrade() {
        //array.vals() -> Turns the array items into an iterable
        // initial size of hashmap - 1
        // Principal.equal - Will check equality of keys
        // Principal.hash - Will hash the Principal's id's
        balances := HashMap.fromIter<Principal, Nat>(balanceEntries.vals(), 1, Principal.equal, Principal.hash);

        // if the hashtable contains no entries, then assign total supply to owner
        if (balances.size() < 1) {
            balances.put(owner, totalSupply);
        };
    };

    // Query function to find out who owns how much tokens
    public query func balanceOf(who : Principal) : async Nat {

        // If balance of a particular id is 0 then return 0
        // else return the result of balance
        let balance : Nat = switch (balances.get(who)) {
            case null 0;
            case (?result) result;
        };

        return balance;
    };

    // function which returns symbol
    public query func getSymbol() : async Text {
        return symbol;
    };

    // Shared(msg) -> Shared functions allow functions defined inside an actor by another actor
    // msg.caller -> will show id of caller
    public shared (msg) func payOut() : async Text {
        Debug.print(debug_show (msg.caller));

        // checking if the the caller account exists in hashmap
        if (balances.get(msg.caller) == null) {
            let amount = 10000;
            // using balances.put function to transfer tokens to the caller
            //balances.put(msg.caller, amount);

            // transfer amt from canister to user
            let result = await transfer(msg.caller, amount);
            return result;
        } else {
            return "Already Claimed";
        };
    };

    // Transfer of token from one account to another
    // 1) fromAccount - Amount
    // 2) toAccount + Amount

    // Public shared function to transfer particular amount to given id
    public shared (msg) func transfer(to : Principal, amount : Nat) : async Text {
        //fromBalance -> balance of amount transferer
        let fromBalance = await balanceOf(msg.caller);

        // check is amount transferer has enough balance
        if (fromBalance > amount) {
            // Subtract amount from amount transferer's balance
            let newFromBalance : Nat = fromBalance - amount;

            // Update amt transferer's balance
            balances.put(msg.caller, newFromBalance);

            //toBalance -> balance of id where amt to be trasfered
            let toBalance = await balanceOf(to);

            // Transfer amt to account
            let newToBalance = toBalance + amount;

            // Update amt reciver's balance
            balances.put(to, newToBalance);

            return "Success";
        } else {
            return "Insufficient Funds";
        };

    };

};
