"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export default function ListYourPropertyPage(){
  const [photos,setPhotos]=useState<File[]>([]);
  const [saving,setSaving]=useState(false);
  const [success,setSuccess]=useState(false);
  const [error,setError]=useState("");

  function addPhotos(event:ChangeEvent<HTMLInputElement>){
    const incoming=Array.from(event.target.files||[]);
    setPhotos(current=>[...current,...incoming].filter((file,index,all)=>all.findIndex(x=>x.name===file.name&&x.size===file.size)===index).slice(0,10));
    event.target.value="";
  }

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!supabase){setError("Property submissions are temporarily unavailable. Please contact us on WhatsApp.");return}
    const data=new FormData(event.currentTarget);
    if(data.get("website")){return}
    setSaving(true);setError("");
    const photoUrls:string[]=[];
    for(const photo of photos){
      const safe=photo.name.replace(/[^a-zA-Z0-9._-]/g,"-");
      const path=`owner-submissions/${crypto.randomUUID()}-${safe}`;
      const {error:uploadError}=await supabase.storage.from("property-images").upload(path,photo,{contentType:photo.type,upsert:false});
      if(uploadError){setError(`Photo upload failed: ${uploadError.message}`);setSaving(false);return}
      photoUrls.push(supabase.storage.from("property-images").getPublicUrl(path).data.publicUrl);
    }
    const record={
      owner_name:String(data.get("owner_name")||""),owner_phone:String(data.get("owner_phone")||""),owner_email:String(data.get("owner_email")||"")||null,
      city:String(data.get("city")||""),property_type:String(data.get("property_type")||""),locality:String(data.get("locality")||""),address:String(data.get("address")||"")||null,
      expected_rent:String(data.get("expected_rent")||""),deposit:String(data.get("deposit")||"")||null,maintenance:String(data.get("maintenance")||"")||null,
      bedrooms:Number(data.get("bedrooms")||0)||null,bathrooms:Number(data.get("bathrooms")||0)||null,area_sqft:Number(data.get("area_sqft")||0)||null,
      furnishing:String(data.get("furnishing")||"")||null,available_from:String(data.get("available_from")||"")||null,amenities:String(data.get("amenities")||"").split(",").map(x=>x.trim()).filter(Boolean),
      description:String(data.get("description")||"")||null,image_urls:photoUrls,consent:true,status:"pending"
    };
    const {error:insertError}=await supabase.from("owner_submissions").insert(record);
    setSaving(false);
    if(insertError){setError(insertError.message);return}
    const message=`*New Owner Submission — Pixellar Spaces*\nOwner: ${record.owner_name}\nPhone: ${record.owner_phone}\nProperty: ${record.property_type}\nLocation: ${record.locality}, ${record.city}\nExpected rent: ${record.expected_rent}\nPhotos: ${photoUrls.length}\nStatus: Pending admin review`;
    window.open(`https://wa.me/917893817322?text=${encodeURIComponent(message)}`,"_blank","noopener,noreferrer");
    setSuccess(true);
  }

  if(success)return <main className="owner-submit-page"><section className="owner-success"><span>✓</span><h1>Property submitted</h1><p>Thank you. Our team will verify the details and contact you before publishing the listing.</p><div><Link className="dark-btn" href="/">Back to website</Link><a className="orange-btn" href="https://wa.me/917893817322" target="_blank">Chat on WhatsApp</a></div></section></main>;

  return <main className="owner-submit-page"><header className="owner-submit-nav"><Link className="brand" href="/"><span className="brand-mark">P</span><span>Pixellar <b>Spaces</b></span></Link><Link href="/">← Back to listings</Link></header><section className="owner-submit-wrap"><div className="owner-submit-intro"><span className="kicker">FOR PROPERTY OWNERS</span><h1>List your property with confidence.</h1><p>Share your property details once. Our team will verify the information, improve the listing and contact you before it goes live.</p><ul><li>✓ No listing is published without admin approval</li><li>✓ Multiple photos supported</li><li>✓ Tenant enquiries stay linked to your property</li><li>✓ Local support on WhatsApp</li></ul></div><form className="owner-submit-form" onSubmit={submit}><h2>Owner & property details</h2><p>Fields marked * are required.</p><input className="honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"/><div className="field-row"><label>Owner name *<input required name="owner_name"/></label><label>Mobile number *<input required name="owner_phone" type="tel" inputMode="numeric" pattern="[0-9 +()-]{10,18}"/></label></div><label>Email address<input name="owner_email" type="email"/></label><div className="field-row"><label>City *<select required name="city" defaultValue=""><option value="" disabled>Select city</option><option>Hyderabad</option><option>Bengaluru</option></select></label><label>Property type *<select required name="property_type"><option>Home</option><option>Office</option></select></label></div><label>Locality *<input required name="locality" placeholder="e.g. Kondapur"/></label><label>Full address<input name="address" placeholder="Kept private until verification"/></label><div className="field-row thirds"><label>Bedrooms<input type="number" min="0" name="bedrooms"/></label><label>Bathrooms<input type="number" min="0" name="bathrooms"/></label><label>Area (sq.ft)<input type="number" min="0" name="area_sqft"/></label></div><div className="field-row"><label>Expected monthly rent *<input required name="expected_rent" placeholder="e.g. 35000"/></label><label>Security deposit<input name="deposit" placeholder="e.g. 70000"/></label></div><div className="field-row"><label>Monthly maintenance<input name="maintenance"/></label><label>Available from<input type="date" name="available_from"/></label></div><label>Furnishing<select name="furnishing"><option>Unfurnished</option><option>Semi-furnished</option><option>Fully furnished</option><option>Plug-and-play</option></select></label><label>Amenities<input name="amenities" placeholder="Parking, lift, power backup"/></label><label>Description<textarea rows={4} name="description" placeholder="Property highlights, preferred tenants and any important details"/></label><label className="photo-picker">Property photos (up to 10)<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addPhotos}/><small>Add several together or add more in separate selections.</small></label>{photos.length>0&&<div className="photo-manager">{photos.map((file,index)=><div className="photo-preview" key={file.name+file.size}><img src={URL.createObjectURL(file)} alt="Selected property"/><span>{index+1}</span><button type="button" onClick={()=>setPhotos(list=>list.filter((_,i)=>i!==index))}>×</button></div>)}</div>}<label className="consent-check"><input required type="checkbox" name="consent"/><span>I confirm that I own or am authorized to list this property, and I consent to Pixellar Spaces contacting me and verifying these details before publication.</span></label>{!isSupabaseConfigured&&<div className="admin-notice">Online submission setup is pending.</div>}{error&&<div className="admin-notice">{error}</div>}<button className="orange-btn form-submit" disabled={saving}>{saving?"Uploading & submitting…":"Submit property for review →"}</button><small className="privacy-note">Your contact details and exact address are not shown publicly.</small></form></section></main>;
}
