# GitHub Secrets Setup for CI/CD

To enable automatic deployment on push to main, you need to configure the following secrets in your GitHub repository.

## How to Add Secrets

1. Go to your GitHub repository: https://github.com/bytesofconnor/baking-addiction
2. Navigate to: Settings → Secrets and variables → Actions
3. Click "New repository secret" for each secret below

## Required Secrets

### 1. VERCEL_TOKEN

**How to get it:**
1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Give it a name like "GitHub Actions Deploy"
4. Select scope: Full Account (or restrict to specific projects if preferred)
5. Copy the token

**Secret name:** `VERCEL_TOKEN`
**Value:** The token you just created

### 2. VERCEL_ORG_ID

**How to get it:**
1. Go to your Vercel project: https://vercel.com/connors-projects-408eaae2/baking-addiction
2. Navigate to Settings → General
3. Look for "Project ID" (this is the project ID, but you also need the org ID)
4. The org ID is typically visible in the URL or can be found in `.vercel/project.json` locally

**Secret name:** `VERCEL_ORG_ID`
**Value:** `team_ynn7qy4sDXJcDEMHSuWLuXXo`

### 3. VERCEL_PROJECT_ID

**How to get it:**
1. Go to your Vercel project: https://vercel.com/connors-projects-408eaae2/baking-addiction
2. Navigate to Settings → General
3. Look for "Project ID"

**Secret name:** `VERCEL_PROJECT_ID`
**Value:** `prj_aFYDZXk50XMLtWsmraJ6lbd8eTAg`

### 4. CONVEX_DEPLOY_KEY

**How to get it:**
1. Go to your Convex dashboard for production deployment `beloved-lapwing-642`
2. Navigate to Settings → API Keys
3. Create a new "Deployment Key" or use an existing one
4. Copy the key

**Secret name:** `CONVEX_DEPLOY_KEY`
**Value:** The deployment key

## Verification

After adding the secrets, you can test the workflow by:

1. Creating a new branch: `git checkout -b test-ci`
2. Making a small change
3. Committing and pushing to GitHub
4. Creating a pull request to main
5. Merging the PR to trigger the deployment

## Troubleshooting

If the workflow fails:

1. Check the Actions tab in GitHub for error logs
2. Verify all secrets are correctly set
3. Ensure the Vercel token has the right permissions
4. Check that the Convex deployment key is valid for the production deployment

## Alternative Method

If you prefer not to use secrets, you can connect Git directly to Vercel:

```bash
npx vercel git connect https://github.com/bytesofconnor/baking-addiction --yes --scope connors-projects-408eaae2
```

Then use the alternative workflow file: `.github/workflows/deploy-alternative.yml`
