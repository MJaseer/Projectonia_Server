import mongoose from 'mongoose'

function dbConnect() {
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },()=>{
        console.log('MongoDB connected');
    }).catch((err) => {
        console.log('data base error\n' + err);
    })
}

export default dbConnect 