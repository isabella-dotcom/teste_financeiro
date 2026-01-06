import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

let cachedApp: express.Application | null = null;
let initError: any = null;

async function createApp(): Promise<express.Application> {
  if (cachedApp) {
    return cachedApp;
  }

  if (initError) {
    throw initError;
  }

  try {
    console.log('=== Starting app creation ===');
    console.log('CWD:', process.cwd());
    console.log('__dirname:', __dirname);
    
    // Try to load AppModule
    let AppModule: any;
    let modulePath: string | null = null;
    
    const basePaths = [
      path.join(process.cwd(), 'backend', 'dist', 'src', 'app.module'),
      path.join(__dirname, '..', 'backend', 'dist', 'src', 'app.module'),
      '../backend/dist/src/app.module',
    ];
    
    for (const basePath of basePaths) {
      try {
        const jsPath = basePath + '.js';
        if (fs.existsSync(jsPath)) {
          console.log('Found module file:', jsPath);
          modulePath = jsPath;
          AppModule = require(jsPath).AppModule;
          console.log('AppModule loaded successfully from:', jsPath);
          break;
        }
      } catch (e: any) {
        console.log('Failed to load from:', basePath, e.message);
      }
    }
    
    if (!AppModule) {
      // Try require.resolve as last resort
      try {
        modulePath = require.resolve('../backend/dist/src/app.module');
        AppModule = require(modulePath).AppModule;
        console.log('AppModule loaded via require.resolve:', modulePath);
      } catch (e: any) {
        const errorMsg = `Cannot find AppModule. Tried: ${basePaths.join(', ')}. Error: ${e.message}`;
        console.error(errorMsg);
        initError = new Error(errorMsg);
        throw initError;
      }
    }
    
    const expressApp = express();
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
      { logger: ['error', 'warn'] }
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
    return expressApp;
  } catch (error) {
    initError = error;
    console.error('=== Error creating app ===');
    console.error(error);
    throw error;
  }
}

export default async function handler(req: Request, res: Response) {
  try {
    // Simple test endpoint
    if (req.url === '/api/test' || req.url === '/test') {
      return res.json({
        status: 'ok',
        cwd: process.cwd(),
        dirname: __dirname,
        files: {
          backendDist: fs.existsSync(path.join(process.cwd(), 'backend', 'dist')),
          appModuleJs: fs.existsSync(path.join(process.cwd(), 'backend', 'dist', 'src', 'app.module.js')),
        },
        initError: initError ? {
          message: initError.message,
          stack: initError.stack,
        } : null,
      });
    }
    
    // Remove /api prefix
    const url = req.url || '';
    const cleanUrl = url.replace(/^\/api/, '') || '/';
    req.url = cleanUrl;
    req.originalUrl = cleanUrl;
    
    const app = await createApp();
    app(req, res);
  } catch (error: any) {
    console.error('=== Handler error ===');
    console.error(error);
    
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        cwd: process.cwd(),
        dirname: __dirname,
        initError: initError ? {
          message: initError.message,
          stack: initError.stack,
        } : null,
      });
    }
  }
}
