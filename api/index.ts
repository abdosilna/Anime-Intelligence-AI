import app from '../src/serverApp.ts';

/**
 * Vercel Serverless Function entry point.
 * Exports the Express app instance wrapped as a request listener.
 */
export default function handler(req: any, res: any) {
  return app(req, res);
}
