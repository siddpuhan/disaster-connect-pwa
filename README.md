# Disaster Connect

An offline-first emergency communication Progressive Web App (PWA) designed to function in disaster-affected areas without requiring an active internet connection, cell towers, or centralized infrastructure. 

## Features

- **No Internet Needed**: Direct device-to-device messaging using WebRTC. Connect via local WiFi, ad-hoc networks, or mesh setups.
- **Everything Saved Locally**: Critical messages, locations, and resource offers/needs are safely stored directly on your device using IndexedDB. 
- **Auto-Sync When Back Online**: The moment connectivity is restored, data is silently and automatically synced to the cloud.
- **Resource Exchange Mockup**: Allows users to post `NEED` (e.g., Food, Water, Medicine) and `OFFER` (e.g., Shelter, First Aid, Transport) boards.
- **PWA Ready**: Installable as a native-like app on Android and iOS. Built with a Service Worker that uses a Network-First strategy to guarantee offline availability while keeping the UI up-to-date.

## Tech Stack

- **React / Vite**: Fast, modern frontend.
- **Service Workers**: Enables offline functionality and local caching.
- **IndexedDB**: Persistent local storage ensuring zero data loss during power/network outages.
- **WebRTC** (Mocked in Phase 1): Peer-to-peer connections for device discovery and messaging.

## Getting Started

To run the application locally for development:

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`. 

> **Important during development:** Ensure your DevTools "Update on reload" setting for Service Workers is checked, or clear the cache manually if you encounter stale views.

## Built for Resiliency

Disaster Connect was heavily inspired by the necessity of humanitarian aid coordination in areas affected by floods, earthquakes, cyclones, and sweeping power outages. It's built for the moments when everything else fails.
