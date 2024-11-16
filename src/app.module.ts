import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MulterModule } from '@nestjs/platform-express';
import { join } from 'path';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // Ensure the path to the uploaded files is correct
      serveRoot: '/uploads',  // Public URL path to access the files
      serveStaticOptions:{
        index : false
      }
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
