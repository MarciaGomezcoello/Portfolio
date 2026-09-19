import { useState } from "react";
import {
    hasItems, hasText, asset, videoSource, channelIndex,
    sectionOn, partOn, shapeRatio,
} from "../content/site";
import { useWords } from "../components/common/Words";
import Figure from "../components/common/Figure";
import Reveal from "../components/common/Reveal";
import PageHeader from "../components/common/PageHeader";
import "./Tejidos.css";

/* ============================================================================
   Tejidos — the two YouTube channels and the work that comes out of them.

   The channels are the biggest audience she has, so they lead, and the work
   itself — the videos, what she teaches, the finished pieces — follows.

   Each channel card wears its own logo, because the two channels are told
   apart by their pictures long before anybody reads the names. The logo is a
   content field like every other picture: a card whose logo is empty keeps its
   name, its line of description and its link, and simply goes without.
   ============================================================================ */

/* ----------------------------------------------------------------------------
   The chosen videos.

   An even grid of cards, each one a photograph of the finished piece with the
   play mark over it, and under that the channel it came from, its title and a
   line about it. This section is here to show the knitting off, so the picture
   is the card and the words annotate it.

   The grid is auto-filled and uncapped, so twelve videos and sixty lay out the
   same way, and touching a card opens the video inside it — a page of them
   costs no players until somebody asks for one.
   ---------------------------------------------------------------------------- */

// Play as soon as it is asked for — the click is the gesture that permits it,
// so nobody has to press play twice.
function withAutoplay(url) {
    return url.includes("?") ? `${url}&autoplay=1` : `${url}?autoplay=1`;
}

