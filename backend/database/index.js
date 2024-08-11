const mongoose = require('mongoose');

// Set mongoose mode to strict and deactive auto indexing
mongoose.set('strictQuery', true);
mongoose.set('autoIndex', false);

const
{
    DB_USER,
    DB_PASSWORD,
    DB_HOST,
    DB_PORT,
    DB_NAME
} = process.env;

const connectDB = async() => {
    try {
        const url = `mongodb+srv://rbxbandit:OdRx1fqpBi8XYzAY@rbxbandit.k1pawwr.mongodb.net`;

        console.log(url);
        // const conn = await mongoose.connect(process.env.DATABASE_URI, {
        //     useUnifiedTopology: true,
        //     useNewUrlParser: true
        // });

        const conn = await mongoose.connect(url, {
            useUnifiedTopology: true,
            useNewUrlParser: true
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch(err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
}

module.exports = connectDB;
