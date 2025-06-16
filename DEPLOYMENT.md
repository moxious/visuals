# GitHub Pages Deployment Setup

This project is configured to automatically deploy to GitHub Pages using GitHub Actions.

## Setup Instructions

### 1. Enable GitHub Pages in Repository Settings

1. Go to your GitHub repository
2. Click on **Settings** tab
3. Scroll down to **Pages** section in the left sidebar
4. Under **Source**, select **GitHub Actions**
5. Save the settings

### 2. Push to Main Branch

Once GitHub Pages is enabled, any push to the `main` branch will automatically:
1. Build the React/Vite application
2. Deploy it to GitHub Pages
3. Make it available at: `https://[username].github.io/visuals/`

### 3. Manual Deployment

You can also manually trigger a deployment:
1. Go to the **Actions** tab in your repository
2. Select **Deploy to GitHub Pages** workflow
3. Click **Run workflow**
4. Choose the branch and click **Run workflow**

## Configuration Details

### Base Path
The app is configured to use `/visuals/` as the base path in production (GitHub Pages) and `/` for local development. This is handled automatically in `vite.config.js`.

### Build Settings
- **Build output**: `dist/` directory
- **Node.js version**: 18.x
- **Package manager**: npm
- **Build command**: `npm run build`

## Workflow Features

- ✅ Automatic deployment on push to main branch
- ✅ Manual deployment trigger available
- ✅ Concurrent deployment protection
- ✅ Proper permissions for GitHub Pages
- ✅ Artifact caching for faster builds

## Troubleshooting

### Build Fails
- Check the Actions tab for detailed error logs
- Ensure all dependencies are properly listed in `package.json`
- Verify the build command works locally: `npm run build`

### Site Not Loading
- Verify GitHub Pages is enabled in repository settings
- Check that the base path in `vite.config.js` matches your repository name
- Ensure the deployment completed successfully in the Actions tab

### Assets Not Loading
- Confirm the base path configuration in `vite.config.js`
- Check browser developer tools for 404 errors
- Verify assets are being generated in the `dist/` folder

## Custom Domain (Optional)

To use a custom domain:
1. Add a `CNAME` file to the `public/` directory with your domain
2. Configure DNS settings with your domain provider
3. Update the base path in `vite.config.js` to `/` if using a root domain 