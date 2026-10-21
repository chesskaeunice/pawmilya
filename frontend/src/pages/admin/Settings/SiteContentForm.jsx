import { useEffect, useState } from "react";
import { Globe, Save } from "lucide-react";

import { formatApiError } from "../../../services/authService.js";
import {
  deleteSiteImage,
  getSiteContent,
  saveSiteContent,
  uploadSiteImage,
} from "../../../services/siteService.js";

const MAX_IMAGE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// One uploadable picture (donation QR, About images); uploads and removals save right away
function ImageSlot({ label, slot, url, onChange, onError }) {
  const [busy, setBusy] = useState(false);

  const upload = async (event) => {
    const file = event.target.files[0];
    event.target.value = "";
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) return onError("Use a JPG, PNG or WebP image.");
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) return onError(`The image must be ${MAX_IMAGE_MB} MB or smaller.`);

    setBusy(true);
    try {
      onChange(await uploadSiteImage(slot, file));
    } catch (error) {
      const { message, fields } = formatApiError(error);
      onError(fields.image || message);
    }
    setBusy(false);
  };

  const remove = async () => {
    setBusy(true);
    try {
      onChange(await deleteSiteImage(slot));
    } catch (error) {
      onError(formatApiError(error).message);
    }
    setBusy(false);
  };

  return (
    <div className="settings__image-slot">
      <span>{label}</span>
      {url ? <img src={url} alt={label} /> : <small>No image uploaded (hidden on the site)</small>}
      <input type="file" accept={ALLOWED_TYPES.join(",")} onChange={upload} disabled={busy} />
      {url && (
        <button type="button" className="staff-button staff-button--outline" onClick={remove} disabled={busy}>
          Remove
        </button>
      )}
    </div>
  );
}

const lines = (text) => text.split("\n").map((line) => line.trim()).filter(Boolean);

// Pound info, donation QR, About text/images and the in-kind wishlist shown on the public site
function SiteContentForm() {
  const [content, setContent] = useState(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSiteContent().then(setContent).catch((error) => setMessage(formatApiError(error).message));
  }, []);

  if (!content) return message ? <p className="settings__message">{message}</p> : null;

  const setField = (section, field, value) =>
    setContent({ ...content, [section]: { ...content[section], [field]: value } });

  const setGroup = (index, group) =>
    setContent({ ...content, in_kind: content.in_kind.map((g, i) => (i === index ? group : g)) });

  // Images come back from the server; keep any text the manager is typing
  const withImages = (fresh) =>
    setContent({
      ...content,
      donation: { ...content.donation, qr: fresh.donation.qr },
      about: { ...content.about, images: fresh.about.images },
    });

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const { pound, donation, about, in_kind } = content;
      await saveSiteContent({
        pound,
        donation: { caption: donation.caption },
        about: { headline: about.headline, vision: about.vision, mission: about.mission, goals: about.goals },
        in_kind: in_kind.map((g) => ({ title: g.title, items: g.items })),
      });
      setMessage("Saved. The public site shows the changes within a minute.");
    } catch (error) {
      const { message: text, fields } = formatApiError(error);
      setMessage(Object.values(fields)[0] || text);
    }
    setSaving(false);
  };

  return (
    <form className="staff-detail-card settings__section" onSubmit={save}>
      <h2 className="staff-detail-card__title">
        <Globe size={15} />
        Public Site Content
      </h2>
      <p className="settings__hint">Shown on the Home page, footer and QR scan page. Leave a field empty to hide it.</p>

      <h3 className="settings__subtitle">Pound information</h3>
      <div className="settings__fields">
        {[
          ["name", "Pound name"],
          ["address", "Address"],
          ["phone", "Phone"],
          ["email", "Email"],
          ["hours", "Office hours"],
          ["map_link", "Map link (https://...)"],
        ].map(([field, label]) => (
          <label key={field}>
            {label}
            <input value={content.pound[field] ?? ""} onChange={(e) => setField("pound", field, e.target.value)} />
          </label>
        ))}
      </div>

      <h3 className="settings__subtitle">Donation</h3>
      <div className="settings__fields">
        <label>
          Caption
          <input value={content.donation.caption ?? ""} onChange={(e) => setField("donation", "caption", e.target.value)} />
        </label>
        <ImageSlot label="Donation QR (GCash / bank)" slot="donation_qr" url={content.donation.qr} onChange={withImages} onError={setMessage} />
      </div>

      <h3 className="settings__subtitle">About Us</h3>
      <div className="settings__fields settings__fields--single">
        <label>
          Headline
          <input value={content.about.headline ?? ""} onChange={(e) => setField("about", "headline", e.target.value)} />
        </label>
        <label>
          Vision
          <textarea className="settings__textarea" rows="3" value={content.about.vision ?? ""} onChange={(e) => setField("about", "vision", e.target.value)} />
        </label>
        <label>
          Mission
          <textarea className="settings__textarea" rows="3" value={content.about.mission ?? ""} onChange={(e) => setField("about", "mission", e.target.value)} />
        </label>
        <label>
          Goals (one per line)
          <textarea
            className="settings__textarea"
            rows="5"
            defaultValue={content.about.goals.join("\n")}
            onChange={(e) => setField("about", "goals", lines(e.target.value))}
          />
        </label>
        <ImageSlot label="About image 1" slot="about_1" url={content.about.images[0]} onChange={withImages} onError={setMessage} />
        <ImageSlot label="About image 2" slot="about_2" url={content.about.images[1]} onChange={withImages} onError={setMessage} />
      </div>

      <h3 className="settings__subtitle">Donate In-Kind wishlist</h3>
      {content.in_kind.map((group, index) => (
        <div className="settings__fields settings__fields--single" key={index}>
          <label>
            List title
            <input value={group.title} onChange={(e) => setGroup(index, { ...group, title: e.target.value })} />
          </label>
          <label>
            Items (one per line)
            <textarea
              className="settings__textarea"
              rows="5"
              defaultValue={group.items.join("\n")}
              onChange={(e) => setGroup(index, { ...group, items: lines(e.target.value) })}
            />
          </label>
          <button
            type="button"
            className="staff-button staff-button--outline"
            onClick={() => setContent({ ...content, in_kind: content.in_kind.filter((_, i) => i !== index) })}
          >
            Remove list
          </button>
        </div>
      ))}
      {content.in_kind.length < 6 && (
        <button
          type="button"
          className="staff-button staff-button--outline"
          onClick={() => setContent({ ...content, in_kind: [...content.in_kind, { title: "", items: [] }] })}
        >
          Add list
        </button>
      )}

      {message && <p className="settings__message" role="status">{message}</p>}

      <div className="settings__actions">
        <button type="submit" className="staff-button" disabled={saving}>
          <Save size={13} />
          {saving ? "Saving..." : "Save Site Content"}
        </button>
      </div>
    </form>
  );
}

export default SiteContentForm;
