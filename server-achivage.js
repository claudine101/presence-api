const express = require("express");
const https = require('https')
const http = require('http')
const fs = require('fs');
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const ip = require('ip')
const fileUpload = require("express-fileupload");
const RESPONSE_CODES = require("./constants/RESPONSE_CODES");
const RESPONSE_STATUS = require("./constants/RESPONSE_STATUS");
// const adminRouter = require("./routes/administration/adminRouter");

const app = express();
const bindUser = require("./middleware/bindUser");
const adminRouter = require("./routes/administration/administrationRouter");


dotenv.config({ path: path.join(__dirname, "./.env") });

const { Server } = require("socket.io");
const authRouter = require("./routes/auth/auth_usersRoutes");
app.use(cors());
app.set('view engine','ejs');
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(fileUpload());

app.use("/admin", adminRouter)


app.all('*', bindUser)
app.use('/auth', authRouter)
app.use('/admin', adminRouter)
app.all("*", (req, res) => {
          res.status(RESPONSE_CODES.NOT_FOUND).json({
                    statusCode: RESPONSE_CODES.NOT_FOUND,
                    httpStatus: RESPONSE_STATUS.NOT_FOUND,
                    message: "Route non trouvé",
                    result: []
          })
});
const port = process.env.PORT || 8000;
const isHttps = false
var server
if (isHttps) {
          var options = {
                    key: fs.readFileSync('/var/www/html/api/https/privkey.pem'),
                    cert: fs.readFileSync('/var/www/html/api/https/fullchain.pem')
          };
          server = https.createServer(options, app)
} else {
          server = http.createServer(app);
}
const io = new Server(server);
io.on('connection', socket => {
          socket.on('join', (data) => {
                    console.log(data.userId, "Connect to a socket")
                    socket.join(data.userId)
          })
})
io.on('disconnect', () => {
          console.log('user disconnected')
})
app.io = io
server.listen(port, async () => {
          console.log(`${(process.env.NODE_ENV).toUpperCase()} - Server is running on : http://${ip.address()}:${port}/`);
});