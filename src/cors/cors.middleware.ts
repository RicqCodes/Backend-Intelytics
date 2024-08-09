import {
  Injectable,
  MiddlewareConsumer,
  NestMiddleware,
  NestModule,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  allowedOrigins = [
    'https://intelytics-fe.vercel.app',
    'http://localhost:3000',
  ];

  use(req: Request, res: Response, next: NextFunction) {
    const origin = req.headers.origin;
    if (this.allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  }
}

// In your AppModule or specific module:
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware).forRoutes('*');
  }
}
