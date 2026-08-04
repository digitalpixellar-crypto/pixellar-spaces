# Pixellar Spaces — Update 2

Public rental marketplace plus a secure Supabase-powered admin dashboard.

## Included

- Public Hyderabad and Bengaluru property search
- Database-backed active property listings
- Stored visit, tenant-requirement and owner-listing enquiries
- WhatsApp handoff after every enquiry
- Email/password admin login at `/admin`
- Property add, edit, publish/draft/rented status, and delete
- Lead pipeline status tracking and WhatsApp follow-up
- Supabase Row Level Security policies
- Safe fallback listings until Supabase is connected

## Required one-time setup

Follow `UPDATE-2-SETUP-GUIDE.txt` in order. Run `supabase-setup.sql` in the
Supabase SQL Editor, create the admin user, authorize that user, and add the two
public Supabase variables to Vercel.

## Local development

Copy `.env.example` to `.env.local`, insert your Supabase values, then run:

```bash
npm install
npm run dev
```

Production build verified with `npm run build` on 5 August 2026.
