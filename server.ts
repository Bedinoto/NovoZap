import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Webhook endpoint for Uazapi
  app.post("/api/webhook", (req, res) => {
    const { event, data, instance } = req.body;
    console.log(`Webhook [${event}] received for instance [${instance}]`);
    
    if (event === 'messages.upsert') {
      const message = data.message;
      const remoteJid = data.key.remoteJid;
      const pushName = data.pushName;
      const text = message.conversation || message.extendedTextMessage?.text || '';
      
      console.log(`New message from ${pushName} (${remoteJid}): ${text}`);
    } else if (event === 'connection.update') {
      console.log(`Connection update: ${data.state}`);
    }
    
    res.status(200).json({ status: "received" });
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
