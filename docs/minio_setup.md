# ☁️ VPS & MinIO Setup Guide

So you want to host your own "S3" on your VPS, securily? Let's do this.

## 🎯 Objective
- Host MinIO (S3 compatible storage) on your VPS.
- Make it accessible **ONLY** via Tailscale (secure, no public internet exposure).
- Connect your local backend to it.

---

## 🛠️ Prerequisites
- **VPS** with Docker installed.
- **Tailscale** installed and running on both the VPS and your local machine.
- **SSD** storage mounted (or just enough space on root).

---

## 1️⃣ Security First (UFW + Tailscale)

Since only port 22 is open, we need to allow MinIO ports (9000 & 9001) but **ONLY** for the Tailscale interface. This keeps it invisible to the public internet.

**On your VPS:**
```bash
# 1. Find your Tailscale interface/IP subnet (usually starts with 100.x.x.x)
ip addr show tailscale0
# Or just trust Tailscale's magic

# 2. Allow traffic on the Tailscale interface to ANY port (easiest for dev)
sudo ufw allow in on tailscale0

# OR be specific (Better security):
sudo ufw allow in on tailscale0 to any port 9000 proto tcp
sudo ufw allow in on tailscale0 to any port 9001 proto tcp
```
*Port 9000 is for API (code).*
*Port 9001 is for Console (browser UI).*

---

## 2️⃣ Run MinIO (Docker)

We'll run MinIO and persist the data to a folder on your VPS (e.g., `/mnt/data` or just `~/minio-data`).

**On your VPS:**
```bash
# Create a folder for data
mkdir -p ~/minio/data

# Run the container
docker run -d \
  --name minio \
  --restart always \
  -p 9000:9000 \
  -p 9001:9001 \
  -v ~/minio/data:/data \
  -e "MINIO_ROOT_USER=admin" \
  -e "MINIO_ROOT_PASSWORD=SuperSecretPassword123!" \
  quay.io/minio/minio server /data --console-address ":9001"
```

### Check if it's running:
```bash
docker logs minio
```

---

## 3️⃣ Verify Connectivity (Local Machine)

**On your Local Machine:**
1. Get your VPS's Tailscale IP (e.g., `100.10.20.30`).
2. Open your browser to `http://100.10.20.30:9001`.
3. Login with `admin` / `SuperSecretPassword123!`.
4. **Create a Bucket**:
   - Go to "Buckets" -> "Create Bucket".
   - Name: `3dex-models`.
   - **Important**: Set Access Policy to `Public` (or create a read-only policy if you want strict security, but for now Public Read is easier for development so previews work).
   - Actually for *security*, keep it Private, and let the Backend generate Signed URLs for downloads (which our code already does!).

---

## 4️⃣ Connect Backend

Update your local `.env` to talk to the VPS.

**Apps/Backend/.env:**
```env
# ... database config ...

# Storage (MinIO on VPS)
# Use the VPS Tailscale IP here!
STORAGE_ENDPOINT="http://100.10.20.30:9000"  
STORAGE_ACCESS_KEY="admin"
STORAGE_SECRET_KEY="SuperSecretPassword123!"
STORAGE_BUCKET="3dex-models"
```

---

## 5️⃣ Test It
1. Restart backend (`npm run dev`).
2. Hit the `POST /storage/upload-url` endpoint (via Postman or Frontend).
3. Try to upload a file to the returned URL.
4. Check the MinIO Console to see if the file appeared.

You are now a self-hosting god. 🚀
