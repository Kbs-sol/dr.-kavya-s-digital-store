module.exports = {
  apps: [
    {
      name: 'drkavyas',
      script: 'npx',
      args: 'vite dev --host 0.0.0.0 --port 3000',
      cwd: '/home/user/webapp',
      env: {
        NODE_ENV: 'development',
        PORT: '3000',
        SUPABASE_URL: 'https://bpdwuckiloirpenamrbi.supabase.co',
        SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_kcXaQZrRl8y9sr0UnzGpWA_Ha1fO-Ts',
        VITE_SUPABASE_URL: 'https://bpdwuckiloirpenamrbi.supabase.co',
        VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_kcXaQZrRl8y9sr0UnzGpWA_Ha1fO-Ts',
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
    },
  ],
};
