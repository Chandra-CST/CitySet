# GrievanceFlow

A citizen grievance management system built with React and Vite. Citizens submit complaints, which are automatically categorized and prioritized, tracked by ID, and managed through an admin dashboard.

## Live demo

_Add your deployed link here once you've deployed (see below)._

## Features

- **Citizen portal** — submit a grievance with name, location, and description; track status later using a generated grievance ID
- **Automatic classification** — a keyword-scoring algorithm reads the description and assigns a category (Sanitation, Electricity, Water Supply, Roads & Transport, or Other), routes it to the relevant department, and flags priority (High/Medium) based on urgency language
- **Admin dashboard** — passcode-gated view showing total/pending/in-progress/resolved counts, a status and category breakdown visualized as bar charts, location-based insights (which areas report the most issues), search and filter tools, and per-grievance status updates or deletion
- **CSV export** — admins can export all grievance records as a downloadable CSV
- **Persistence** — all data is stored in the browser via `localStorage`, so it survives page refreshes

## Tech stack

React 19, Vite, plain CSS (no framework) — no backend, no external APIs; all logic is client-side JavaScript.

## Project structure

```
src/
  App.jsx              main component: all state, views, and event handlers
  index.css             all styling
  utils/classifier.js   keyword-scoring classification logic
  main.jsx              React entry point
```

## Running locally

```
npm install
npm run dev
```

## How classification works

`classifyGrievance(description)` counts how many keywords from each category's keyword list appear in the description text, and assigns whichever category scores highest — rather than stopping at the first match, so a description mentioning multiple issue types is classified by the strongest signal. Priority is flagged separately: any urgency-related keyword (e.g. "emergency," "danger") marks the grievance High priority, otherwise Medium.

## Known limitations

- **No real backend** — all data lives in the current browser's `localStorage` only. It does not sync across devices or browsers, and clearing browser data erases it.
- **Admin access is not real authentication** — the admin passcode is checked client-side, meaning it's a placeholder to demonstrate the concept of role-gating, not a secure login system.
- **Classification is rule-based, not ML** — keyword scoring is explainable and fast, but will misclassify descriptions that don't use expected keywords.

## Roadmap

1. **Backend migration** — Node/Express + MongoDB API, replacing `localStorage` with real persistence
2. **Real authentication** — JWT-based roles for citizens, admins, and department staff
3. **Notifications** — email/SMS alerts when a grievance's status changes
4. **Map integration** — plot grievance locations (Leaflet) to visually surface high-complaint areas
5. **Smarter classification** — upgrade from keyword scoring to an NLP or LLM-based classifier for higher accuracy
