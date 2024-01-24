type ProcessedFile = {
  name: string;
  base64: string;
};

export const processFiles = async (fileList: FileList | null) => {
  const promises = [];
  const files = fileList ?? [];

  for (let i = 0; i < files.length; i++) {
    const error: string | undefined = validateFileErrors(files[i]);
    if (error) {
      promises.push(Promise.reject(error));
      continue;
    }

    promises.push(fileToBase64(files[i]));
  }

  const results = await Promise.allSettled(promises);

  const processedFiles: ProcessedFile[] = [];
  const errors: string[] = [];

  results.forEach((result) =>
    result.status === 'fulfilled'
      ? processedFiles.push(result.value as ProcessedFile)
      : errors.push(result.reason)
  );

  return {
    files: processedFiles,
    errors,
  };
};

const fileToBase64 = (file: File) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve({ name: file.name, base64: reader.result });
    reader.onerror = reject;
  });

const validateFileErrors: (file: File) => string | undefined = (file) => {
  if (!file.type.includes('image/') && !file.type.includes('pdf')) {
    return `Filen '${file.name}' har ugyldig format. Bruk PNG, JPEG, GIF, HEIC eller PDF`;
  }
  if (file.size > 5242880) {
    return `Filen '${file.name}' er større enn 5MB`;
  }
};
