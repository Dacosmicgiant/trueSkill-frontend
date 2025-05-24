# trueSkill - Skills-Based Hiring Platform

trueSkill is a comprehensive skills-based hiring platform designed for HR professionals and recruiters. The platform helps evaluate candidates based on their actual projects, technical skills, and soft skills.

## Features

- **Project Authenticity Verification**: Analyze repositories and generate questions to verify project understanding
- **Technical Skill Assessment**: Evaluate code quality, tech stack compatibility, and open-source contributions
- **Soft Skills Assessment**: Social media analysis and online group discussion evaluation
- **Candidate Recommendation System**: Tech stack-based matching and comprehensive scoring
- **Job Posting Management**: Shareable links and Google Drive integration for CV collection

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/your-username/trueSkill.git
   cd trueSkill/frontend
   ```

2. Install dependencies

   ```bash
   npm install
   # or
   yarn
   ```

3. Add Tailwind CSS and configuration

   ```bash
   npm install -D tailwindcss postcss autoprefixer @tailwindcss/forms
   # or
   yarn add -D tailwindcss postcss autoprefactor @tailwindcss/forms
   ```

4. Create a `postcss.config.js` file in the root directory

   ```javascript
   export default {
     plugins: {
       tailwindcss: {},
       autoprefixer: {},
     },
   };
   ```

5. Create a `public` directory and save the logo.svg file there

### Development

Start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

### Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

## Project Structure

```
frontend/
├── public/               # Static assets
│   └── logo.svg          # Application logo
├── src/
│   ├── assets/           # Images, icons, etc.
│   ├── components/       # Reusable UI components
│   │   ├── common/       # Buttons, inputs, cards, etc.
│   │   ├── layout/       # Header, footer, sidebar
│   │   └── ...
│   ├── context/          # React context for state management
│   │   └── AuthContext.jsx # Authentication context
│   ├── pages/            # Main application pages
│   │   ├── Auth/         # Login and registration
│   │   ├── Candidates/   # Candidate listings and analysis
│   │   ├── Dashboard/    # Main dashboard view
│   │   ├── Jobs/         # Job creation and listings
│   │   └── ...
│   ├── App.jsx           # Main application component
│   └── main.jsx          # Application entry point
├── tailwind.config.js    # Tailwind configuration
└── package.json          # Dependencies
```

## Technologies Used

- **React**: Frontend library for building UI
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Headless UI**: Unstyled, accessible UI components
- **Chart.js**: Interactive charts and visualizations
- **React Syntax Highlighter**: Code syntax highlighting

## Next Steps

- Implement backend API using Node.js/Express or another technology of your choice
- Add real authentication and authorization
- Connect to GitHub API for repository analysis
- Implement Google Drive API integration for CV collection
- Add social media API integrations for candidate analysis
- Create an admin panel for system management

hi my name is aditya
