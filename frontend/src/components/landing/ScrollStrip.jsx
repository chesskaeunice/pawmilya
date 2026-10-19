import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

import "./ScrollStrip.css";

const AUTO_MS = 4500;
const RESUME_MS = 3500;
// after a pause ends, the next card comes quickly instead of after a full AUTO_MS
const FIRST_STEP_AFTER_RESUME_MS = 1000;
const EDGE = 2;

const reducedQuery = "(prefers-reduced-motion: reduce)";

// True only for keyboard focus. A mouse click also focuses a button, but that
// must not count as "still interacting" (clicks have their own short pause).
function isKeyboardFocus(element) {
  try {
    return element.matches(":focus-visible");
  } catch {
    return true;
  }
}

// Index of the card closest to the left edge of the strip.
function getCurrentIndex(track) {
  let best = 0;
  let bestDistance = Infinity;

  Array.from(track.children).forEach((item, index) => {
    const distance = Math.abs(item.offsetLeft - track.scrollLeft);
    if (distance < bestDistance) {
      best = index;
      bestDistance = distance;
    }
  });

  return best;
}

// Horizontal scroll-snap strip shared by the pet, report and article previews.
// Native scrolling always works; auto-scroll only runs while the user is idle.
function ScrollStrip({
  label,
  children,
  autoScroll = false,
  showDots = false,
  className = "",
}) {
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const frameRef = useRef(0);
  const resumeTimerRef = useRef(0);
  const hoverRef = useRef(false);
  const focusRef = useRef(false);
  const resumeSoonRef = useRef(false);

  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia(reducedQuery).matches
  );
  const [userPaused, setUserPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [tabVisible, setTabVisible] = useState(() => !document.hidden);
  const [inView, setInView] = useState(false);

  const behavior = reducedMotion ? "auto" : "smooth";

  /* ---------- position tracking ---------- */

  const updatePosition = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const max = track.scrollWidth - track.clientWidth;
    const start = track.scrollLeft <= EDGE;
    const end = track.scrollLeft >= max - EDGE;

    setAtStart(start);
    setAtEnd(end);
    setActiveIndex(end ? track.children.length - 1 : getCurrentIndex(track));
  }, []);

  const handleScroll = () => {
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(updatePosition);
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    const observer = new ResizeObserver(updatePosition);
    observer.observe(track);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameRef.current);
    };
  }, [updatePosition]);

  /* ---------- scrolling helpers ---------- */

  const scrollToIndex = useCallback(
    (index) => {
      const track = trackRef.current;
      const item = track?.children[index];
      if (item) track.scrollTo({ left: item.offsetLeft, behavior });
    },
    [behavior]
  );

  const advance = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const max = track.scrollWidth - track.clientWidth;

    if (track.scrollLeft >= max - EDGE) {
      track.scrollTo({ left: 0, behavior }); // loop back to the first card
      return;
    }

    scrollToIndex(
      Math.min(getCurrentIndex(track) + 1, track.children.length - 1)
    );
  }, [behavior, scrollToIndex]);

  const goPrevious = () => {
    const track = trackRef.current;
    const index = getCurrentIndex(track);
    const offset = track.scrollLeft - track.children[index].offsetLeft;
    scrollToIndex(offset > 4 ? index : Math.max(index - 1, 0));
  };

  const goNext = () => {
    const track = trackRef.current;
    scrollToIndex(
      Math.min(getCurrentIndex(track) + 1, track.children.length - 1)
    );
  };

  /* ---------- pause on interaction, resume after a short idle time ---------- */

  const hold = () => {
    clearTimeout(resumeTimerRef.current);
    setInteracting(true);
  };

  const release = () => {
    clearTimeout(resumeTimerRef.current);
    if (hoverRef.current || focusRef.current) return;

    resumeTimerRef.current = setTimeout(() => {
      resumeSoonRef.current = true;
      setInteracting(false);
    }, RESUME_MS);
  };

  const touch = () => {
    hold();
    release();
  };

  useEffect(() => () => clearTimeout(resumeTimerRef.current), []);

  /* ---------- environment: reduced motion, hidden tab, off-screen ---------- */

  useEffect(() => {
    const query = window.matchMedia(reducedQuery);
    const onChange = (event) => setReducedMotion(event.matches);

    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const onVisibility = () => setTabVisible(!document.hidden);

    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.4 }
    );
    observer.observe(root);

    return () => observer.disconnect();
  }, []);

  /* ---------- auto-scroll: one card every few seconds ---------- */

  const running =
    autoScroll &&
    !reducedMotion &&
    !userPaused &&
    !interacting &&
    tabVisible &&
    inView;

  useEffect(() => {
    if (!running) return undefined;

    let interval = 0;
    const firstDelay = resumeSoonRef.current
      ? FIRST_STEP_AFTER_RESUME_MS
      : AUTO_MS;
    resumeSoonRef.current = false;

    const first = setTimeout(() => {
      advance();
      interval = setInterval(advance, AUTO_MS);
    }, firstDelay);

    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [running, advance]);

  /* ---------- render ---------- */

  const items = Array.isArray(children) ? children : [children];
  const canPause = autoScroll && !reducedMotion;

  return (
    <div
      className={`strip ${className}`}
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onPointerEnter={() => {
        hoverRef.current = true;
        hold();
      }}
      onPointerLeave={() => {
        hoverRef.current = false;
        release();
      }}
      onFocus={(event) => {
        // only keyboard focus keeps the strip paused
        if (!isKeyboardFocus(event.target)) return;
        focusRef.current = true;
        hold();
      }}
      onBlur={(event) => {
        if (!focusRef.current) return;
        if (rootRef.current?.contains(event.relatedTarget)) return;
        focusRef.current = false;
        release();
      }}
      onTouchStart={hold}
      onTouchEnd={release}
      onPointerDown={touch}
      onWheel={touch}
      onClick={touch}
      onKeyDown={touch}
    >
      <div className="strip__viewport">

        <button
          type="button"
          className="strip__arrow strip__arrow--prev"
          onClick={goPrevious}
          disabled={atStart}
          aria-label={`Previous ${label}`}
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>

        <ul className="strip__track" ref={trackRef} onScroll={handleScroll}>
          {items.map((item, index) => (
            <li className="strip__item" key={item.key ?? index}>
              {item}
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="strip__arrow strip__arrow--next"
          onClick={goNext}
          disabled={atEnd}
          aria-label={`Next ${label}`}
        >
          <ChevronRight size={22} aria-hidden="true" />
        </button>

      </div>

      {(showDots || canPause) && (
        <div className="strip__footer">

          {showDots ? (
            <div className="strip__dots">
              {items.map((item, index) => (
                <button
                  type="button"
                  key={item.key ?? index}
                  className={
                    index === activeIndex
                      ? "strip__dot strip__dot--active"
                      : "strip__dot"
                  }
                  onClick={() => scrollToIndex(index)}
                  aria-label={`Go to item ${index + 1}`}
                  aria-current={index === activeIndex ? "true" : undefined}
                />
              ))}
            </div>
          ) : (
            <span />
          )}

          {canPause && (
            <button
              type="button"
              className="strip__pause"
              onClick={() => {
                if (userPaused) resumeSoonRef.current = true;
                setUserPaused(!userPaused);
              }}
              aria-label={
                userPaused ? "Resume auto-scroll" : "Pause auto-scroll"
              }
            >
              {userPaused ? (
                <Play size={14} aria-hidden="true" />
              ) : (
                <Pause size={14} aria-hidden="true" />
              )}
              {userPaused ? "Play" : "Pause"}
            </button>
          )}

        </div>
      )}
    </div>
  );
}

export default ScrollStrip;
