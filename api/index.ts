import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

let app: express.Application | null = null;
let initError: any = null;

function findAppModule(): { module: any; path: string } | null {
  const cwd = process.cwd();
  const dirname = __dirname;
  
  const possiblePaths = [
    path.join(cwd, 'backend', 'dist', 'src', 'app.module.js'),
    path.join(dirname, '..', 'backend', 'dist', 'src', 'app.module.js'),
    path.join(cwd, '..', 'backend', 'dist', 'src', 'app.module.js'),
    '../backend/dist/src/app.module.js',
    './backend/dist/src/app.module.js',
  ];

  // Try to find file first
  for (const testPath of possiblePaths) {
    const fullPath = path.isAbsolute(testPath) ? testPath : path.join(dirname, testPath);
    if (fs.existsSync(fullPath)) {
      try {
        const module = require(fullPath);
        if (module.AppModule) {
          return { module: module.AppModule, path: fullPath };
        }
      } catch (e) {
        // Continue trying
      }
    }
  }

  // Try require.resolve
  for (const testPath of ['../backend/dist/src/app.module', './backend/dist/src/app.module']) {
    try {
      const resolved = require.resolve(testPath);
      const module = require(resolved);
      if (module.AppModule) {
        return { module: module.AppModule, path: resolved };
      }
    } catch (e) {
      // Continue trying
    }
  }

  return null;
}

async function getApp(): Promise<express.Application> {
  if (app) return app;
  if (initError) throw initError;

  try {
    const result = findAppModule();
    
    if (!result) {
      const error = new Error('AppModule not found');
      initError = error;
      throw error;
    }

    const { module: AppModule, path: modulePath } = result;
    
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
    
    app = expressApp;
    return app;
  } catch (error: any) {
    initError = error;
    throw error;
  }
}

export default async function handler(req: Request, res: Response) {
  try {
    // Debug endpoint
    if (req.url === '/api/debug' || req.url === '/debug') {
      const cwd = process.cwd();
      const dirname = __dirname;
      const result = findAppModule();
      
      return res.json({
        cwd,
        dirname,
        moduleFound: !!result,
        modulePath: result?.path || null,
        initError: initError ? {
          message: initError.message,
          stack: initError.stack
        } : null,
        files: {
          backendDist: fs.existsSync(path.join(cwd, 'backend', 'dist')),
          appModuleJs: fs.existsSync(path.join(cwd, 'backend', 'dist', 'src', 'app.module.js')),
        }
      });
    }
    
    // Remove /api prefix
    const url = req.url || '';
    if (url.startsWith('/api')) {
      req.url = url.replace(/^\/api/, '') || '/';
      req.originalUrl = req.url;
    }
    
    const expressApp = await getApp();
    expressApp(req, res);
  } catch (error: any) {
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
