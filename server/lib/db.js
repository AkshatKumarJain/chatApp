import mongoose from "mongoose";

const getMongoUri = () => {
    const uri = process.env.MONGODB_URI;

    if(!uri)
    {
        throw new Error("MONGODB_URI is required");
    }

    const [baseUri, queryString] = uri.split("?");
    const hasDatabaseName = /mongodb(?:\+srv)?:\/\/[^/]+\/[^/?]+/.test(baseUri);

    if(hasDatabaseName)
    {
        return uri;
    }

    return `${baseUri.replace(/\/$/, "")}/chatApp${queryString ? `?${queryString}` : ""}`;
}

export const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => {
            console.log('Database connected');
        })
        await mongoose.connect(getMongoUri())
    } catch (error) {
        console.log(error);
        throw error;
    }
}
