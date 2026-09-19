import TypeWriter from "typewriter-effect";
import { Link } from "react-router-dom";
import { hasItems, hasText, sectionOn, shapeRatio } from "../../content/site";
import Figure from "../../components/common/Figure";
import "./Hero.css";
import { Adorno, FiestaSky } from "../../components/common/Fiesta";

/* ============================================================================
   The first screen.

   Her name at full size, the roles cycling underneath, and the portrait frame
   beside it. The roles are the point: she is not one thing, and the type
   rewriting itself says that faster than a list would.
   ============================================================================ */

function Hero({ hero = {} }) {
    if (!sectionOn(hero)) return null;

    // Blank entries dropped, so a list of empty words shows no line at all
    // rather than a rule with a cursor blinking beside nothing.
    const roles = hasItems(hero.roles) ? hero.roles.filter((r) => hasText(r)) : [];

    return (
        <section className="hero">
            <FiestaSky />
            {/* A loose thread drawn across the background — the site's one
                recurring ornament, tying writing and knitting together. */}
            <svg className="heroThread" viewBox="0 0 1200 600" aria-hidden="true" preserveAspectRatio="none">
                <path d="M-40 430C160 300 300 470 470 380S760 120 940 220s220 60 320 10" />
                <path d="M-40 480C180 370 320 520 500 440s280-220 470-130 210 80 310 30" />
            </svg>

            <div className="heroInner">
                <div className="heroText">
                    {hasText(hero.greeting) && (
                        <span className="heroGreeting">{hero.greeting}</span>
                    )}

                    {hasText(hero.name) && (
                        <h1 className="heroName">
                            {hero.honorific && (
                                <span className="heroHon">{hero.honorific}</span>
                            )}
                            {hero.name}
                        </h1>
                    )}

                    {roles.length > 0 && (
                        <div className="heroRoles" aria-label={roles.join(", ")}>
                            <span className="heroRolesRule" aria-hidden="true" />
                            <span className="heroRolesType" aria-hidden="true">
                                <TypeWriter
                                    options={{
                                        strings: roles,
                                        autoStart: true,
                                        loop: true,
                                        delay: 55,
                                        deleteSpeed: 30,
                                    }}
                                />
                            </span>
                        </div>
                    )}

                    {hasText(hero.intro) && <p className="heroIntro">{hero.intro}</p>}

                    {/* The two buttons lead where they have always led; only
                        their wording is content. A destination is structure, and
                        nothing is gained by letting somebody retype "/libros". */}
                    <div className="heroActions">
                        {hasText(hero.primaryLabel) && (
                            <Link className="btn btnSolid" to="/libros">
                                {hero.primaryLabel}
                            </Link>
                        )}
                        {hasText(hero.secondaryLabel) && (
                            <Link className="btn btnGhost" to="/tejidos">
                                {hero.secondaryLabel}
                            </Link>
                        )}
                    </div>

                    {hasText(hero.place) && (
                        <span className="heroPlace">{hero.place}</span>
                    )}
                </div>

                <div className="heroPortrait">
                    <Figure
                        src={hero.photo}
                        alt={hero.photoAlt}
                        kind="portrait"
                        priority
                        ratio={shapeRatio(hero.photoShape)}
                        label="portraitFrame"
                    />
                    <span className="heroPortraitFrame" aria-hidden="true" />
                    <Adorno spot="portrait" />
                    <Adorno spot="companion" />
                </div>
            </div>

            <span className="heroScroll" aria-hidden="true">
                <span className="heroScrollLine" />
            </span>
        </section>
    );
}

export default Hero;
