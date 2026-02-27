// PM2 Ecosystem Configuration
// Usage:
//   pm2 start ecosystem.config.js
//   pm2 save
//   pm2 startup    (run the printed command to auto-start on reboot)

module.exports = {
  apps: [
    // ── 1. Node.js / Express Backend ─────────────────────────────────────
    {
      name: 'sahayai-backend',
      script: './backend/server.js',
      cwd: '/var/www/sahayai',
      instances: 'max',          // cluster mode — one worker per CPU core
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      // Logging
      out_file: '/var/log/pm2/sahayai-backend-out.log',
      error_file: '/var/log/pm2/sahayai-backend-err.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Auto-restart on crash with exponential back-off
      autorestart: true,
      restart_delay: 4000,
      max_restarts: 10,
    },

    // ── 2. Python Flask Prediction Microservice ───────────────────────────
    {
      name: 'sahayai-python',
      script: 'prediction_server.py',
      cwd: '/var/www/sahayai',
      interpreter: '/var/www/sahayai/.venv/bin/python3',
      watch: false,
      max_memory_restart: '256M',
      env: {
        FLASK_ENV: 'production',
        PORT: 5001,
      },
      // Logging
      out_file: '/var/log/pm2/sahayai-python-out.log',
      error_file: '/var/log/pm2/sahayai-python-err.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      restart_delay: 5000,
      max_restarts: 5,
    },
  ],
};
