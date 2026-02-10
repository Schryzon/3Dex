module.exports = {
  apps: [
    {
      name: "3dex-api",
      cwd: "apps/backend",
      script: "dist/app.js",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "3dex-frontend",
      cwd: "apps/frontend",
      script: "npm",
      args: "run start",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
