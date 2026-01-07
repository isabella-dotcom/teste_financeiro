import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

let app: express.Application | null = null;
let initError: any = null;
let isInitializing = false;
let initPromise: Promise<express.Application> | null = null;

function findAppModuleFile(): string | null {
  const cwd = process.cwd();
  const dirname = __dirname;
  
  // Lista de caminhos possíveis
  const possiblePaths = [
    path.join(cwd, 'backend', 'dist', 'src', 'app.module.js'),
    path.join(dirname, '..', 'backend', 'dist', 'src', 'app.module.js'),
    path.join(cwd, '..', 'backend', 'dist', 'src', 'app.module.js'),
  ];

  // Primeiro, verificar se o arquivo existe
  for (const testPath of possiblePaths) {
    const fullPath = path.resolve(testPath);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  return null;
}

function loadAppModule(): any {
  const modulePath = findAppModuleFile();
  
  if (!modulePath) {
    throw new Error(
      `AppModule não encontrado. CWD: ${process.cwd()}, __dirname: ${__dirname}`
    );
  }

  try {
    // Limpar cache se existir
    if (require.cache[modulePath]) {
      delete require.cache[modulePath];
    }
    
    const module = require(modulePath);
    
    if (!module || !module.AppModule) {
      throw new Error(`AppModule não exportado em ${modulePath}`);
    }
    
    return module.AppModule;
  } catch (error: any) {
    throw new Error(`Erro ao carregar AppModule de ${modulePath}: ${error.message}`);
  }
}

async function initializeApp(): Promise<express.Application> {
  if (app) return app;
  if (initError) throw initError;
  if (isInitializing && initPromise) return initPromise;

  isInitializing = true;
  initPromise = (async () => {
    try {
      console.log('=== Iniciando inicialização ===');
      console.log('CWD:', process.cwd());
      console.log('__dirname:', __dirname);
      
      // Verificar se backend/dist existe
      const backendDist = path.join(process.cwd(), 'backend', 'dist');
      if (!fs.existsSync(backendDist)) {
        throw new Error(`backend/dist não encontrado em ${backendDist}`);
      }
      
      console.log('✓ backend/dist encontrado');

      // Carregar AppModule
      console.log('Carregando AppModule...');
      const AppModule = loadAppModule();
      console.log('✓ AppModule carregado');

      // Criar aplicação Express
      console.log('Criando aplicação Express...');
      const expressApp = express();
      
      // Criar aplicação NestJS
      console.log('Criando aplicação NestJS...');
      const nestApp = await NestFactory.create(
        AppModule,
        new ExpressAdapter(expressApp),
        {
          logger: ['error', 'warn'],
        }
      );

      // Configurar CORS
      console.log('Configurando CORS...');
      nestApp.enableCors({
        origin: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || '*',
        credentials: true,
      });

      // Configurar ValidationPipe
      console.log('Configurando ValidationPipe...');
      nestApp.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        })
      );

      // Inicializar
      console.log('Inicializando NestJS...');
      await nestApp.init();
      
      console.log('✓ NestJS inicializado com sucesso!');
      
      app = expressApp;
      isInitializing = false;
      return app;
    } catch (error: any) {
      isInitializing = false;
      initError = error;
      console.error('=== ERRO na inicialização ===');
      console.error('Mensagem:', error?.message);
      console.error('Stack:', error?.stack);
      throw error;
    }
  })();

  return initPromise;
}

export default async function handler(req: Request, res: Response) {
  try {
    // Endpoint de debug - SEM inicializar NestJS
    if (req.url === '/api/debug' || req.url === '/debug' || req.path === '/debug') {
      const cwd = process.cwd();
      const dirname = __dirname;
      const modulePath = findAppModuleFile();
      
      // Listar arquivos em backend/dist se existir
      const backendDist = path.join(cwd, 'backend', 'dist');
      let distContents: string[] = [];
      if (fs.existsSync(backendDist)) {
        try {
          distContents = fs.readdirSync(backendDist);
        } catch (e) {
          // Ignorar erro
        }
      }

      const backendDistSrc = path.join(backendDist, 'src');
      let srcContents: string[] = [];
      if (fs.existsSync(backendDistSrc)) {
        try {
          srcContents = fs.readdirSync(backendDistSrc);
        } catch (e) {
          // Ignorar erro
        }
      }

      return res.json({
        status: 'debug',
        cwd,
        dirname,
        nodeVersion: process.version,
        env: {
          NODE_ENV: process.env.NODE_ENV,
          DATABASE_URL: process.env.DATABASE_URL ? 'Definida' : 'Não definida',
        },
        files: {
          backendDist: fs.existsSync(backendDist),
          backendDistSrc: fs.existsSync(backendDistSrc),
          appModuleJs: modulePath ? fs.existsSync(modulePath) : false,
          modulePath: modulePath || null,
        },
        contents: {
          dist: distContents,
          src: srcContents,
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

    // Remover prefixo /api da URL
    let cleanUrl = req.url || req.path || '/';
    if (cleanUrl.startsWith('/api')) {
      cleanUrl = cleanUrl.replace(/^\/api/, '') || '/';
    }
    
    req.url = cleanUrl;
    req.originalUrl = cleanUrl;
    if (req.path) {
      req.path = cleanUrl;
    }

    // Inicializar e obter a aplicação
    const expressApp = await initializeApp();
    
    // Passar a requisição para o Express
    expressApp(req, res);
  } catch (error: any) {
    console.error('=== Erro no handler ===');
    console.error('Mensagem:', error?.message);
    console.error('Stack:', error?.stack);
    
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error?.message || 'Unknown error',
        debug: {
          cwd: process.cwd(),
          dirname: __dirname,
          hasInitError: !!initError,
          initError: initError ? {
            message: initError.message,
            stack: initError.stack,
          } : null,
        },
      });
    }
  }
}
