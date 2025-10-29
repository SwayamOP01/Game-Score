"use client";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const GAMES = [
  // Mobile Games
  "BGMI",
  "PUBG Mobile",
  "PUBG KR",
  "Game for Peace",
  "Call of Duty Mobile",
  "Free Fire",
  "Apex Legends Mobile",
  // PC Games
  "Counter-Strike 2",
  "Valorant",
  "Overwatch 2",
  "Fortnite (PC)",
  "Apex Legends (PC)",
  "Call of Duty: Warzone",
  // Console Games
  "Halo Infinite",
  "Call of Duty: Modern Warfare",
  "Fortnite (Console)",
  "Apex Legends (Console)",
  // Controller Games
  "Rainbow Six Siege",
  "Destiny 2",
  "Battlefield 2042",
];

const REGIONS: Record<string, string[]> = {
  // Mobile Games
  "BGMI": ["India"],
  "PUBG Mobile": ["Global", "EU", "NA", "SA", "APAC"],
  "PUBG KR": ["Korea", "Japan"],
  "Game for Peace": ["China"],
  "Call of Duty Mobile": ["Global"],
  "Free Fire": ["Global", "India"],
  "Apex Legends Mobile": ["Global"],
  // PC Games
  "Counter-Strike 2": ["Global", "EU", "NA", "Asia", "CIS"],
  "Valorant": ["Global", "NA", "EU", "APAC", "LATAM", "BR"],
  "Overwatch 2": ["Global", "Americas", "Europe", "Asia"],
  "Fortnite (PC)": ["Global", "NA-East", "NA-West", "Europe", "Asia", "Brazil", "Oceania"],
  "Apex Legends (PC)": ["Global", "NA", "EU", "Asia"],
  "Call of Duty: Warzone": ["Global", "Americas", "Europe", "Asia"],
  // Console Games
  "Halo Infinite": ["Global", "Xbox", "PC"],
  "Call of Duty: Modern Warfare": ["Global", "PlayStation", "Xbox"],
  "Fortnite (Console)": ["PlayStation", "Xbox", "Switch"],
  "Apex Legends (Console)": ["PlayStation", "Xbox", "Switch"],
  // Controller Games
  "Rainbow Six Siege": ["Global", "PC", "PlayStation", "Xbox"],
  "Destiny 2": ["Global", "PC", "PlayStation", "Xbox"],
  "Battlefield 2042": ["Global", "PC", "PlayStation", "Xbox"],
};

