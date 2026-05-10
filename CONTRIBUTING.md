# Contributing to 3Dēx

First off, thank you for considering contributing to 3Dēx! We welcome community contributions to make this platform the best ecosystem for 3D artists and printing providers.

## The Mental Model
We write code like system designers. We prioritize:
- **Readability over cleverness**: Flat logic over deeply nested conditionals.
- **Predictability**: Use `snake_case` for database fields, API payloads, and system-level variables.
- **Optimistic Error Handling**: Don't swallow errors. Let things crash loudly in development so we can fix the root cause.

## Git Workflow
We strictly adhere to a feature-branch workflow. **Never push directly to the `master` branch.**

1. **Checkout the dev branch**
   ```bash
   git checkout dev
   git pull origin dev
   ```
2. **Create a new feature branch**
   Name your branch descriptively based on the task: `feat/cart-checkout`, `fix/login-crash`, `chore/deps-update`.
   ```bash
   git checkout -b feat/your-task-name
   ```
3. **Commit your changes**
   Keep pull requests small and focused. Write clear, imperative commit messages.
   ```bash
   git commit -m "Add Midtrans payment integration to cart"
   ```
4. **Push and create a Pull Request**
   ```bash
   git push origin feat/your-task-name
   ```
   Open a Pull Request against the `dev` branch. Ensure your code passes all linting and unit tests.

## Local Environment
Never commit your `.env` files. If you need to add a new environment variable for a feature, add it to `.env.example` and note it in your PR description.
Do not share your local PostgreSQL database dumps in the repository. Use Prisma seed files for test data.

## Bug Reports and Feature Requests
Please use the GitHub Issue Tracker. When reporting a bug, include:
- A clear description of the issue.
- Steps to reproduce the behavior.
- Expected vs. actual behavior.
- Screenshots or console logs if applicable.

Thank you for contributing to 3Dēx!
