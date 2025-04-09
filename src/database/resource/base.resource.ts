import { Prop } from '@nestjs/mongoose';
import { MongooseDefaultQueryMiddleware } from 'mongoose';

/**
 * Mixin class to add timestamp fields to a resource.
 */
export class TimestampMixin {
  /**
   * The date and time when the resource was created.
   * @type {Date}
   * @schema {created_at: {type: 'string', format: 'date-time'}}
   * @prop {created_at}
   */
  created_at?: Date;

  /**
   * The date and time when the resource was last updated.
   * @type {Date}
   * @schema {updated_at: {type: 'string', format: 'date-time'}}
   * @prop {updated_at}
   */
  updated_at?: Date;
}

/**
 * Represents an entity with modification metadata.
 */
export class ModifierEntity {
  /**
   * The date and time when the entity was created.
   * @type {Date}
   */
  created_at?: Date;

  /**
   * The date and time when the entity was last updated.
   * @type {Date}
   */
  updated_at?: Date;

  /**
   * The type of update performed on the entity.
   * @type {string}
   * @decorator Prop
   */
  @Prop({})
  updated_type?: string;

  /**
   * The identifier of the user who performed the last update.
   * @type {string}
   * @decorator Prop
   */
  @Prop({})
  updated_by?: string;
}

/**
 * Represents an entity that can be deleted.
 */
export class DeleteEntity {
  /**
   * The date and time when the entity was created.
   * @optional
   */
  created_at?: Date;

  /**
   * The date and time when the entity was last updated.
   * @optional
   */
  updated_at?: Date;

  /**
   * The date and time when the entity was deleted.
   * Defaults to null.
   * @optional
   */
  @Prop({ default: null })
  deleted_at?: Date;

  /**
   * The type of deletion that occurred.
   * @optional
   */
  @Prop({})
  deleted_type?: string;

  /**
   * The identifier of the user who deleted the entity.
   * @optional
   */
  @Prop({})
  deleted_by?: string;
}

/**
 * Represents an entity with fields for tracking creation, modification, and deletion metadata.
 */
export class DeleteAndModifierEntity {
  /**
   * The date and time when the entity was created.
   * @type {Date}
   */
  created_at?: Date;

  /**
   * The date and time when the entity was last updated.
   * @type {Date}
   */
  updated_at?: Date;

  @Prop({})
  created_type?: string;

  @Prop({})
  created_by?: string;
  /**
   * The date and time when the entity was deleted.
   * Defaults to null.
   * @type {Date}
   */
  @Prop({ default: null })
  deleted_at?: Date;

  /**
   * The type of deletion performed on the entity.
   * @type {string}
   */
  @Prop({})
  deleted_type?: string;

  /**
   * The identifier of the user who deleted the entity.
   * @type {string}
   */
  @Prop({})
  deleted_by?: string;

  /**
   * The type of update performed on the entity.
   * @type {string}
   */
  @Prop({})
  updated_type?: string;

  /**
   * The identifier of the user who last updated the entity.
   * @type {string}
   */
  @Prop({})
  updated_by?: string;
}

export enum LogAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export const READ_MODE = 'secondaryPreferred';

export const QUERY_MIDDLEWARES: MongooseDefaultQueryMiddleware[] = [
  'estimatedDocumentCount',
  'countDocuments',
  'deleteMany',
  'distinct',
  'find',
  'findOne',
  'findOneAndDelete',
  'findOneAndReplace',
  'findOneAndUpdate',
  'replaceOne',
  'updateMany',
  'updateOne',
  'deleteOne',
];
