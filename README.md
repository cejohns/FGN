# FireStar Gaming News

A comprehensive gaming news and media platform featuring automated content aggregation, game reviews, videos, guides, and an admin management system.

## Features

### Public Features
- **News**: Latest gaming news aggregated from multiple sources
- **Reviews**: In-depth game reviews and ratings
- **Videos**: Gaming video content and streaming integration
- **Gallery**: Gaming screenshots and media collections
- **Blog**: Editorial content and opinion pieces
- **Guides**: Gaming tutorials and how-to guides

### Admin Features
- **Content Management**: Create, edit, and delete all content types
- **Automated Content Fetching**: Integration with multiple gaming APIs
- **Secure Authentication**: Password-protected admin panel
- **Real-time Updates**: Instant content publishing

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Backend**: Supabase Edge Functions
- **Deployment**: Bolt.new

## Project Structure

```
project/
├── src/
│   ├── components/          # React components
│   │   ├── AdminLogin.tsx   # Admin authentication
│   │   ├── AdminPanel.tsx   # Admin dashboard
│   │   ├── BlogPage.tsx     # Blog section
│   │   ├── ContentForms.tsx # Content creation forms
│   │   ├── Footer.tsx       # Site footer
│   │   ├── GalleryPage.tsx  # Media gallery
│   │   ├── GuidesPage.tsx   # Gaming guides
│   │   ├── Header.tsx       # Navigation header
│   │   ├── HomePage.tsx     # Landing page
│   │   ├── NewsPage.tsx     # News articles
│   │   ├── ReviewsPage.tsx  # Game reviews
│   │   └── VideosPage.tsx   # Video content
│   ├── lib/
│   │   └── supabase.ts      # Supabase client setup
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── supabase/
│   ├── functions/           # Edge Functions
│   │   ├── fetch-all-gaming-content/
│   │   ├── fetch-game-deals/
│   │   ├── fetch-gaming-news/
│   │   ├── fetch-igdb-games/
│   │   ├── fetch-steam-content/
│   │   ├── fetch-twitch-videos/
│   │   ├── generate-ai-content/
│   │   └── update-game-images/
│   └── migrations/          # Database migrations
└── public/                  # Static assets
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- API keys for content aggregation (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_ADMIN_PASSWORD=your_admin_password
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Database Setup

The project uses Supabase with the following main tables:

- `news` - Gaming news articles
- `reviews` - Game reviews and ratings
- `videos` - Video content metadata
- `blog_posts` - Blog articles
- `guides` - Gaming guides and tutorials
- `gallery_items` - Media gallery images

All tables include Row Level Security (RLS) policies for data protection.

### Running Migrations

Migrations are managed through Supabase and are located in `supabase/migrations/`.

## Admin Panel Access

The admin panel is protected and can be accessed in two ways:

### Method 1: Keyboard Shortcut
1. Navigate to the homepage
2. Type `admin` on your keyboard
3. The admin login screen will appear

### Method 2: Direct Session
If already authenticated, click the "Admin" button in the bottom-right corner.

**Default Credentials:**
- Password: `admin123` (or the value set in `VITE_ADMIN_PASSWORD`)

## Edge Functions

The project includes several Supabase Edge Functions for automated content aggregation:

- `fetch-all-gaming-content` - Aggregates content from all sources
- `fetch-game-deals` - Fetches gaming deals and discounts
- `fetch-gaming-news` - Retrieves latest gaming news
- `fetch-igdb-games` - Fetches game data from IGDB
- `fetch-steam-content` - Retrieves Steam platform content
- `fetch-twitch-videos` - Aggregates Twitch gaming videos
- `generate-ai-content` - AI-powered content generation
- `update-game-images` - Updates game imagery

### Invoking Edge Functions

Edge functions can be triggered via HTTP requests or scheduled tasks.

## Deployment

### Deploy to Bolt.new

This project is optimized for Bolt.new deployment:

1. Push your code to the Bolt.new platform
2. Configure environment variables in the Bolt dashboard
3. Your site will be available at: `your-project.bolt.host`

### Custom Domain Setup

1. In your DNS provider (e.g., IONOS), add a CNAME record:
   - Host: `www`
   - Points to: `your-project.bolt.host`

2. In the Bolt dashboard:
   - Navigate to Settings > Domains
   - Add your custom domain: `www.yourdomain.com`
   - Wait 5-30 minutes for SSL certificate provisioning

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Security Best Practices

- Admin password is stored in environment variables
- Session storage is used for admin authentication
- Supabase RLS policies protect database access
- API keys are never exposed to the client

## Customization

### Changing the Admin Password

Set `VITE_ADMIN_PASSWORD` in your `.env` file:
```env
VITE_ADMIN_PASSWORD=your_secure_password
```

### Styling

The project uses Tailwind CSS with a custom dark theme featuring:
- Slate backgrounds
- Cyan/blue accent colors
- Glass-morphism effects
- Smooth transitions and animations

Customize colors in `tailwind.config.js`.

## API Integrations

This platform can integrate with:
- IGDB (Internet Game Database) - Primary game data provider
- RAWG Video Games Database - Secondary game data provider
- Steam API
- Twitch API
- Gaming news RSS feeds

Configure API keys in your edge function environment variables.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For issues or questions:
- Check the documentation
- Review existing issues
- Contact the development team

## Roadmap

- [ ] User accounts and profiles
- [ ] Comment system
- [ ] Social media sharing
- [ ] Newsletter integration
- [ ] Advanced search and filtering
- [ ] Mobile app

---

**Built with** React, TypeScript, Tailwind CSS, and Supabase
