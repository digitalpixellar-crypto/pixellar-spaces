# Pixellar Spaces

Public rental homes and office-space marketplace for Hyderabad and Bengaluru.

## Deploy on Vercel

1. Create a new empty GitHub repository named `pixellar-spaces`.
2. Extract this ZIP on your computer.
3. Upload every extracted file and folder to the repository root.
4. In Vercel, choose **Add New → Project**.
5. Import the `pixellar-spaces` GitHub repository.
6. Keep **Framework Preset: Next.js** and leave all build settings unchanged.
7. Select **Deploy**.

No environment variables or database setup are required for this version.

## Update 1

- Schedule Visit automatically selects the chosen property's city and space type.
- Owner, tenant and visit forms create a structured WhatsApp lead for +91 78938 17322.
- Scheduled-visit messages automatically include the property title and property ID.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production build

```bash
npm run build
```

Future commits pushed to the connected GitHub branch will deploy automatically on Vercel.
