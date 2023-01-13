import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    id: String,
    guilds: {
        type: Object,
        default: {
            level: {
                type: Number,
                default: 0
            },
            xp: {
                type: Number,
                default: 0
            },
            warnings: {
                type: Number,
                default: 0
            }
        }
    }
});

export default mongoose.model('Member', Schema, 'members');