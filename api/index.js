const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const app = express();
const port = 3002;
const cors = require("cors");
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
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
