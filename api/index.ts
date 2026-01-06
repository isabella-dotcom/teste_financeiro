import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

let cachedApp: express.Application | null = null;
let isInitializing = false;
let initPromise: Promise<express.Application> | null = null;
let lastError: any = null;

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
      const debugInfo: string[] = [];
      
      const cwd = process.cwd();
      const dirname = __dirname;
      debugInfo.push(`CWD: ${cwd}`);
      debugInfo.push(`__dirname: ${dirname}`);
      
      // Try multiple paths
      const possiblePaths = [
        '../backend/dist/src/app.module',
        path.join(dirname, '../backend/dist/src/app.module'),
        path.join(cwd, 'backend/dist/src/app.module'),
        './backend/dist/src/app.module',
      ];
      
      let modulePath: string | null = null;
      for (const testPath of possiblePaths) {
        try {
          const resolved = require.resolve(testPath);
          debugInfo.push(`✓ Found module at: ${resolved}`);
          modulePath = resolved;
          AppModule = require(resolved).AppModule;
          break;
        } catch (e: any) {
          debugInfo.push(`✗ Failed: ${testPath} - ${e.message}`);
        }
      }
      
      if (!AppModule) {
        // Last resort: try direct require
        try {
          AppModule = require('../backend/dist/src/app.module').AppModule;
          debugInfo.push('✓ Loaded using direct require');
        } catch (e: any) {
          debugInfo.push(`✗ Direct require failed: ${e.message}`);
          throw new Error(`Cannot load AppModule. Debug: ${debugInfo.join('; ')}`);
        }
      }
      
      console.log('AppModule loaded. Debug info:', debugInfo.join('; '));
      
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
    console.log('=== Handler called ===');
    console.log('URL:', req.url);
    console.log('Method:', req.method);
    
    // Debug endpoint - return system info
    if (req.url === '/api/debug' || req.url === '/debug') {
      const debugData = {
        cwd: process.cwd(),
        dirname: __dirname,
        nodeVersion: process.version,
        env: {
          DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
          NODE_ENV: process.env.NODE_ENV,
        },
        files: {
          backendDist: fs.existsSync(path.join(process.cwd(), 'backend/dist')),
          appModule: fs.existsSync(path.join(process.cwd(), 'backend/dist/src/app.module.js')),
        },
        lastError: lastError ? {
          message: lastError.message,
          stack: lastError.stack,
        } : null,
      };
      return res.json(debugData);
    }
    
    // Remove /api prefix from path
    const originalUrl = req.url || '';
    const pathWithoutApi = originalUrl.replace(/^\/api/, '') || '/';
    console.log('Path without /api:', pathWithoutApi);
    
    // Modify the request URL
    req.url = pathWithoutApi;
    req.originalUrl = pathWithoutApi;
    
    console.log('Creating app...');
    const app = await createApp();
    console.log('App created, handling request...');
    
    // Use the app directly - it's already an Express app
    app(req, res);
  } catch (error) {
    lastError = error;
    console.error('=== Error in handler ===');
    console.error('Error:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    } else {
      console.error('Error (not Error instance):', JSON.stringify(error));
    }
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        type: error instanceof Error ? error.name : typeof error,
        debug: {
          cwd: process.cwd(),
          dirname: __dirname,
        }
      });
    }
  }
}

