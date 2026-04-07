module.exports = {
  apps: [
    {
      name: "conectarh-backend",
      script: "npm",
      args: "start",
      cwd: "./backend",
      watch: false,
      env: {
        NODE_ENV: "production",
        // Caso queira configurar a porta, altere no .env ou aqui:
        // PORT: 3001
      }
    },
    {
      name: "conectarh-frontend",
      // Utiliza o pacote serve do npx gerando a build em Single Page Application
      script: "npx",
      args: "serve -s dist -l 5173",
      cwd: "./frontend",
      watch: false,
      env: {
        NODE_ENV: "production",
      }
    }
  ]
};
