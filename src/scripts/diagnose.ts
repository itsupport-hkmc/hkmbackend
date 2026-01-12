
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import nodemailer from 'nodemailer';

dotenv.config();

const diagnose = async () => {
  console.log('=== Starting Diagnostics ===');

  // 1. Check Env Vars
  console.log('\n--- 1. Environment Variables ---');
  const requiredVars = ['MONGO_URI', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET', 'EMAIL_USER', 'EMAIL_PASS'];
  const missing = requiredVars.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '));
  } else {
    console.log('✅ All required environment variables are present.');
  }

  // 2. Test MongoDB Connection
  console.log('\n--- 2. MongoDB Connection ---');
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || '', { serverSelectionTimeoutMS: 5000 });
    console.log('✅ MongoDB Connected successfully!');
    await mongoose.disconnect();
  } catch (error: any) {
    console.error('❌ MongoDB Connection Failed:', error.message);
  }

  // 3. Test Cloudinary Configuration
  console.log('\n--- 3. Cloudinary Configuration ---');
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  
  try {
    console.log('Pinging Cloudinary API...');
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary Ping Successful:', result);
  } catch (error: any) {
    console.error('❌ Cloudinary Ping Failed:', error.message);
  }

  // 4. Test Email Transporter
  console.log('\n--- 4. Email Transporter ---');
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });
        console.log('Verifying Email Transporter...');
        await transporter.verify();
        console.log('✅ Email Transporter Verified!');
      } catch (error: any) {
        console.error('❌ Email Transporter Verification Failed:', error.message);
      }
  } else {
      console.log('⚠️ Skipping Email test (credentials missing)');
  }

  console.log('\n=== Diagnostics Complete ===');
  process.exit(0);
};

diagnose();
