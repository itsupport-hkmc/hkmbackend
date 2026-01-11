
import { Request, Response } from 'express';
import Registration from '../models/Registration';
import { sendRegistrationEmailAsync } from '../services/emailService';

export const createRegistration = async (req: Request, res: Response) => {
  console.log("[Controller] createRegistration called");

  try {
    const body = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files?.childPhoto?.length || !files?.paymentScreenshot?.length) {
      return res.status(400).json({ message: 'Both images are required' });
    }

    const registration = new Registration({
      ...body,
      dob: new Date(body.dob),
      mediaConsent: body.mediaConsent === 'Yes' || body.mediaConsent === 'true',
      childPhotoUrl: files.childPhoto[0].path,
      paymentScreenshotUrl: files.paymentScreenshot[0].path,
    });

    console.log("[Controller] Saving registration to DB...");
    const savedRegistration = await registration.save();
    console.log("[Controller] Registration saved:", savedRegistration._id);

    // ✅ RESPOND IMMEDIATELY (CRITICAL)
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      registrationId: savedRegistration._id,
    });

    // 🔥 SEND EMAIL ASYNC (NON-BLOCKING)
    if (body.email) {
      sendRegistrationEmailAsync(body.email, savedRegistration);
    }

  } catch (error) {
    console.error("[Controller] Error:", error);
    res.status(500).json({ message: 'Server Error' });
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
