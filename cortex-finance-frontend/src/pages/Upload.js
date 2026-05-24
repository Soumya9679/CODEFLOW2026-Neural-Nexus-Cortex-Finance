import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '../api/mockService';

const Upload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      setError('Please upload a valid PDF or CSV bank statement.');
      return;
    }
    setError('');
    setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/csv': ['.csv']
    },
    maxFiles: 1
  });

  const handleAnalyze = async () => {
    if (!file) return;
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post('/upload', formData, { timeout: 120000 });
      navigate('/dashboard');
    } catch (err) {
      setError('Upload failed. Please try again.');
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F0F11] p-4 relative overflow-hidden">
      <div className="glow-orb orb-1"></div>
      
      <motion.div 
        className={`glass-panel max-w-xl w-full p-10 relative ${isUploading ? 'ai-glow' : ''}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3 text-white font-outfit">Upload Bank Statement</h2>
          <p className="text-[rgba(255,255,255,0.5)]">Let Cortex AI analyze your transactions, categorize expenses, and generate financial insights instantly.</p>
        </div>

        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 mb-6 flex flex-col items-center justify-center min-h-[250px]
            ${isDragActive ? 'border-[#D7FF3F] bg-[rgba(215,255,63,0.04)] scale-[1.02]' : 'border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.03)]'}
            ${file ? 'border-[rgba(166,255,77,0.3)] bg-[rgba(166,255,77,0.03)]' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          <AnimatePresence mode="wait">
            {file ? (
              <motion.div 
                key="file"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center text-[#A6FF4D]"
              >
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-[rgba(166,255,77,0.2)] rounded-full blur-md"></div>
                  <FileText size={64} className="relative z-10" />
                  <CheckCircle className="absolute -bottom-2 -right-2 text-[#0F0F11] bg-[#A6FF4D] rounded-full" size={24} />
                </div>
                <h4 className="text-lg font-semibold text-white truncate max-w-xs">{file.name}</h4>
                <p className="text-sm mt-1 text-[rgba(255,255,255,0.4)]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-[rgba(255,255,255,0.06)] flex items-center justify-center text-[rgba(255,255,255,0.3)] mb-4 border border-[rgba(255,255,255,0.05)]">
                  <UploadCloud size={36} />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Drag & drop your statement here</h3>
                <p className="text-sm text-[rgba(255,255,255,0.4)] mb-6">Supports PDF or CSV formats</p>
                <button className="btn btn-secondary px-6 py-2 rounded-lg text-sm" onClick={(e) => e.preventDefault()}>Browse Files</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 text-[#FF5C75] bg-[rgba(255,92,117,0.08)] p-3 rounded-xl mb-6 text-sm font-medium border border-[rgba(255,92,117,0.1)]"
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8">
          <motion.button 
            className={`btn w-full py-4 text-base font-bold rounded-xl relative overflow-hidden ${isUploading ? 'bg-[rgba(255,255,255,0.06)] text-white border border-[rgba(215,255,63,0.2)]' : 'btn-primary'}`}
            disabled={!file || isUploading}
            onClick={handleAnalyze}
            whileHover={file && !isUploading ? { scale: 1.02 } : {}}
            whileTap={file && !isUploading ? { scale: 0.98 } : {}}
          >
            {isUploading ? (
              <div className="flex items-center justify-center gap-3 w-full">
                <Loader2 className="animate-spin text-[#D7FF3F]" size={22} />
                <span className="text-[#D7FF3F] animate-pulse">Analyzing with Cortex AI...</span>
                <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
              </div>
            ) : (
              'Analyze Statement'
            )}
          </motion.button>
        </div>
        
        <div className="flex items-center justify-center gap-2 mt-6 text-xs text-[rgba(255,255,255,0.3)] font-medium">
          <CheckCircle size={14} className="text-[#A6FF4D]" />
          <span>Your data is encrypted and securely processed.</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Upload;
