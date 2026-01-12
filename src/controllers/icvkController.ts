
import { Request, Response } from 'express';
import Registration from '../models/Registration';
import { sendRegistrationEmailAsync } from '../services/emailService';

// Validate Cloudinary URL
const validateCloudinaryUrl = (url: string, cloudName: string): boolean => {
  if (typeof url !== 'string') return false;
  
  // Match Cloudinary URL pattern with version number
  const pattern = new RegExp(
    `^https://res\\.cloudinary\\.com/${cloudName}/image/upload/v\\d+/icvk/registrations/`
  );
  return pattern.test(url);
};

export const createRegistration = async (req: Request, res: Response) => {
  console.log("[Controller] createRegistration called");

  try {
    const body = req.body;
    const { childPhotoUrl, paymentScreenshotUrl } = body;

    // Get cloud name from environment
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    
    if (!cloudName) {
      console.error("[Controller] CLOUDINARY_CLOUD_NAME not configured");
      return res.status(500).json({ 
        success: false,
        message: 'Server configuration error' 
      });
    }

    // Validate URLs are provided
    if (!childPhotoUrl || !paymentScreenshotUrl) {
      return res.status(400).json({ 
        success: false,
        message: 'Both childPhotoUrl and paymentScreenshotUrl are required' 
      });
    }

    // Validate URLs are valid Cloudinary URLs with correct folder
    if (!validateCloudinaryUrl(childPhotoUrl, cloudName)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid childPhotoUrl. Must be a valid Cloudinary URL in icvk/registrations folder' 
      });
    }

    if (!validateCloudinaryUrl(paymentScreenshotUrl, cloudName)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid paymentScreenshotUrl. Must be a valid Cloudinary URL in icvk/registrations folder' 
      });
    }

    // Create registration with validated URLs
    const registration = new Registration({
      ...body,
      dob: new Date(body.dob),
      mediaConsent: body.mediaConsent === 'Yes' || body.mediaConsent === 'true',
      childPhotoUrl,
      paymentScreenshotUrl,
    });

    console.log("[Controller] Saving registration to DB...");
    const savedRegistration = await registration.save();
    console.log("[Controller] Registration saved:", savedRegistration._id);

    // ✅ RESPOND IMMEDIATELY (CRITICAL - under 200ms)
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      registrationId: savedRegistration._id,
    });

    // 🔥 SEND EMAIL ASYNC (NON-BLOCKING - does not affect response time)
    if (body.email) {
      sendRegistrationEmailAsync(body.email, savedRegistration);
    }

  } catch (error: any) {
    console.error("🔥 [Controller] Create Registration Error:", error);
    res.status(500).json({ 
      success: false,
      message: 'Registration Failed', 
      error: error.message || 'Unknown Error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const getRegistrations = async (req: Request, res: Response) => {
    try {
        const registrations = await Registration.find().sort({ createdAt: -1 });
        res.json(registrations);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
