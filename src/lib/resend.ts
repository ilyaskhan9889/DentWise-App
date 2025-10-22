
import {Resend} from 'resend';
// Initialize Resend with the API key from environment variables
export const resend = new Resend(process.env.RESEND_API_KEY);
export default resend;