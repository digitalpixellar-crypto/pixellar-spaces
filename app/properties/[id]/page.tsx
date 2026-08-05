"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Property={id:string;property_code:string;title:string;city:string;property_type:string;locality:string;rent:string;deposit:string|null;maintenance:string|null;bedrooms:number|null;bathrooms:number|null;furnishing:string|null;area_sqft:number|null;available_from:string|null;address:string|null;address_visibility:string|null;map_url:string|null;amenities:string[];restrictions:string[];description:string|null;specs:string[];badge:string;availability:string;image_url:string|null;image_urls:string[]};

export default function PropertyDetails(){
  const {id}=useParams<{id:string}>();
  const [property,setProperty]=useState<Property|null>(null),[loading,setLoading]=useState(Boolean(supabase));
  const [active,setActive]=useState(0),[lightbox,setLightbox]=useState(false);
  useEffect(()=>{if(!supabase)return;supabase.from("properties").select("*").eq("id",id).eq("status","active").maybeSingle().then(({data})=>{setProperty(data as Property|null);setLoading(false)})},[id]);
  if(loading)return <main className="details-shell"><div className="details-state">Loading property…</div></main>;
  if(!property)return <main className="details-shell"><div className="details-state"><h1>Property not found</h1><p>This listing may be unavailable or no longer active.</p><Link href="/">← Browse properties</Link></div></main>;

  const photos=property.image_urls?.length?property.image_urls:property.image_url?[property.image_url]:[];
  const move=(direction:number)=>setActive(index=>(index+direction+photos.length)%photos.length);
  const money=(value:string|null)=>{if(!value)return value;const plain=value.trim();if(/^\d+$/.test(plain))return `₹${Number(plain).toLocaleString("en-IN")}`;return value};
  const message=`Hello Pixellar Spaces, I want to schedule a visit for ${property.title} (${property.property_code}), ${property.locality}.`;

  return <main className="details-page">
    <header className="detail-nav container"><Link className="brand" href="/"><span className="brand-mark">P</span><span>Pixellar <b>Spaces</b></span></Link><Link href="/">← Back to all listings</Link></header>
    <section className="container detail-layout"><div>
      <div className="detail-gallery">{photos.length?<>
        <button className="gallery-image" onClick={()=>setLightbox(true)} aria-label="View full-size photo"><img src={photos[active]} alt={`${property.title} — photo ${active+1}`}/></button>
        {photos.length>1&&<><button className="gallery-arrow previous" type="button" onClick={()=>move(-1)} aria-label="Previous photo">‹</button><button className="gallery-arrow next" type="button" onClick={()=>move(1)} aria-label="Next photo">›</button><span className="gallery-count">{active+1} / {photos.length}</span></>}
      </>:<div className="detail-placeholder">Verified {property.property_type}</div>}</div>
      {photos.length>1&&<div className="detail-thumbs" aria-label="Property photo thumbnails">{photos.map((url,index)=><button key={`${url}-${index}`} className={active===index?"active":""} onClick={()=>setActive(index)} aria-label={`Show property photo ${index+1}`}><img src={url} alt=""/></button>)}</div>}
      <div className="detail-content"><span className="kicker">{property.badge.toUpperCase()} · {property.property_code}</span><h1>{property.title}</h1><p className="detail-location">⌖ {property.address_visibility==="exact"&&property.address?property.address:property.locality}</p>
        <div className="detail-specs">{property.bedrooms!=null&&<span><b>{property.bedrooms}</b> Bedrooms</span>}{property.bathrooms!=null&&<span><b>{property.bathrooms}</b> Bathrooms</span>}{property.area_sqft!=null&&<span><b>{property.area_sqft}</b> sq.ft</span>}{property.furnishing&&<span><b>{property.furnishing}</b></span>}</div>
        {property.description&&<div className="detail-section"><h2>About this property</h2><p>{property.description}</p></div>}
        {property.amenities?.length>0&&<div className="detail-section"><h2>Amenities</h2><div className="amenity-grid">{property.amenities.map(x=><span key={x}>✓ {x}</span>)}</div></div>}
        {property.restrictions?.length>0&&<div className="detail-section"><h2>Important notes</h2><div className="restriction-list">{property.restrictions.map(x=><span key={x}>• {x}</span>)}</div></div>}
        {property.map_url&&<a className="map-link" href={property.map_url} target="_blank" rel="noreferrer">Open location in Google Maps ↗</a>}
      </div></div>
      <aside className="detail-side"><span>MONTHLY RENT</span><strong>{money(property.rent)}/month</strong><dl>{property.deposit&&<><dt>Security deposit</dt><dd>{money(property.deposit)}</dd></>}{property.maintenance&&<><dt>Maintenance</dt><dd>{money(property.maintenance)}</dd></>}<dt>Availability</dt><dd>{property.available_from||property.availability}</dd><dt>City</dt><dd>{property.city}</dd></dl><a className="orange-btn" href={`https://wa.me/917893817322?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer">Schedule a visit →</a><a className="outline-btn" href="tel:+917893817322">Call +91 78938 17322</a><small>Verified assistance from shortlist to agreement.</small></aside>
    </section>
    {lightbox&&<div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label="Full-size property photo" onClick={()=>setLightbox(false)}><button className="lightbox-close" onClick={()=>setLightbox(false)} aria-label="Close full-size photo">×</button>{photos.length>1&&<button className="gallery-arrow previous" onClick={e=>{e.stopPropagation();move(-1)}} aria-label="Previous photo">‹</button>}<img src={photos[active]} alt={`${property.title} — full-size photo ${active+1}`} onClick={e=>e.stopPropagation()}/>{photos.length>1&&<button className="gallery-arrow next" onClick={e=>{e.stopPropagation();move(1)}} aria-label="Next photo">›</button>}</div>}
  </main>;
}