// Whatever the video turned out to be: a file gets the browser's own player,
// a link gets an embed frame.
function Player({ item, source }) {
    if (source.kind === "file") {
        return (
            <video
                className="videoCardPlayer"
                src={source.src}
                poster={asset(item.photo) || undefined}
                controls
                autoPlay
                playsInline
            />
        );
    }

    return (
        <iframe
            className="videoCardPlayer"
            src={withAutoplay(source.src)}
            title={item.title || "Video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
        />
    );
}

function VideoCard({ item, index, playing, onPlay, channels }) {
    const source = videoSource(item.video);
    const isPlaying = playing === index && source;

    // Two channels, two tints. A tag that matches neither still shows, just
    // without a colour of its own.
    const tone = channelIndex(item.channel, channels);

    const poster = (
        <>
            <span className="videoCardMedia">
                <Figure
                    src={item.photo}
                    alt={item.photoAlt || item.title || ""}
                    kind="yarn"
                    ratio="16 / 10"
                    label="knitPhoto"
                />
            </span>

            {source && (
                <span className="videoCardPlay" aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false">
                        <path d="M9 7.5 17 12l-8 4.5v-9Z" />
                    </svg>
                </span>
            )}
        </>
    );

    return (
        <Reveal as="li" className="videoCard" delay={Math.min(index, 5) * 80}>
            <div className="videoCardFrame">
                {isPlaying ? (
                    <Player item={item} source={source} />
                ) : source ? (
                    <button
                        type="button"
                        className="videoCardOpen"
                        onClick={() => onPlay(index)}
                    >
                        {poster}
                        <span className="srOnly">Ver «{item.title || "video"}»</span>
                    </button>
                ) : (
                    /* Nothing to play yet, so it is a picture and not a button
                       — no promise it cannot keep. */
                    <span className="videoCardOpen">{poster}</span>
                )}
            </div>

            <div className="videoCardBody">
                {hasText(item.channel) && (
                    <span className={`videoCardTag tone${tone >= 0 ? tone : "None"}`}>
                        {item.channel}
                    </span>
                )}
                {item.title && <h3 className="videoCardTitle">{item.title}</h3>}
                {hasText(item.note) && (
                    <p className="videoCardNote">{item.note}</p>
                )}
            </div>
        </Reveal>
    );
}

function Reel({ featured = {}, channels }) {
    const items = hasItems(featured.items) ? featured.items : [];
    const [playing, setPlaying] = useState(null);

    if (!sectionOn(featured) || items.length === 0) return null;

    return (
        <section className="band reelBand">
            <div className="bandInner">
                <Reveal className="bandHead">
                    <div>
                        {hasText(featured.kicker) && (
                            <span className="kicker">{featured.kicker}</span>
                        )}
                        <h2 className="bandTitle">
                            {featured.title || "Los mejores videos"}
                        </h2>
                        {hasText(featured.lead) && (
                            <p className="bandLead">{featured.lead}</p>
                        )}
                    </div>
                </Reveal>

                <ul className="videoGrid">
                    {items.map((item, i) => (
                        <VideoCard
                            key={i}
                            item={item}
                            index={i}
                            playing={playing}
                            onPlay={setPlaying}
                            channels={channels}
                        />
                    ))}
                </ul>
            </div>
        </section>
    );
}

/* ----------------------------------------------------------------------------
   The gallery of finished pieces.

   Hung from a line rather than set in a grid: a thread runs across the top of
   each row and every piece drops from its own knot. Each piece keeps its own
   shape — wide, tall or square — so nothing is cropped to fit a frame it was
   never photographed for, and the pieces in a row are centred against each
   other so the difference in height shows evenly above and below rather than
   as one ragged bottom edge.

   It costs nothing to grow: pieces wrap onto as many rows as they need, so
   adding a ninth needs no decision from anybody.
   ---------------------------------------------------------------------------- */

function Gallery({ gallery = {} }) {
    const items = hasItems(gallery.items) ? gallery.items : [];

    if (!sectionOn(gallery) || items.length === 0) return null;

    return (
        <section className="band galleryBand">
            <div className="bandInner">
                <Reveal className="bandHead">
                    <div>
                        {hasText(gallery.kicker) && (
                            <span className="kicker">{gallery.kicker}</span>
                        )}
                        <h2 className="bandTitle">
                            {gallery.title || "Galería"}
                        </h2>
                        {hasText(gallery.lead) && (
                            <p className="bandLead">{gallery.lead}</p>
                        )}
                    </div>
                </Reveal>

                <ul className="galleryLine">
                    {items.map((piece, i) => (
                        <Reveal
                            as="li"
                            className="galleryPiece"
                            key={i}
                            delay={Math.min(i, 5) * 70}
                        >
                            <div className="galleryPhoto">
                                <Figure
                                    src={piece.photo}
                                    alt={piece.photoAlt || piece.title || ""}
                                    kind="yarn"
                                    ratio={shapeRatio(piece.shape)}
                                    label="knit"
                                    zoom={{
                                        src: piece.photo,
                                        alt: piece.photoAlt || piece.title || "",
                                        caption: piece.title,
                                        note: piece.note,
                                    }}
                                />
                            </div>

                            {(piece.title || hasText(piece.note)) && (
                                <div className="galleryLabel">
                                    {piece.title && (
                                        <span className="galleryName">{piece.title}</span>
                                    )}
                                    {hasText(piece.note) && (
                                        <span className="galleryNote">{piece.note}</span>
                                    )}
                                </div>
                            )}
                        </Reveal>
                    ))}
                </ul>
            </div>
        </section>
    );
}

function Tejidos({ tejidos = {} }) {
    const words = useWords();
    const channels = hasItems(tejidos.channels) ? tejidos.channels : [];
    const playlists = tejidos.playlists || {};
    const playlistItems = hasItems(playlists.items) ? playlists.items : [];

    return (
        <>
            {partOn(tejidos, "headVisible") && (
                <PageHeader
                    kicker={tejidos.kicker}
                    title={tejidos.title || "Tejidos"}
                    lead={tejidos.lead}
                />
            )}

            {partOn(tejidos, "channelsVisible") && channels.length > 0 && (
                <section className="band">
                    {(hasText(tejidos.channelsKicker) || hasText(tejidos.channelsTitle)) && (
                        <div className="bandInner">
                            <Reveal className="bandHead">
                                <div>
                                    {hasText(tejidos.channelsKicker) && (
                                        <span className="kicker">{tejidos.channelsKicker}</span>
                                    )}
                                    {hasText(tejidos.channelsTitle) && (
                                        <h2 className="bandTitle">{tejidos.channelsTitle}</h2>
                                    )}
                                </div>
                            </Reveal>
                        </div>
                    )}
                    <div className="bandInner channelGrid">
                        {channels.map((ch, i) => (
                            <Reveal key={i} delay={i * 120}>
                                <a
                                    className="channelPanel"
                                    href={ch.url}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <span className="channelPanelHead">
                                        {hasText(ch.logo) && (
                                            <span className="channelPanelLogo">
                                                <Figure
                                                    src={ch.logo}
                                                    alt={ch.logoAlt || ch.name || ""}
                                                    kind="yarn"
                                                    ratio="1 / 1"
                                                    label={ch.short}
                                                />
                                            </span>
                                        )}
                                        <span className="channelPanelTag">{ch.short}</span>
                                    </span>
                                    <h2 className="channelPanelName">{ch.name}</h2>
                                    {ch.description && (
                                        <p className="channelPanelText">{ch.description}</p>
                                    )}
                                    <span className="channelPanelCta">
                                        {words.seeChannel} <span aria-hidden="true">↗</span>
                                    </span>
                                </a>
                            </Reveal>
                        ))}
                    </div>
                </section>
            )}

            <Reel featured={tejidos.featured} channels={channels} />

            {sectionOn(playlists) && playlistItems.length > 0 && (
                <section className="band">
                    <div className="bandInner">
                        <Reveal className="bandHead">
                            <div>
                                {hasText(playlists.kicker) && (
                                    <span className="kicker">{playlists.kicker}</span>
                                )}
                                <h2 className="bandTitle">{playlists.title || "Lo que se enseña"}</h2>
                            </div>
                        </Reveal>
                        <ul className="playlistGrid">
                            {playlistItems.map((p, i) => (
                                <Reveal as="li" className="playlistCard" key={i} delay={i * 80}>
                                    <span className="playlistName">{p.name}</span>
                                    {p.note && <span className="playlistNote">{p.note}</span>}
                                </Reveal>
                            ))}
                        </ul>
                    </div>
                </section>
            )}

            <Gallery gallery={tejidos.gallery} />
        </>
    );
}

export default Tejidos;
