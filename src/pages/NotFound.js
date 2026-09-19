import { Link } from "react-router-dom";
import { useWords } from "../components/common/Words";
import { siteTabs } from "../components/tabs";
import "./NotFound.css";

// Anything that is not one of the tabs lands here rather than on a blank page.
function NotFound({ lang = "es" }) {
    const words = useWords();
    const links = siteTabs(lang);

    return (
        <section className="band notFound">
            <div className="bandInner notFoundInner">
                <span className="kicker">{words.notFoundKicker}</span>
                <h1 className="notFoundTitle">{words.notFoundTitle}</h1>
                <p className="notFoundText">{words.notFoundText}</p>
                <div className="notFoundLinks">
                    <Link className="btn btnSolid" to="/">{words.notFoundHome}</Link>
                    {links.map((link) => (
                        <Link className="btn btnGhost" to={link.to} key={link.to}>
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default NotFound;
