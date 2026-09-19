import Hero from "./home/Hero";
import {
    UpcomingPreview, QuoteBand, BooksPreview, PoemFeature, TejidosPreview,
} from "./home/Sections";

// The cover page: one screen for who she is, then one band per area of work,
// each ending in a way into its own tab.
//
// Every band is handed its own block and reads nothing else, so a band can be
// rewritten, switched off or emptied without any other band — or any other
// page — noticing.
function Home({ home = {} }) {
    return (
        <>
            <Hero hero={home.hero} />
            <UpcomingPreview block={home.proximo} />
            <BooksPreview block={home.books} />
            <PoemFeature poem={home.poem} />
            <TejidosPreview block={home.tejidos} />
            <QuoteBand quote={home.quote} />
        </>
    );
}

export default Home;
