import { useState } from "react";

import { LOCAL_BREEDS, purebredBreeds } from "../../config/petBreeds.js";
import {
  KINDS,
  OTHER_CHOICE,
  composeBreed,
  hasBreedList,
  parseBreed,
} from "../../utils/breedValue.js";

import "./BreedSelect.css";

// One shared Breed field. It keeps ONE string (a hidden input named `name`, default "breed",
// and `onChange(breed)`), so the API's `breed` field is unchanged:
//   "Shih Tzu", "Aspin" / "Puspin", "Mixed Breed", "Mixed Breed - Shih Tzu x Poodle" or "".
//
// Breed type: Purebred (a list ending in "Others (specify)"), Mixed breed (an optional text
// "Specify the mix") or the local breed of the animal (Aspin for a Dog, Puspin for a Cat).
//
//   petType   "Dog" | "Cat" | anything else (Others: a plain optional text input) | "" (not chosen yet)
//   value     the saved breed, to show it again in an edit form (initial value only)
//   required  Add/Edit Animal: true. Report forms: false (the default)
//   inline    true: the cells join the parent's grid (display: contents); the parent places them
//             with .breed-select__kind / __choice / __specify. false: the field has its own grid.
//   reserveSpecify  true: the Breed dropdown always keeps its place (the "Specify" input only shows when needed)
//             (muted and disabled until they are needed), so what is below never moves.
//
// Pass key={petType} from the parent so changing the animal type starts the field over.
// Labels and controls get the look of the page they are in (the page styles its labels and
// inputs); BreedSelect.css only gives low-priority defaults.
function BreedSelect({
  petType = "",
  value = "",
  required = false,
  name = "breed",
  inline = false,
  reserveSpecify = false,
  onChange,
}) {
  const [state, setState] = useState(() => parseBreed(value, petType));

  const withList = hasBreedList(petType);
  const breed = composeBreed(state, petType);

  const update = (changes) => {
    const next = { ...state, ...changes };
    setState(next);
    onChange?.(composeBreed(next, petType));
  };

  const isMixed = state.kind === KINDS.MIXED;
  const showChoice = withList && state.kind === KINDS.PUREBRED;
  // the text input: the breed under "Others (specify)" (required), or the optional mix
  const showSpecify = withList && (isMixed || (showChoice && state.choice === OTHER_CHOICE));

  const mark = required
    ? <span className="breed-select__required" aria-hidden="true"> *</span>
    : <span className="breed-select__optional"> (optional)</span>;

  // The text input: "Specify the breed" under Others (specify), "Specify the mix (optional)" for a
  // mixed breed; hidden otherwise
  const specifyCell = showSpecify ? (
    <label className="breed-select__specify">
      <span>
        {isMixed ? "Specify the mix" : "Specify the breed"}
        {isMixed
          ? <span className="breed-select__optional"> (optional)</span>
          : <span className="breed-select__required" aria-hidden="true"> *</span>}
      </span>
      <input
        type="text"
        maxLength={100}
        required={!isMixed}
        placeholder={isMixed ? "Example: Shih Tzu x Poodle" : "Example: Dachshund"}
        value={state.other}
        onChange={(event) => update({ other: event.target.value })}
      />
    </label>
  ) : null;

  return (
    <div className={inline ? "breed-select breed-select--inline" : "breed-select"}>
      {/* the value the form reads */}
      <input type="hidden" name={name} value={breed} />

      {!withList ? (
        // Others (or no type yet): just a text input
        <>
          <label className="breed-select__kind breed-select__plain">
            <span>Breed{mark}</span>
            <input
              type="text"
              maxLength={100}
              required={required}
              disabled={!petType}
              placeholder={petType ? "" : "Select a pet type first"}
              value={state.other}
              onChange={(event) => update({ other: event.target.value })}
            />
          </label>
          {specifyCell}
        </>
      ) : (
        <>
          <label className="breed-select__kind">
            <span>Breed type{mark}</span>
            <select
              required={required}
              value={state.kind}
              onChange={(event) => update({ kind: event.target.value, choice: "", other: "" })}
            >
              <option value="">Select breed type</option>
              <option value={KINDS.PUREBRED}>Purebred</option>
              <option value={KINDS.MIXED}>Mixed breed</option>
              <option value={KINDS.LOCAL}>{LOCAL_BREEDS[petType]}</option>
            </select>
          </label>

          {!showChoice && reserveSpecify && (
            <label className="breed-select__choice breed-select__choice--idle">
              <span>Breed</span>
              <select disabled value="">
                <option value="">Select breed</option>
              </select>
            </label>
          )}

          {showChoice && (
            <label className="breed-select__choice">
              <span>
                Breed{required && <span className="breed-select__required" aria-hidden="true"> *</span>}
              </span>
              <select
                required={required}
                value={state.choice}
                onChange={(event) => update({ choice: event.target.value, other: "" })}
              >
                <option value="">Select breed</option>
                {purebredBreeds(petType).map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
                <option value={OTHER_CHOICE}>Others (specify)</option>
              </select>
            </label>
          )}

          {specifyCell}
        </>
      )}
    </div>
  );
}

export default BreedSelect;
