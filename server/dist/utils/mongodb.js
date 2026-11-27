import mongoose from "mongoose";
export const connectToMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("You successfully connected to MongoDB!");
        return mongoose;
    }
    catch (err) {
        console.dir(err);
    }
};
// Call this only when your application terminates
export async function disconnectFromMongoDB() {
    await mongoose.connection.close();
}
//# sourceMappingURL=mongodb.js.map