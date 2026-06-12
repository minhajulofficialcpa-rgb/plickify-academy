"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Play, Pause, Maximize, Minimize } from "lucide-react";

interface VideoPlayerProps {
  lessonId: string;
  videoId: string;
  provider: string;
  userName: string;
  userEmail: string;
  userId: string;
  phoneLast4?: string;
  initialPosition?: number;
  courseTitle: string;
  lessonTitle: string;
}

export function VideoPlayer({
  lessonId,
  videoId,
  provider,
  userName,
  userEmail,
  userId,
  phoneLast4,
  initialPosition = 0,
  courseTitle,
  lessonTitle,
}: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialPosition);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();

  // Watermark position animation
  const [watermarkPos, setWatermarkPos] = useState({ x: 20, y: 20 });
  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setWatermarkPos({
        x: Math.random() * 60 + 10,
        y: Math.random() * 60 + 10,
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [playing]);

  // Watch analytics tracking every 10 seconds
  useEffect(() => {
    if (!playing) return;

    progressIntervalRef.current = setInterval(async () => {
      const newTime = currentTime + 10;
      const newProgress = duration > 0 ? Math.min((newTime / duration) * 100, 100) : 0;

      // Upsert watch analytics
      await supabase.from("watch_analytics").upsert(
        {
          user_id: userId,
          lesson_id: lessonId,
          watched_seconds: Math.round(newTime),
          progress_percent: Math.round(newProgress),
          last_position_seconds: Math.round(newTime),
          completed: newProgress >= 90,
          last_watched_at: new Date().toISOString(),
        },
        { onConflict: "user_id, lesson_id" },
      );
    }, 10000);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [playing, currentTime, duration, lessonId, userId, supabase]);

  // Save position on unmount
  useEffect(() => {
    return () => {
      if (currentTime > 0) {
        supabase.from("watch_analytics").upsert(
          {
            user_id: userId,
            lesson_id: lessonId,
            last_position_seconds: Math.round(currentTime),
            watched_seconds: Math.round(currentTime),
            last_watched_at: new Date().toISOString(),
          },
          { onConflict: "user_id, lesson_id" },
        );
      }
    };
  }, [currentTime, lessonId, userId, supabase]);

  // UI restriction: right-click block
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const preventContextMenu = (e: MouseEvent) => e.preventDefault();
    const preventCopy = (e: ClipboardEvent) => e.preventDefault();

    container.addEventListener("contextmenu", preventContextMenu);
    container.addEventListener("copy", preventCopy);

    return () => {
      container.removeEventListener("contextmenu", preventContextMenu);
      container.removeEventListener("copy", preventCopy);
    };
  }, []);

  // Keyboard shortcut block
  useEffect(() => {
    const blockKeys = (e: KeyboardEvent) => {
      // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J")) ||
        (e.ctrlKey && e.key === "u")
      ) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", blockKeys);
    return () => window.removeEventListener("keydown", blockKeys);
  }, []);

  const togglePlay = useCallback(() => {
    setPlaying((p) => !p);
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({
          event: "command",
          func: playing ? "pauseVideo" : "playVideo",
          args: [],
        }),
        "*",
      );
    }
  }, [playing]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const youtubeUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=0&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&cc_load_policy=0&fs=0&origin=${typeof window !== "undefined" ? window.location.origin : ""}`;

  // Handle iframe messages for player state
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.event === "onStateChange") {
          if (data.info === 1) setPlaying(true); // Playing
          if (data.info === 2) setPlaying(false); // Paused
        }
        if (data.event === "onReady") {
          // Get duration
          if (iframeRef.current) {
            iframeRef.current.contentWindow?.postMessage(
              JSON.stringify({ event: "command", func: "getDuration", args: [""] }),
              "*",
            );
          }
        }
      } catch {}
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-xl overflow-hidden group"
      onMouseEnter={() => setShowOverlay(true)}
      onMouseLeave={() => setShowOverlay(false)}
    >
      {/* Video iframe */}
      <div className="aspect-video relative">
        <iframe
          ref={iframeRef}
          src={youtubeUrl}
          className="absolute inset-0 w-full h-full pointer-events-none"
          allow="autoplay; encrypted-media"
          allowFullScreen={false}
          title={lessonTitle}
        />

        {/* Custom play/pause overlay (transparent, intercepts clicks) */}
        <div
          className="absolute inset-0 z-10 cursor-pointer"
          onClick={togglePlay}
        />

        {/* Watermark */}
        <div
          className="absolute z-20 pointer-events-none transition-all duration-1000 ease-in-out"
          style={{
            left: `${watermarkPos.x}%`,
            top: `${watermarkPos.y}%`,
            transform: "translate(-50%, -50%)",
            opacity: 0.5 + (watermarkPos.x / 100) * 0.3,
          }}
        >
          <div className="bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap border border-white/10">
            <p className="font-semibold">{userName}</p>
            <p className="text-[10px] opacity-70">
              {userEmail} {phoneLast4 ? `• ${phoneLast4}` : ""}
            </p>
            <p className="text-[10px] opacity-50">{userId.slice(0, 8)}</p>
          </div>
        </div>

        {/* Center play button when paused */}
        {!playing && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="h-16 w-16 rounded-full bg-primary/80 backdrop-blur-sm flex items-center justify-center">
              <Play className="h-8 w-8 text-white ml-1" />
            </div>
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showOverlay || !playing ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Progress bar */}
        <div className="mb-3">
          <div className="h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="text-white hover:text-primary transition-colors"
            >
              {playing ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </button>
            <span className="text-xs text-white/70">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-primary transition-colors"
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
