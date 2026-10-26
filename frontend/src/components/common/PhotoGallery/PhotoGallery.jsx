import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

import SafeImage from "../SafeImage.jsx";

import "./PhotoGallery.css";

const AUTO_MS = 4000;
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

// True only for keyboard focus (a mouse click also focuses a button, but that must not pause the slideshow)
function isKeyboardFocus(element) {
  try {
    return element.matches(":focus-visible");
  } catch {
    return true;
  }
}

// View-only photo gallery shared by the citizen and staff animal pages:
// one big photo, a row of square thumbnails with arrows, a slideshow that changes
// the photo every 4 seconds, and swipe / keyboard support.
//   photos       array of image URLs (main photo first)
//   alt          text used in the image alt and the aria labels (the pet's name)
//   type         animal type (Dog / Cat / Other): picks the placeholder for a missing file
//   emptyContent shown instead of a placeholder picture when there are no photos
//   className    extra class for the page to size / round the gallery (see --gallery-radius)
// Give it a `key` (the animal id) so it starts again from the first photo for another animal.
function PhotoGallery({ photos = [], alt = "", type, emptyContent, className = "" }) {
  const count = photos.length;
  const photosKey = photos.join("|");

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const [reduced, setReduced] = useState(
    () => window.matchMedia?.(REDUCED_QUERY).matches ?? false
  );
  // bumped by every click so the 4-second timer starts again from that moment
  const [restart, setRestart] = useState(0);

  const scrollerRef = useRef(null);
  const thumbRefs = useRef([]);
  const touchStartX = useRef(null);

  const current = Math.min(index, Math.max(count - 1, 0));
  const slideshowOn = count > 1 && playing && !hovered && !focused && !tabHidden && !reduced;

  const goTo = (next) => {
    setIndex(((next % count) + count) % count); // wraps around
    setRestart((value) => value + 1);
  };

  // reduced motion and hidden browser tab
  useEffect(() => {
    const query = window.matchMedia?.(REDUCED_QUERY);
    const onChange = (event) => setReduced(event.matches);
    const onVisibility = () => setTabHidden(document.visibilityState === "hidden");

    query?.addEventListener?.("change", onChange);
    document.addEventListener("visibilitychange", onVisibility);
    onVisibility();

    return () => {
      query?.removeEventListener?.("change", onChange);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // the slideshow: one timeout per photo, so any change of photo restarts the 4 seconds
  useEffect(() => {
    if (!slideshowOn) return undefined;

    const timer = setTimeout(() => {
      setIndex((value) => (value + 1) % count);
    }, AUTO_MS);

    return () => clearTimeout(timer);
  }, [slideshowOn, current, restart, count, photosKey]);

  // keep the active thumbnail in view (scrolls the thumbnail row only, never the page)
  useEffect(() => {
    const scroller = scrollerRef.current;
    const thumb = thumbRefs.current[current];
    if (!scroller || !thumb) return;

    scroller.scrollTo({
      left: thumb.offsetLeft - (scroller.clientWidth - thumb.clientWidth) / 2,
      behavior: reduced ? "auto" : "smooth",
    });
  }, [current, reduced]);

  if (count === 0) {
    return (
      <div className={`photo-gallery ${className}`}>
        <div className="photo-gallery__stage photo-gallery__stage--empty">
          {emptyContent ?? <SafeImage type={type} alt={alt} className="photo-gallery__photo is-active" />}
        </div>
      </div>
    );
  }

  const handleKeyDown = (event) => {
    if (count < 2) return;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(current - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(current + 1);
    }
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return;

    const distance = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(distance) > 40) goTo(current + (distance < 0 ? 1 : -1));
  };

  return (
    <div
      className={`photo-gallery ${className}`}
      role="group"
      aria-roledescription="carousel"
      aria-label={`Photos of ${alt}`}
      tabIndex={count > 1 ? 0 : undefined}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={(event) => {
        if (isKeyboardFocus(event.target)) setFocused(true);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >

      {/* BIG PHOTO: all photos are stacked and cross-faded, so the next one is already loaded */}
      <div
        className="photo-gallery__stage"
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0].clientX;
        }}
        onTouchEnd={handleTouchEnd}
        aria-live={slideshowOn ? "off" : "polite"}
      >
        {photos.map((photo, position) => (
          <SafeImage
            key={photo}
            type={type}
            src={photo}
            alt={position === current ? `Photo ${position + 1} of ${count}: ${alt}` : ""}
            aria-hidden={position === current ? undefined : "true"}
            className={
              position === current
                ? "photo-gallery__photo is-active"
                : "photo-gallery__photo"
            }
            loading={position === current || position === (current + 1) % count ? "eager" : "lazy"}
          />
        ))}

        {count > 1 && !reduced && (
          <button
            type="button"
            className="photo-gallery__round photo-gallery__pause"
            onClick={() => setPlaying((value) => !value)}
            aria-label={playing ? "Pause slideshow" : "Play slideshow"}
          >
            {playing ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
          </button>
        )}
      </div>


      {/* THUMBNAILS */}
      {count > 1 && (
        <div className="photo-gallery__strip">

          <div className="photo-gallery__thumbs" ref={scrollerRef}>
            {photos.map((photo, position) => (
              <button
                type="button"
                key={photo}
                ref={(element) => {
                  thumbRefs.current[position] = element;
                }}
                className={
                  position === current
                    ? "photo-gallery__thumb photo-gallery__thumb--active"
                    : "photo-gallery__thumb"
                }
                onClick={() => goTo(position)}
                aria-label={`Show photo ${position + 1} of ${count}`}
                aria-current={position === current ? "true" : undefined}
              >
                <SafeImage type={type} src={photo} alt="" loading="lazy" />
              </button>
            ))}
          </div>

          <button
            type="button"
            className="photo-gallery__round photo-gallery__arrow photo-gallery__arrow--prev"
            onClick={() => goTo(current - 1)}
            aria-label="Previous photo"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>

          <button
            type="button"
            className="photo-gallery__round photo-gallery__arrow photo-gallery__arrow--next"
            onClick={() => goTo(current + 1)}
            aria-label="Next photo"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>

        </div>
      )}

    </div>
  );
}

export default PhotoGallery;
