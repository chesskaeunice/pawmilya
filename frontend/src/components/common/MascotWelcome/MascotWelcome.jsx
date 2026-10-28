import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Volume2, X } from "lucide-react";

import mascotClosed from "../../../assets/images/mascot/pawmilya-mascot.png";
import mascotMid from "../../../assets/images/mascot/pawmilya-mascot-mid.png";
import mascotOpen from "../../../assets/images/mascot/pawmilya-mascot-open.png";
import voiceSrc from "../../../assets/audio/barky-intro.mp3";
import { playVoice, woof } from "./barkyVoice.js";
import "./MascotWelcome.css";

// Remembers that the visitor closed the message in this browser tab.
const CLOSED_KEY = "pawmilya-welcome-closed";

// The bubble tucks itself away after this long; the puppy brings it back.
const AUTO_HIDE_MS = 12000;

// What Barky says. The title is typed first, then the message.
const TITLE = "Hi there, I'm Barky!";
const BODY =
  " Welcome to PAWmilya! Every pet deserves a loving home. Come meet the animals who are waiting for you.";
const FULL = TITLE + BODY;
const TYPE_MS = 55;

const FRAMES = { closed: mascotClosed, mid: mascotMid, open: mascotOpen };

// Vowels open the mouth wide, consonants open it halfway, pauses close it.
function mouthFor(char) {
  if (!char || /[\s.,!?']/.test(char)) return "closed";
  return /[aeiouy]/i.test(char) ? "open" : "mid";
}

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

function wasClosed() {
  try {
    return sessionStorage.getItem(CLOSED_KEY) === "true";
  } catch {
    return false;
  }
}

function remember(closed) {
  try {
    sessionStorage.setItem(CLOSED_KEY, closed ? "true" : "false");
  } catch {
    // storage can be blocked; the message will simply show again next time
  }
}

/**
 * Mascot in the bottom-right corner with a speech bubble that welcomes
 * the visitor. Click the puppy to hide or show the bubble again.
 *
 * It waits for the intro video to finish (see MascotWelcome.css).
 */
function MascotWelcome() {
  const [bubbleOpen, setBubbleOpen] = useState(() => !wasClosed());
  const [reopened, setReopened] = useState(false);
  const [typed, setTyped] = useState(0);
  const [barking, setBarking] = useState(false);
  const [flap, setFlap] = useState(null);
  const hideTimer = useRef(null);
  const typeTimer = useRef(null);
  const flapTimer = useRef(null);
  const stopVoice = useRef(null);

  // Dragging: after the first drag the mascot sits at { right, bottom } pixels from the viewport edges
  const asideRef = useRef(null);
  const drag = useRef(null);
  const dragged = useRef(false);
  const [pos, setPos] = useState(null);

  // keeps the whole mascot (puppy and bubble) inside the visible area
  function clampToViewport(right, bottom) {
    const rect = asideRef.current.getBoundingClientRect();
    const { clientWidth, clientHeight } = document.documentElement;

    return {
      right: Math.min(Math.max(0, right), Math.max(0, clientWidth - rect.width)),
      bottom: Math.min(Math.max(0, bottom), Math.max(0, clientHeight - rect.height)),
    };
  }

  function startDrag(event) {
    if (event.button > 0) return;

    const rect = asideRef.current.getBoundingClientRect();
    const { clientWidth, clientHeight } = document.documentElement;

    drag.current = {
      x: event.clientX,
      y: event.clientY,
      right: clientWidth - rect.right,
      bottom: clientHeight - rect.bottom,
    };
    dragged.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event) {
    const start = drag.current;
    if (!start) return;

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;

    // a small wobble while clicking is not a drag
    if (!dragged.current && Math.hypot(dx, dy) < 5) return;

    dragged.current = true;
    setPos(clampToViewport(start.right - dx, start.bottom - dy));
  }

  function endDrag() {
    drag.current = null;
  }

  // a drag ends with a click event: it must not open or close the bubble
  function handlePupClick() {
    if (dragged.current) {
      dragged.current = false;
      return;
    }
    toggleBubble();
  }

  // window resized or bubble opened: move it only if part of it is off screen
  useEffect(() => {
    if (!pos) return undefined;

    const keepVisible = () => setPos((current) => current && clampToViewport(current.right, current.bottom));

    keepVisible();
    window.addEventListener("resize", keepVisible);

    return () => window.removeEventListener("resize", keepVisible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos === null, bubbleOpen]);

  useEffect(() => {
    return () => {
      clearTimeout(hideTimer.current);
      clearInterval(typeTimer.current);
      clearInterval(flapTimer.current);
      stopVoice.current?.();
    };
  }, []);

  const talking = typed > 0 && typed < FULL.length;
  const mouth = barking
    ? "open"
    : flap
      ? flap
      : talking
        ? mouthFor(FULL[typed - 1])
      : "closed";

  // Two happy barks, with his mouth open for each one.
  function woofWoof() {
    [0, 300].forEach((delay) => {
      setTimeout(() => {
        woof();
        setBarking(true);
        setTimeout(() => setBarking(false), 180);
      }, delay);
    });
  }

  // Types the message while Barky's mouth moves. With voice, he talks in his
  // recorded voice and the text follows along. Browsers only allow sound after a
  // click, so the voice is opt-in; the first greeting is silent.
  function startTalking(withVoice) {
    clearInterval(typeTimer.current);
    clearInterval(flapTimer.current);
    cancelAutoHide();
    stopVoice.current?.();

    if (prefersReducedMotion()) {
      setTyped(FULL.length);
      startAutoHide();
      return;
    }

    let count = 0;
    let synced = false;
    let speaking = false;
    let finished = false;

    function finish() {
      if (finished) return;
      finished = true;

      clearInterval(typeTimer.current);
      clearInterval(flapTimer.current);
      setFlap(null);
      setTyped(FULL.length);

      if (withVoice) woofWoof();
      startAutoHide();
    }

    setTyped(0);

    // typing on its own clock, until his spoken words take over
    typeTimer.current = setInterval(() => {
      if (synced) return;

      count += 1;
      setTyped(count);

      if (count >= FULL.length && !(withVoice && speaking)) finish();
    }, TYPE_MS);

    if (!withVoice) return;

    // Barky's recorded voice: the mouth follows the loudness of the sound
    // and the text follows how far along the recording is.
    speaking = true;

    stopVoice.current = playVoice(voiceSrc, {
      onFrame: (level, progress) => {
        synced = true;
        setTyped(Math.min(FULL.length, Math.round(progress * FULL.length)));
        setFlap(level > 0.1 ? "open" : level > 0.035 ? "mid" : "closed");
      },
      onEnd: finish,
    });
  }

  function cancelAutoHide() {
    clearTimeout(hideTimer.current);
  }

  // The bubble hides itself a while after Barky finishes talking.
  function startAutoHide() {
    cancelAutoHide();

    hideTimer.current = setTimeout(() => {
      setBubbleOpen(false);
    }, AUTO_HIDE_MS);
  }

  function closeBubble() {
    cancelAutoHide();
    clearInterval(typeTimer.current);
    clearInterval(flapTimer.current);
    setFlap(null);
    stopVoice.current?.();
    setBubbleOpen(false);
    remember(true);
  }

  function toggleBubble() {
    if (bubbleOpen) {
      closeBubble();
      return;
    }

    setReopened(true);
    setTyped(0);
    setBubbleOpen(true);
    remember(false);
  }

  return (
    <aside
      ref={asideRef}
      className="mascot-welcome"
      style={pos ? { right: pos.right, bottom: pos.bottom } : undefined}
      aria-label="Welcome message from the PAWmilya mascot"
    >
      {bubbleOpen && (
        <div
          className={`mascot-welcome__bubble${
            reopened ? " mascot-welcome__bubble--reopened" : ""
          }`}
          onAnimationEnd={() => startTalking(false)}
          onMouseEnter={cancelAutoHide}
          onFocus={cancelAutoHide}
        >
          <button
            type="button"
            className="mascot-welcome__close"
            onClick={closeBubble}
            aria-label="Close welcome message"
          >
            <X size={16} aria-hidden="true" />
          </button>

          <div className="mascot-welcome__speech" aria-label={FULL}>
            {/* invisible full text keeps the bubble from growing while typing */}
            <div className="mascot-welcome__ghost" aria-hidden="true">
              <p className="mascot-welcome__title">{TITLE}</p>
              <p className="mascot-welcome__text">{BODY.trim()}</p>
            </div>

            <div className="mascot-welcome__typed" aria-hidden="true">
              <p className="mascot-welcome__title">{FULL.slice(0, Math.min(typed, TITLE.length))}</p>
              <p className="mascot-welcome__text">{FULL.slice(TITLE.length + 1, typed)}</p>
            </div>
          </div>

          <div className="mascot-welcome__actions">
          <Link to="/adoptable-pets" className="mascot-welcome__cta">
            Meet the pets
          </Link>

            <button
              type="button"
              className="mascot-welcome__voice"
              onClick={() => startTalking(true)}
            >
              <Volume2 size={16} aria-hidden="true" />
              Hear Barky
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        className="mascot-welcome__pup"
        onClick={handlePupClick}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        aria-expanded={bubbleOpen}
        aria-label={
          bubbleOpen ? "Hide welcome message" : "Show welcome message"
        }
      >
        <span className="mascot-welcome__sprite" data-mouth={mouth}>
          {Object.entries(FRAMES).map(([name, src]) => (
            <img key={name} src={src} alt="" data-frame={name} draggable={false} />
          ))}
        </span>
      </button>
    </aside>
  );
}

export default MascotWelcome;