export default function UploadPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [query, setQuery] = useState("");
  const [game, setGame] = useState<string>("");
  const [region, setRegion] = useState<string>("");
  const [loading, setLoading] = useState(false);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setError(null);
    setFile(f);
    if (!f) {
      setVideoUrl(null);
      return;
    }
    const isMp4 = f.type === "video/mp4";
    const isMov = f.type === "video/quicktime";
    if (!isMp4 && !isMov) {
      setError("Unsupported file type. Upload mp4 or mov.");
      setFile(null);
      setVideoUrl(null);
      return;
    }
    const url = URL.createObjectURL(f);
    setVideoUrl(url);
  }

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onLoaded = () => {
      const dur = v.duration;
      if (isFinite(dur)) {
        if (dur < 60 || dur > 300) {
          setError("Clip must be between 1 and 5 minutes.");
          setFile(null);
          setVideoUrl(null);
        }
      }
    };
    v.addEventListener("loadedmetadata", onLoaded);
    return () => v.removeEventListener("loadedmetadata", onLoaded);
  }, [videoUrl]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-violet-500">Upload Gameplay Clip</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-4 space-y-3">
          <label className="text-sm font-medium text-zinc-300">Game title</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search games"
            className="w-full input"
          />
          <div className="max-h-60 overflow-auto border border-white/10 rounded">
            {/* Group games by category */}
            {Object.entries(GAMES.filter((g) => g.toLowerCase().includes(query.toLowerCase())).reduce((acc, g) => {
              // Determine category based on game name or comments in the array
              let category = "Mobile Games";
              if (g.includes("(PC)") || g === "Counter-Strike 2" || g === "Valorant" || g === "Overwatch 2" || g === "Call of Duty: Warzone") {
                category = "PC Games";
              } else if (g.includes("(Console)") || g === "Halo Infinite" || g === "Call of Duty: Modern Warfare") {
                category = "Console Games";
              } else if (g === "Rainbow Six Siege" || g === "Destiny 2" || g === "Battlefield 2042") {
                category = "Controller Games";
              }
              
              if (!acc[category]) {
                acc[category] = [];
              }
              acc[category].push(g);
              return acc;
            }, {} as Record<string, string[]>))
            .map(([category, games]) => (
              <div key={category}>
                <div className="bg-black/40 px-3 py-1 sticky top-0 font-medium text-cyan-300 text-sm">
                  {category}
                </div>
                {games.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      setGame(g);
                      setRegion("");
                    }}
                    className={`block w-full text-left px-3 py-2 hover:bg-white/10 ${game === g ? "bg-white/10" : ""}`}
                  >
                    <span className="text-zinc-200">{g}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4 space-y-3">
          <label className="text-sm font-medium text-zinc-300">Region / Version</label>
          <div className="grid grid-cols-2 gap-2">
            {(REGIONS[game] || []).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRegion(r)}
                className={`px-3 py-2 rounded border border-white/10 ${region === r ? "bg-gradient-to-r from-cyan-600 to-violet-600 text-white" : "text-zinc-200"}`}
              >
                {r}
              </button>
            ))}
          </div>
          {!game && <p className="text-xs text-zinc-400">Select a game to see regions.</p>}
        </div>
      </div>

      <div className="text-sm text-zinc-300">Selected: {game || "—"} {region ? `• ${region}` : ""}</div>
      <input className="input" type="file" accept="video/mp4,video/quicktime" onChange={onFileChange} />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {videoUrl && (
        <div className="space-y-2">
          <p className="text-sm text-zinc-400">Preview</p>
          <div className="card p-2">
            <video ref={videoRef} src={videoUrl} controls className="w-full max-h-[360px] rounded" />
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <button
          disabled={!file || !!error || !game || !region || !session?.user?.email || loading}
          className="btn-primary disabled:opacity-50"
          onClick={async () => {
            if (!file || !session?.user?.email || loading) return;
            setError(null);
            setLoading(true);
            try {
              const fd = new FormData();
              fd.append("file", file);
              fd.append("game", game);
              fd.append("region", region);

              const resUser = await fetch(`/api/user/by-email?email=${encodeURIComponent(session.user.email)}`);
              if (!resUser.ok) {
                const err = await resUser.json().catch(() => ({}));
                setError(err.error || "Account not found. Please sign up on the Auth page.");
                return;
              }
              const userData = await resUser.json();
              if (!userData?.id) {
                setError("Could not resolve user ID. Try signing out/in and retry.");
                return;
              }
              fd.append("userId", userData.id);

              const res = await fetch("/api/upload", { method: "POST", body: fd });
              const data = await res.json().catch(() => ({}));
              if (!res.ok) {
                if (res.status === 402) {
                  setError((data.error || "Quota exceeded.") + " Upgrade your plan to continue.");
                } else {
                  setError(data.error || "Upload failed. Check your clip and try again.");
                }
                return;
              }
              router.push(`/analysis/${data.id}`);
            } catch {
              setError("Unexpected error occurred. Check network and try again.");
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? "Analyzing…" : "Analyze Now"}
        </button>
        <button disabled={!file} className="btn-secondary disabled:opacity-50" onClick={() => {
          setFile(null);
          setVideoUrl(null);
          setError(null);
        }}>
          Reset
        </button>
      </div>
      <p className="text-sm text-zinc-400">Supported: mp4/mov • Duration: 1–5 minutes</p>
      {error?.toLowerCase().includes("quota") && (
        <div className="mt-2">
          <a href="/subscribe" className="btn-primary">Subscribe</a>
        </div>
      )}
    </div>
  );
}