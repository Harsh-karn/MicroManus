# MicroManus AI Agent

MicroManus is a sophisticated AI Agent application built with Next.js 15, Vercel AI SDK, Supabase, and Stripe.
It features a web UI for usage-based billing, internet search capabilities via Brave Search, and PDF generation via Puppeteer.

## Features

*   **Authentication**: Social login (GitHub/Google) via Supabase Auth.
*   **Paywall & Usage-Based Billing**:
    *   New users encounter a paywall.
    *   Users can purchase 5 credits for $5 via Stripe Checkout.
    *   Coupon code bypass: Use code `SID_DRDROID` on Stripe Checkout for 100% discount.
    *   Credits are decremented per turn (API call) in the chat.
*   **AI Agent**:
    *   Powered by the Vercel AI SDK (`streamText`, `tool` usage).
    *   Supports Anthropic (Claude 3.5 Sonnet) and OpenAI (GPT-4o). Model can be toggled in settings.
    *   Tools available: `web_search` (using Brave Search) and `create_pdf` (rendering markdown to a PDF).
*   **Conversational Memory**: Chat threads are persisted in Supabase Database. The UI displays message history securely.

## Setup Instructions

### 1. Prerequisites
- Node.js (v18+ recommended)
- A Supabase Project (Database, Auth, Storage configured)
- A Stripe Account
- API Keys for Brave Search, OpenAI, and Anthropic

### 2. Environment Variables
Create a `.env.local` file in the root directory based on `.env.example`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
# Get this from your Stripe Dashboard -> Products -> Pricing ID
NEXT_PUBLIC_STRIPE_PRICE_ID=price_...

# AI Provider Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-...

# Agent Tooling
BRAVE_SEARCH_API_KEY=your_brave_search_key
```

### 3. Database Schema setup (Supabase)
Ensure your Supabase project contains the following tables:
1. `users` (id uuid PK, email, credits int) - Triggered on Auth signup.
2. `threads` (id uuid PK, user_id, created_at, updated_at) - RLS enabled (user can read/write their own threads).
3. `messages` (id uuid PK, thread_id, role, content, created_at) - RLS enabled (user can read/write their own messages).

For detailed DB schema, run the Supabase migrations or refer to the agent's logic.

### 4. Running the Development Server
Install dependencies and run the server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Testing Locally ("Friend Test")
To fully verify functionality on a fresh clone or as a reviewer:
1. Copy `.env.example` to `.env.local` and populate all the keys.
2. Start the dev server (`npm run dev`).
3. Sign up using GitHub/Google.
4. You should see the paywall. Click to pay $5, then either complete a test payment via Stripe or apply the `SID_DRDROID` coupon code to bypass it.
5. After successful payment (which updates the webhook), you will receive 5 credits and be redirected to the chat UI.
6. Chat with the agent, ask it to "Search the web for latest AI news" and "Create a PDF with the summary". Ensure it uses both tools successfully.

## Tech Stack
*   **Next.js 15 (App Router)**
*   **React 19**
*   **Tailwind CSS**
*   **Supabase (Auth, Postgres, ssr)**
*   **Stripe (Checkout, Webhooks)**
*   **Vercel AI SDK**
*   **Lucide React** (Icons)
