import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

import "./ImageDropzone.css";

const MAX_FILES = 3;
const MAX_SIZE_MB = 5;

// Drag-and-drop (or click) image picker with thumbnail previews.
// `items` is a list of { id, file, url } owned by the parent form.
//
// Two modes:
//  - default: one drop area, up to `maxFiles` photos shown as small thumbnails
//  - single slot (maxFiles={1}): a labeled slot (for example "Photo 1") that
//    shows a large preview with an X to remove it; a new photo replaces the old
function ImageDropzone({ items, onChange, error, maxFiles = MAX_FILES, label }) {
  const inputRef = useRef(null);
  const itemsRef = useRef(items);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState("");

  const single = maxFiles === 1;

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // free the preview URLs when the form closes
  useEffect(
    () => () => {
      itemsRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    },
    []
  );

  const toItem = (file) => ({
    id: `${file.name}-${file.size}-${file.lastModified}`,
    file,
    url: URL.createObjectURL(file),
  });

  const checkFile = (file) => {
    if (!file.type.startsWith("image/")) {
      return `"${file.name}" is not an image. Please choose a photo (JPG, PNG or WEBP).`;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `"${file.name}" is larger than ${MAX_SIZE_MB} MB. Please choose a smaller photo.`;
    }
    return "";
  };

  const addSingle = (fileList) => {
    const files = Array.from(fileList);
    if (!files.length) return;

    const problem = checkFile(files[0]);
    if (problem) {
      setNotice(problem);
      return;
    }

    // replace the current photo
    items.forEach((item) => URL.revokeObjectURL(item.url));
    setNotice(files.length > 1 ? "Only one photo fits here, so the first one was used." : "");
    onChange([toItem(files[0])]);
  };

  const addFiles = (fileList) => {
    if (single) {
      addSingle(fileList);
      return;
    }

    const next = [...items];
    const problems = [];

    Array.from(fileList).forEach((file) => {
      const problem = checkFile(file);

      if (problem) {
        problems.push(problem);
      } else if (
        next.some(
          (item) =>
            item.file.name === file.name &&
            item.file.size === file.size &&
            item.file.lastModified === file.lastModified
        )
      ) {
        // same file picked twice: ignore
      } else if (next.length >= maxFiles) {
        problems.push(`You can add up to ${maxFiles} photos.`);
      } else {
        next.push(toItem(file));
      }
    });

    setNotice([...new Set(problems)].join(" "));
    onChange(next);
  };

  const removeItem = (id) => {
    const target = items.find((item) => item.id === id);
    if (target) URL.revokeObjectURL(target.url);

    setNotice("");
    onChange(items.filter((item) => item.id !== id));
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  };

  const openPicker = () => inputRef.current?.click();

  const message = notice || error;

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      multiple={!single}
      hidden
      onChange={(event) => {
        addFiles(event.target.files);
        event.target.value = "";
      }}
    />
  );

  const dropHandlers = {
    onDragOver: (event) => {
      event.preventDefault();
      setDragging(true);
    },
    onDragLeave: () => setDragging(false),
    onDrop: handleDrop,
  };

  /* ---------- single slot ---------- */

  if (single) {
    const photo = items[0];

    return (
      <div className="dropzone-wrap">
        {photo ? (
          <div
            className={dragging ? "dropzone-slot dropzone-slot--filled dropzone--active" : "dropzone-slot dropzone-slot--filled"}
            {...dropHandlers}
          >
            <img src={photo.url} alt={`${label || "Photo"} preview: ${photo.file.name}`} />

            {label && <span className="dropzone-slot__tag">{label}</span>}

            <button
              type="button"
              className="dropzone-slot__remove"
              onClick={() => removeItem(photo.id)}
              aria-label={`Remove ${label || "photo"} (${photo.file.name})`}
            >
              <X size={16} aria-hidden="true" />
            </button>

            {fileInput}
          </div>
        ) : (
          <div
            className={dragging ? "dropzone dropzone-slot dropzone--active" : "dropzone dropzone-slot"}
            role="button"
            tabIndex={0}
            aria-label={`${label || "Photo"}: add a photo. Drag and drop an image here or press Enter to browse.`}
            aria-invalid={Boolean(message)}
            onClick={openPicker}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openPicker();
              }
            }}
            {...dropHandlers}
          >
            <ImagePlus size={30} aria-hidden="true" />
            {label && <strong>{label}</strong>}
            <span>Click or drag a photo here</span>
            <small>Images only, up to {MAX_SIZE_MB} MB</small>

            {fileInput}
          </div>
        )}

        {message && (
          <p className="mform__error" role="alert">{message}</p>
        )}
      </div>
    );
  }

  /* ---------- default: several photos ---------- */

  return (
    <div className="dropzone-wrap">

      <div
        className={dragging ? "dropzone dropzone--active" : "dropzone"}
        role="button"
        tabIndex={0}
        aria-label="Add photos of the pet. Drag and drop images here or press Enter to browse."
        onClick={openPicker}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPicker();
          }
        }}
        {...dropHandlers}
      >
        <ImagePlus size={30} aria-hidden="true" />
        <strong>Drag and drop photos here</strong>
        <span>or click to browse. Images only, up to {maxFiles} photos.</span>

        {fileInput}
      </div>

      {items.length > 0 && (
        <ul className="dropzone__thumbs">
          {items.map((item) => (
            <li key={item.id} className="dropzone__thumb">
              <img src={item.url} alt={`Preview of ${item.file.name}`} />

              <button
                type="button"
                onClick={() => removeItem(item.id)}
                aria-label={`Remove ${item.file.name}`}
              >
                <X size={14} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {message && (
        <p className="mform__error" role="alert">{message}</p>
      )}

    </div>
  );
}

export default ImageDropzone;
