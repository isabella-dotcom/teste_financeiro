import express, { Request, Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

let app: express.Application | null = null;
let initError: any = null;

// Endpoint de teste simples - SEM NADA
export default async function handler(req: Request, res: Response) {
  try {
    const cwd = process.cwd();
    const dirname = __dirname;
    
    // Se for /test, retornar info básica SEM inicializar nada
    if (req.url === '/api/test' || req.url === '/test' || req.path === '/test') {
      return res.json({
        status: 'ok',
        message: 'Função serverless funcionando!',
        cwd,
        dirname,
        nodeVersion: process.version,
        timestamp: new Date().toISOString(),
      });
    }

    // Se for /debug, mostrar estrutura de arquivos
    if (req.url === '/api/debug' || req.url === '/debug' || req.path === '/debug') {
      const backendDist = path.join(cwd, 'backend', 'dist');
      const appModulePath = path.join(backendDist, 'src', 'app.module.js');
      
      let distFiles: string[] = [];
      let srcFiles: string[] = [];
      
      if (fs.existsSync(backendDist)) {
        try {
          distFiles = fs.readdirSync(backendDist);
        } catch (e) {}
      }
      
      const srcPath = path.join(backendDist, 'src');
      if (fs.existsSync(srcPath)) {
        try {
          srcFiles = fs.readdirSync(srcPath);
        } catch (e) {}
      }

      return res.json({
        status: 'debug',
        cwd,
        dirname,
        files: {
          backendDist: fs.existsSync(backendDist),
          appModuleJs: fs.existsSync(appModulePath),
          path: appModulePath,
        },
        contents: {
          dist: distFiles,
          src: srcFiles,
        },
        nodeModules: {
          backend: fs.existsSync(path.join(cwd, 'backend', 'node_modules')),
          backendNest: fs.existsSync(path.join(cwd, 'backend', 'node_modules', '@nestjs')),
        },
      });
    }

    // Para outras rotas, tentar inicializar o NestJS
    if (!app && !initError) {
      try {
        console.log('=== Tentando inicializar NestJS ===');
        console.log('CWD:', cwd);
        console.log('__dirname:', dirname);

        // Verificar se arquivo existe
        const backendDist = path.join(cwd, 'backend', 'dist');
        const appModulePath = path.join(backendDist, 'src', 'app.module.js');
        
        if (!fs.existsSync(appModulePath)) {
          throw new Error(`AppModule não encontrado: ${appModulePath}`);
        }

        // Carregar módulos
        const { NestFactory } = require('@nestjs/core');
        const { ValidationPipe } = require('@nestjs/common');
        const { ExpressAdapter } = require('@nestjs/platform-express');

        // Carregar AppModule
        delete require.cache[appModulePath];
        const appModule = require(appModulePath);
        const AppModule = appModule.AppModule;

        if (!AppModule) {
          throw new Error('AppModule não encontrado no módulo');
        }

        // Criar app
        const expressApp = express();
        const nestApp = await NestFactory.create(
          AppModule,
          new ExpressAdapter(expressApp),
          { logger: false }
        );

        nestApp.enableCors({
          origin: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || '*',
          credentials: true,
        });

        nestApp.useGlobalPipes(
          new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
          })
        );

        await nestApp.init();
        app = expressApp;
        console.log('✓ NestJS inicializado');
      } catch (error: any) {
        initError = error;
        console.error('Erro ao inicializar:', error.message);
        console.error(error.stack);
      }
    }

    if (initError) {
      return res.status(500).json({
        error: 'Erro ao inicializar aplicação',
        message: initError.message,
        stack: initError.stack,
        debug: {
          cwd,
          dirname,
        },
      });
    }

    if (!app) {
      return res.status(500).json({
        error: 'Aplicação não inicializada',
      });
    }

    // Remover /api da URL
    let cleanUrl = req.url || req.path || '/';
    if (cleanUrl.startsWith('/api')) {
      cleanUrl = cleanUrl.replace(/^\/api/, '') || '/';
    }
    
    req.url = cleanUrl;
    req.originalUrl = cleanUrl;
    if (req.path) req.path = cleanUrl;

    // Passar para Express
    app(req, res);
  } catch (error: any) {
    console.error('=== Handler Error ===');
    console.error(error?.message);
    console.error(error?.stack);
    
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error?.message || 'Unknown error',
      });
    }
  }
}
