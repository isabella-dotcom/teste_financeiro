import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';

let app: express.Application | null = null;

async function getApp(): Promise<express.Application> {
  if (app) return app;

  try {
    // Simple require - Vercel should have the files in includeFiles
    const { AppModule } = require('../backend/dist/src/app.module');
    
    const expressApp = express();
    const nestApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
      { logger: false }
    );

    nestApp.enableCors({ origin: '*', credentials: true });
    nestApp.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await nestApp.init();
    
    app = expressApp;
    return app;
  } catch (error: any) {
    console.error('Init error:', error?.message, error?.stack);
    throw error;
  }
}

export default async function handler(req: Request, res: Response) {
  try {
    // Remove /api prefix
    if (req.url?.startsWith('/api')) {
      req.url = req.url.replace(/^\/api/, '') || '/';
      req.originalUrl = req.url;
    }
    
    const expressApp = await getApp();
    expressApp(req, res);
  } catch (error: any) {
    console.error('Handler error:', error?.message);
    if (!res.headersSent) {
      res.status(500).json({ error: error?.message || 'Internal Server Error' });
    }
  }
}
