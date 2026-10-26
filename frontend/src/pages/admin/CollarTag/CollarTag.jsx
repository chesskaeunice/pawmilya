import { useState } from "react";
import { useParams } from "react-router-dom";

import { Download, Printer } from "lucide-react";

import useFetch from "../../../hooks/useFetch.js";
import { getAnimal, getAnimalQr } from "../../../services/animalService.js";
import { siteInfo } from "../../../data/siteInfo.js";
import usePoundInfo from "../../../hooks/usePoundInfo.js";

import "./CollarTag.css";
import BackButton from "../../../components/common/BackButton.jsx";

const COPY_OPTIONS = [1, 6, 12];

// Printable collar tag for one animal: the QR code (opens the public scan page),
// the name, the animal code and who to contact. Print it on a sheet and cut along the dashed line.
function CollarTag() {
  const { animalId } = useParams();
  const pound = usePoundInfo();

  const { data: animal, loading } = useFetch(() => getAnimal(animalId), [animalId]);
  const { data: qrSvg } = useFetch(() => getAnimalQr(animalId), [animalId]);

  const [copies, setCopies] = useState(1);

  if (loading) {
    return (
      <div className="staff-page">
        <p>Loading...</p>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="staff-page">
        <h1>Animal not found.</h1>
      </div>
    );
  }

  const name = animal.name || "Unnamed";

  // The QR code as a file (for engraving or other tag makers)
  const downloadQr = () => {
    const blob = new Blob([qrSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${animal.animal_code}-qr.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div className="staff-page collar-page">

      <div className="collar-page__controls">

        <BackButton fallback={`/admin/animals/${animal.id}`} />

        <label>
          Copies
          <select
            value={copies}
            onChange={(event) => setCopies(Number(event.target.value))}
          >
            {COPY_OPTIONS.map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
        </label>

        <button type="button" className="staff-button staff-button--outline" onClick={downloadQr} disabled={!qrSvg}>
          <Download size={13} />
          Download QR (SVG)
        </button>

        <button type="button" className="staff-button" onClick={() => window.print()} disabled={!qrSvg}>
          <Printer size={13} />
          Print Tag
        </button>

      </div>

      <h1 className="staff-page__title">Collar Tag</h1>

      <p className="staff-page__subtitle">
        Print the tag, cut along the dashed line and attach it to the collar.
        The QR code opens {name}&apos;s information page.
      </p>

      {/* Only this sheet is printed */}
      <div className="collar-sheet">
        {Array.from({ length: copies }, (_, index) => (
          <div className="collar-tag" key={index}>

            <div
              className="collar-tag__qr"
              // The SVG comes from our own API
              dangerouslySetInnerHTML={{ __html: qrSvg ?? "" }}
            />

            <div className="collar-tag__text">
              <strong className="collar-tag__lead">If found, scan me</strong>
              <span className="collar-tag__name">{name}</span>
              <span>{animal.animal_code}</span>
              <span className="collar-tag__pound">
                {siteInfo.brandName} Animal Pound
              </span>
              <span>{pound.phone}</span>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}

export default CollarTag;
