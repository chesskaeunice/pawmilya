import { Link } from "react-router-dom";

import BackButton from "../../../components/common/BackButton.jsx";
import legalPages, { LEGAL_UPDATED, legalOrder } from "../../../data/legalPages.js";
import useSiteInfo from "../../../hooks/useSiteInfo.js";
import { formatDate } from "../../../utils/formatDateTime.js";

import "./LegalPage.css";

// One page component for all three policies; `slug` picks the content.
function LegalPage({ slug }) {
  const page = legalPages[slug];
  const contact = useSiteInfo()?.pound ?? {};
  const others = legalOrder.filter((key) => key !== slug);

  return (
    <article className="legal-page">

      <BackButton fallback="/" />

      <p className="legal-page__eyebrow">Legal</p>
      <h1>{page.title}</h1>
      <p className="legal-page__updated">
        Last updated: {formatDate(`${LEGAL_UPDATED}T00:00:00`)}
      </p>

      <p className="legal-page__intro">{page.intro}</p>

      {page.sections.map((section) => (
        <section className="legal-page__section" key={section.heading}>
          <h2>{section.heading}</h2>

          {section.list && (
            <ul>
              {section.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}

          {section.paragraphs?.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </section>
      ))}

      <section className="legal-page__section">
        <h2>Contact us</h2>
        {(contact.email || contact.phone) && (
          <p>
            Questions about this policy?
            {contact.email && ` Email ${contact.email}`}
            {contact.email && contact.phone && " or call"}
            {!contact.email && " Call"}
            {contact.phone && ` ${contact.phone}`}.
          </p>
        )}
      </section>

      <nav className="legal-page__others" aria-label="Other policies">
        <span>Other policies:</span>
        {others.map((key) => (
          <Link key={key} to={`/${key}`}>
            {legalPages[key].title}
          </Link>
        ))}
      </nav>

    </article>
  );
}

export default LegalPage;
