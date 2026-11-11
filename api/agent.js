// Vercel serverless function: POST /api/agent streams the agent's trace; GET /api/agent says whether AI is on.
import { handle } from '../agent/src/handler.js';

export const config = { maxDuration: 60 };

export default function handler(req, res) {
  return handle(req, res, { env: process.env });
}
