import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

// Full-screen viewer for the images of the Adoption Application Details page.
//   images  the URLs of the group that was clicked (home photos, animal photos, or the one valid ID)
//   start   index of the image that was clicked
//   label   what the images are ("Home photo", "Valid ID", ...)
// Closes with X, Escape or a click on the dark backdrop. With more than one image it has previous /
// next buttons, Left / Right keys and a counter. The page behind does not scroll while it is open,
// and focus goes back to the image that was clicked.
function PhotoViewer({ images, start = 0, label = "Photo", onClose }) {
  const [index, setIndex] = useState(start);
  const [failed, setFailed] = useState(false);

  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const count = images.length;
  const many = count > 1;

  const go = (next) => {
    setFailed(false);
    setIndex(((next % count) + count) % count);
  };

  // focus the X on open, give focus back to the clicked image on close, and lock the page scroll
  useEffect(() => {
    const opener = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });

    return () => {
      document.body.style.overflow = previousOverflow;
      opener?.focus?.({ preventScroll: true });
    };
  }, []);

  // keyboard: Escape closes, Left / Right browse a group, Tab stays inside the viewer
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      } else if (many && event.key === "ArrowLeft") {
        event.preventDefault();
        go(index - 1);
      } else if (many && event.key === "ArrowRight") {
        event.preventDefault();
        go(index + 1);
      } else if (event.key === "Tab") {
        const buttons = dialogRef.current?.querySelectorAll("button");
        if (!buttons?.length) return;

        const first = buttons[0];
        const last = buttons[buttons.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  });

  return createPortal(
    <div
      className="application-details__lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`${label} viewer`}
      ref={dialogRef}
      onMouseDown={(event) => {
        // only a click on the dark backdrop closes it, never a click on the image or the buttons
        if (event.target === event.currentTarget) onClose();
      }}
    >

      <button
        type="button"
        className="application-details__lightbox-close"
        onClick={onClose}
        aria-label="Close photo viewer"
        ref={closeRef}
      >
        <X size={22} aria-hidden="true" />
      </button>

      {many && (
        <button
          type="button"
          className="application-details__lightbox-nav application-details__lightbox-nav--prev"
          onClick={() => go(index - 1)}
          aria-label="Previous photo"
        >
          <ChevronLeft size={26} aria-hidden="true" />
        </button>
      )}

      <figure className="application-details__lightbox-content">
        {failed ? (
          <div className="application-details__lightbox-missing">Photo not available</div>
        ) : (
          <img
            src={images[index]}
            alt={many ? `${label} ${index + 1} of ${count}` : label}
            onError={() => setFailed(true)}
          />
        )}

        {many && (
          <figcaption className="application-details__lightbox-counter" aria-live="polite">
            {index + 1} / {count}
          </figcaption>
        )}
      </figure>

      {many && (
        <button
          type="button"
          className="application-details__lightbox-nav application-details__lightbox-nav--next"
          onClick={() => go(index + 1)}
          aria-label="Next photo"
        >
          <ChevronRight size={26} aria-hidden="true" />
        </button>
      )}

    </div>,
    document.body
  );
}

export default PhotoViewer;
