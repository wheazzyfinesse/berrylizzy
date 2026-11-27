import mongoose from "mongoose";
import type { IProduct } from "../types/index.js";
declare const Product: mongoose.Model<IProduct, {}, {}, {}, mongoose.Document<unknown, {}, IProduct, {}, mongoose.DefaultSchemaOptions> & IProduct & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IProduct & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
export default Product;
//# sourceMappingURL=products.d.ts.map