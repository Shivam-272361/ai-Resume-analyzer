const cron = require("node-cron");
const fs = require("fs/promises");
const path = require("path");

// ⏱️ Change this for testing (1 min), then set back to 24 hrs
const EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours
// const EXPIRY_TIME = 60 * 1000; // 1 minute (for testing)

const uploadDir = path.join(__dirname, "../uploads");

console.log("Cleanup cron initialized");

cron.schedule("0 * * * *", async () => {
  console.log("Running file cleanup...");

  try {
    const files = await fs.readdir(uploadDir);

    if (!files.length) {
      console.log("No files found");
      return;
    }

    const now = Date.now();
    let deletedCount = 0;

    for (const file of files) {
      try {
        const filePath = path.join(uploadDir, file);

        const stats = await fs.stat(filePath);
        const fileAge = now - stats.mtimeMs;

        if (fileAge > EXPIRY_TIME) {
          await fs.unlink(filePath);
          deletedCount++;
          console.log(`Deleted file: ${file}`);
        }
      } catch (err) {
        console.log(`Error processing file ${file}:`, err.message);
      }
    }

    console.log(`Cleanup done. Deleted ${deletedCount} files`);
  } catch (err) {
    console.error("Cleanup job failed:", err.message);
  }
});