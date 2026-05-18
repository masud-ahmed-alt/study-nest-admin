import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from '../api/axios';
import { Upload, FileText, X, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UploadPDFPage = () => {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    titleEn: '',
    titleAs: '',
    class: '',
    subjectId: '',
    partId: '',
    chapterNumber: '',
  });

  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [parts, setParts] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSubjects();
    fetchClasses();
    if (editId) fetchChapterData();
  }, [editId]);

  useEffect(() => {
    if (formData.subjectId) fetchParts(formData.subjectId);
  }, [formData.subjectId]);

  const fetchSubjects = async () => {
    try {
      const { data } = await axios.get('/api/subjects');
      setSubjects(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchClasses = async () => {
    try {
      const { data } = await axios.get('/api/classes');
      setClasses(data);
      if (data.length > 0 && !formData.class) {
        setFormData(prev => ({ ...prev, class: data[0]._id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchParts = async (subjectId) => {
    try {
      const { data } = await axios.get(`/api/parts?subjectId=${subjectId}`);
      setParts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchChapterData = async () => {
    try {
      const { data } = await axios.get(`/api/chapter/${editId}`);
      setFormData({
        titleEn: data.title.en,
        titleAs: data.title.as || '',
        class: typeof data.class === 'object' ? data.class._id : data.class,
        subjectId: typeof data.subjectId === 'object' ? data.subjectId._id : data.subjectId,
        partId: data.partId ? (typeof data.partId === 'object' ? data.partId._id : data.partId) : '',
        chapterNumber: data.chapterNumber,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setError('');
    } else {
      setError('Please select a valid PDF file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile && !editId) {
      setError('Please select a PDF file to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10); // Start progress

    const data = new FormData();
    data.append('title[en]', formData.titleEn);
    data.append('title[as]', formData.titleAs);
    data.append('class', formData.class);
    data.append('subjectId', formData.subjectId);
    if (formData.partId) data.append('partId', formData.partId);
    data.append('chapterNumber', formData.chapterNumber);
    if (selectedFile) data.append('pdf', selectedFile);

    try {
      setUploadProgress(40);
      if (editId) {
        await axios.put(`/api/admin/chapter/${editId}`, data);
      } else {
        await axios.post('/api/admin/chapter', data);
      }
      setUploadProgress(100);
      setSuccess(true);
      setTimeout(() => navigate('/chapters'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{editId ? 'Edit Chapter' : 'Upload Chapter PDF'}</h1>
        <p className="text-slate-500 text-sm md:text-base">Provide chapter details and upload the PDF file.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1">Class</label>
                <select
                  className="input-field"
                  value={formData.class}
                  onChange={(e) => setFormData({...formData, class: e.target.value})}
                  required
                >
                  <option value="" className="dark:bg-slate-900">Select Class</option>
                  {classes.map(c => <option key={c._id} value={c._id} className="dark:bg-slate-900">{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1">Subject</label>
                <select
                  className="input-field"
                  value={formData.subjectId}
                  onChange={(e) => setFormData({...formData, subjectId: e.target.value})}
                  required
                >
                  <option value="" className="dark:bg-slate-900">Select Subject</option>
                  {subjects.filter(s => (s.class?._id || s.class) === formData.class).map(s => (
                    <option key={s._id} value={s._id} className="dark:bg-slate-900">{s.name.en}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1">Part (Optional)</label>
                <select
                  className="input-field"
                  value={formData.partId}
                  onChange={(e) => setFormData({...formData, partId: e.target.value})}
                  disabled={parts.length === 0}
                >
                  <option value="" className="dark:bg-slate-900">No Part</option>
                  {parts.map(p => (
                    <option key={p._id} value={p._id} className="dark:bg-slate-900">{p.title.en}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1">Chapter No.</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                  className="input-field font-bold"
                  value={formData.chapterNumber}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^[0-9]+$/.test(val)) {
                      setFormData({...formData, chapterNumber: val});
                    }
                  }}
                  required
                />
              </div>
            </div>

            <div className="space-y-4 md:space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1">Chapter Title (English)</label>
                <input
                  type="text"
                  className="input-field text-lg md:text-xl font-bold py-3 md:py-4"
                  value={formData.titleEn}
                  onChange={(e) => setFormData({...formData, titleEn: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1">Chapter Title (Assamese)</label>
                <input
                  type="text"
                  className="input-field text-lg md:text-xl font-bold py-3 md:py-4"
                  value={formData.titleAs}
                  onChange={(e) => setFormData({...formData, titleAs: e.target.value})}
                />
              </div>
            </div>


            <div className="pt-4">
              <button 
                type="submit" 
                disabled={isUploading}
                className="btn-primary w-full flex items-center justify-center gap-2 h-14"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    <span>Processing... {uploadProgress}%</span>
                  </>
                ) : (
                  <>
                    <Upload size={24} />
                    <span>{editId ? 'Update Chapter' : 'Upload Chapter'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>


        <div className="space-y-6">
          <div className="card h-fit">
            <h2 className="text-lg font-bold mb-4">PDF File</h2>
            <div 
              onClick={() => fileInputRef.current.click()}
              className={`
                border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all
                ${selectedFile ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-slate-200 dark:border-slate-800 hover:border-primary-400'}
              `}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".pdf" 
                className="hidden" 
              />
              <div className={`p-4 rounded-full ${selectedFile ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                {selectedFile ? <CheckCircle2 size={32} /> : <FileText size={32} />}
              </div>
              <div className="text-center">
                <p className="font-bold">{selectedFile ? selectedFile.name : 'Select PDF'}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'Max size 20MB'}
                </p>
              </div>
            </div>

            {selectedFile && (
              <button 
                onClick={() => setSelectedFile(null)}
                className="w-full mt-4 flex items-center justify-center gap-2 text-red-500 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/10 p-2 rounded-xl transition-colors"
              >
                <X size={16} />
                <span>Remove File</span>
              </button>
            )}
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 p-4 rounded-2xl flex items-start gap-3"
              >
                <AlertCircle className="text-red-500 shrink-0" size={20} />
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 p-4 rounded-2xl flex items-start gap-3"
              >
                <CheckCircle2 className="text-green-500 shrink-0" size={20} />
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">Chapter uploaded successfully! Redirecting...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                <span>Uploading to Cloudinary</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  className="h-full bg-primary-600 shadow-[0_0_10px_rgba(14,165,233,0.5)]"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadPDFPage;
