import express from 'express'
import User from '../models/user.js'
import {verifyWebhook} from '@clerk/clerk-sdk-node'

const router = express.Router()

router.post("/", async(req,res) => {
    try{
        
    const sigingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
    if(!sigingSecret){
        return res.status(500).json({error: "Webhook signing secret is not defined in the environment variables"});
    }

    const payload = Buffer.isBuffer(req.body) ? req.body.toString("utf:8") : JSON.stringify(req.body); 
    const request = new Request("http://internal/webhooks/clerk",{
        method: "POST",
        headers: new Header(req.headers),
        body: payload
    });

    const evt = await verifyWebhook(request, sigingSecret);

    if(evt.type === "user.created" || evt.type === "user.updated"){
        const u = evt.data;

        const email = u.email_addresses?.find((e) => e.id === u.primary_email_address_id)?.email_address ?? u.email_addresses?.[0]?.email_address;


        const FullName = [u.find_name, u.last_name].filter(Boolean).join(" ");

        await User.findOneAndUpdate(
            {clearkId: u.id},
            {clearkId: u.id, email, FullName, profilePic: u.profile_image_url},
            {new:true, upsert:true,setDefaultsOnInsert:true}
        )
    }

    if (evt.type === "user.deleted"){
        if(evt.data && evt.data.id){
            await User.findOneAndDelete({clearkId: evt.data.id});
        }
    }

    res.status(200).json({message: "Webhook processed successfully"});
    }
    catch(error){
        console.error("Error processing webhook:", error);
        res.status(500).json({error: "Internal server error"});
    }
    })

export default router