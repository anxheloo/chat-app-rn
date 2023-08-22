const express = require("express");
// const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const app = express();
const port = 3002;
const cors = require("cors");
app.use(cors());

var bodyParser = require("body-parser");
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(passport.initialize());
const jwt = require("jsonwebtoken");

mongoose
  .connect(
    "mongodb+srv://anxhelocenollari:anxheloo1@cluster0.lpmdi8z.mongodb.net/",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connected to Mongo Db"))
  .catch((error) => {
    console.log("Error connecting to MongoDb", error);
  });

app.listen(port, () => {
  console.log("Server running on port 3002");
});

// importing Schemas: User & Message

const User = require("./models/user");
const Message = require("./models/message");

//endpoint for registration of the user
app.post("/register", (req, res) => {
  const { name, email, password, image } = req.body;

  // create a new User object
  const newUser = new User({ name, email, password, image });

  //save the user to the database
  newUser
    .save()
    .then(() => {
      res.status(200).json({ message: "User registered successfully" });
    })
    .catch((error) => {
      console.log("Error registering the user", error);
      res.status(500).json({ message: "Error registering the user!" });
    });
});

//function to create token based on the user Id
const createToken = (userId) => {
  const payload = {
    userId: userId,
  };

  // Generate the token with a secret key and expiration time
  const token = jwt.sign(payload, "Q$r2K6W8n!jCW%Zk", { expiresIn: "1h" });

  return token;
};

//endpoint for logging in of the user
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  //check if the email and password are provied
  if (!email || !password) {
    return res
      .status(404)
      .json({ message: "Email and the password are required" });
  }

  //check for that particular user in the database
  User.findOne({ email })
    .then((user) => {
      //user not found
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      //compare the provided password with the password in the database
      if (password !== user.password) {
        return res.status(404).json({ message: "Invalid Password!" });
      }

      const token = createToken(user._id);
      res.status(200).json({ token });
    })
    .catch((error) => {
      console.log("Error in finding the user", error);
      res.status(500).json({ message: "Internal server Error!" });
    });
});

//endpoint to access all the users except the user who's currently logged in
app.get("/users/:userId", (req, res) => {
  const loggedInUserId = req.params.userId;

  User.find({ _id: { $ne: loggedInUserId } })
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((error) => {
      console.log("Error retrieving users:", error);
      res.status(500).json({ message: "Error retrieving users" });
    });
});

//endpoint to send a request to a user
app.post("/friend-request", async (req, res) => {
  const { currentUserId, selectedUserId } = req.body;

  try {
    //update the receipient's friends request array
    await User.findByIdAndUpdate(selectedUserId, {
      $push: { friendRequests: currentUserId },
    });

    //update the sender's sendFirendRequests array
    await User.findByIdAndUpdate(currentUserId, {
      $push: { sentFriendRequests: selectedUserId },
    });

    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
});

//endpoint to show all the friend requests of a user

app.get("/friend-request/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    //fetch the user document based on the User id
    const user = await User.findById(userId)
      .populate("friendRequests", "name email image")
      .lean();

    const friendRequests = user.friendRequests;

    res.json(friendRequests);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/*endpoint to accept a friend-request: Anxhelo is sending a friend request to Berti
  If berti accepts, we add each other on friends array and remove sent friend request 
  from anxhelo's array
*/
app.post("/friend-request/accept", async (req, res) => {
  try {
    const { senderId, receipientId } = req.body;

    // retreive the documents o sender and the recipient
    const sender = await User.findById(senderId);
    const receipient = await User.findById(receipientId);

    //they become friends
    // if(sender.friends.receipientId !== receipientId){
    //      sender.friends.push(receipientId);
    // }

    //     if (receipient.friends.senderId !== senderId) {
    //       receipient.friends.push(senderId);
    //     }

    sender.friends.push(receipientId);
    receipient.friends.push(senderId);

    //remove the Id from sentFriendRequsts Id
    receipient.friendRequests = receipient.friendRequests.filter(
      (request) => request.toString() !== senderId.toString()
    );

    sender.sentFriendRequests = sender.sentFriendRequests.filter(
      (request) => request.toString() !== receipientId.toString()
    );

    await sender.save();
    await receipient.save();

    res.status(200).json({ message: "Friend Request accepted successfully!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//endpoint to access all the friends of the logged in user!
app.get("/accepted-friends/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate(
      "friends",
      "name email image"
    );

    const acceptedFriends = user.friends;
    res.status(200).json(acceptedFriends);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Serve Error" });
  }
});

// Multer Configuration
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb(null, path.join(__dirname, "files"));
    cb(null, "files"); //specify the desired destination folder
  },
  filename: function (req, file, cb) {
    //Generate a unique filename for the uploaded file
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

//endpoint to post Messages and store it in the backend
app.post("/messages", upload.single("imageFile"), async (req, res) => {
  // console.log("1231232131231232132131232132132132");

  try {
    // const formData = req.body;
    // console.log("THis is formData", formData);

    const _parts = req.body;
    // console.log("THis is _parts: ", _parts);
    const { uri, base64 } = _parts[3][1];

    // const { data } = req.body;

    // console.log("THis is uri", uri);
    // console.log("THis is base64", base64);

    // console.log("THis is data.userId", data.userId);

    // console.log("This is uri: ", uri);

    const senderId = _parts[0][1];
    const recepientId = _parts[1][1];
    const messageType = _parts[2][1];
    let messageText = "";

    if (messageType === "text") {
      messageText = _parts[3][1];
    } else {
      // messageText = uri;
      messageText = base64;
      // const destinationFilePath = `files/${uri}`;

      // const fs = require("fs");
      // fs.copyFileSync(uri, destinationFilePath);
    }

    const newMessage = new Message({
      senderId,
      recepientId,
      messageType,
      message: messageType === "text" ? messageText : null,
      timestamp: new Date(),
      imageUrl: messageType === "image" ? base64 : null,
      // imageUrl: messageType === "image" ? base64 : null,
      // imageUrl: messageType === "image" ? req.file.path : null,
    });

    // console.log(newMessage);

    await newMessage.save();

    res.status(200).json({ message: "Message sent Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//endpoint to get the user details to design the chat Room header
app.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    //fetch the user data from the userId
    const recepientId = await User.findById(userId);

    res.json(recepientId);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//endpoint to fetch the messages between two users in the chat room
app.get("/messages/:senderId/:recepientId", async (req, res) => {
  try {
    const { senderId, recepientId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: senderId, recepientId: recepientId },
        { senderId: recepientId, recepientId: senderId },
      ],
    }).populate("senderId", "_id name");

    res.json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//endpoint to delete the messages!
app.post("/deleteMessages", async (req, res) => {
  try {
    const messages = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: "Invalid Request Body" });
    }

    await Message.deleteMany({ _id: { $in: messages } });

    res.status(200).json({ message: "Message deleted Successfully!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server" });
  }
});
