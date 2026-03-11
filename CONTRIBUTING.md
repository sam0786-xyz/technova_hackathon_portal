# Contributing to Technova Website

Thank you for your interest in contributing! This guide will help you set up your local development environment.

## 🔐 Environment Setup for Contributors

Since this project uses Supabase for backend/database, **you'll need to set up your own free Supabase project** for development. This keeps the production database secure while allowing you to freely experiment.

### Step 1: Fork and Clone

```bash
# Fork this repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/technova_website_v2.git
cd technova_website_v2
npm install
```

### Step 2: Create Your Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up (it's free!)
2. Click **"New Project"**
3. Choose a name and set a strong database password (save this!)
4. Wait for the project to be provisioned (~2 minutes)

### Step 3: Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings > API**
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon (public)** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### Step 4: Set Up Environment Variables

```bash
# Copy the example file
cp .env.example .env
```

Then edit `.env` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 5: Set Up the Database Schema

Run the SQL migrations to create the required tables:

1. In your Supabase dashboard, go to **SQL Editor**
2. Run the migration files from `supabase/migrations/` folder in order
3. Or use the Supabase CLI:
   ```bash
   npx supabase db push
   ```

### Step 6: Generate Auth Secret

```bash
npx auth secret
```

Copy the generated secret to your `.env` file as `AUTH_SECRET`.

### Step 7: (Optional) Set Up Google OAuth

For Google Sign-In to work locally:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new OAuth 2.0 Client ID
3. Add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI
4. Copy the Client ID and Secret to your `.env`:
   ```env
   AUTH_GOOGLE_ID=your_client_id
   AUTH_GOOGLE_SECRET=your_client_secret
   ```

> **Note**: If you skip this step, Google Sign-In won't work, but you can still test other features.

### Step 8: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🛠️ Optional Services

These services are optional for local development. The app will mostly work without them:

### Email (Resend)
- Used for: Sending confirmation emails
- Get a free API key at [resend.com](https://resend.com)
- Without it: Registration works, but no email sent

### Payments (Razorpay)
- Used for: Paid event registrations
- Get test keys at [razorpay.com](https://razorpay.com)
- Without it: Free events work, paid events won't process

---

## 💡 Tips for Contributors

1. **Never commit `.env` files** - They're in `.gitignore` for a reason
2. **Use your own test data** - Feel free to add sample events/users
3. **Ask questions** - Open an issue if you're stuck on setup
4. **Check existing issues** - Look for `good first issue` labels

---

## 🔄 Keeping Your Fork Updated

```bash
# Add upstream remote (one time)
git remote add upstream https://github.com/sam0786-xyz/technova_website_v2.git

# Sync with main repo
git fetch upstream
git checkout main
git merge upstream/main
```

---

## 📋 Pull Request Guidelines

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and commit with clear messages
3. Test locally to ensure everything works
4. Push and open a Pull Request
5. Describe what you changed and why

Thank you for contributing! 🙌
