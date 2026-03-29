import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  type Video = {
    title : Text;
    url : Text;
    tag : Text;
    createdAt : Int;
  };

  type Actor = {
    videos : Map.Map<Nat, Video>;
    nextId : Nat;
  };

  public func run(_old : {}) : Actor {
    {
      videos = Map.empty<Nat, Video>();
      nextId = 0;
    };
  };
};
