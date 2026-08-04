"use client";

import { useMemo, useState } from "react";

type Property = {
  id: number; city: "Hyderabad" | "Bengaluru"; type: "Home" | "Office";
  title: string; location: string; rent: string; specs: string[]; theme: string;
  badge: string; available: string;
};

const properties: Property[] = [
  { id: 1, city: "Hyderabad", type: "Home", title: "Serene 2 BHK in a gated community", location: "Kondapur, Hyderabad", rent: "₹36,000/mo", specs: ["2 Beds", "2 Baths", "1,180 sq.ft"], theme: "home-one", badge: "Verified", available: "Ready now" },
  { id: 2, city: "Bengaluru", type: "Office", title: "Plug-and-play studio office", location: "HSR Layout, Bengaluru", rent: "₹58,000/mo", specs: ["12 Seats", "1 Cabin", "850 sq.ft"], theme: "office-one", badge: "Managed", available: "Ready now" },
  { id: 3, city: "Hyderabad", type: "Office", title: "Premium workspace with skyline views", location: "Financial District, Hyderabad", rent: "₹1.25L/mo", specs: ["24 Seats", "2 Cabins", "1,650 sq.ft"], theme: "office-two", badge: "Exclusive", available: "From Aug 15" },
  { id: 4, city: "Bengaluru", type: "Home", title: "Bright furnished 3 BHK apartment", location: "Whitefield, Bengaluru", rent: "₹62,000/mo", specs: ["3 Beds", "3 Baths", "1,740 sq.ft"], theme: "home-two", badge: "Verified", available: "Ready now" },
  { id: 5, city: "Hyderabad", type: "Home", title: "Contemporary family residence", location: "Gachibowli, Hyderabad", rent: "₹48,000/mo", specs: ["3 Beds", "2 Baths", "1,520 sq.ft"], theme: "home-three", badge: "New", available: "From Aug 10" },
  { id: 6, city: "Bengaluru", type: "Office", title: "Furnished office near Outer Ring Road", location: "Bellandur, Bengaluru", rent: "₹92,000/mo", specs: ["18 Seats", "Boardroom", "1,300 sq.ft"], theme: "office-three", badge: "Verified", available: "Ready now" },
];

