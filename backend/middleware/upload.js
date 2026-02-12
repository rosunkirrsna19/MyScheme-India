const multer = require('multer');
const path = require('path');

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save files to the 'backend/uploads/documents' directory
    cb(null, 'uploads/documents/');
  },
  filename: (req, file, cb) => {
    // Create a unique filename: fieldname-timestamp.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to allow only certain file types
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|pdf|doc|docx/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: PDF, DOC, or Images Only!'));
  }
}

// Initialize multer with storage configuration
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

// Custom error handler for multer
const uploadMiddleware = (req, res, next) => {
  // --- THIS IS THE UPDATED LINE ---
  const uploader = upload.array('documents', 10); // Now allows up to 10 files

  uploader(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred (e.g., file too large)
      return res.status(400).json({ msg: err.message });
    } else if (err) {
      // An unknown error occurred (e.g., our custom file type error)
      return res.status(400).json({ msg: err.message });
    }
    // Everything went fine
    next();
  });
};

module.exports = uploadMiddleware;