import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { Plus, Edit, Trash2, FileText, ExternalLink, Filter, Eye, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import PDFViewer from '../components/PDFViewer';

const ChaptersPage = () => {
  const [chapters, setChapters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ subjectId: '', class: '', search: '' });
  
  // PDF Viewer State
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState({ url: '', title: '' });

  useEffect(() => {
    fetchChapters();
    fetchSubjects();
    fetchClasses();
  }, []);

  const fetchChapters = async () => {
    try {
      const { data } = await axios.get('/api/chapters');
      setChapters(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this chapter?')) {
      try {
        await axios.delete(`/api/admin/chapter/${id}`);
        fetchChapters();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredChapters = chapters.filter(c => {
    const chapterClassId = typeof c.class === 'object' ? c.class?._id : c.class;
    const chapterSubjectId = typeof c.subjectId === 'object' ? c.subjectId?._id : c.subjectId;
    
    const matchesSearch = !filter.search || 
      c.title.en.toLowerCase().includes(filter.search.toLowerCase()) || 
      (c.title.as && c.title.as.toLowerCase().includes(filter.search.toLowerCase()));
    
    const matchesSubject = !filter.subjectId || chapterSubjectId === filter.subjectId;
    const matchesClass = !filter.class || chapterClassId === filter.class;
    
    return matchesSearch && matchesSubject && matchesClass;
  });

  const openViewer = (url, title) => {
    setSelectedPdf({ url, title });
    setIsViewerOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Chapters</h1>
          <p className="text-slate-500">Manage your chapter-wise notes and PDF files.</p>
        </div>
        <Link
          to="/upload"
          className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Plus size={20} />
          <span>Upload New Chapter</span>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-[2] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search chapters..." 
            className="input-field pl-12"
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          />
        </div>
        <div className="flex-1 flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
          <Filter size={18} className="text-slate-400 shrink-0" />
          <select
            className="bg-transparent outline-none text-sm font-medium w-full"
            value={filter.subjectId}
            onChange={(e) => setFilter({ ...filter, subjectId: e.target.value })}
          >
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s._id} value={s._id}>{s.name.en}</option>)}
          </select>
        </div>
        <div className="flex-1 flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
          <Filter size={18} className="text-slate-400 shrink-0" />
          <select
            className="bg-transparent outline-none text-sm font-medium w-full"
            value={filter.class}
            onChange={(e) => setFilter({ ...filter, class: e.target.value })}
          >
            <option value="">All Classes</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
      </div>


      <div className="card overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">No.</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest min-w-[200px]">Chapter Title</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest min-w-[150px]">Subject</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">PDF</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest min-w-[120px]">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan="6" className="p-10 text-center">Loading chapters...</td></tr>
              ) : filteredChapters.length === 0 ? (
                <tr><td colSpan="6" className="p-10 text-center text-slate-500">No chapters found.</td></tr>
              ) : filteredChapters.map((chapter) => (
                <tr key={chapter._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-5">
                    <span className="font-bold text-slate-400">#{chapter.chapterNumber}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="font-bold">{chapter.title.en}</div>
                    <div className="text-xs text-slate-500">{chapter.title.as || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="text-sm font-medium">
                      {subjects.find(s => s._id === (typeof chapter.subjectId === 'string' ? chapter.subjectId : chapter.subjectId._id))?.name?.en}
                    </div>
                    <div className="text-[10px] uppercase text-slate-400 tracking-wider font-bold">
                      {chapter.class?.name || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center whitespace-nowrap">
                    {chapter.pdfUrl ? (
                      <div className="flex flex-col items-center">
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-bold rounded uppercase mb-1">Uploaded</span>
                        <button
                          onClick={() => openViewer(chapter.pdfUrl, chapter.title.en)}
                          className="text-primary-600 hover:text-primary-700 inline-flex items-center gap-1 text-xs font-bold cursor-pointer"
                        >
                          View <Eye size={12} />
                        </button>
                      </div>
                    ) : (
                      <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold rounded uppercase">Missing</span>
                    )}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {new Date(chapter.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-')}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right whitespace-nowrap">

                    <div className="flex items-center justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      <Link
                        to={`/upload?edit=${chapter._id}`}
                        className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-lg"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(chapter._id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PDFViewer
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        pdfUrl={selectedPdf.url}
        title={selectedPdf.title}
      />
    </div>
  );
};

export default ChaptersPage;
