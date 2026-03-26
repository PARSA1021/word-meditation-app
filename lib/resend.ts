import { Resend } from 'resend';

// Only initialize if the environment variable is available
export const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;
