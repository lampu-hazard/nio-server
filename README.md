# nio-backend

The backend API server and Discord bot controller for the nio dashboard, built using NestJS, Prisma (PostgreSQL), Bun, and discord.js.

## Key Features

- **Discord Integration**: Runs a native discord.js bot supporting slash commands, interaction components (buttons, select menus), and sticker keywords.
- **Role Panels**: Manage self-role assignments, rules, and announcements with visual styles (premium, minimal, colorful, neon).
- **Sticker Keywords**: Automatically replies with custom sticker images stored in Cloudflare R2 when users type specific keywords in Discord channels (configurable per-guild).
- **Cloudflare R2 Storage**: Direct client-to-storage upload via S3-compatible presigned URLs.
- **Session Authentication**: Secure REST API endpoints guarded by guild permissions and session authentication.

## Prerequisites

- Bun v1.2+
- PostgreSQL database
- Discord Bot Application (with Message Content Intent enabled)
- Cloudflare R2 Bucket

## Getting Started

### 1. Configuration

Create a `.env` file in the root directory:

```env
PORT=3002
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@host:port/database

# Discord Application Credentials
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_REDIRECT_URI=http://localhost:3002/auth/discord/callback

# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://your-r2-public-url.com
```

### 2. Setup Database

Generate Prisma Client and apply migrations:

```bash
bun run prisma:generate
bun run prisma:migrate
```

### 3. Installation & Run

Install dependencies and start the development server:

```bash
bun install
bun run dev
```

For production builds:

```bash
bun run build
bun run start:prod
```

## Deployment

Continuous deployment is configured using GitHub Actions (`.github/workflows/deploy.yml`) to rebuild and deploy the server inside a Docker container on push to the `main` branch.

Ensure the following GitHub Secrets are configured in your repository:
- `VPS_HOST`: Server IP address
- `VPS_USER`: SSH username
- `VPS_SSH_KEY`: SSH private key
- `VPS_PORT`: SSH port (optional, defaults to 22)
- `VPS_PROJECT_PATH`: Repository path on server
- `DISCORD_WEBHOOK_URL`: Webhook URL for deployment status notifications

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
