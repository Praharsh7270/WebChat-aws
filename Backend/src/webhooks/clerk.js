import express from 'express';
import User from '../models/UserModel.js';
import { Webhook } from 'svix';

const router = express.Router();

// Because we used express.raw() in index.js, req.body is a Buffer here.
router.post("/", async (req, res) => {
    try {
        const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
        
        if (!signingSecret) {
            console.error("Missing CLERK_WEBHOOK_SIGNING_SECRET");
            return res.status(500).json({ error: "Webhook signing secret is missing" });
        }

        // 1. Get the headers from Svix
        const svix_id = req.headers["svix-id"];
        const svix_timestamp = req.headers["svix-timestamp"];
        const svix_signature = req.headers["svix-signature"];

        // If there are no Svix headers, error out
        if (!svix_id || !svix_timestamp || !svix_signature) {
            return res.status(400).json({ error: "Error occurred -- no svix headers" });
        }

        // 2. Get the raw body
        const payload = req.body.toString("utf8");

        // 3. Verify the payload using Svix
        const wh = new Webhook(signingSecret);
        let evt;
        
        try {
            evt = wh.verify(payload, {
                "svix-id": svix_id,
                "svix-timestamp": svix_timestamp,
                "svix-signature": svix_signature,
            });
        } catch (err) {
            console.error("Error verifying webhook:", err.message);
            return res.status(400).json({ error: "Webhook signature verification failed" });
        }

        // 4. Process the webhook event
        const { type, data } = evt;

        if (type === "user.created" || type === "user.updated") {
            const email = data.email_addresses?.find(
                (e) => e.id === data.primary_email_address_id
            )?.email_address ?? data.email_addresses?.[0]?.email_address;

            // Fixed typo: u.find_name -> data.first_name
            const fullName = [data.first_name, data.last_name].filter(Boolean).join(" ");
            
            // Clerk recently updated profile images to use 'image_url' instead of 'profile_image_url'
            const profilePic = data.image_url || data.profile_image_url;

            // Note: Ensure your User schema expects 'clerkId' not 'clearkId'
            await User.findOneAndUpdate(
                { clerkId: data.id },
                { 
                    clerkId: data.id, 
                    email: email, 
                    FullName: fullName, 
                    profilePic: profilePic 
                },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            );
        }

        if (type === "user.deleted") {
            if (data && data.id) {
                await User.findOneAndDelete({ clerkId: data.id });
            }
        }

        return res.status(200).json({ success: true, message: "Webhook processed successfully" });

    } catch (error) {
        console.error("Unexpected error in webhook route:", error);
        return res.status(500).json({ error: "Internal server error processing webhook" });
    }
});

export default router;