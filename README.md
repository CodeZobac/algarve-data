# Restaurant Data Management Application

This application is a Next.js project designed to manage restaurant data, including searching for restaurants by region, displaying their details, and sending out invitation emails. It integrates with Google Places API for restaurant data, Supabase for data storage, NextAuth.js for authentication, and Azure Communication Services for email functionality.

## Features

- **User Authentication:** Secure sign-in and sign-out functionality using NextAuth.js with Google OAuth.
- **Restaurant Search:** Users can search for restaurants by specifying a region. The application fetches data from the Google Places API.
- **Restaurant Data Storage:** Fetched restaurant data is stored and managed in a Supabase database.
- **Restaurant Display:** Authenticated users can view a list of restaurants with details such as name, photo, contact information (phone, website), and location.
- **Email Invitation System:** Allows authenticated users to send invitation emails to new users, providing them with a link to access the application.
- **Authenticated Access:** Generates a unique, hashed link for authenticated users to access the restaurant dashboard, ensuring secure navigation.

## Project Structure Overview

The core functionalities of the application are organized within the `data/app` directory:

### `data/app/restaurants/[hash]/page.tsx`

This is the main page component for the restaurant dashboard.
- It handles user session management (redirecting unauthenticated users to sign-in).
- Provides a search interface for restaurants by region.
- Displays the fetched restaurant data in a grid layout.
- Includes an expandable section for sending email invitations.
- Interacts with `/api/restaurants` for searching and fetching restaurant data.
- Interacts with `/api/send-invite` for sending invitation emails.

### `data/app/components/`

This directory contains reusable UI components:

- **`AuthButton.tsx`**:
  - Manages the authentication UI, allowing users to sign in with Google or sign out.
  - Displays the authenticated user's profile image, name, and email.
  - Utilizes `next-auth/react` for session management.

- **`AuthenticatedLink.tsx`**:
  - Generates a secure, hashed link to the restaurant dashboard (`/restaurants/[hash]`).
  - The hash is created using `crypto` and a secret key from environment variables (`NEXT_PUBLIC_HASH_SECRET`).
  - Ensures that the link is only rendered for authenticated users.

### `data/app/api/`

This directory contains Next.js API routes that handle backend logic:

- **`auth/[...nextauth]/route.ts`**:
  - Configures NextAuth.js for authentication.
  - Currently set up to use Google as an OAuth provider, requiring `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` environment variables.

- **`restaurants/route.ts`**:
  - **`POST` handler:**
    - Accepts a `region` in the request body.
    - Calls the Google Places API to search for restaurants in the specified region.
    - Processes the API response, extracts relevant restaurant details (name, photo, contact, location).
    - Upserts (inserts or updates) the restaurant data into a Supabase table named `restaurants`.
    - Requires `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `GOOGLE_PLACES_API_KEY` environment variables.
  - **`GET` handler:**
    - Fetches all restaurant data from the Supabase `restaurants` table.
    - Filters out entries without location data.

- **`send-invite/route.ts`**:
  - **`POST` handler:**
    - Accepts `email` and `link` in the request body.
    - Calls the `sendInviteEmail` function from `app/lib/email.ts` to send the invitation.
    - Returns a success or error message based on the email sending status.

### `data/app/lib/email.ts`

- Contains the `sendInviteEmail` function responsible for sending emails.
- Uses the `@azure/communication-email` client to interact with Azure Communication Services.
- Constructs an HTML-formatted welcome email with the provided recipient and invitation link.
- Requires `AZURE_COMMUNICATION_CONNECTION_STRING` and a `senderAddress` (e.g., `test@<your-domain>.azurecomm.net`) for sending emails.

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Recent Updates

- feat: APP to add data to the Restaurant Management APP and to handle emails generation
- feat: send data to main app && email-service

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
