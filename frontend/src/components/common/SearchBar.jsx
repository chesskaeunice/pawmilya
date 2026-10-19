import { useRef } from "react";
import { Search, X } from "lucide-react";

import "./SearchBar.css";

// Controlled search bar used for live search.
//  - the page filters its cards on every keystroke (onChange)
//  - the icon sits at the right end of the input
//  - Enter keeps the text and does nothing special (onSubmit is optional)
//  - while there is text the icon becomes an X that clears it in one click
function SearchBar({
  value,
  onChange,
  onClear,
  onSubmit,
  placeholder = "Search",
  label = "Search",
  className = "",
}) {
  const inputRef = useRef(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.(value);
  };

  const handleClear = () => {
    onClear();
    inputRef.current?.focus();
  };

  return (
    <form
      className={`search-bar ${className}`}
      role="search"
      onSubmit={handleSubmit}
    >
      <input
        ref={inputRef}
        type="text"
        className="search-bar__input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        autoComplete="off"
      />

      {value ? (
        <button
          type="button"
          className="search-bar__icon"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <X size={20} aria-hidden="true" />
        </button>
      ) : (
        <button
          type="submit"
          className="search-bar__icon"
          aria-label="Search"
        >
          <Search size={20} aria-hidden="true" />
        </button>
      )}
    </form>
  );
}

export default SearchBar;
