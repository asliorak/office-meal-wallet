import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Account extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', unique: true, required: true })
  userId!: Types.ObjectId;

  // Para tutarlarını float yerine her zaman kuruş (integer) olarak tutuyoruz!
  @Prop({ required: true, default: 0, min: 0 })
  balance!: number;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