export default function Home() {
  const [city, setCity] = useState("All cities");
  const [kind, setKind] = useState("All spaces");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<number[]>([]);
  const [modal, setModal] = useState<"owner" | "requirement" | "visit" | null>(null);
  const [selected, setSelected] = useState<Property | null>(null);
  const [sent, setSent] = useState(false);

  const filtered = useMemo(() => properties.filter((p) =>
    (city === "All cities" || p.city === city) &&
    (kind === "All spaces" || p.type === kind) &&
    `${p.title} ${p.location}`.toLowerCase().includes(query.toLowerCase())
  ), [city, kind, query]);

  const openModal = (name: typeof modal, property?: Property) => {
    setSelected(property || null); setSent(false); setModal(name);
  };

  return (
    <main>
      <header className="nav-wrap">
        <nav className="nav container">
          <a className="brand" href="#top" aria-label="Pixellar Spaces home"><span className="brand-mark">P</span><span>Pixellar <b>Spaces</b></span></a>
          <div className="nav-links"><a href="#properties">Homes</a><a href="#properties">Office spaces</a><a href="#how">How it works</a><a href="#manage">Property management</a></div>
          <div className="nav-actions"><button className="text-btn" onClick={() => openModal("owner")}>List your property</button><button className="dark-btn" onClick={() => openModal("requirement")}>Find a space</button></div>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-orb orb-one"/><div className="hero-orb orb-two"/>
        <div className="container hero-inner">
          <div className="hero-copy">
            <div className="eyebrow"><span>●</span> VERIFIED RENTALS · HYDERABAD & BENGALURU</div>
            <h1>A better way to find your <em>next space.</em></h1>
            <p>Curated rental homes and ready-to-move offices, personally verified and managed from search to agreement.</p>
            <div className="search-box">
              <label><small>I’m looking for</small><select value={kind} onChange={e => setKind(e.target.value)}><option>All spaces</option><option>Home</option><option>Office</option></select></label>
              <label><small>Preferred city</small><select value={city} onChange={e => setCity(e.target.value)}><option>All cities</option><option>Hyderabad</option><option>Bengaluru</option></select></label>
              <label className="location-input"><small>Area or locality</small><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Try Kondapur or HSR" /></label>
              <a href="#properties" className="search-btn" aria-label="Search properties">⌕ <span>Search</span></a>
            </div>
            <div className="proof"><div className="avatars"><i>YK</i><i>AR</i><i>SK</i><i>+</i></div><p><strong>250+ verified spaces</strong><br/><span>Clear terms. Genuine listings. Local experts.</span></p></div>
          </div>
          <div className="hero-art" aria-label="Modern rental home interior illustration">
            <div className="sun-window"><span/></div><div className="plant">☘</div><div className="sofa"><i/><i/><i/></div><div className="table"/><div className="art-card"><span className="mini-icon">✓</span><p><small>END-TO-END SUPPORT</small><b>From shortlist to move-in</b></p></div>
          </div>
        </div>
      </section>

      <section className="properties container" id="properties">
        <div className="section-head"><div><span className="kicker">SPACES PICKED FOR YOU</span><h2>Fresh, verified listings</h2><p>Real properties. Current availability. No duplicate listings.</p></div><div className="filter-pills">{["All spaces","Home","Office"].map(v => <button key={v} className={kind === v ? "active" : ""} onClick={() => setKind(v)}>{v === "Home" ? "Homes" : v === "Office" ? "Offices" : v}</button>)}</div></div>
        <div className="property-grid">
          {filtered.map(p => <article className="property-card" key={p.id}>
            <div className={`property-image ${p.theme}`}><span className="badge">✓ {p.badge}</span><button className={`heart ${saved.includes(p.id) ? "saved" : ""}`} onClick={() => setSaved(s => s.includes(p.id) ? s.filter(x => x !== p.id) : [...s, p.id])} aria-label="Save property">♥</button><div className="fake-room"><i/><b/><span/></div></div>
            <div className="card-body"><div className="card-meta"><span>{p.type.toUpperCase()}</span><small>{p.available}</small></div><h3>{p.title}</h3><p className="pin">⌖ {p.location}</p><div className="specs">{p.specs.map(s => <span key={s}>{s}</span>)}</div><div className="price-row"><div><small>Monthly rent</small><strong>{p.rent}</strong></div><button onClick={() => openModal("visit", p)}>Schedule visit →</button></div></div>
          </article>)}
        </div>
        {!filtered.length && <div className="empty"><h3>No exact matches yet</h3><p>Share your requirement and our local team will find options for you.</p><button className="dark-btn" onClick={() => openModal("requirement")}>Share requirement</button></div>}
      </section>

      <section className="how" id="how"><div className="container"><span className="kicker">SIMPLE. TRANSPARENT. SUPPORTED.</span><h2>Move in without the runaround</h2><div className="steps">{[["01","Tell us what fits","Share your city, budget and move-in date."],["02","Tour verified spaces","Visit only genuine, recently checked properties."],["03","Close with confidence","We coordinate terms, documents and handover."]].map(x => <div className="step" key={x[0]}><span>{x[0]}</span><div className="step-icon">{x[0] === "01" ? "⌕" : x[0] === "02" ? "⌂" : "✓"}</div><h3>{x[1]}</h3><p>{x[2]}</p></div>)}</div></div></section>

      <section className="manage container" id="manage"><div><span className="kicker">FOR PROPERTY OWNERS</span><h2>Your property, professionally managed.</h2><p>From high-quality listings and tenant screening to rent coordination and maintenance support—we keep ownership simple.</p><ul><li>✓ Professional photos & verified listing</li><li>✓ Tenant screening & visit coordination</li><li>✓ Documentation & move-in support</li><li>✓ Optional ongoing property management</li></ul><button className="orange-btn" onClick={() => openModal("owner")}>List your property</button></div><div className="owner-panel"><div className="owner-building"><i/><i/><i/><i/><i/><i/></div><div className="metric"><small>OWNER EXPERIENCE</small><strong>One trusted team</strong><span>for every step of the rental journey</span></div></div></section>

      <section className="cta"><div className="container"><div><span>READY WHEN YOU ARE</span><h2>Let’s find a space that works for you.</h2></div><button onClick={() => openModal("requirement")}>Share your requirement →</button></div></section>
      <footer><div className="container footer-grid"><div><div className="brand light"><span className="brand-mark">P</span><span>Pixellar <b>Spaces</b></span></div><p>Verified rental homes and ready-to-move office spaces in Hyderabad and Bengaluru.</p></div><div><b>Explore</b><a href="#properties">Rental homes</a><a href="#properties">Office spaces</a><a href="#how">How it works</a></div><div><b>For owners</b><a href="#manage">List a property</a><a href="#manage">Property management</a><a href="#manage">Partner with us</a></div><div><b>Contact</b><a href="tel:+917893817322">+91 78938 17322</a><a href="mailto:digitalpixellar@gmail.com">digitalpixellar@gmail.com</a><span>Hyderabad · Bengaluru</span></div></div><div className="container copyright">© 2026 Pixellar Spaces · A Digital Pixellar venture <span>Privacy · Terms</span></div></footer>

      {modal && <div className="modal-backdrop" onMouseDown={() => setModal(null)}><div className="modal" onMouseDown={e => e.stopPropagation()}><button className="modal-close" onClick={() => setModal(null)}>×</button>{sent ? <div className="success"><span>✓</span><h2>Thank you!</h2><p>Your request has been received. Our spaces team will contact you shortly.</p><button className="dark-btn" onClick={() => setModal(null)}>Done</button></div> : <><span className="kicker">{modal === "owner" ? "PROPERTY OWNER" : modal === "visit" ? "SCHEDULE A VISIT" : "PERSONALISED SEARCH"}</span><h2>{modal === "owner" ? "List your property" : modal === "visit" ? `Visit ${selected?.title}` : "Tell us what you need"}</h2><p>Share a few details and our local team will take it from here.</p><form onSubmit={e => {e.preventDefault(); setSent(true)}}><div className="field-row"><label>Full name<input required placeholder="Your name"/></label><label>Phone number<input required type="tel" placeholder="+91"/></label></div><div className="field-row"><label>City<select required defaultValue=""><option value="" disabled>Select city</option><option>Hyderabad</option><option>Bengaluru</option></select></label><label>{modal === "owner" ? "Property type" : "Looking for"}<select><option>Rental home</option><option>Office space</option></select></label></div><label>{modal === "owner" ? "Property locality" : "Budget and preferred locality"}<input placeholder={modal === "owner" ? "e.g. Kondapur" : "e.g. ₹40,000, HSR Layout"}/></label><label>Anything else?<textarea placeholder="Move-in date, furnishing, size or other details"/></label><button className="orange-btn form-submit" type="submit">Submit request →</button></form></>}</div></div>}
    </main>
  );
}
