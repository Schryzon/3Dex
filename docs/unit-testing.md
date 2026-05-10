# Unit Testing Strategy for 3Dex

This document outlines the unit testing strategy and available tools for the 3Dex application. Our testing environment ensures robust code quality across both the frontend and the backend. We prioritize **determinism** and **flat logic** in our tests—if a component fails, the test should pinpoint exactly why without digging through layers of nested assertions.

---

## Overview

We use **Jest** as the primary test runner and assertion framework across the entire monorepo. This allows a unified testing experience whether you are writing UI component tests or backend API assertions.

- **Frontend (`apps/frontend`)**: Tests are run using `jest`, together with `@testing-library/react` and `@testing-library/jest-dom` for component testing.
- **Backend (`apps/backend`)**: Tests are executed via `jest` and `ts-jest`. We also utilize `supertest` for e2e-like HTTP API layer testing.

---

## Backend Testing (`apps/backend`)

The backend test suite focuses on middleware interactions, route behaviors (via `supertest`), and verifying utility functions (e.g. mocking AWS S3 interactions in storage tests).

### Where to Write Tests
Backend test files should be placed inside `apps/backend/src/__tests__/` and suffixed with `.test.ts`. Tests for specific services can be co-located (e.g., `user.service.test.ts`).

### Running Backend Tests
Navigate to the backend directory:
```bash
cd apps/backend
npm run test
```
*(Appending `-- --watch` allows you to develop iteratively).*

### Mocking the Database (Prisma)
Do not hit the real PostgreSQL database in unit tests. We use `jest-mock-extended` to mock the Prisma Client.
```typescript
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import prisma from '../lib/prisma';

jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
});

test('should fetch a user', async () => {
  const user = { id: '1', email: 'test@example.com', /* ... */ };
  prismaMock.user.findUnique.mockResolvedValue(user);

  // Call service and assert
});
```

### Mocking External Services (e.g. AWS S3)
For services that interact with external layers (like Minio/S3 storage or Midtrans), we strictly mock the APIs. 
```typescript
jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn(() => ({
      send: jest.fn().mockResolvedValue({}),
    })),
    PutObjectCommand: jest.fn(),
  };
});
```

---

## Frontend Testing (`apps/frontend`)

Frontend testing revolves heavily around rendering components successfully and ensuring that state logic (like authentication context or filter lists) behaves correctly.

### Where to Write Tests
Frontend test environments are configured using `jest.setup.js` and `jest.config.js`. Generally, place tests adjacent to the components or features they cover, or within a designated `__tests__` folder. Always suffix test files with `.test.ts` or `.test.tsx`.

### Running Frontend Tests
Navigate to the frontend directory:
```bash
cd apps/frontend
npm run test
```

### Testing Components (React Testing Library)
Ensure that you correctly mock Next.js routers (`next/navigation`) and any API calls made via Axios or React Query. Use React Testing Library's `render` and `screen` utilities to verify accessibility roles and component presence in the DOM.

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return { push: jest.fn() };
  },
}));

test('renders button and handles click', async () => {
  const onClickMock = jest.fn();
  render(<Button onClick={onClickMock}>Click Me</Button>);
  
  const button = screen.getByRole('button', { name: /click me/i });
  expect(button).toBeInTheDocument();
  
  await userEvent.click(button);
  expect(onClickMock).toHaveBeenCalledTimes(1);
});
```

---

## CI / CD Pipeline

All pull requests and merges to active branches should ideally pass the automated testing suite. Before you create a PR, always manually invoke both test scripts locally to verify your changes did not inadvertently break other components or endpoints.

### Error Handling Philosophy in Tests
If a test is designed to verify a failure state (e.g., "User not found"), ensure the code gracefully handles the error or explicitly throws a predictable error class.

**Good:**
```typescript
await expect(userService.getUserById('999')).rejects.toThrow(NotFoundError);
```
