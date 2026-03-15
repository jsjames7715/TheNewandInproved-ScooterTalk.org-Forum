# ScooterTalk Forum - Modern Recreation

A modern, fully-functional recreation of the classic ScooterTalk.org electric scooter forum. Built with cutting-edge web technologies while preserving the community spirit and design aesthetic of the original.

## 🛴 Features

### Modern Forum Platform
- **User Registration & Authentication** - Secure email verification system
- **Categories & Boards** - Organized discussion structure
- **Thread Creation & Replies** - Full discussion functionality
- **User Profiles** - Avatar and bio management
- **Search & Navigation** - Easy content discovery
- **Responsive Design** - Works on all devices

### Data Preservation
- **Archived Content** - Browse historical forum discussions
- **Original Design** - Modernized version of the classic look
- **Smooth Migration** - Import old data while maintaining functionality

### Technical Excellence
- **Fast Performance** - Modern React + TypeScript
- **Type Safety** - Full-stack type safety with oRPC
- **Modern UX** - Smooth transitions and animations
- **Scalable Architecture** - Built for growth

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm package manager

### Installation
```bash
# Install dependencies
pnpm install

# Seed the forum with initial data
pnpm ts scripts/seed-forum.ts

# The app runs automatically in Quests
```

### Default Admin Account
- **Email**: `admin@scootertalk.org`
- **Password**: `admin123`

## 🎨 Design System

### Color Palette
- **Primary**: Teal/Aqua (#14b8a6) - Based on original ScooterTalk branding
- **Neutral**: Modern grays for readability
- **Accents**: Blue, green, yellow, red for different states

### Typography
- **Sans Serif**: Inter for body text
- **Monospace**: JetBrains Mono for code
- **Responsive**: Scales beautifully across devices

### Components
- **Layout**: Clean, modern header with navigation
- **Cards**: Rounded corners with subtle shadows
- **Buttons**: Gradient-filled with hover effects
- **Forms**: Clean, accessible input fields

## 📁 Project Structure

```
src/
├── client/                    # Frontend React app
│   ├── components/
│   │   └── forum/          # Forum components
│   │       ├── auth/       # Authentication
│   │       └── layout.tsx  # Main layout
│   ├── styles/
│   │   └── forum.css       # Forum styling
│   ├── forum-app.tsx       # Forum app with routing
│   └── forum-client.ts     # RPC client setup
├── server/                 # Backend server
│   ├── rpc/
│   │   └── forum/         # Forum RPC handlers
│   │       ├── auth.ts  # Authentication
│   │       ├── content.ts # Forum content
│   │       ├── storage.ts # Data storage
│   │       └── index.ts   # RPC router
│   └── lib/
│       ├── forum-types.ts # Type definitions
│       └── crypto.ts      # Password hashing
└── AGENTS.md            # Project guidelines
```

## 🔧 Technical Details

### Backend
- **Hono**: Fast web framework
- **oRPC**: Type-safe RPC between client/server
- **Unstorage**: Key-value storage with live updates
- **Zod**: Runtime type validation

### Frontend
- **React 19**: Latest React with new features
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling
- **Heroicons**: Beautiful icon set

### Database
- **File-based storage**: Simple, reliable
- **Live queries**: Real-time updates
- **Type-safe**: Full TypeScript integration

## 🌟 Key Features

### User Experience
- **Modern Registration**: Email verification system
- **Intuitive Navigation**: Clean, organized interface
- **Fast Loading**: Optimized for performance
- **Mobile Friendly**: Responsive design

### Community Features
- **Thread Creation**: Start new discussions
- **Reply System**: Engage in conversations
- **User Profiles**: Personalize your presence
- **Moderation**: Admin and moderator roles

### Content Management
- **Categories**: Organize discussions
- **Boards**: Specific topic areas
- **Tags**: Thread categorization
- **Search**: Find content easily

## 📊 Data Model

### Users
- Username, email, password (hashed)
- Avatar, bio, role
- Post count, last active
- Email verification

### Categories
- Name, slug, description
- Icon, order
- Multiple boards per category

### Boards
- Name, slug, description
- Moderators, category association
- Thread/post counts
- Last activity

### Threads
- Title, content, author
- Board association
- Pin/lock/archive status
- View count, tags

### Posts
- Content, author
- Thread association
- Like count, edit history

## 🔄 Data Migration

The forum includes tools to import and archive content from the original ScooterTalk:

### Archive Import
- Parse HTML from Wayback Machine
- Extract threads and posts
- Preserve historical content
- Link to original sources

### Data Structure
- Original forum structure preserved
- Modern database schema
- Backward compatibility
- Searchable archives

## 🚀 Deployment

### Development
```bash
# Install dependencies
pnpm install

# Seed with sample data
pnpm ts scripts/seed-forum.ts

# The app runs automatically in Quests
```

### Production
- Built with Vite for optimal performance
- TypeScript for reliability
- Modern browser support
- Progressive Web App ready

## 🎨 Customization

### Styling
- CSS custom properties for easy theming
- Tailwind CSS utilities
- Responsive breakpoints
- Dark mode support

### Configuration
- Environment variables for API keys
- Configurable categories and boards
- Custom user roles and permissions
- Extensible plugin system

## 📈 Performance

### Optimizations
- Code splitting for fast loading
- Image optimization
- Caching strategies
- Lazy loading

### Scalability
- Modular architecture
- Efficient data storage
- Horizontal scaling ready
- Database optimization

## 🔒 Security

### Authentication
- Password hashing with PBKDF2
- Email verification
- Session management
- CSRF protection

### Data Protection
- Input validation
- SQL injection prevention
- XSS protection
- Privacy compliance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Original ScooterTalk community
- Modern web development tools
- Open source contributors
- Electric scooter enthusiasts

---

**ScooterTalk** - An electric scooter community on a mission to stamp out transportation mediocrity. 🛴✨