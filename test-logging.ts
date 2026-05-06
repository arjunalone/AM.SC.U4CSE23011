import { Log, setCredentials } from './src/index';

// Initialize with credentials received from the registration API
// These could also be set via process.env.CLIENT_ID and process.env.CLIENT_SECRET
setCredentials(
  'a5291495-80f2-44d3-a081-ba7c289d0bdd', 
  'jezdyHXBcHFJFCJB'
);

async function testLogging() {
  console.log("Testing Log function...");

  // If an error occurs in your application's handler due to a data type mismatch
  await Log("backend", "error", "controller", "received string, expected bool");

  // If an error occurs in your application's db layer
  await Log("backend", "fatal", "db", "Critical database connection failure.");
  
  // Custom frontend log example (note: Package constraint applies to Backend mostly as per instructions, but here is a simple call)
  await Log("frontend", "info", "cache", "Frontend cache updated.");

  console.log("Logs sent to API!");
}

testLogging();
