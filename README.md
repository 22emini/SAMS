This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## npm to run to ensure that  face id work

 npm run download:face-models  
  npx drizzle-kit push 
   npx drizzle-kit push:mysql    
    npx drizzle-kit generate  
    npm install drizzle-kit --save-dev           
    mysql -u root -p < migrations/001_add_face_descriptor.sql
    npm install face-api.js --force   
    npm run db:



## npm package json
 "scripts": 
    "dev": "next dev",
    "build": "next build && next export",
    "start": "next start",
    "lint": "next lint",
    "db:push": "npx drizzle-kit push",
    "db:studio": "npx drizzle-kit studio",
    "download:face-models": "node scripts/download-face-models.js"
  
  
 "name": "student-attenadnce-monitoring-app",
      "version": "0.1.0",
      "dependencies": {
        "@ag-grid-community/client-side-row-model": "^32.3.3",
        "@babel/runtime": "^7.27.0",
        "@clerk/clerk-sdk-node": "^4.13.23",
        "@clerk/nextjs": "^6.12.12",
        "@radix-ui/react-alert-dialog": "^1.1.4",
        "@radix-ui/react-dialog": "^1.1.4",
        "@radix-ui/react-dropdown-menu": "^2.1.6",
        "@radix-ui/react-popover": "^1.1.4",
        "@radix-ui/react-slot": "^1.1.1",
        "@tensorflow/tfjs": "^4.16.0",
        "@tidbcloud/serverless": "^0.2.0",
        "@vladmandic/face-api": "^1.7.15",
        "ag-grid-react": "^33.0.4",
        "axios": "^1.8.4",
        "class-variance-authority": "^0.7.1",
        "clsx": "^2.1.1",
        "date-fns": "^3.6.0",
        "dotenv": "^16.5.0",
        "drizzle-orm": "^0.38.4",
        "face-api.js": "^0.22.2",
        "file-saver": "^2.0.5",
        "framer-motion": "^12.0.0",
        "lucide-react": "^0.473.0",
        "moment": "^2.30.1",
        "mysql2": "^3.12.0",
        "next": "^15.3.0",
        "next-themes": "^0.4.6",
        "nodemailer": "^6.10.1",
        "postgres": "^3.4.5",
        "react": "^19.0.0",
        "react-dom": "^19.0.0",
        "react-hook-form": "^7.54.2",
        "recharts": "^2.15.0",
        "resend": "^4.4.0",
        "sonner": "^1.7.2",
        "tailwind-merge": "^2.6.0",
        "tailwindcss-animate": "^1.0.7",
        "xlsx": "^0.18.5",
        "xlsx-js-style": "^1.2.0"
      },
      "devDependencies": {
        "drizzle-kit": "^0.30.6",
        "postcss": "^8",
        "tailwindcss": "^3.4.1"