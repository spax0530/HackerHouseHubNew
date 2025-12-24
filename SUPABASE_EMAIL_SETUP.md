# Fixing "Error sending confirmation email" in Supabase

If you're getting this error when signing up, it's because Supabase email confirmation isn't configured. Here are two solutions:

## Option 1: Disable Email Confirmation (Quick Fix for Development)

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/dwgowbbzvncolxsnvmvp
2. Click **Authentication** in the left sidebar
3. Click **Providers** (or go to **Settings** → **Auth**)
4. Scroll down to **Email Auth**
5. Find **"Confirm email"** toggle
6. **Turn OFF** the "Confirm email" toggle
7. Click **Save**

Now users can sign up without email confirmation. Perfect for development/testing!

## Option 2: Configure SMTP (For Production)

If you want email confirmation to work, you need to configure SMTP:

1. Go to **Authentication** → **Email Templates** in Supabase
2. Click **SMTP Settings** (or go to **Settings** → **Auth** → **SMTP Settings**)
3. Configure your SMTP provider:
   - **SendGrid** (recommended - free tier available)
   - **Mailgun**
   - **AWS SES**
   - **Custom SMTP**

### Using SendGrid (Free Tier)

1. Sign up at https://sendgrid.com
2. Create an API key
3. In Supabase SMTP Settings:
   - **Host**: `smtp.sendgrid.net`
   - **Port**: `587`
   - **Username**: `apikey`
   - **Password**: Your SendGrid API key
   - **Sender email**: Your verified SendGrid sender email
   - **Sender name**: Your app name

4. Click **Save**

### Using Gmail SMTP (For Testing Only)

⚠️ **Not recommended for production** - Gmail has strict limits

1. Enable "Less secure app access" in your Google Account (or use App Password)
2. In Supabase SMTP Settings:
   - **Host**: `smtp.gmail.com`
   - **Port**: `587`
   - **Username**: Your Gmail address
   - **Password**: Your Gmail app password
   - **Sender email**: Your Gmail address

## Option 3: Use Magic Link (Passwordless)

You can also enable Magic Link authentication which doesn't require SMTP configuration:

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Enable **Magic Link** option
4. Users can sign in with just their email (no password needed)

## Testing After Configuration

After configuring email:

1. Try signing up a new user
2. Check your email inbox (and spam folder)
3. Click the confirmation link
4. You should be able to sign in

## Troubleshooting

**Still getting email errors?**
- Check Supabase dashboard → **Logs** → **Auth Logs** for detailed error messages
- Verify your SMTP credentials are correct
- Check that your sender email is verified in your SMTP provider
- For SendGrid: Make sure you've verified your sender email address

**Users can't sign in after signup?**
- Make sure email confirmation is either disabled OR users have confirmed their email
- Check that the confirmation link redirects to the correct URL
- Verify your site URL is set correctly in Supabase Auth settings

## Recommended Setup for Development

For now, **disable email confirmation** (Option 1) to get your app working quickly. You can enable it later when you're ready for production.

