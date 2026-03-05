# GuideCodex Frontend

React frontend for the GuideCodex multi-game guide platform.

GuideCodex allows users to create and manage game guides using a built-in CMS.

Live sites:
https://guidecodex.com (multi-game)
https://luckydefenseguides.com (single-game)

## Features

- Dynamic routing between multiple games
- CMS-driven page rendering
- Admin editing tools
- Customizable navigation system

## Tech Stack

- React
- React Router
- Vite
- TailwindCSS
- Express backend API

## Architecture

The frontend communicates with a separate Express API backend that handles authentication, CMS content management, and database access.

Core architecture concepts:

- **React Router loaders** are used for data fetching before route rendering.
- **CMS blocks** are rendered dynamically based on database-driven content.
- **Game-based routing** allows multiple games to exist within the same platform using dynamic route parameters.
- **Admin routes** are protected and expose CMS management tools for editing site content.

## Getting Started

Clone the repository:

```bash
git clone https://github.com/ghidbase/guide-site-frontend
cd guide-site-frontend
npm install
npm run dev
```

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_SERVER=https://api.luckydefenseguides.com
```

## Structure

Work in progress — documentation will be added as the project stabilizes.

## Git Collaboration Workflow

Work in progress — documentation for branch and merge workflow will be added soon.
