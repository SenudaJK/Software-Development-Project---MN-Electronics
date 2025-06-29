// filepath: d:\Java\MN Electronics\config\cloudinary.js
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
// const cloudinary = require("../config/cloudinary");
console.log("Cloudinary Loaded:", cloudinary.config());

// Configure Cloudinary with hardcoded credentials
cloudinary.config({
    cloud_name: "dl3a1lhfh", 
    api_key: "172758113856911", 
    api_secret: "3D5O4HkCkCROxYVzcmI2mdg5-9g", 
});

console.log("Cloudinary Config in cloudinary.js:", cloudinary.config()); // Debug log

module.exports = cloudinary;