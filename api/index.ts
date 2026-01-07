import express, { Request, Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

let app: express.Application | null = null;
let initError: any = null;
let isInitializing = false;
let initPromise: Promise<express.Application> | null = null;

async function initializeApp(): Promise<express.Application> {
  if (app) return app;
  if (initError) throw initError;
  if (isInitializing && initPromise) return initPromise;

  isInitializing = true;
  initPromise = (async () => {
    try {
      console.log('=== INICIANDO ===');
      console.log('CWD:', process.cwd());
      console.log('__dirname:', __dirname);

      // Verificar estrutura de diretórios
      const cwd = process.cwd();
      const backendDist = path.join(cwd, 'backend', 'dist');
      const backendDistSrc = path.join(backendDist, 'src');
      const appModulePath = path.join(backendDistSrc, 'app.module.js');

      console.log('Verificando:', appModulePath);
      console.log('Existe?', fs.existsSync(appModulePath));

      if (!fs.existsSync(appModulePath)) {
        // Listar o que existe
        const dirs: any = {};
        if (fs.existsSync(backendDist)) {
          dirs.dist = fs.readdirSync(backendDist);
        }
        if (fs.existsSync(backendDistSrc)) {
          dirs.src = fs.readdirSync(backendDistSrc);
        }
        throw new Error(`AppModule não encontrado em ${appModulePath}. Diretórios: ${JSON.stringify(dirs)}`);
      }

      // Carregar módulos necessários
      const { NestFactory } = await import('@nestjs/core');
      const { ValidationPipe } = await import('@nestjs/common');
      const { ExpressAdapter } = await import('@nestjs/platform-express');

      // Carregar AppModule
      console.log('Carregando AppModule...');
      delete require.cache[appModulePath];
      const appModule = require(appModulePath);
      
      if (!appModule || !appModule.AppModule) {
        throw new Error(`AppModule não exportado. Módulo: ${JSON.stringify(Object.keys(appModule || {}))}`);
      }

      const AppModule = appModule.AppModule;
      console.log('✓ AppModule carregado');

      // Criar Express app
      const expressApp = express();
      
      // Criar NestJS app
      console.log('Criando NestJS app...');
      const nestApp = await NestFactory.create(
        AppModule,
        new ExpressAdapter(expressApp),
        { logger: false }
      );

      // Configurar
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

      console.log('Inicializando...');
      await nestApp.init();
      console.log('✓ SUCESSO!');

      app = expressApp;
      isInitializing = false;
      return app;
    } catch (error: any) {
      isInitializing = false;
      initError = error;
      console.error('=== ERRO ===');
      console.error('Mensagem:', error?.message);
      console.error('Stack:', error?.stack);
      throw error;
    }
  })();

  return initPromise;
}

export default async function handler(req: Request, res: Response) {
  try {
    // Endpoint de teste simples - SEM NestJS
    if (req.url === '/api/test' || req.url === '/test' || req.path === '/test') {
      const cwd = process.cwd();
      const dirname = __dirname;
      const backendDist = path.join(cwd, 'backend', 'dist');
      const appModulePath = path.join(backendDist, 'src', 'app.module.js');

      let distContents: any = null;
      let srcContents: any = null;
      
      if (fs.existsSync(backendDist)) {
        try {
          distContents = fs.readdirSync(backendDist);
        } catch (e) {}
      }
      
      if (fs.existsSync(path.join(backendDist, 'src'))) {
        try {
          srcContents = fs.readdirSync(path.join(backendDist, 'src'));
        } catch (e) {}
      }

      return res.json({
        status: 'ok',
        message: 'Função serverless está funcionando!',
        cwd,
        dirname,
        files: {
          backendDist: fs.existsSync(backendDist),
          appModuleJs: fs.existsSync(appModulePath),
          path: appModulePath,
        },
        contents: {
          dist: distContents,
          src: srcContents,
        },
        app: {
          initialized: !!app,
          hasError: !!initError,
        },
        error: initError ? {
          message: initError.message,
          stack: initError.stack?.split('\n').slice(0, 5).join('\n'),
        } : null,
      });
    }

    // Endpoint de debug
    if (req.url === '/api/debug' || req.url === '/debug' || req.path === '/debug') {
      const cwd = process.cwd();
      const backendDist = path.join(cwd, 'backend', 'dist');
      const appModulePath = path.join(backendDist, 'src', 'app.module.js');

      return res.json({
        status: 'debug',
        cwd,
        dirname: __dirname,
        nodeVersion: process.version,
        files: {
          backendDist: fs.existsSync(backendDist),
          appModuleJs: fs.existsSync(appModulePath),
          path: appModulePath,
        },
        app: {
          initialized: !!app,
          hasError: !!initError,
          isInitializing,
        },
        error: initError ? {
          message: initError.message,
          stack: initError.stack,
        } : null,
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

    // Inicializar app
    const expressApp = await initializeApp();
    expressApp(req, res);
  } catch (error: any) {
    console.error('=== Handler Error ===');
    console.error(error?.message);
    console.error(error?.stack);
    
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error?.message || 'Unknown error',
        debug: {
          cwd: process.cwd(),
          dirname: __dirname,
          initError: initError ? {
            message: initError.message,
            stack: initError.stack?.split('\n').slice(0, 10).join('\n'),
          } : null,
        },
      });
    }
  }
}
