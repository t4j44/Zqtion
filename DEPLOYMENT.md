# Deployment Guide - Vercel & Supabase

This project is optimized for deployment on Vercel with Supabase as the backend.

## Prerequisites

- GitHub/GitLab/Bitbucket account
- Vercel account (free tier available)
- Supabase account (free tier available)

## Supabase Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Set a strong database password
   - Choose a region close to your users

2. **Get Your Credentials**
   - Go to Project Settings → API
   - Copy the `Project URL`
   - Copy the `anon/public` key
   - Copy the `service_role` key (keep this secret!)

3. **Configure Database** (if needed)
   - Use the Supabase SQL Editor to create tables
   - Set up Row Level Security (RLS) policies
   - Configure authentication providers if needed

## Vercel Deployment

### Option 1: Deploy via Vercel Dashboard

1. **Connect Repository**
   - Push your code to GitHub/GitLab/Bitbucket
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository

2. **Configure Environment Variables**
   - In Vercel project settings, go to "Environment Variables"
   - Add the following variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
     ```

3. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your site

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Environment Variables

Create a `.env.local` file locally (never commit this):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Vercel Configuration

The project includes:
- `vercel.json` - Vercel project configuration
- `.vercelignore` - Files to exclude from deployment
- `next.config.js` - Next.js configuration with Supabase image domains

## Post-Deployment

1. **Test Your Site**
   - Visit your Vercel deployment URL
   - Test all functionality
   - Check browser console for errors

2. **Configure Custom Domain** (optional)
   - Go to Vercel project settings → Domains
   - Add your custom domain
   - Update DNS records as instructed

3. **Set Up Monitoring**
   - Use Vercel Analytics (built-in)
   - Set up Supabase monitoring
   - Configure error tracking if needed

## Automatic Deployments

Vercel automatically deploys:
- **Production**: Every push to `main` branch
- **Preview**: Every push to other branches
- **Pull Requests**: Automatic preview deployments

## Troubleshooting

### Build Errors
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify environment variables are set

### Supabase Connection Issues
- Verify environment variables are correct
- Check Supabase project status
- Review RLS policies if getting permission errors

### Performance Issues
- Enable Vercel Edge caching
- Optimize images using Next.js Image component
- Use Supabase Edge Functions for heavy operations

## Best Practices

1. **Security**
   - Never commit `.env.local` or `.env`
   - Use RLS policies in Supabase
   - Keep service role key secret (server-side only)

2. **Performance**
   - Use ISR (Incremental Static Regeneration) where possible
   - Implement proper caching strategies
   - Optimize database queries

3. **Monitoring**
   - Enable Vercel Analytics
   - Monitor Supabase usage
   - Set up alerts for errors

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase + Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
