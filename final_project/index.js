const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
app.use(express.json());

// Session middleware for "/customer" routes
app.use("/customer", session({
  secret: "fingerprint_customer", // Secret key for session encryption
  resave: true,                   // Forces the session to be saved back to the store
  saveUninitialized: true         // Forces a session that is "uninitialized" to be saved to the store
}));

// Authentication middleware for "/customer/auth/*" routes
app.use("/customer/auth/*", function auth(req, res, next) {
  // Check if the session contains an authorization object with an access token
  if (req.session.authorization) {
    const token = req.session.authorization['accessToken']; // Access token from session
    jwt.verify(token, "access", (err, user) => { // Verify the JWT token
      if (!err) {
        req.user = user; // Attach the user object to the request
        next();          // Proceed to the next middleware/route handler
      } else {
        return res.status(403).json({ message: "User not authenticated" }); // Token verification failed
      }
    });
  } else {
    return res.status(403).json({ message: "User not logged in" }); // No session data found
  }
});

const PORT = 5000;

// Use the customer and general routes
app.use("/customer", customer_routes);
app.use("/", genl_routes);

// Start the server
app.listen(PORT, () => console.log("Server is running on port " + PORT));
