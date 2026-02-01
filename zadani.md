Detailed Technical Specification for the Mineralogist's Location Diary Web Application
1. Project Overview

    Purpose: Develop a simple, stable, and secure web-based application serving as a personal diary for a mineralogist (rock collector). The app allows users to manage locations where rocks/stones have been collected or are planned for visits. Key features include mapping locations on a global map (with default zoom on the Czech Republic), adding photos of finds, maintaining a mini-blog for notes, tabular views with filtering, exporting data, and color-coding points (e.g., visited, planned).
    Target User: Single or small group of users (e.g., family or hobbyists), assuming good intent. No multi-tenant scaling required.
    Deployment Environment:
        Runs on Raspberry Pi 4 (RPi4) in a home local network.
        Accessible locally via local DNS (e.g., resolved via hosts file or a local DNS server like Pi-hole).
        Also accessible remotely via VPN (e.g., WireGuard or OpenVPN setup on the RPi or home router).
        Entire application stack containerized using Docker Compose for easy deployment, management, and portability.
        Backups: Automated periodic backups of the database and uploaded files (e.g., photos) to a home NAS (Network Attached Storage). Use tools like rsync or Duplicati inside a Docker container for backups.
    High-Level Requirements:
        Web-based UI for ease of access from browsers on desktops, tablets, or mobiles.
        Authentication for security, with an option to integrate Keycloak for advanced auth (e.g., OAuth2, user management).
        Focus on simplicity: Minimalist UI, no unnecessary features.
        Stability: Robust error handling, automatic restarts via Docker, and secure practices to avoid active resets (e.g., no exposed vulnerabilities).
        Security: HTTPS enforcement (self-signed certs for local use), input validation, secure file uploads, and role-based access if multi-user.
        Performance: Optimized for RPi4's limited resources (e.g., ARM architecture compatibility, lightweight frameworks).

2. Functional Requirements

    Core Features:
        Map Integration:
            Use a global interactive map (e.g., Leaflet.js or OpenLayers for frontend, with OpenStreetMap tiles for free, offline-capable mapping).
            Default view: Zoomed to Czech Republic (center on approx. lat: 49.8, lon: 15.5, zoom level 7-8 for country overview).
            Full world coverage with unlimited zoom (up to street-level detail where available).
            Users can add, edit, delete location points (markers) via click or search.
            Markers color-coded: e.g., green for visited/collected, yellow for planned, red for archived/unsuccessful. Configurable via UI.
            Clustering for dense areas to avoid UI clutter.
            Display popups on markers showing summary: location name, date visited, photo thumbnails, mini-blog snippet.
        Location Management:
            CRUD (Create, Read, Update, Delete) for locations: Each location has fields like name, coordinates (lat/lon), date visited/planned, description (mini-blog as rich text), associated finds (rocks/stones with names/types).
            Add photos: Upload multiple images per location (e.g., JPEG/PNG, max 5MB each, stored in filesystem).
            Mini-blog: Simple rich-text editor (e.g., Quill.js or Markdown support) for notes per location.
        Tabular Views and Filtering:
            List view: Table showing all locations with columns (name, date, status, coordinates, number of photos, excerpt from blog).
            Filtering: By date range, status (visited/planned), keyword search in name/description, proximity (e.g., within X km of a point).
            Sorting: By date, name, etc.
            Pagination for large datasets (though expected to be small).
        Exports:
            Export locations to formats like GeoJSON, KML (for Google Earth/Maps), CSV.
            Include options to filter exports (e.g., only planned locations).
            Export photos as ZIP archive per location or all.
    Additional Features:
        User Authentication: Basic login/logout. Option to integrate Keycloak for SSO, roles (admin/user), and secure token-based auth.
        Dashboard: Home page with map as primary view, sidebar/router links to list view, add new location, exports, settings.
        Routing: Single Page Application (SPA) with client-side routing (e.g., React Router) for pages like: /map, /locations, /location/:id (detail view with photos/blog), /exports, /settings.
        Backup Integration: Script or cron job in Docker to backup DB and files to NAS (mounted as volume or via network share).
        Offline Considerations: Map tiles cachable for offline use if possible (e.g., via service workers), but core app requires network for DB access.
    Non-Functional Requirements:
        Usability: Intuitive UI, mobile-responsive (use Bootstrap or Tailwind CSS).
        Accessibility: Basic WCAG compliance (alt texts for images, keyboard navigation).
        Internationalization: Support Czech language by default (UI strings in Czech, with English fallback).
        Data Volume: Assume <1000 locations, <10GB photos total; optimize storage.

