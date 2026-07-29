import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Transaction extends Document {
  // Bakiye yüklemede gönderici admin olacağı için null olabilir[cite: 1]
  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  senderId!: Types.ObjectId | null;

  // Kasaya ödeme yapıldığında alıcı bir kullanıcı değil, ortak kasa olacağı için null olabilir[cite: 1]
  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  receiverId!: Types.ObjectId | null;

  @Prop({ required: true, min: 1 })
  amount!: number; // Kuruş cinsinden tutar[cite: 1]

  @Prop({ required: true, enum: ['deposit', 'payment', 'transfer'] })
  type!: string;

  @Prop({ required: true })
  description!: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
