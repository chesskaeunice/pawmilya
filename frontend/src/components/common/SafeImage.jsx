import { useState } from "react";

import { petPlaceholders } from "../../assets/images/placeholders/index.js";

// Generic picture for photos that are missing or cannot be loaded
const NO_PHOTO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">' +
      '<rect width="400" height="300" fill="#f1ebe0"/>' +
      '<g fill="none" stroke="#b8ab97" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">' +
      '<rect x="140" y="95" width="120" height="90" rx="12"/>' +
      '<circle cx="200" cy="140" r="22"/><path d="M172 95l8-14h40l8 14"/></g>' +
      '<text x="200" y="236" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#8a7d6b">Photo not available</text>' +
      "</svg>"
  );

// <img> for uploaded photos. If the file is missing or fails to load, it shows a
// placeholder instead of the browser's broken-image icon: `fallback` (a URL) if given,
// else the placeholder of the animal `type` (Dog / Cat / Other), else "Photo not available".
// Everything else (className, style, loading, ...) goes straight to the <img>.
function SafeImage({ src, alt = "", fallback, type, onError, ...rest }) {
  const [failedSrc, setFailedSrc] = useState(null);

  const backup =
    fallback ?? (type ? petPlaceholders[type] || petPlaceholders.Other : NO_PHOTO);

  // `failedSrc` remembers which file failed, so a new `src` is tried again
  const showBackup = !src || failedSrc === src;

  return (
    <img
      {...rest}
      src={showBackup ? backup : src}
      alt={alt}
      onError={(event) => {
        if (!showBackup) setFailedSrc(src);
        onError?.(event);
      }}
    />
  );
}

export default SafeImage;
