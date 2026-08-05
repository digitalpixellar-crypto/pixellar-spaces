"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type Lead = { id:string; lead_type:string; property_title:string|null; full_name:string; phone:string; city:string; space_type:string; locality_budget:string|null; details:string|null; status:string; created_at:string };
type Property = { id:string; property_code:string; title:string; city:string; property_type:string; locality:string; rent:string; specs:string[]; badge:string; availability:string; status:string; deposit:string|null; maintenance:string|null; bedrooms:number|null; bathrooms:number|null; furnishing:string|null; area_sqft:number|null; available_from:string|null; address:string|null; address_visibility:string|null; map_url:string|null; amenities:string[]; restrictions:string[]; description:string|null; image_url:string|null; image_urls:string[] };
const statuses = ["new","contacted","visit_scheduled","qualified","closed","lost"];

export default function AdminPage() {
  const [loading,setLoading]=useState(true), [signedIn,setSignedIn]=useState(false), [allowed,setAllowed]=useState(false);
  const [email,setEmail]=useState(""), [password,setPassword]=useState(""), [notice,setNotice]=useState(""), [noticeTab,setNoticeTab]=useState<"leads"|"properties"|null>(null), [saving,setSaving]=useState(false);
  const [tab,setTab]=useState<"leads"|"properties">("leads"), [leads,setLeads]=useState<Lead[]>([]), [properties,setProperties]=useState<Property[]>([]);
  const [editing,setEditing]=useState<Property|null>(null), [showPropertyForm,setShowPropertyForm]=useState(false);
  const [pendingPhotos,setPendingPhotos]=useState<File[]>([]), [keptPhotos,setKeptPhotos]=useState<string[]>([]);

  function openPropertyForm(property:Property|null){
    setEditing(property);
    setPendingPhotos([]);
    setKeptPhotos(property?.image_urls?.length?property.image_urls:property?.image_url?[property.image_url]:[]);
    setShowPropertyForm(true);
  }
  function addPhotos(e:ChangeEvent<HTMLInputElement>){
    const incoming=Array.from(e.target.files||[]);
    setPendingPhotos(current=>[...current,...incoming].filter((file,index,all)=>all.findIndex(x=>x.name===file.name&&x.size===file.size)===index));
    e.target.value="";
  }

  const loadData=useCallback(async()=>{
    if(!supabase) return;
    const [{data:leadRows},{data:propertyRows}] = await Promise.all([
      supabase.from("leads").select("*").order("created_at",{ascending:false}),
      supabase.from("properties").select("*").order("created_at",{ascending:false}),
    ]);
    setLeads((leadRows||[]) as Lead[]); setProperties((propertyRows||[]) as Property[]);
  },[]);

  useEffect(()=>{(async()=>{
    if(!supabase){setLoading(false);return;}
    const {data:{session}}=await supabase.auth.getSession();
    setSignedIn(Boolean(session));
    if(session){
      const {data}=await supabase.from("admin_users").select("user_id").eq("user_id",session.user.id).maybeSingle();
      setAllowed(Boolean(data)); if(data) await loadData();
    }
    setLoading(false);
  })()},[loadData]);

  async function login(e:FormEvent){e.preventDefault();if(!supabase)return;setNotice("Signing in…");
    const {data,error}=await supabase.auth.signInWithPassword({email,password});
    if(error){setNotice(error.message);return} setSignedIn(true);
    const {data:admin}=await supabase.from("admin_users").select("user_id").eq("user_id",data.user.id).maybeSingle();
    if(!admin){setAllowed(false);setNotice("This account is not authorized for the admin dashboard.");return}
    setAllowed(true);setNotice("");await loadData();
  }
  async function logout(){await supabase?.auth.signOut();setSignedIn(false);setAllowed(false);}
  async function updateLead(id:string,status:string){if(!supabase)return;await supabase.from("leads").update({status}).eq("id",id);setLeads(v=>v.map(x=>x.id===id?{...x,status}:x));}
  async function deleteLead(id:string){if(!supabase||!confirm("Delete this lead permanently?"))return;await supabase.from("leads").delete().eq("id",id);setLeads(v=>v.filter(x=>x.id!==id));}
  async function deleteProperty(id:string){if(!supabase||!confirm("Delete this property permanently?"))return;await supabase.from("properties").delete().eq("id",id);setProperties(v=>v.filter(x=>x.id!==id));}
  async function saveProperty(e:FormEvent<HTMLFormElement>){e.preventDefault();if(!supabase)return;const d=new FormData(e.currentTarget);setSaving(true);setNotice("");
    const photos=pendingPhotos;
    const uploaded:string[]=[];
    for(const photo of photos){const safe=photo.name.replace(/[^a-zA-Z0-9._-]/g,"-");const path=`${crypto.randomUUID()}-${safe}`;const {error}=await supabase.storage.from("property-images").upload(path,photo,{contentType:photo.type,upsert:false});if(error){setNotice(`Photo upload failed: ${error.message}`);setNoticeTab("properties");setSaving(false);return}uploaded.push(supabase.storage.from("property-images").getPublicUrl(path).data.publicUrl)}
    const images=[...keptPhotos,...uploaded];
    const numberOrNull=(name:string)=>{const value=String(d.get(name)||"").trim();return value?Number(value):null};
    const csv=(name:string)=>String(d.get(name)||"").split(",").map(x=>x.trim()).filter(Boolean);
    const record={property_code:String(d.get("property_code")),title:String(d.get("title")),city:String(d.get("city")),property_type:String(d.get("property_type")),locality:String(d.get("locality")),rent:String(d.get("rent")),deposit:String(d.get("deposit")||"")||null,maintenance:String(d.get("maintenance")||"")||null,bedrooms:numberOrNull("bedrooms"),bathrooms:numberOrNull("bathrooms"),furnishing:String(d.get("furnishing")||"")||null,area_sqft:numberOrNull("area_sqft"),available_from:String(d.get("available_from")||"")||null,address:String(d.get("address")||"")||null,address_visibility:String(d.get("address_visibility")||"approximate"),map_url:String(d.get("map_url")||"")||null,amenities:csv("amenities"),restrictions:csv("restrictions"),description:String(d.get("description")||"")||null,specs:csv("specs"),badge:String(d.get("badge")),availability:String(d.get("availability")),image_url:images[0]||editing?.image_url||null,image_urls:images,status:String(d.get("status"))};
    const result=editing?await supabase.from("properties").update(record).eq("id",editing.id):await supabase.from("properties").insert(record);
    setSaving(false);if(result.error){setNotice(result.error.message);setNoticeTab("properties");return} setEditing(null);setPendingPhotos([]);setKeptPhotos([]);setShowPropertyForm(false);setNotice("Property saved successfully.");setNoticeTab("properties");await loadData();
  }

  if(loading)return <main className="admin-shell"><div className="admin-login">Loading…</div></main>;
  if(!isSupabaseConfigured)return <main className="admin-shell"><div className="admin-login"><div className="brand"><span className="brand-mark">P</span><span>Pixellar <b>Spaces</b></span></div><h1>Connect Supabase first</h1><p>Add the two variables from <code>.env.example</code> to Vercel, then redeploy.</p><Link href="/">← Back to website</Link></div></main>;
  if(!signedIn||!allowed)return <main className="admin-shell"><form className="admin-login" onSubmit={login}><div className="brand"><span className="brand-mark">P</span><span>Pixellar <b>Spaces</b></span></div><span className="kicker">SECURE TEAM ACCESS</span><h1>Admin dashboard</h1><p>Sign in with your authorized Pixellar Spaces account.</p><label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} /></label><label>Password<input type="password" required value={password} onChange={e=>setPassword(e.target.value)} /></label>{notice&&<div className="admin-notice">{notice}</div>}<button className="orange-btn">Sign in</button><Link href="/">← Back to website</Link></form></main>;

  const newCount=leads.filter(x=>x.status==="new").length, visitCount=leads.filter(x=>x.lead_type==="visit").length;
  return <main className="dashboard"><aside><div className="brand light"><span className="brand-mark">P</span><span>Pixellar <b>Spaces</b></span></div><nav><button className={tab==="leads"?"active":""} onClick={()=>setTab("leads")}>Enquiries & visits <b>{newCount}</b></button><button className={tab==="properties"?"active":""} onClick={()=>setTab("properties")}>Properties <b>{properties.length}</b></button></nav><Link href="/">View public website ↗</Link><button className="logout" onClick={logout}>Sign out</button></aside><section className="dash-main"><header><div><span className="kicker">OPERATIONS CENTER</span><h1>{tab==="leads"?"Leads & visits":"Property inventory"}</h1></div>{tab==="properties"&&<button className="orange-btn" onClick={()=>openPropertyForm(null)}>+ Add property</button>}</header>
  {notice&&noticeTab===tab&&<div className="dash-notice">{notice}</div>}
  {tab==="leads"?<><div className="stat-grid"><div><small>Total enquiries</small><strong>{leads.length}</strong></div><div><small>New leads</small><strong>{newCount}</strong></div><div><small>Visit requests</small><strong>{visitCount}</strong></div><div><small>Closed</small><strong>{leads.filter(x=>x.status==="closed").length}</strong></div></div><div className="data-card"><div className="data-head"><b>Recent enquiries</b><span>Newest first</span></div>{leads.length?leads.map(l=><article className="lead-row" key={l.id}><div className="lead-type">{l.lead_type==="visit"?"VISIT":l.lead_type.toUpperCase()}</div><div><strong>{l.full_name}</strong><span>{l.phone} · {l.city} · {l.space_type}</span><small>{l.property_title||l.locality_budget||"General enquiry"}</small></div><select value={l.status} onChange={e=>updateLead(l.id,e.target.value)}>{statuses.map(s=><option key={s} value={s}>{s.replace("_"," ")}</option>)}</select><a href={`https://wa.me/91${l.phone.replace(/\D/g,"").slice(-10)}`} target="_blank">WhatsApp</a><button className="danger-link" onClick={()=>deleteLead(l.id)}>Delete</button></article>):<div className="dash-empty">No enquiries yet. New website submissions will appear here.</div>}</div></>:<div className="data-card"><div className="data-head"><b>All properties</b><span>{properties.filter(x=>x.status==="active").length} active</span></div>{properties.map(p=><article className="property-row" key={p.id}><div className="property-code">{p.property_code}</div><div><strong>{p.title}</strong><span>{p.locality} · {p.property_type}</span></div><b>{p.rent}</b><span className={`status ${p.status}`}>{p.status}</span><button onClick={()=>openPropertyForm(p)}>Edit</button><button className="danger-link" onClick={()=>deleteProperty(p.id)}>Delete</button></article>)}</div>}
  </section>{showPropertyForm&&<div className="modal-backdrop" onMouseDown={()=>setShowPropertyForm(false)}><form className="modal property-form property-form-v3" onSubmit={saveProperty} onMouseDown={e=>e.stopPropagation()}><button type="button" className="modal-close" onClick={()=>setShowPropertyForm(false)}>×</button><span className="kicker">PROPERTY INVENTORY · UPDATE 3</span><h2>{editing?"Edit property":"Add a property"}</h2><div className="field-row"><label>Property ID<input name="property_code" required defaultValue={editing?.property_code}/></label><label>Status<select name="status" defaultValue={editing?.status||"active"}><option>active</option><option>draft</option><option>rented</option></select></label></div><label>Property title<input name="title" required defaultValue={editing?.title}/></label><div className="field-row"><label>City<select name="city" defaultValue={editing?.city||"Hyderabad"}><option>Hyderabad</option><option>Bengaluru</option></select></label><label>Type<select name="property_type" defaultValue={editing?.property_type||"Home"}><option>Home</option><option>Office</option></select></label></div><label>Locality<input name="locality" required defaultValue={editing?.locality}/></label><div className="field-row"><label>Monthly rent<input name="rent" required placeholder="₹36,000/mo" defaultValue={editing?.rent}/></label><label>Security deposit<input name="deposit" placeholder="₹72,000" defaultValue={editing?.deposit||""}/></label></div><div className="field-row"><label>Monthly maintenance<input name="maintenance" placeholder="₹3,500" defaultValue={editing?.maintenance||""}/></label><label>Available from<input type="date" name="available_from" defaultValue={editing?.available_from||""}/></label></div><div className="field-row thirds"><label>Bedrooms<input type="number" min="0" name="bedrooms" defaultValue={editing?.bedrooms??""}/></label><label>Bathrooms<input type="number" min="0" name="bathrooms" defaultValue={editing?.bathrooms??""}/></label><label>Area (sq.ft)<input type="number" min="0" name="area_sqft" defaultValue={editing?.area_sqft??""}/></label></div><div className="field-row"><label>Furnishing<select name="furnishing" defaultValue={editing?.furnishing||"Unfurnished"}><option>Unfurnished</option><option>Semi-furnished</option><option>Fully furnished</option><option>Plug-and-play</option></select></label><label>Badge<input name="badge" defaultValue={editing?.badge||"Verified"}/></label></div><label>Specifications (comma separated)<input name="specs" placeholder="2 Beds, 2 Baths, 1,180 sq.ft" defaultValue={editing?.specs?.join(", ")}/></label><label>Amenities (comma separated)<input name="amenities" placeholder="Parking, Lift, Power backup, Gym" defaultValue={editing?.amenities?.join(", ")}/></label><label>Restrictions (comma separated)<input name="restrictions" placeholder="No smoking, Families preferred" defaultValue={editing?.restrictions?.join(", ")}/></label><label>Description<textarea name="description" rows={4} defaultValue={editing?.description||""}/></label><label>Full address<input name="address" defaultValue={editing?.address||""}/></label><div className="field-row"><label>Address shown publicly<select name="address_visibility" defaultValue={editing?.address_visibility||"approximate"}><option value="approximate">Approximate locality only</option><option value="exact">Exact address</option></select></label><label>Google Maps link<input type="url" name="map_url" placeholder="https://maps.google.com/..." defaultValue={editing?.map_url||""}/></label></div><label className="photo-picker">Property photos<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addPhotos}/><small>Select several together or add more in separate selections. Remove any photo before saving.</small></label>{(keptPhotos.length>0||pendingPhotos.length>0)&&<div className="photo-manager">{keptPhotos.map((url,index)=><div className="photo-preview" key={url}><img src={url} alt="Existing property photo"/><span>Saved</span><button type="button" aria-label="Remove existing photo" onClick={()=>setKeptPhotos(list=>list.filter(x=>x!==url))}>×</button></div>)}{pendingPhotos.map((file,index)=><div className="photo-preview" key={file.name+file.size}><img src={URL.createObjectURL(file)} alt="New property photo"/><span>New</span><button type="button" aria-label="Remove new photo" onClick={()=>setPendingPhotos(list=>list.filter((_,i)=>i!==index))}>×</button></div>)}</div>}<div className="field-row"><label>Availability label<input name="availability" defaultValue={editing?.availability||"Ready now"}/></label><span/></div><button className="orange-btn" disabled={saving}>{saving?"Saving & uploading…":"Save property"}</button></form></div>}</main>;
}
