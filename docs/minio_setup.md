# VPS and MinIO Setup Guide

This guide details the process of hosting a private, S3-compatible storage solution using MinIO on a VPS. This replaces AWS S3 for local development and self-hosted production deployments, drastically reducing bandwidth costs for heavy 3D assets.

---

## Table of Contents
- [Objective](#objective)
- [Prerequisites](#prerequisites)
- [1. Security Configuration (UFW and Tailscale)](#1-security-configuration-ufw-and-tailscale)
- [2. Deploy MinIO via Docker](#2-deploy-minio-via-docker)
- [3. Connectivity Verification](#3-connectivity-verification)
- [4. MinIO Client (mc) & IAM Policies](#4-minio-client-mc--iam-policies)
- [5. Backend Configuration](#5-backend-configuration)
- [6. Deployment Test & Troubleshooting](#6-deployment-test--troubleshooting)

---

## Objective
- Host MinIO on a VPS to act as the primary blob storage for 3D files and user avatars.
- Restrict access strictly to the Tailscale overlay network for enhanced zero-trust security.
- Configure the local backend to connect to the MinIO instance and generate Presigned URLs.

---

## Prerequisites
- **VPS**: A Linux VPS (Ubuntu/Debian recommended) with Docker and Docker Compose installed.
- **Tailscale**: Tailscale must be installed, authenticated, and running on both the VPS and the local development machine.
- **Storage**: Sufficient block storage space on the VPS (minimum 50GB recommended for 3D assets).
- **Domains**: Optionally, a domain name if you plan to proxy MinIO through Cloudflare later.

---

## 1. Security Configuration (UFW and Tailscale)

To ensure the MinIO instance is not exposed to the public internet and brute-force attacks, we will restrict access solely to the Tailscale interface (`tailscale0`).

**On the VPS:**
1. Identify the Tailscale interface:
   ```bash
   ip addr show tailscale0
   ```
2. Enable UFW (Uncomplicated Firewall) if not already active:
   ```bash
   sudo ufw enable
   ```
3. Allow SSH (ensure you don't lock yourself out) and restrict MinIO ports to the Tailscale interface:
   ```bash
   sudo ufw allow ssh
   sudo ufw allow in on tailscale0 to any port 9000 proto tcp
   sudo ufw allow in on tailscale0 to any port 9001 proto tcp
   ```
4. Reload the firewall:
   ```bash
   sudo ufw reload
   ```

---

## 2. Deploy MinIO via Docker

Deploy MinIO with data persistence to a local directory on the VPS (e.g., `/mnt/volume1/minio/data`).

**On the VPS:**
```bash
# Create the data directory (Use your largest mounted volume)
mkdir -p ~/minio/data

# Start the MinIO container
docker run -d \
  --name minio \
  --restart always \
  -p 9000:9000 \
  -p 9001:9001 \
  -v ~/minio/data:/data \
  -e "MINIO_ROOT_USER=admin" \
  -e "MINIO_ROOT_PASSWORD=YourSecurePassword" \
  quay.io/minio/minio server /data --console-address ":9001"
```

Verify the container status:
```bash
docker logs minio -f
```
Ensure you see the "Endpoint" logs indicating it is listening on `:9000` and `:9001`.

---

## 3. Connectivity Verification

**On the Local Development Machine:**
1. Identify the VPS Tailscale IP (e.g., `100.10.20.30`) using `tailscale ip -4` or the Tailscale Admin Console.
2. Navigate to `http://100.10.20.30:9001` in a web browser. You should see the MinIO login screen.
3. Log in with the `MINIO_ROOT_USER` and `MINIO_ROOT_PASSWORD`.
4. **Create a Bucket**:
   - Navigate to "Buckets" -> "Create Bucket".
   - Name: `3dex-models`.
   - **Access Policy**: Keep the bucket **Private**. The backend application will generate signed URLs for secure, temporary access to files. Do not set it to Public unless you want unauthorized scraping.

---

## 4. MinIO Client (mc) & IAM Policies

For advanced management, install the MinIO Client (`mc`) on your local machine.

```bash
# Install mc (macOS example)
brew install minio/stable/mc

# Alias your VPS MinIO instance
mc alias set myminio http://100.10.20.30:9000 admin YourSecurePassword
```

### Creating a Service Account
Using the root credentials in your backend `.env` is a bad practice. Create a dedicated Service Account:
1. In the MinIO Console, go to **Access Keys** -> **Create Access Key**.
2. Give it the `readwrite` policy.
3. Save the generated Access Key and Secret Key for your backend configuration.

---

## 5. Backend Configuration

Update the local backend configuration (`apps/backend/.env`) to point to the VPS-hosted MinIO instance. Use the Tailscale IP and the Service Account credentials you just created.

```env
# Storage Configuration
STORAGE_ENDPOINT="http://100.10.20.30:9000"  
STORAGE_ACCESS_KEY="your_service_access_key"
STORAGE_SECRET_KEY="your_service_secret_key"
STORAGE_BUCKET="3dex-models"
```

Ensure your `storage.service.ts` uses the S3 SDK correctly:
```typescript
import { S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  endpoint: process.env.STORAGE_ENDPOINT,
  region: 'us-east-1', // MinIO defaults to this
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY,
    secretAccessKey: process.env.STORAGE_SECRET_KEY,
  },
  forcePathStyle: true, // REQUIRED FOR MINIO
});
```

---

## 6. Deployment Test & Troubleshooting

### Testing the Upload Flow
1. Restart the backend Express application.
2. Utilize the frontend (or Postman) to hit the `POST /storage/upload-url` endpoint to generate a presigned URL.
3. Execute a `PUT` request directly to the presigned URL with a test file (e.g., an image or a `.glb` file).
4. Check the MinIO Console to confirm the file exists in the `3dex-models` bucket.

### Common Issues
- **`SignatureDoesNotMatch` Error**: This usually means `forcePathStyle: true` is missing in the `S3Client` config. AWS S3 uses virtual-hosted-style URLs by default (`bucket.endpoint.com`), while MinIO often requires path-style URLs (`endpoint.com/bucket`).
- **Connection Refused (`ECONNREFUSED`)**: Ensure Tailscale is connected on both devices. Try pinging the VPS Tailscale IP from your local machine: `ping 100.10.20.30`.
- **CORS Error on Direct Upload**: If the frontend uploads directly to MinIO, you must configure CORS on the MinIO bucket.
  - In MinIO Console: Go to Buckets > `3dex-models` > Summary > Edit CORS.
  - Or via `mc` command: `mc cors set myminio/3dex-models policy.json`
