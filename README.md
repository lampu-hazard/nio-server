# nio-backend

The backend API server and Discord bot controller for the nio dashboard, built using NestJS, Prisma (PostgreSQL), Bun, and discord.js.

## Key Features

- **Discord Integration**: Runs a native discord.js bot supporting slash commands, interaction components (buttons, select menus), and sticker keywords.
- **Role Panels**: Manage self-role assignments, rules, and announcements with visual styles (premium, minimal, colorful, neon).
- **Sticker Keywords**: Automatically replies with custom sticker images stored in Cloudflare R2 when users type specific keywords in Discord channels (configurable per-guild).
- **Cloudflare R2 Storage**: Direct client-to-storage upload via S3-compatible presigned URLs.
- **Session Authentication**: Secure REST API endpoints guarded by guild permissions and session authentication.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
