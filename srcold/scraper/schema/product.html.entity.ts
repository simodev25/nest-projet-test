import { prop } from '@typegoose/typegoose';
import { Schema } from 'mongoose';

export class ProductHtmlEntity {

  @prop({ type: Schema.Types.String })
  sourceHtml: string;
}
