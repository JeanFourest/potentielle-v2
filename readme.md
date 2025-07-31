# Potentielle v2 🎵

A sophisticated Discord bot with music streaming capabilities and news features. Potentielle is a charismatic bot with a unique personality.

## Features

### 🎵 Music Player

- **Play music** from various sources (YouTube, Spotify, SoundCloud, Apple Music, Vimeo)
- **Queue management** - add, view, and manage song queues
- **Playback controls** - play, pause, skip, shuffle, loop
- **Now playing** - display current track information
- **Voice channel integration** - seamless audio streaming

### 📰 News System

- Automated news updates and management
- Database-backed news storage with PostgreSQL
- Scheduled news delivery via cron jobs

### 🤖 AI Integration

- OpenAI-powered responses with custom personality
- Sardonic wit and dark humor in interactions
- Regal and mysterious character traits

## Tech Stack

- **Node.js** - Runtime environment
- **Discord.js v14** - Discord API wrapper
- **Discord Player v7** - Music streaming functionality
- **PostgreSQL** - Database for news and data storage
- **Docker** - Containerized deployment
- **OpenAI API** - AI-powered responses

## Project Structure

```
src/
├── index.js                 # Main bot entry point
├── commands/               # Slash commands
│   ├── play.js            # Music playback
│   ├── queue.js           # Queue management
│   ├── pause.js           # Playback control
│   ├── skip.js            # Skip tracks
│   ├── shuffle.js         # Shuffle queue
│   ├── loop.js            # Loop modes
│   ├── nowplaying.js      # Current track info
│   ├── news.js            # News commands
│   └── ping.js            # Bot status
├── events/                # Discord event handlers
├── db/                    # Database configuration
├── scripts/               # Utility scripts
└── utils/                 # Helper functions
```

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Discord Bot Token
- OpenAI API Key (optional for AI features)

### Environment Setup

Create a `.env` file with your configuration:

```env
OPENAI_TOKEN="your_openai_api_key"
TOKEN="your_discord_bot_token"
CLIENT_ID="your_discord_client_id"
GUILD_ID="your_discord_guild_id"

#database
PGHOST=""
PGUSER=""
PGPASSWORD=""
PGDATABASE=""
PGPORT=""
```

### Docker Commands

Start all services:

```bash
docker-compose up
```

Start in background (detached mode):

```bash
docker-compose up -d
```

Stop all services:

```bash
docker-compose down
```

Stop and remove containers, networks, and volumes:

```bash
docker-compose down -v
```

Build or rebuild services:

```bash
docker-compose build
```

Start services and rebuild if needed:

```bash
docker-compose up --build
```

Force rebuild without cache:

```bash
docker-compose build --no-cache
```

### Database Management

Connect to PostgreSQL database:

```bash
docker exec -it <docker container database> psql -U postgres -d <database_name>
```

Check database tables:

```sql
\dt -- List all tables
\d news -- Check news table structure
```

## Development

### Install Dependencies

```bash
npm install
```

### Run Locally

```bash
npm start
```

### Deploy Commands

```bash
npm run deploy-commands
```

## Commands

- `/play <song>` - Play music from various sources
- `/queue` - View current music queue
- `/pause` - Pause/resume playback
- `/skip` - Skip current track
- `/shuffle` - Shuffle queue
- `/loop` - Toggle loop modes
- `/nowplaying` - Show current track
- `/news` - News-related commands
- `/ping` - Check bot status
