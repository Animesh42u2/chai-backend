import mongoose, { Schema, Types } from "mongoose"

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, //one who is subscribing
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId, //one who to whom 'Subscriber' is subscribing
        ref: "User"
    }
}, {timestamps: truef})



export const subscription = mongoose.model("Subscriptions", subscriptionSchema)