import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

let app: express.Application | null = null;
let initPromise: Promise<express.Application> | null = null;

async function getApp(): Promise<express.Application> {
  if (app) return app;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const cwd = process.cwd();
      const dirname = __dirname;
      
      console.log('=== Initializing NestJS ===');
      console.log('CWD:', cwd);
      console.log('__dirname:', dirname);
      
      // Try multiple paths to find AppModule
      const possiblePaths = [
        path.join(cwd, 'backend', 'dist', 'src', 'app.module.js'),
        path.join(dirname, '..', 'backend', 'dist', 'src', 'app.module.js'),
        path.join(cwd, '..', 'backend', 'dist', 'src', 'app.module.js'),
        '../backend/dist/src/app.module.js',
        './backend/dist/src/app.module.js',
      ];

      let AppModule: any = null;
      let loadedPath: string | null = null;

      // First, try to find the file
      for (const testPath of possiblePaths) {
        const fullPath = path.isAbsolute(testPath) ? testPath : path.join(dirname, testPath);
        console.log('Checking:', fullPath);
        
        if (fs.existsSync(fullPath)) {
          console.log('✓ Found file at:', fullPath);
          try {
            AppModule = require(fullPath).AppModule;
            loadedPath = fullPath;
            console.log('✓ Successfully loaded AppModule from:', loadedPath);
            break;
          } catch (e: any) {
            console.log('✗ Failed to require:', e.message);
          }
        }
      }

      // If file not found, try require.resolve
      if (!AppModule) {
        console.log('File not found, trying require.resolve...');
        for (const testPath of ['../backend/dist/src/app.module', './backend/dist/src/app.module']) {
          try {
            const resolved = require.resolve(testPath);
            console.log('✓ Resolved to:', resolved);
            AppModule = require(resolved).AppModule;
            loadedPath = resolved;
            break;
          } catch (e: any) {
            console.log('✗ require.resolve failed:', testPath, e.message);
          }
        }
      }

      if (!AppModule) {
        throw new Error(`Cannot find AppModule. Tried paths: ${possiblePaths.join(', ')}`);
      }

      console.log('Creating NestJS app...');
      const expressApp = express();
      const nestApp = await NestFactory.create(
        AppModule,
        new ExpressAdapter(expressApp),
        { logger: false }
      );

      nestApp.enableCors({ 
        origin: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || '*', 
        credentials: true 
      });
      
      nestApp.useGlobalPipes(
        new ValidationPipe({ 
          whitelist: true, 
          forbidNonWhitelisted: true,
          transform: true 
        })
      );
      
      await nestApp.init();
      console.log('✓ NestJS app initialized successfully');
      
      app = expressApp;
      return app;
    } catch (error: any) {
      console.error('=== INIT ERROR ===');
      console.error('Message:', error?.message);
      console.error('Stack:', error?.stack);
      throw error;
    }
  })();

  return initPromise;
}

export default async function handler(req: Request, res: Response) {
  try {
    console.log('Handler called:', req.method, req.url);
    
    // Remove /api prefix
    const url = req.url || '';
    if (url.startsWith('/api')) {
      req.url = url.replace(/^\/api/, '') || '/';
      req.originalUrl = req.url;
    }
    
    const expressApp = await getApp();
    expressApp(req, res);
  } catch (error: any) {
    console.error('=== HANDLER ERROR ===');
    console.error('Message:', error?.message);
    console.error('Stack:', error?.stack);
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: error?.message || 'Unknown error',
        cwd: process.cwd(),
        dirname: __dirname
      });
    }
  }
}
