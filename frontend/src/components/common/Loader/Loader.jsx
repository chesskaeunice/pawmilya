import "./Loader.css";

// One paw print (viewBox points the toes up).
function Paw() {
  return (
    <svg
      className="loader__paw"
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      <ellipse cx="13" cy="28" rx="6" ry="8" transform="rotate(-22 13 28)" />
      <ellipse cx="25" cy="14" rx="6.5" ry="9" transform="rotate(-8 25 14)" />
      <ellipse cx="39" cy="14" rx="6.5" ry="9" transform="rotate(8 39 14)" />
      <ellipse cx="51" cy="28" rx="6" ry="8" transform="rotate(22 51 28)" />
      <path d="M32 31c-11 0-19 11-17 19 1.6 7 10 5.5 17 5.5s15.4 1.5 17-5.5c2-8-6-19-17-19z" />
    </svg>
  );
}

/**
 * Paw-print loading indicator.
 *
 * <Loader fullScreen />            full-page loading screen (walking paws)
 * <Loader />                       small inline loader, uses the text color
 * <Loader size={14} label="Saving" />   e.g. inside a button
 */
function Loader({ fullScreen = false, size, label = "Loading" }) {
  const pawSize = size ?? (fullScreen ? 44 : 16);
  const style = { "--paw-size": `${pawSize}px` };

  if (fullScreen) {
    return (
      <div
        className="loader loader--screen"
        role="status"
        aria-live="polite"
        style={style}
      >
        <div className="loader__trail" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((step) => (
            <span
              key={step}
              className="loader__step"
              style={{ "--i": step }}
            >
              <Paw />
            </span>
          ))}
        </div>

        <p className="loader__label">{label}</p>
      </div>
    );
  }

  return (
    <span
      className="loader loader--inline"
      role="status"
      aria-live="polite"
      style={style}
    >
      <span className="loader__dots" aria-hidden="true">
        {[0, 1, 2].map((step) => (
          <span
            key={step}
            className="loader__dot"
            style={{ "--i": step }}
          >
            <Paw />
          </span>
        ))}
      </span>

      <span className="loader__sr">{label}</span>
    </span>
  );
}

export default Loader;
