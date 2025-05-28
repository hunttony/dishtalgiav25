import { ObjectId } from 'mongodb';

export type ContactStatus = 'new' | 'in_progress' | 'resolved' | 'spam';

export interface ContactFormData {
  _id?: ObjectId;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactStatus;
  ip?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  notes?: string;
  metadata?: {
    userAgent?: string;
    referrer?: string;
  };
}

export const ContactCollection = 'contacts';

// Default values for new contacts
export const defaultContactData: Omit<ContactFormData, 'name' | 'email' | 'subject' | 'message'> = {
  status: 'new',
  createdAt: new Date(),
  updatedAt: new Date(),
};
