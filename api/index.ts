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

async function initializeApp(): Promise<express.Application> {
  if (app) return app;
  if (initError) throw initError;
  if (isInitializing && initPromise) return initPromise;

  isInitializing = true;
  initPromise = (async () => {
    try {
      console.log('=== Iniciando inicialização do NestJS ===');
      console.log('CWD:', process.cwd());
      console.log('__dirname:', __dirname);
      console.log('NODE_ENV:', process.env.NODE_ENV);
      console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Definida' : 'Não definida');

      // Caminhos possíveis para o AppModule compilado
      const possiblePaths = [
        path.join(process.cwd(), 'backend', 'dist', 'src', 'app.module.js'),
        path.join(__dirname, '..', 'backend', 'dist', 'src', 'app.module.js'),
        path.join(process.cwd(), '..', 'backend', 'dist', 'src', 'app.module.js'),
      ];

      let AppModule: any = null;
      let modulePath: string | null = null;

      // Tentar encontrar e carregar o módulo
      for (const testPath of possiblePaths) {
        const fullPath = path.resolve(testPath);
        console.log(`Tentando: ${fullPath}`);
        console.log(`Existe: ${fs.existsSync(fullPath)}`);

        if (fs.existsSync(fullPath)) {
          try {
            // Limpar cache do require para garantir que carregue a versão mais recente
            delete require.cache[require.resolve(fullPath)];
            const module = require(fullPath);
            
            if (module && module.AppModule) {
              AppModule = module.AppModule;
              modulePath = fullPath;
              console.log(`✓ AppModule encontrado em: ${fullPath}`);
              break;
            } else {
              console.log(`✗ Módulo encontrado mas AppModule não está exportado`);
            }
          } catch (e: any) {
            console.log(`✗ Erro ao carregar: ${e.message}`);
            console.log(e.stack);
          }
        }
      }

      if (!AppModule) {
        // Última tentativa: usar require.resolve
        try {
          const resolved = require.resolve('../backend/dist/src/app.module');
          delete require.cache[resolved];
          const module = require(resolved);
          if (module && module.AppModule) {
            AppModule = module.AppModule;
            modulePath = resolved;
            console.log(`✓ AppModule encontrado via require.resolve: ${resolved}`);
          }
        } catch (e: any) {
          console.log(`✗ require.resolve falhou: ${e.message}`);
        }
      }

      if (!AppModule) {
        const error = new Error(
          `AppModule não encontrado. Caminhos testados: ${possiblePaths.join(', ')}`
        );
        console.error('=== ERRO: AppModule não encontrado ===');
        console.error(error.message);
        initError = error;
        throw error;
      }

      console.log('Criando aplicação Express...');
      const expressApp = express();
      
      console.log('Criando aplicação NestJS...');
      const nestApp = await NestFactory.create(
        AppModule,
        new ExpressAdapter(expressApp),
        {
          logger: ['error', 'warn', 'log'],
        }
      );

      console.log('Configurando CORS...');
      nestApp.enableCors({
        origin: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || '*',
        credentials: true,
      });

      console.log('Configurando ValidationPipe...');
      nestApp.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        })
      );

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
    // Endpoint de debug
    if (req.url === '/api/debug' || req.url === '/debug' || req.path === '/debug') {
      const cwd = process.cwd();
      const dirname = __dirname;
      
      const testPaths = [
        path.join(cwd, 'backend', 'dist', 'src', 'app.module.js'),
        path.join(dirname, '..', 'backend', 'dist', 'src', 'app.module.js'),
      ];

      const fileChecks: Record<string, boolean> = {};
      for (const testPath of testPaths) {
        fileChecks[testPath] = fs.existsSync(testPath);
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
          ...fileChecks,
          backendDist: fs.existsSync(path.join(cwd, 'backend', 'dist')),
          backendDistSrc: fs.existsSync(path.join(cwd, 'backend', 'dist', 'src')),
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

    // Remover prefixo /api da URL se existir
    let cleanUrl = req.url || req.path || '/';
    if (cleanUrl.startsWith('/api')) {
      cleanUrl = cleanUrl.replace(/^\/api/, '') || '/';
    }
    
    req.url = cleanUrl;
    req.originalUrl = cleanUrl;
    req.path = cleanUrl;

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
        },
      });
    }
  }
}
