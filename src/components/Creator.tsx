import { useEffect, useState } from "react";
import OptimizedImage from "./OptimizedImage";

interface CreatorProfile {
  login: string;
  name: string | null;
  avatar_url: string | null;
  html_url: string;
  bio: string | null;
  followers: number;
  following: number;
  public_repos: number;
  location: string | null;
}

export default function Creator() {
  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const avatarUrl = "https://github.com/Reyansh-Niranjan.png";

  useEffect(() => {
    const controller = new AbortController();
    const loadCreator = async () => {
      try {
        const response = await fetch("https://api.github.com/users/Reyansh-Niranjan", {
          signal: controller.signal,
          headers: { Accept: "application/vnd.github+json" },
        });
        if (!response.ok) {
          throw new Error("GitHub profile request failed");
        }
        const data = (await response.json()) as CreatorProfile;
        setCreator(data);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setCreator(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadCreator();
    return () => controller.abort();
  }, []);

  return (
    <section id="creator" className="py-20 relative" style={{ background: "#0B1220" }}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "#E2E8F0" }}>
            Meet The <span className="bg-gradient-to-r from-teal-400 to-purple-500 bg-clip-text text-transparent">Creator</span>
          </h2>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: "#94A3B8" }}>
            Live data from GitHub
          </p>
        </div>

        <div className="max-w-[1000px] mx-auto">
          <div className="relative group">
            <div
              className="absolute inset-0 -z-10"
              style={{
                filter: "blur(80px)",
                opacity: 0.18,
                background:
                  "radial-gradient(circle at 0% 0%, #14B8A6 0%, transparent 55%), radial-gradient(circle at 100% 100%, #8B5CF6 0%, transparent 55%)",
              }}
            />
            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: "#101C2C",
                border: "1px solid #1F2A3D",
                boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.05)",
              }}
            >
              <div className="h-1" style={{ background: "linear-gradient(90deg, #14B8A6 0%, #8B5CF6 100%)" }} />
              <div className="p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#14B8A6] to-[#8B5CF6] opacity-20 blur-md" />
                  {isLoading ? (
                    <div className="w-28 h-28 md:w-32 md:h-32 rounded-full" style={{ background: "#1F2A3D" }} />
                  ) : (
                    <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-tr from-[#14B8A6] to-[#8B5CF6] p-1">
                      <div className="w-full h-full rounded-full overflow-hidden" style={{ background: "#0B1220" }}>
                        <OptimizedImage
                          src={creator?.avatar_url || avatarUrl}
                          alt={creator?.name || creator?.login || "Creator"}
                          className="w-full h-full rounded-full"
                          loading="lazy"
                          fetchPriority="low"
                          sizes="128px"
                          width={128}
                          height={128}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-6">
                  {isLoading ? (
                    <div>
                      <div className="h-6 w-1/2 rounded mb-3" style={{ background: "#1F2A3D" }} />
                      <div className="h-4 w-1/3 rounded" style={{ background: "#0B1220" }} />
                    </div>
                  ) : creator ? (
                    <div>
                      <div className="flex flex-col md:flex-row md:items-baseline md:gap-4">
                        <h3 className="text-3xl font-bold" style={{ color: "#E2E8F0" }}>
                          {creator.name || creator.login}
                        </h3>
                        {creator.login ? (
                          <a
                            href={creator.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold hover:underline"
                            style={{ color: "#71F8E4" }}
                          >
                            @{creator.login}
                          </a>
                        ) : null}
                      </div>
                      {creator.bio ? (
                        <p className="text-lg leading-relaxed mt-4" style={{ color: "#E2E8F0" }}>
                          {creator.bio}
                        </p>
                      ) : null}
                      {creator.location ? (
                        <div className="mt-4 flex items-center justify-center md:justify-start gap-2 text-sm" style={{ color: "#94A3B8" }}>
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-7.75 7-12a7 7 0 10-14 0c0 4.25 7 12 7 12z" />
                            <circle cx="12" cy="9" r="2.5" />
                          </svg>
                          <span>{creator.location}</span>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-sm" style={{ color: "#94A3B8" }}>
                      Creator profile unavailable right now.
                    </p>
                  )}

                  <div className="grid grid-cols-3 gap-6 border-y py-6" style={{ borderColor: "rgba(31, 42, 61, 0.6)" }}>
                    {isLoading ? (
                      [0, 1, 2].map((index) => (
                        <div key={index} className="flex flex-col items-center md:items-start gap-2">
                          <div className="h-6 w-12 rounded" style={{ background: "#1F2A3D" }} />
                          <div className="h-3 w-20 rounded" style={{ background: "#162235" }} />
                        </div>
                      ))
                    ) : creator ? (
                      <>
                        <div className="flex flex-col items-center md:items-start">
                          <span className="text-xl font-semibold" style={{ color: "#14B8A6" }}>
                            {creator.public_repos}
                          </span>
                          <span className="text-xs uppercase tracking-wider" style={{ color: "#94A3B8" }}>
                            Public Repos
                          </span>
                        </div>
                        <div className="flex flex-col items-center md:items-start">
                          <span className="text-xl font-semibold" style={{ color: "#14B8A6" }}>
                            {creator.followers}
                          </span>
                          <span className="text-xs uppercase tracking-wider" style={{ color: "#94A3B8" }}>
                            Followers
                          </span>
                        </div>
                        <div className="flex flex-col items-center md:items-start">
                          <span className="text-xl font-semibold" style={{ color: "#14B8A6" }}>
                            {creator.following}
                          </span>
                          <span className="text-xs uppercase tracking-wider" style={{ color: "#94A3B8" }}>
                            Following
                          </span>
                        </div>
                      </>
                    ) : null}
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
