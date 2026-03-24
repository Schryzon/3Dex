# VPS and MinIO Setup Guide

This guide details the process of hosting a private, S3-compatible storage solution using MinIO on a VPS.

---

## Table of Contents
- [Objective](#objective)
- [Prerequisites](#prerequisites)
- [1. Security Configuration](#1-security-configuration-ufw-and-tailscale)
- [2. Deploy MinIO via Docker](#2-deploy-minio-via-docker)
- [3. Connectivity Verification](#3-connectivity-verification)
- [4. Backend Configuration](#4-backend-configuration)
- [5. Deployment Test](#5-deployment-test)

---

## Objective
- Host MinIO on a VPS.
- Restrict access to the Tailscale network for enhanced security.
- Configure the local backend to connect to the MinIO instance.

---

## Prerequisites
- VPS with Docker installed.
- Tailscale installed and configured on both the VPS and the local development machine.
- Sufficient storage space on the VPS.

---

## 1. Security Configuration (UFW and Tailscale)

To ensure the MinIO instance is not exposed to the public internet, we will restrict access to the Tailscale interface.

**On the VPS:**
1. Identify the Tailscale interface:
   ```bash
   ip addr show tailscale0
   ```
2. Allow traffic on the Tailscale interface:
   ```bash
   sudo ufw allow in on tailscale0
   ```
   *Alternatively, specify the MinIO ports (9000 for API, 9001 for Console):*
   ```bash
   sudo ufw allow in on tailscale0 to any port 9000 proto tcp
   sudo ufw allow in on tailscale0 to any port 9001 proto tcp
   ```

---

## 2. Deploy MinIO via Docker

Deploy MinIO with data persistence to a local directory on the VPS (e.g., `~/minio/data`).

**On the VPS:**
```bash
# Create the data directory
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
docker logs minio
```

---

## 3. Connectivity Verification

**On the Local Machine:**
1. Identify the VPS Tailscale IP (e.g., `100.10.20.30`).
2. Navigate to `http://100.10.20.30:9001` in a web browser.
3. Log in with the configured credentials.
4. **Create a Bucket**:
   - Navigate to "Buckets" -> "Create Bucket".
   - Name: `3dex-models`.
   - **Access Policy**: It is recommended to keep the bucket private. The backend application will generate signed URLs for secure access.

---

## 4. Backend Configuration

Update the local backend configuration to point to the VPS-hosted MinIO instance.

**apps/backend/.env**:
```env
# Storage Configuration
STORAGE_ENDPOINT="http://100.10.20.30:9000"  
STORAGE_ACCESS_KEY="admin"
STORAGE_SECRET_KEY="YourSecurePassword"
STORAGE_BUCKET="3dex-models"
```

---

## 5. Deployment Test
1. Restart the backend application.
2. Utilize the `POST /storage/upload-url` endpoint to verify connectivity.
3. Upload a test file and confirm its presence in the MinIO Console.
