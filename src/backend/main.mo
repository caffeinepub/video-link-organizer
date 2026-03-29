import Int "mo:core/Int";
import Map "mo:core/Map";
import Migration "migration";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";

(with migration = Migration.run)
actor {
  public type Video = {
    title : Text;
    url : Text;
    tag : Text;
    createdAt : Int;
  };

  var nextId = 0;

  let videos = Map.empty<Nat, Video>();

  func getVideoInternal(id : Nat) : Video {
    switch (videos.get(id)) {
      case (null) { Runtime.trap("Video entry with id " # id.toText() # " does not exist.") };
      case (?video) { video };
    };
  };

  public shared ({ caller }) func addVideo(title : Text, url : Text, tag : Text) : async Video {
    let video : Video = {
      title;
      url;
      tag;
      createdAt = Time.now();
    };
    videos.add(nextId, video);
    nextId += 1;
    video;
  };

  public shared ({ caller }) func deleteVideo(id : Nat) : async () {
    ignore getVideoInternal(id);
    videos.remove(id);
  };

  public query ({ caller }) func getVideos() : async [Video] {
    videos.values().toArray();
  };
};
