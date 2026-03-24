const cron = require("node-cron");
const fs = require("fs/promises");
const path = require("path");
const Resume = require("../models/resume");

cron.schedule("0 * * * *", async () => {
  console.log("Running cleanup job...");

  const expiredResumes = await Resume.find({
    expiresAt: { $lt: new Date() }
  });

  for (const resume of expiredResumes) {
    try {
      if (!resume.fileURL) continue;

      const fileName = resume.fileURL.split("/").pop();
      const filePath = path.join(__dirname, "../uploads", fileName);

      // delete file (no exists check needed)
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.log("File already deleted or missing");
      }

      // delete DB record
      await Resume.findByIdAndDelete(resume._id);

      console.log(`Deleted: ${fileName}`);
    } catch (err) {
      console.log("Error deleting file:", err);
    }
  }

  console.log(`Cleanup done. Removed ${expiredResumes.length} items`);
});