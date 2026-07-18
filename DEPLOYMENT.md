# Deployment Instructions for MicroManus

To complete the assignment, you need to deploy this Next.js app to a live URL (e.g., Vercel) and configure the external services. Follow these steps:

## 1. Setup Supabase
1. Go to [Supabase](https://supabase.com/) and create a new project.
2. In the Supabase dashboard, go to **SQL Editor** and run the contents of the `database_schema.sql` file provided in this repository to create your tables and Row Level Security (RLS) policies.
3. Go to **Authentication > Providers** and enable **Google** and **GitHub** authentication.
4. Go to **Project Settings > API** to find your keys.
5. In your `.env.local` (and Vercel environment variables), set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## 2. Setup Stripe
1. Go to the [Stripe Dashboard](https://dashboard.stripe.com/) (make sure you are in **Test Mode**).
2. Go to **Developers > API keys** and copy your **Publishable key** and **Secret key**.
3. Set these in your `.env.local` as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY`.
4. Go to **Webhooks** and add an endpoint pointing to `https://<YOUR_DEPLOYED_URL>/api/webhook`. Select the event `checkout.session.completed`.
5. Copy the **Signing secret** and set it as `STRIPE_WEBHOOK_SECRET`.

## 3. Web Search & Encryption Key
1. Get a free API key from [Brave Search API](https://brave.com/search/api/) and set it as `BRAVE_SEARCH_API_KEY`.
2. Generate a random 32-character base64 string for `ENCRYPTION_KEY` (e.g. run `openssl rand -base64 32` in terminal).

## 4. Deploy to Vercel
1. Initialize a Git repository (`git init`), commit all files, and push to a new GitHub repository.
2. Go to [Vercel](https://vercel.com/) and import your GitHub repository.
3. During the import process, add all the environment variables from your `.env.local` into Vercel's Environment Variables section.
4. Click **Deploy**.

## 5. Friend Testing & Final Submission
Once deployed, verify the URL:
1. Sign up with Google or GitHub.
2. Hit the Paywall. Use `SID_DRDROID` as a coupon to bypass it, or use the Stripe test card (`4242 4242 4242 4242`).
3. Go to `/settings` and add your LLM API Key (e.g., Anthropic or OpenAI) and select a model.
4. Start a chat with the prompt: *"Create a report explaining the recent forest fires in California, what are causing it and what can be done to avoid it"*. The agent should use the Brave Search tool and generate a PDF link.
5. Check `/stats` to see the cost per chat.

Once verified, email the Vercel URL to Siddarth as instructed!
