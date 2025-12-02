# App Structure

This document explains the folder and file structure of the ClimaPH project using Next.js with the App Router.

## Folder Structure

ClimaPH/
├─ app/
│ ├─ layout.tsx # Root layout containing <html> and <body>
│ ├─ page.tsx # Home page component
│ ├─ components/ # Reusable UI components (buttons, cards)
│ ├─ features/ # Feature-specific components
│ └─ styles/ # Global and component-specific styles
├─ public/ # Static assets (images, icons, fonts)
├─ docs/ # Project documentation
├─ node_modules/ # Installed dependencies
├─ package.json # Project metadata and scripts
├─ tsconfig.json # TypeScript configuration
├─ .eslintrc.js # ESLint configuration
└─ .gitignore # Files and folders to ignore in Git


## Notes

- The `app/` folder is the main directory for routing using Next.js App Router.  
- Components are modular to allow easy reuse and maintainability.  
- `public/` stores static assets that can be accessed using `/asset-name` paths.  
- A `src/` folder can optionally be used, but for simplicity, all main code lives directly under `app/`.
