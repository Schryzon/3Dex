# Unit Testing Strategy for 3Dex

This document outlines the unit testing strategy and available tools for the 3Dex application. Our testing environment ensures robust code quality across both the frontend and the backend.

## Overview

We use **Jest** as the primary test runner and assertion framework across the entire monorepo. This allows a unified testing experience whether you are writing UI component tests or backend API assertions.

- **Frontend (`apps/frontend`)**: Tests are run using `jest`, together with `@testing-library/react` and `@testing-library/jest-dom` for component testing.
- **Backend (`apps/backend`)**: Tests are executed via `jest` and `ts-jest`. We also utilize `supertest` for e2e-like HTTP API layer testing.

---

## Backend Testing (`apps/backend`)

The backend test suite focuses on middleware interactions, route behaviors (via `supertest`), and verifying utility functions (e.g. mocking AWS S3 interactions in storage tests).

### Where to write tests
Backend test files should be placed inside `apps/backend/src/__tests__/` and suffixed with `.test.ts`.

### Running Backend Tests
1. Navigate to the backend directory:
   ```bash
   cd apps/backend
   ```
2. Run the test suite:
   ```bash
   npm run test
   ```
   *(Appending `-- --watch` allows you to develop iteratively).*

### Mocking External Services (e.g. AWS S3)
For services that interact with external layers (like Minio/S3 storage or Midtrans), we strictly mock the APIs. By utilizing Jest's mocking mechanisms (e.g., `jest.mock('@aws-sdk/client-s3')`), we ensure that unit tests do not rely on a live server and run deterministically.

---

## Frontend Testing (`apps/frontend`)

Frontend testing revolves heavily around rendering components successfully and ensuring that state logic (like authentication context or filter lists) behaves correctly.

### Where to write tests
Frontend test environments are configured using `jest.setup.js` and `jest.config.js`. Generally, place tests adjacent to the components or features they cover, or within a designated `__tests__` folder. Always suffix test files with `.test.ts` or `.test.tsx`.

### Running Frontend Tests
1. Navigate to the frontend directory:
   ```bash
   cd apps/frontend
   ```
2. Run the test suite:
   ```bash
   npm run test
   ```

### Mocking Component State
When testing Next.js pages or features, ensure that you correctly mock Next.js routers (`next/navigation`) and any API calls made via Axios or React Query. Use React Testing Library's `render` and `screen` utilities to verify accessibility roles and component presence in the DOM.

---

## CI / CD Pipeline

All pull requests and merges to active branches should ideally pass the automated testing suite. Before you create a PR, always manually invoke both test scripts locally to verify your changes did not inadvertently break other components or endpoints.
