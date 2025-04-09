import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';
import * as packageJson from 'package.json';
import { Environment } from 'src/common/constant/constant';
import { ConfigurationType } from './configuration';

export function SwaggerConfiguration({
  app,
  configService,
}: {
  app: NestExpressApplication;
  configService: ConfigService<ConfigurationType, true>;
}): void {
  const node_env = configService.get<ConfigurationType['node_env']>('node_env');
  if (node_env === Environment.PRODUCTION) {
    return;
  }
  app.use(
    ['/docs'],
    basicAuth({
      challenge: true,
      users: {
        chotdonnhanhdev: 'Y2hvdGRvbm5oYW5oZGV2Cg==',
      },
    }),
  );

  const configFactory = new DocumentBuilder()
    .setTitle('API')
    .setDescription(packageJson.description)
    .setVersion(String(packageJson.version))
    .addBearerAuth();

  const document = SwaggerModule.createDocument(app, configFactory.build());
  const options = {
    swaggerOptions: {
      filter: true, // Cho phép search tag theo tên
      persistAuthorization: true, // Giữ token khi refresh tab (token sẽ được lưu trong localStorage)
      defaultModelsExpandDepth: 5, // Mở tất cả thuộc tính của các schema
      defaultModelExpandDepth: 5,
      docExpansion: 'none', // Đóng tất cả các endpoints có trong tag.
      tryItOutEnabled: true, // Không cần click "Try it out" để execute endpoint.
      displayRequestDuration: true, // Hiển thị thời gian api phản hồi
    },
  };

  SwaggerModule.setup('/docs', app, document, options);
}
