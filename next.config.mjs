/** @type {import('next').NextConfig} */
const nextConfig = {
  reactstrictMode: true,
  images: {
    domains: ["avatar.vercel.sh", "firebasestorage.googleapis.com"]
  },
  env: {
    AZURE_ENDPOINT: "https://models.inference.ai.azure.com",

  }
};

export default nextConfig;
