import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';

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
      console.log('Current working directory:', process.cwd());
      console.log('__dirname:', __dirname);
      
      // Dynamically import AppModule to avoid module resolution issues
      let AppModule: any;
      try {
        const modulePath = require.resolve('../backend/dist/src/app.module');
        console.log('Resolved AppModule path:', modulePath);
        AppModule = require(modulePath).AppModule;
      } catch (error) {
        console.error('Error resolving AppModule:', error);
        // Try direct require as fallback
        AppModule = require('../backend/dist/src/app.module').AppModule;
        console.log('AppModule loaded using direct require');
      }
      
      const expressApp = express();
      console.log('Creating NestJS app with AppModule...');
      
      const app = await NestFactory.create(
        AppModule,
        new ExpressAdapter(expressApp),
        {
          logger: ['error', 'warn', 'log'],
        }
      );
      console.log('NestJS app created');

      app.enableCors({
        origin: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || '*',
        credentials: true,
      });
      console.log('CORS enabled');

      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
      );
      console.log('Global pipes configured');

      await app.init();
      console.log('NestJS app initialized successfully');
      
      // Don't call listen() - we're using ExpressAdapter
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
    console.log('Handler called with URL:', req.url);
    console.log('Handler method:', req.method);
    
    // Remove /api prefix from path
    const originalUrl = req.url || '';
    const pathWithoutApi = originalUrl.replace(/^\/api/, '') || '/';
    console.log('Path without /api:', pathWithoutApi);
    
    const app = await createApp();
    console.log('App created, handling request...');
    
    // Use the app directly - it's already an Express app
    app(req, res);
  } catch (error) {
    console.error('Error handling request:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
      console.error('Error message:', error.message);
      console.error('Error name:', error.name);
    }
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  }
}

