// PM2 Ecosystem Config - VAR Project
// Usage: pm2 start ecosystem.config.cjs

const path = require('path');
const root = __dirname;

module.exports = {
  apps: [
    {
      name: 'var-backend',
      script: path.join(root, 'server', 'index.js'),
      cwd: path.join(root, 'server'),
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: path.join(root, 'logs', 'backend-error.log'),
      out_file: path.join(root, 'logs', 'backend-out.log'),
    },
    {
      name: 'var-chatbot',
      script: path.join(root, 'AI Chatbot', 'server.js'),
      cwd: path.join(root, 'AI Chatbot'),
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: path.join(root, 'logs', 'chatbot-error.log'),
      out_file: path.join(root, 'logs', 'chatbot-out.log'),
    },
  ],
};
