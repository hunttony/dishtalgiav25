import { ObjectId } from 'mongodb';

export interface ContactFormData {
  _id?: ObjectId;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

export const ContactCollection = 'contacts';
