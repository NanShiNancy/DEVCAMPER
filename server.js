const path = require('path');
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser')
const errorHandler = require('./middleware/error');
const connectDB = require("./config/db");

//Load env vars
dotenv.config({
  path: "./config/config.env",
});

//Connect to database;
connectDB();

//Route files
const bootcamps = require("./routes/bootcamps.js");
const courses = require("./routes/courses.js");
const auth = require('./routes/auths');
const users = require('./routes/users');

const app = express();

//Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

//Dev logging middleware
if (process.env.NODE_ENV == "development") {
  app.use(morgan("dev"));
}

// File uploading
app.use(fileupload());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

//Mount routers
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);

//when call next(err) 
//to use the errorHandler function, it must be put after Mount rounters
app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("Hello from express");
});

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server runnning in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow
    .bold
  )
);

//Handle unhandeled promis rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  //Close server and exit process
  server.close(() => process.exit(1));
});