import { useState } from "react";
import { CircleAlert } from "lucide-react";

import "./FieldError.css";

// The one look for form errors across the site.
//
// FieldError: the message right under a field. With no message it takes no space; a message expands
// smoothly (see FieldError.css) and collapses again when it is fixed. Give it an `id` and point the
// input's aria-describedby at it, and set aria-invalid on the input (it gets the red border).
export default function FieldError({ id, message }) {
  // keep the last message on screen while the line collapses
  const [lastMessage, setLastMessage] = useState(message);
  if (message && message !== lastMessage) setLastMessage(message);

  const open = Boolean(message);

  return (
    <div className={open ? "field-error is-open" : "field-error"}>
      <p id={id} className="field-error__text" aria-live="polite">
        {/* hidden while collapsed, so aria-describedby never reads an old message */}
        <span className="field-error__content" aria-hidden={!open}>
          <CircleAlert size={14} aria-hidden="true" />
          <span>{message || lastMessage}</span>
        </span>
      </p>
    </div>
  );
}

// FormError: a message about the whole form (wrong password, too many attempts, server down)
export function FormError({ message }) {
  if (!message) return null;

  return (
    <p className="form-error" role="alert">
      <CircleAlert size={16} aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}
