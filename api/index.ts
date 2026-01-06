import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';

let app: express.Application | null = null;

async function getApp(): Promise<express.Application> {
  if (app) {
    return app;
  }

  try {
    // Import AppModule - try different approaches
    let AppModule: any;
    
    try {
      // First try: relative path from api/ directory
      AppModule = require('../backend/dist/src/app.module').AppModule;
    } catch (e1) {
      try {
        // Second try: absolute path
        const path = require('path');
        const modulePath = path.join(process.cwd(), 'backend', 'dist', 'src', 'app.module.js');
        AppModule = require(modulePath).AppModule;
      } catch (e2) {
        throw new Error(`Cannot load AppModule. Error 1: ${e1}. Error 2: ${e2}`);
      }
    }

    const expressApp = express();
    const nestApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
      { logger: false }
    );

    nestApp.enableCors({
      origin: '*',
      credentials: true,
    });

    nestApp.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await nestApp.init();
    app = expressApp;
    return app;
  } catch (error: any) {
    console.error('Error initializing app:', error);
    throw error;
  }
}

export default async function handler(req: Request, res: Response) {
  try {
    const expressApp = await getApp();
    
    // Remove /api prefix
    if (req.url?.startsWith('/api')) {
      req.url = req.url.replace(/^\/api/, '') || '/';
      req.originalUrl = req.url;
    }
    
    expressApp(req, res);
  } catch (error: any) {
    console.error('Handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error?.message || 'Unknown error',
      });
    }
  }
}
