import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SoftwareTeamDocument = HydratedDocument<SoftwareTeam>;

@Schema()
export class SoftwareTeam {
  @Prop({ required: true })
  'username': string;

  @Prop({ required: true })
  'password': string;
}

export const SoftwareTeamSchema = SchemaFactory.createForClass(SoftwareTeam);
