// Type-to-search text input: the browser shows the matching suggestions while the user types, and
// anything can still be typed (check the value yourself when it must come from the list).
//   <SuggestInput listId="street-list" options={streets} id="street" value={...} onChange={...} />
// Every other prop goes straight to the <input>.
function SuggestInput({ listId, options, ...inputProps }) {
  return (
    <>
      <input type="text" list={listId} autoComplete="off" {...inputProps} />

      <datalist id={listId}>
        {options.map((option, index) => (
          <option key={`${index}-${option}`} value={option} />
        ))}
      </datalist>
    </>
  );
}

export default SuggestInput;
