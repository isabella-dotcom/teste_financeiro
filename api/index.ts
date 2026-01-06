import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';

// Import AppModule from compiled code
// Use dynamic import to handle path resolution issues
let AppModule: any;

try {
  // Try to resolve the module path
  const modulePath = require.resolve('../backend/dist/src/app.module');
  AppModule = require(modulePath).AppModule;
  console.log('AppModule loaded from:', modulePath);
} catch (error) {
  console.error('Error loading AppModule:', error);
  // Fallback: try direct require
  try {
    AppModule = require('../backend/dist/src/app.module').AppModule;
    console.log('AppModule loaded using fallback method');
  } catch (e) {
    console.error('Failed to load AppModule:', e);
    throw new Error(`Cannot find AppModule: ${e instanceof Error ? e.message : String(e)}`);
  }
}

let cachedApp: express.Application | null = null;
let isInitializing = false;
let initPromise: Promise<express.Application> | null = null;

async function createApp(): Promise<express.Application> {
  if (cachedApp) {
    return cachedApp;
  }

  if (isInitializing && initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      isInitializing = true;
      console.log('Initializing NestJS app...');
      console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
      
      const expressApp = express();
      const app = await NestFactory.create(
        AppModule,
        new ExpressAdapter(expressApp),
        {
          logger: ['error', 'warn', 'log'],
        }
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
      console.log('NestJS app initialized successfully');
      cachedApp = expressApp;
      isInitializing = false;
      return expressApp;
    } catch (error) {
      isInitializing = false;
      console.error('Error creating NestJS app:', error);
      if (error instanceof Error) {
        console.error('Error stack:', error.stack);
        console.error('Error message:', error.message);
      }
      throw error;
    }
  })();

  return initPromise;
}

export default async function handler(req: Request, res: Response) {
  try {
    // Remove /api prefix from path
    const originalUrl = req.url || '';
    const pathWithoutApi = originalUrl.replace(/^\/api/, '') || '/';
    
    // Create a new request object with modified URL
    const modifiedReq = {
      ...req,
      url: pathWithoutApi,
      originalUrl: pathWithoutApi,
    } as Request;
    
    const app = await createApp();
    app(modifiedReq, res);
  } catch (error) {
    console.error('Error handling request:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
      console.error('Error message:', error.message);
    }
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
      });
    }
  }
}

