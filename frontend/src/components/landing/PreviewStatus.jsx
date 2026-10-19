// Status pill. Reuses the existing status colors from the Missing Pets page
// (missing-pets__status--*). Swap for <StatusBadge> once that file is ready.
function PreviewStatus({ status }) {
  const slug = status.toLowerCase().replaceAll(" ", "-");

  return (
    <span className={`missing-pets__status missing-pets__status--${slug}`}>
      {status}
    </span>
  );
}

export default PreviewStatus;
