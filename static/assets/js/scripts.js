  document.getElementById('formFile').addEventListener('change', function () {
    const file = this.files[0];
    const maxSizeMB = 1; // Limit in MB
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (file && file.size > maxSizeBytes) {
      document.getElementById('error').textContent = "File size must be under 1MB.";
      this.value = ""; // Clear the file input
    } else {
      document.getElementById('error').textContent = "";
    }
  });