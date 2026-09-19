import { hasItems, hasText } from "../../content/site";
import SocialIcon from "./SocialIcon";
import { useWords } from "../common/Words";
import { Adorno, useFiesta } from "../common/Fiesta";
import "./SiteFooter.css";

/* ============================================================================
   Footer.

   A running stitch across the top, then two halves: who she is, and every place
   she can be found. There is no menu here — the bar at the top of every page
   already is one, and a second copy of it made the footer a list of lists. What
   the footer is for is following her somewhere once you have finished reading,
   so the accounts get the room: a line of marks and names in ink, knotted
   together like a seam, with no boxes round them.

   An account with no address yet still shows its name, greyed and not a link,
   so the row reads as complete while she fills them in.
   ============================================================================ */

/* The two languages, side by side, each written in its own language — someone
   looking for English should find the word "English", not "Inglés". Fixed here
   rather than in the site file: the names never change, and English is always
   offered. */
const LANGUAGES = [
    { code: "es", name: "Español" },
    { code: "en", name: "English" },
];

function LanguageSwitch({ lang, onLang }) {
    const words = useWords();
    return (
        <div className="siteFooterLang" role="group" aria-label={words.language}>
            {LANGUAGES.map((o, i) => (
                <span key={o.code} className="siteFooterLangItem">
                    {i > 0 && <span className="siteFooterLangSep" aria-hidden="true">·</span>}
                    <button
                        type="button"
                        lang={o.code}
                        className={`siteFooterLangBtn ${lang === o.code ? "isOn" : ""}`}
                        aria-pressed={lang === o.code}
                        onClick={() => {
                            onLang(o.code);
                            window.scrollTo({ top: 0, left: 0 });
                        }}
                    >
                        {o.name}
                    </button>
                </span>
            ))}
        </div>
    );
}

function SiteFooter({ site = {}, lang = "es", onLang = () => {} }) {
    const footer = site.footer || {};
    const social = hasItems(footer.social)
        ? footer.social.filter((l) => l && hasText(l.label))
        : [];
    const year = new Date().getFullYear();
    const fiesta = useFiesta();

    return (
        <footer className={`siteFooter ${fiesta ? "hasFiesta" : ""}`}>
            <Adorno spot="garland" />
            <span className="siteFooterStitch" aria-hidden="true" />

            <div className="siteFooterInner">
                <div className="siteFooterBrand">
                    <span className="siteFooterName">
                        {hasText(site.honorific) && (
                            <span className="siteFooterHonorific">{site.honorific} </span>
                        )}
                        {site.name}
                    </span>
                    {hasText(site.tagline) && (
                        <span className="siteFooterTagline">{site.tagline}</span>
                    )}
                    {hasText(footer.note) && (
                        <p className="siteFooterNote">{footer.note}</p>
                    )}
                </div>

                {social.length > 0 && (
                    <nav
                        className="siteFooterSocial"
                        aria-label={footer.socialTitle || site.name}
                    >
                        {hasText(footer.socialTitle) && (
                            <span className="siteFooterTitle">{footer.socialTitle}</span>
                        )}
                        <ul className="siteFooterChips">
                            {social.map((link, i) => (
                                <li key={i}>
                                    {hasText(link.url) ? (
                                        <a
                                            className="siteFooterChip"
                                            href={link.url}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <SocialIcon name={link.icon} />
                                            {link.label}
                                        </a>
                                    ) : (
                                        <span className="siteFooterChip isMuted">
                                            <SocialIcon name={link.icon} />
                                            {link.label}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </nav>
                )}
            </div>

            <div className="siteFooterBottom">
                <span className="siteFooterDiamond" aria-hidden="true" />
                <span>© {year} {site.name}</span>
                <LanguageSwitch lang={lang} onLang={onLang} />
            </div>
        </footer>
    );
}

export default SiteFooter;
