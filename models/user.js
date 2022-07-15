import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    id: String,
    chatbridge: {
        color: {
            type: String,
            default: null
        },
        enabled: {
            type: Boolean,
            default: false
        }
    },
    reminder: {
        note: {
            type: String,
            default: null
        },
        time: {
            type: String,
            default: null
        }
    }
});

export default mongoose.model("User", Schema, "users");