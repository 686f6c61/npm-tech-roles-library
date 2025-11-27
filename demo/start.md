# Tech Roles Library - Demo Guide

> **@sparring/tech-roles-library** - Interactive Demo
> A comprehensive library for managing technical roles, career levels, and competency frameworks.
> 78 technical roles × 9 career levels with bilingual support (EN/ES)

This guide explains how to run the interactive browser demo for the Tech Roles Library.

## Prerequisites

- Node.js installed on your system
- Basic command line knowledge

## Running the demo

The demo requires a local HTTP server because it uses `fetch()` to load data files, which doesn't work with the `file://` protocol due to CORS restrictions.

Navigate to the demo directory and start the included server:

```bash
cd demo
node server.js
```

The demo will be available at `http://localhost:3000`

## Using the demo

Once the server is running:

1. Open your browser and go to `http://localhost:3000`
2. Select your preferred language (English/Spanish)
3. Browse roles using the search, category filter, or show all options
4. Click on any role in the table to see detailed competencies
5. Explore career paths and next level requirements

## Stopping the server

Press `Ctrl+C` in the terminal where the server is running.

## Troubleshooting

### Port already in use

If port 3000 is already in use:

1. Find the process using the port:
```bash
lsof -ti:3000
```

2. Kill the process:
```bash
kill -9 <PID>
```

3. Or edit `server.js` and change the PORT constant to a different port (e.g., 8080)

### Files not loading

Make sure you're in the `demo` directory when starting the server. The server needs to be in the same directory as `index.html` and `bundle-data.json`.

### CORS errors

These occur when trying to open `index.html` directly in the browser. Always use the server to avoid CORS restrictions.

---

## About the Demo

The interactive demo showcases the complete Tech Roles Library functionality:

- **78 Technical Roles** across multiple categories
- **9 Career Levels** (L1 Trainee → L9 Visionary)
- **Bilingual Support** (English/Spanish)
- **Complete Competency Framework** (Core, Complementary, Indicators)
- **Career Progression Paths**
- **Experience-Based Recommendations**

## Links

- **NPM Package**: [@sparring/tech-roles-library](https://www.npmjs.com/package/@sparring/tech-roles-library)
- **GitHub Repository**: [npm-tech-roles-library](https://github.com/686f6c61/npm-tech-roles-library)
- **Author**: 686f6c61
- **License**: MIT

---

*For full documentation and API reference, see the main README.md in the repository root.*