3. Technical Stack

    Backend:
        Language/Framework: Python with FastAPI (lightweight, async, good for RPi) or Node.js with TypeScript/Express (if preferring JS ecosystem). Avoid C#/.NET for RPi compatibility (though possible with .NET 8 ARM support, Python/Node are lighter).
        Database: PostgreSQL (PG) with PostGIS extension for geospatial queries (e.g., proximity filtering).
        API: RESTful endpoints (e.g., /api/locations, /api/upload-photo). Use JWT for auth if not using Keycloak.
        File Storage: Store photos in a mounted volume (e.g., /app/uploads) for persistence.
    Frontend:
        Framework: React.js with TypeScript for type safety and maintainability.
        Map Library: Leaflet.js (free, lightweight) with plugins for markers, clustering, geocoding (via Nominatim for address search).
        UI Components: Material-UI or Ant Design for pre-built components (tables, forms, modals).
        State Management: Redux or Context API for managing locations data.
        Rich Text: React-Quill for mini-blog.
    Authentication:
        Integrate Keycloak as a separate Docker service for OIDC/OAuth2. Frontend redirects to Keycloak for login, uses access tokens for API calls.
        Fallback: Simple username/password with bcrypt hashing if Keycloak is overkill.
    Containerization:
        Docker Compose: Services for frontend (Node build/serve), backend (Python/Node), DB (Postgres), Keycloak (optional), and Nginx/Apache as reverse proxy for HTTPS.
        Volumes: Mount /data/db for PG data, /data/uploads for photos (persistent across restarts).
        ARM Compatibility: Use ARM64 images (e.g., postgres:alpine, node:alpine).
    Security Practices:
        Input Sanitization: Validate all user inputs (e.g., via Pydantic in FastAPI or Joi in Express).
        File Uploads: Scan for viruses if possible (e.g., ClamAV in Docker), restrict file types/sizes.
        HTTPS: Self-signed certs via Let's Encrypt or mkcert for local.
        Rate Limiting: On API to prevent abuse.
        Secrets: Use Docker secrets or .env for keys/passwords.
        Logging: Centralized logs (e.g., via ELK lite or just file-based) for monitoring.
        Avoid Resets: Health checks in Docker Compose for auto-restart, idempotent migrations.
    Backup and Recovery:
        DB Backup: pg_dump cron job to NAS (e.g., via SMB/NFS mount).
        Files Backup: rsync uploads folder to NAS.
        Schedule: Daily automated, with retention (e.g., 7 days).
    Development and Testing:
        Version Control: Git for code.
        Testing: Unit tests (Jest/Pytest), integration tests for API, e2e with Cypress.
        CI/CD: Simple GitHub Actions or local scripts for building Docker images.
    Performance Optimizations for RPi4:
        Lightweight containers (Alpine base).
        Limit CPU/Memory in Compose (e.g., 2GB RAM cap).
        Cache map tiles locally if using offline maps.
        Async operations for uploads/exports.

4. Architecture Diagram (Text-Based)

[Browser (User)] <-> [VPN/Local Network] <-> [Nginx Reverse Proxy (HTTPS)]
                                        |
                                        v
[Frontend Container (React/TS)] <-> [Backend Container (FastAPI/Python or Express/TS)]
                                        |
                                        v
[PostgreSQL Container (with PostGIS)] <-> [Mounted Volume (/data/db)]
                                        |
                                        v
[Uploads Volume (/data/uploads)] <-> [Backup Cron Container] <-> [Home NAS]
[Keycloak Container (Optional)] <-> [Backend for Auth]

5. Implementation Steps

    Set up Docker Compose skeleton with services.
    Implement DB schema: Tables for users, locations (with geometry column), photos, blogs.
    Build backend API endpoints.
    Develop frontend: Map component, forms, tables.
    Integrate auth (Keycloak).
    Add exports and filtering logic.
    Configure backups and security.
    Test on RPi4 hardware.
    Deploy and monitor.

6. Potential Challenges and Mitigations

    RPi Resource Limits: Monitor with tools like Prometheus; optimize queries.
    Map Data: Use free OSM; if needed, cache for offline.
    Security: Regular updates to Docker images.
    Scalability: Not required, but design for easy extension.

This spec provides a comprehensive blueprint. Adjustments can be made based on exact preferences (e.g., switch to Python backend).
Prompt for LLM to Fulfill the Entire Task

"Act as an expert full-stack developer specializing in web applications for IoT devices like Raspberry Pi. Your task is to generate the complete source code, configuration files, and setup instructions for the mineralogist's location diary app based on this detailed technical specification: [Paste the entire Detailed Technical Specification above here]. Use Python with FastAPI for the backend (as it's lightweight and suitable for RPi), React with TypeScript for the frontend, PostgreSQL with PostGIS for the DB, Leaflet.js for maps, and integrate Keycloak for authentication. Include a full Docker Compose file with all services, including volumes for persistence and a backup script container using rsync to a NAS (assume NAS path as /mnt/nas/backups). Make the app stable, simple, and secure: implement input validation, HTTPS via Nginx, JWT auth fallback if Keycloak fails, color-coded markers (green=visited, yellow=planned), photo uploads with resizing, mini-blog with Markdown, tabular lists with filtering/sorting/pagination using React Table, exports to GeoJSON/CSV/ZIP, and full map zoom on Czech Republic default. Provide the code in a structured ZIP-like format (e.g., describe folder structure and file contents). Include setup instructions for running on RPi4, including local DNS configuration (e.g., via /etc/hosts) and VPN access notes. Ensure ARM compatibility and no external dependencies beyond what's in the spec. Finally, explain any design choices and how it meets all requirements."