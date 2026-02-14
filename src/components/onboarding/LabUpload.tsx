"use client";

import React, { useState, useRef, useCallback } from "react";

// Supported file types
const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface LabFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadProgress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
}

export interface LabUploadProps {
  patientId?: string;
  onUploadComplete: (files: LabFile[]) => void;
  onSkip?: () => void;
  maxFiles?: number;
  className?: string;
}

export function LabUpload({
  patientId,
  onUploadComplete,
  onSkip,
  maxFiles = 5,
  className = "",
}: LabUploadProps) {
  const [files, setFiles] = useState<LabFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate unique file ID
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Validate file
  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return "Invalid file type. Please upload a PDF or image (JPEG, PNG, WebP).";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File is too large. Maximum size is 10MB.";
    }
    return null;
  };

  // Add files to the list
  const addFiles = (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const remainingSlots = maxFiles - files.length;
    
    if (remainingSlots <= 0) {
      setError(`Maximum ${maxFiles} files allowed.`);
      return;
    }

    const validFiles: LabFile[] = [];
    const duplicateNames = new Set(files.map(f => f.name));

    fileArray.slice(0, remainingSlots).forEach((file) => {
      const error = validateFile(file);
      if (error) {
        setError(error);
        return;
      }
      if (duplicateNames.has(file.name)) {
        setError(`File "${file.name}" already exists.`);
        return;
      }

      validFiles.push({
        id: generateId(),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadProgress: 0,
        status: "pending",
      });
    });

    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
      setError(null);
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      // Reset input
      e.target.value = "";
    }
  };

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, []);

  // Remove file from list
  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Simulate file upload (replace with actual API call)
  const uploadFile = async (file: LabFile): Promise<LabFile> => {
    // Update status to uploading
    setFiles((prev) =>
      prev.map((f) => (f.id === file.id ? { ...f, status: "uploading" as const } : f))
    );

    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, uploadProgress: progress } : f))
      );
    }

    // Simulate API call (replace with actual upload)
    const formData = new FormData();
    formData.append("file", new File([], file.name));
    formData.append("patientId", patientId || "");

    try {
      // Actual API call would go here
      // const response = await fetch("/api/documents/upload", {
      //   method: "POST",
      //   body: formData,
      // });

      // Simulate success
      await new Promise((resolve) => setTimeout(resolve, 500));

      return { ...file, status: "completed" as const, uploadProgress: 100 };
    } catch (err) {
      return {
        ...file,
        status: "error" as const,
        error: "Upload failed. Please try again.",
      };
    }
  };

  // Upload all files
  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    const pendingFiles = files.filter((f) => f.status === "pending");

    try {
      const uploadedFiles: LabFile[] = [];
      for (const file of pendingFiles) {
        const result = await uploadFile(file);
        uploadedFiles.push(result);
      }

      onUploadComplete(uploadedFiles);
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Get file icon
  const getFileIcon = (type: string): string => {
    if (type === "application/pdf") return "📄";
    if (type.startsWith("image/")) return "🖼️";
    return "📁";
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Lab Results</h2>
        <p className="text-gray-600">
          Upload your lab results and medical documents. You can upload PDFs or images.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${isDragging
            ? "border-teal-500 bg-teal-50"
            : "border-gray-300 hover:border-teal-400"
          }
        `}
      >
        <div className="mb-4">
          <svg
            className={`mx-auto h-12 w-12 ${isDragging ? "text-teal-500" : "text-gray-400"}`}
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="text-gray-700 mb-2">
          <span className="font-semibold text-teal-600">Click to upload</span> or drag and drop
        </p>
        <p className="text-sm text-gray-500">
          PDF, PNG, JPG or WebP (max 10MB each)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_FILE_TYPES.join(",")}
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="lab-file-upload"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          Select Files
        </button>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-800">
              Selected Files ({files.length}/{maxFiles})
            </h3>
            <button
              onClick={() => setFiles([])}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
              >
                <span className="text-2xl">{getFileIcon(file.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  {file.status === "uploading" && (
                    <div className="mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-teal-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${file.uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{file.uploadProgress}%</p>
                    </div>
                  )}
                  {file.status === "error" && (
                    <p className="text-xs text-red-500 mt-1">{file.error}</p>
                  )}
                </div>
                {file.status === "pending" && (
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
                {file.status === "completed" && (
                  <span className="text-green-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
        {onSkip && (
          <button
            onClick={onSkip}
            disabled={isUploading}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Skip for now
          </button>
        )}
        <div className="flex gap-3 ml-auto">
          {files.some((f) => f.status === "completed") && (
            <button
              onClick={() => setFiles([])}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Upload More
            </button>
          )}
          {files.some((f) => f.status === "pending") && (
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="px-8 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Uploading...
                </span>
              ) : (
                `Upload ${files.filter((f) => f.status === "pending").length} File${
                  files.filter((f) => f.status === "pending").length > 1 ? "s" : ""
                }`
              )}
            </button>
          )}
          {files.every((f) => f.status === "completed") && (
            <button
              onClick={() => onUploadComplete(files)}
              className="px-8 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default LabUpload;
