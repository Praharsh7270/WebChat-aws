import "dotenv/config";
const secKey = process.env.CLERK_SECRET_KEY;
console.log("Secret key starts with:", secKey.substring(0, 10));
console.log("Has quotes?", secKey.includes('"') || secKey.includes("'"));
