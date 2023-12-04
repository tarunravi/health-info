module.exports = {
    async rewrites() {
        return [
          {
            source: '/api/:path*',
            destination: 'https://api-polbq3pvdq-ue.a.run.app/:path*',
          },
        ]
      },
  };
