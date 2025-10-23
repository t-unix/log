# log

A simple, open-source asset management application for organizations. Track assets, loan events, log issues, and attach photos.

Badges
- CI | Coverage | License (add your badges here)

Summary
- Manage organizational assets, loan/checkout items to members, maintain a logbook of usage and issues, and attach photos captured from devices.
- Supports common OAuth providers and role-based access control.

Features
- Asset catalog with metadata and photos
- Loan/checkout and return tracking (logbook)
- Issue reporting attached to assets or log entries
- Photo capture from device and attachment to assets/log entries
- OAuth providers: Apple, GitHub, Google
- Role-based access control per organization

Quick start (development)
Requirements:
- Docker & docker-compose (recommended) or native runtime for the project's stack
- VS Code dev container (Ubuntu 24.04.2 LTS)

Example (Docker)
1. Build and run:
   $ docker-compose up --build
2. Open in browser:
   $BROWSER http://localhost:3000

Configuration (example .env)
APP_HOST=0.0.0.0
APP_PORT=3000
DATABASE_URL=postgres://user:pass@db:5432/log
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
APPLE_CLIENT_ID=...
APPLE_CLIENT_SECRET=...

Authentication
- OAuth support for Apple, GitHub, and Google.
- Provide client IDs/secrets via environment variables or a secrets manager.

Development & testing
- Install dependencies:
  $ npm install   # or the project-specific command
- Run development server:
  $ npm run dev
- Run tests:
  $ npm test
- Lint:
  $ npm run lint

Contributing
- See CONTRIBUTING.md for contribution guidelines.
- Fork, create a feature branch, add tests, open a PR.

License
- Add a LICENSE file (e.g., MIT) and update badge above.

Maintainers / Contact
- Add maintainer contact info or project team details.

Notes
- Consider adding screenshots, a demo link, CI status, and more detailed deployment instructions.