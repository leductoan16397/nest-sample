export const SERVICE_NAME = 'admin-service';
export const HCM_TIMEZONE = 'Asia/Ho_Chi_Minh';
export const BYTES_PER_MB = 1024 ** 2;
export const BYTES_PER_KB = 1024;
export const REMOVE_SPECIAL_CHARS_REGEX = /\\|\*|\(|\)|\+|\[|\?|\{|\}|\^|\$|\||\.|\/|-/gm;

export enum CdnInternalService {
  SOCIAL = 'SOCIAL_SERVICE',
  ORDER = 'ORDER_SERVICE',
  SHOP = 'SHOP_SERVICE',
  MEDIA = 'MEDIA_SERVICE',
  AI = 'AI_SERVICE',
}

export enum CdnInternalBrokerQueue {
  SOCIAL = 'SOCIAL_SERVICE_INTERNAL_QUEUE',
  ORDER = 'ORDER_SERVICE_INTERNAL_QUEUE',
  SHOP = 'SHOP_SERVICE_INTERNAL_QUEUE',
  MEDIA = 'MEDIA_SERVICE_INTERNAL_QUEUE',
  AI = 'AI_SERVICE_INTERNAL_QUEUE',
}
export enum Environment {
  LOCAL = 'local',
  DEV = 'development',
  BETA = 'beta',
  PRODUCTION = 'production',
}

export const CONN_NAME = 'CONN_NAME';
