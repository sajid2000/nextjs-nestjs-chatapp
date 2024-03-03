/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        hostname: 'localhost',
      },
      {
        hostname: 'utfs.io',
      },
      {
        hostname: 'uploadthing.com',
      },
    ],
  },
};
