import { Environment } from '../constant/constant';

export type ConfigurationType = {
  port: number;
  node_env: Environment;
  hostRedis: string;
  rabbitmq: string;
  botToken: string;
  devopsChatGroupId: string;
  mongo_dns: string;
  mongo_dns_ai: string;
  mongo_dns_back_office: string;
  jwt_secret: string;
  host_redis: string;
};

export const configuration = (): ConfigurationType => ({
  port: process.env.PORT ? parseInt(process.env.PORT) : 1321,
  node_env: (process.env.NODE_ENV as Environment) ?? Environment.DEV,

  hostRedis: process.env.HOST_REDIS || '',
  rabbitmq: process.env.RABBIT_MQ_URI || `amqp://localhost`,

  botToken: process.env.TELEGRAM_BOT_TOKEN || '',
  devopsChatGroupId: process.env.TELEGRAM_DEVOPS_CHAT_GROUP_ID || '',
  host_redis: process.env.HOST_REDIS || '',

  mongo_dns: process.env.MONGO_DSN || '',
  mongo_dns_ai: process.env.MONGO_DSN_AI || '',
  mongo_dns_back_office: process.env.MONGO_DSN_BO || '',

  jwt_secret: process.env.ADMIN_JWT_SECRET || '',
});
