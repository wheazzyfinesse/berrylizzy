import mongoose, { Schema } from "mongoose";
const AddressSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    type: {
        type: String,
        enum: ["Home", "Work", "Other"],
        required: true,
    },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
}, { timestamps: true });
// AddressSchema.index(
// 	{ user: 1 },
// 	{
// 		unique: true,
// 		partialFilterExpression: { isDefault: true },
// 	},
// );
const Address = mongoose.model("Address", AddressSchema);
export default Address;
//# sourceMappingURL=addressses.js.map