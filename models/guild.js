import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    id: String,
    name: String,
    messages: {
        type: Number,
        default: 0
    },
    auto_role: {
        type: String,
        default: null
    }
});

export default mongoose.model("Guild", Schema, "guilds");