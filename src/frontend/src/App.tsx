import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useActor } from "@/hooks/useActor";
import { Loader2, PlayCircle, Plus, Trash2, VideoIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface VideoItem {
  tag: string;
  url: string;
  title: string;
  createdAt: bigint;
}

function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      return u.searchParams.get("v");
    }
    if (u.hostname === "youtu.be") {
      return u.pathname.slice(1).split("?")[0];
    }
  } catch {
    // not a valid URL
  }
  return null;
}

function getThumbnail(url: string): string | null {
  const id = extractVideoId(url);
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

const TAG_COLORS = [
  "bg-primary/20 text-primary border-primary/30",
  "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "bg-violet-500/20 text-violet-400 border-violet-500/30",
  "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "bg-pink-500/20 text-pink-400 border-pink-500/30",
  "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
];

function tagColor(tag: string, allTags: string[]): string {
  const idx = allTags.indexOf(tag);
  return TAG_COLORS[idx % TAG_COLORS.length];
}

export default function App() {
  const { actor, isFetching: actorLoading } = useActor();

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string>("All");

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [tag, setTag] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingIdx, setDeletingIdx] = useState<number | null>(null);

  const fetchVideos = useCallback(async () => {
    if (!actor) return;
    try {
      const result = await actor.getVideos();
      setVideos(result);
    } catch {
      toast.error("Failed to load videos");
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    if (actor && !actorLoading) {
      fetchVideos();
    }
  }, [actor, actorLoading, fetchVideos]);

  const allTags = Array.from(new Set(videos.map((v) => v.tag).filter(Boolean)));

  const filtered =
    activeTag === "All" ? videos : videos.filter((v) => v.tag === activeTag);

  const handleAdd = async () => {
    if (!title.trim() || !url.trim()) {
      toast.error("Title and URL are required");
      return;
    }
    if (!actor) {
      toast.error("Not connected");
      return;
    }
    setAdding(true);
    try {
      await actor.addVideo(title.trim(), url.trim(), tag.trim());
      setTitle("");
      setUrl("");
      setTag("");
      await fetchVideos();
      toast.success("Video saved!");
    } catch {
      toast.error("Failed to save video");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (idx: number) => {
    if (!actor) return;
    setDeletingIdx(idx);
    try {
      await actor.deleteVideo(BigInt(idx));
      await fetchVideos();
      toast.success("Video removed");
    } catch {
      toast.error("Failed to delete video");
    } finally {
      setDeletingIdx(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
  };

  const isLoading = loading || actorLoading;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster theme="dark" richColors />

      {/* Header */}
      <header className="border-b border-border sticky top-0 z-10 bg-background/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/20 border border-primary/30">
            <PlayCircle className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-display text-xl font-bold text-foreground tracking-tight">
            VidVault
          </h1>
          <span className="text-muted-foreground text-sm ml-1">
            — your video library
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 space-y-8">
        {/* Add Video Form */}
        <section
          className="bg-card border border-border rounded-xl p-6 shadow-card"
          data-ocid="video.panel"
        >
          <h2 className="font-display text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" />
            Add a Video
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto] gap-3 items-end">
            <div className="space-y-1.5">
              <label
                htmlFor="vid-title"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                Title
              </label>
              <Input
                id="vid-title"
                data-ocid="video.input"
                placeholder="e.g. React in 100 Seconds"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="vid-url"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                YouTube URL
              </label>
              <Input
                id="vid-url"
                data-ocid="video.search_input"
                placeholder="https://youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="vid-tag"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                Tag
              </label>
              <Input
                id="vid-tag"
                data-ocid="video.tag_input"
                placeholder="e.g. react"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary w-32"
              />
            </div>
            <Button
              data-ocid="video.primary_button"
              onClick={handleAdd}
              disabled={adding || !actor}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-glow transition-shadow self-end"
            >
              {adding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {adding ? "Saving..." : "Add"}
            </Button>
          </div>
        </section>

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <section className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mr-1">
              Filter:
            </span>
            {["All", ...allTags].map((t) => (
              <button
                key={t}
                type="button"
                data-ocid="video.tab"
                onClick={() => setActiveTag(t)}
                className={[
                  "px-3 py-1 rounded-full text-sm font-medium border transition-all",
                  t === activeTag
                    ? "bg-primary text-primary-foreground border-primary shadow-glow"
                    : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground",
                ].join(" ")}
              >
                {t}
              </button>
            ))}
          </section>
        )}

        {/* Video Grid */}
        {isLoading ? (
          <div
            data-ocid="video.loading_state"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                <Skeleton className="w-full aspect-video bg-muted" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4 bg-muted" />
                  <Skeleton className="h-3 w-1/4 bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            data-ocid="video.empty_state"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-4">
              <VideoIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-foreground font-semibold text-lg mb-1">
              {activeTag === "All"
                ? "No videos saved yet"
                : `No videos tagged "${activeTag}"`}
            </p>
            <p className="text-muted-foreground text-sm">
              {activeTag === "All"
                ? "Paste a YouTube link above to get started."
                : "Try a different tag filter."}
            </p>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            data-ocid="video.list"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((video, i) => {
                const globalIdx = videos.indexOf(video);
                const thumb = getThumbnail(video.url);
                const color = tagColor(video.tag, allTags);
                return (
                  <motion.article
                    key={`${video.title}-${video.createdAt}`}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    data-ocid={`video.item.${i + 1}`}
                    className="group bg-card border border-border rounded-xl overflow-hidden shadow-card hover:border-primary/40 transition-colors"
                  >
                    {/* Thumbnail */}
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block relative aspect-video bg-muted overflow-hidden"
                    >
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={video.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <PlayCircle className="w-10 h-10 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <PlayCircle className="w-12 h-12 text-white opacity-0 group-hover:opacity-90 transition-opacity drop-shadow-lg" />
                      </div>
                    </a>

                    {/* Info */}
                    <div className="p-4 flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1.5">
                        <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2">
                          {video.title}
                        </h3>
                        {video.tag && (
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${color}`}
                          >
                            {video.tag}
                          </span>
                        )}
                      </div>
                      <Button
                        data-ocid={`video.delete_button.${i + 1}`}
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(globalIdx)}
                        disabled={deletingIdx === globalIdx}
                        className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors -mr-1"
                        aria-label="Delete video"
                      >
                        {deletingIdx === globalIdx ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-5 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
