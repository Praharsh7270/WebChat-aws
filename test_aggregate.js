import mongoose from "mongoose";

async function run() {
    try {
        await mongoose.connect("mongodb+srv://praharshsingh26_db_user:AUUdfKSepcrdhmyv@cluster0.wpi7osr.mongodb.net/webchat?appName=Cluster0");
        const Message = mongoose.model("Message", new mongoose.Schema({ senderId: mongoose.Schema.Types.ObjectId, receiverId: mongoose.Schema.Types.ObjectId, text: String }, { strict: false }));
        
        const loggedInUser = new mongoose.Types.ObjectId('6a8bf36e69cfbc8e70f6aede');
        const senderOrReceiverQuery = [
            { senderId: loggedInUser },
            { receiverId: loggedInUser }
        ];
        const conveersations = await Message.aggregate([
                {
                    $match: {
                        $or: senderOrReceiverQuery
                    }
                },
                {
                    $group: {
                        _id: {
                            $cond: [
                                { $eq: ["$senderId", loggedInUser] },
                                "$receiverId",
                                "$senderId"
                            ]
                        },
                        latestMessage: { $first: "$$ROOT" },
                    }
                },
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $sort: { "latestMessage.createdAt": -1 }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "_id",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $replaceRoot: { newRoot: { $arrayElemAt: ["$user", 0] } }
                },
                {
                    $project: {
                        _id: 1,
                        FullName: 1,
                        profilePic: 1,
                    }
                }
            ]);
        console.log("Conversations:", JSON.stringify(conveersations, null, 2));
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}
run();
