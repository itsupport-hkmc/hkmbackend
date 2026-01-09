
import { Request, Response } from 'express';
import Registration from '../models/Registration';
import { sendRegistrationEmail } from '../services/emailService';

export const createRegistration = async (req: Request, res: Response) => {
    console.log("[Controller] createRegistration called");
    try {
        const body = req.body;
        console.log("[Controller] Body received:", JSON.stringify(body, null, 2));
        
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        if (!files || !files['childPhoto'] || !files['paymentScreenshot']) {
            console.error("[Controller] Missing files");
            return res.status(400).json({ message: 'Missing files' });
        }

        const childPhoto = files['childPhoto'][0];
        const paymentScreenshot = files['paymentScreenshot'][0];

        const registration = new Registration({
            ...body,
            dob: new Date(body.dob),
            mediaConsent: body.mediaConsent === 'Yes' || body.mediaConsent === 'true',
            childPhotoUrl: childPhoto.path,
            paymentScreenshotUrl: paymentScreenshot.path,
        });

        console.log("[Controller] Saving registration to DB...");
        const savedRegistration = await registration.save();
        console.log("[Controller] Registration saved. ID:", savedRegistration._id);
        
        // Send email
        if (body.email) {
            console.log("[Controller] Email found in body, triggering sendRegistrationEmail...");
            const emailResult = await sendRegistrationEmail(body.email, savedRegistration);
            console.log("[Controller] Email send result:", emailResult);
        } else {
            console.warn("[Controller] No email field found in registration body. Skipping email.");
        }

        res.status(201).json({ message: 'Registration successful', registration: savedRegistration });
    } catch (error) {
        console.error("[Controller] Error in createRegistration:", error);
        res.status(500).json({ message: 'Server Error', error: (error as Error).message });
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
