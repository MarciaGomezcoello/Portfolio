import Reveal from "./Reveal";
import { Adorno, FiestaSky } from "./Fiesta";
import "./PageHeader.css";

// The masthead every inner page opens with: kicker, title, and an optional
// standfirst. Keeps all five tabs recognisably the same publication.
function PageHeader({ kicker, title, subtitle, lead, children }) {
    return (
        <header className="pageHead band bandStrong">
            <FiestaSky count={10} where="masthead" />
            <Adorno spot="masthead" />
            <div className="bandInner">
                <Reveal>
                    {kicker && <span className="kicker">{kicker}</span>}
                    <h1 className="pageTitle">{title}</h1>
                    {subtitle && <p className="pageSubtitle">{subtitle}</p>}
                    {lead && <p className="pageLead">{lead}</p>}
                    {children}
                </Reveal>
            </div>
        </header>
    );
}

export default PageHeader;
