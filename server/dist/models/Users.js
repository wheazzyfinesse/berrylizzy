import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    clerkId: { type: String },
    name: { type: String, trim: true },
    email: { type: String, unique: true, trim: true },
    image: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
}, { timestamps: true });
const User = mongoose.model("User", userSchema);
export default User;
//# sourceMappingURL=Users.js.map