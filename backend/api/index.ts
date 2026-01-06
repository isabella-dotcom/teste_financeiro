import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import express, { Request, Response } from 'express';

let cachedApp: express.Application | null = null;
let isInitializing = false;
const initPromise: Promise<express.Application> | null = null;

async function createApp(): Promise<express.Application> {
  if (cachedApp) {
    return cachedApp;
  }

  if (isInitializing && initPromise) {
    return initPromise;
  }

  const promise = (async () => {
    try {
      isInitializing = true;
      const expressApp = express();
      const app = await NestFactory.create(
        AppModule,
        new ExpressAdapter(expressApp),
      );

      app.enableCors({
        origin: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || '*',
        credentials: true,
      });

      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
      );

      await app.init();
      cachedApp = expressApp;
      isInitializing = false;
      return expressApp;
    } catch (error) {
      isInitializing = false;
      console.error('Error creating NestJS app:', error);
      throw error;
    }
  })();

  return promise;
}

export default async function handler(req: Request, res: Response) {
  try {
    const app = await createApp();
    app(req, res);
  } catch (error) {
    console.error('Error handling request:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

