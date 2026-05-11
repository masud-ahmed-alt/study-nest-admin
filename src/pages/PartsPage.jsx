import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import Modal from '../components/Modal';

const PartsPage = () => {
  const [parts, setParts] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [formData, setFormData] = useState({
    subjectId: '',
    titleEn: '',
    titleAs: ''
  });

  useEffect(() => {
    fetchParts();
    fetchSubjects();
  }, []);

  const fetchParts = async () => {
    try {
      const { data } = await axios.get('/api/parts');
      setParts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const { data } = await axios.get('/api/subjects');
      setSubjects(data.filter(s => s.hasParts));
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenModal = (part = null) => {
    if (part) {
      setEditingPart(part);
      setFormData({
        subjectId: part.subjectId,
        titleEn: part.title.en,
        titleAs: part.title.as || ''
      });
    } else {
      setEditingPart(null);
      setFormData({ subjectId: subjects[0]?._id || '', titleEn: '', titleAs: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      subjectId: formData.subjectId,
      title: { en: formData.titleEn, as: formData.titleAs }
    };

    try {
      if (editingPart) {
        await axios.put(`/api/admin/part/${editingPart._id}`, payload);
      } else {
        await axios.post('/api/admin/part', payload);
      }
      fetchParts();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await axios.delete(`/api/admin/part/${id}`);
        fetchParts();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredParts = parts.filter(part => {
    const matchesSearch = part.title.en.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (part.title.as && part.title.as.toLowerCase().includes(searchTerm.toLowerCase()));
    const partSubjectId = part.subjectId?._id || part.subjectId;
    const matchesSubject = !selectedSubject || partSubjectId === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Subject Parts</h1>
          <p className="text-slate-500">Define parts for subjects that require them (e.g. Part 1, Part 2).</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Plus size={20} />
          <span>Add Part</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search parts..." 
            className="input-field pl-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 w-full md:w-auto">
          <Filter size={18} className="text-slate-400 shrink-0" />
          <select 
            className="bg-transparent outline-none text-sm font-medium w-full"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">All Subjects</option>
            {subjects.map(s => (
              <option key={s._id} value={s._id}>{s.name.en}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest min-w-[150px]">Part Title</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest min-w-[150px]">Subject</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Created</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan="4" className="p-10 text-center text-slate-500">Loading parts...</td></tr>
              ) : filteredParts.length === 0 ? (
                <tr><td colSpan="4" className="p-10 text-center text-slate-500">No parts found.</td></tr>
              ) : filteredParts.map((part) => (
                <tr key={part._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="font-bold">{part.title.en}</div>
                    <div className="text-xs text-slate-500">{part.title.as || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="text-sm font-medium">
                      {subjects.find(s => s._id === (typeof part.subjectId === 'string' ? part.subjectId : part.subjectId._id))?.name?.en || 'Unknown Subject'}
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {part.createdAt ? new Date(part.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-') : 'N/A'}
                  </td>
                  <td className="px-6 py-5 text-right whitespace-nowrap">

                    <div className="flex items-center justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(part)}
                        className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-lg"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(part._id)}
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



      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingPart ? 'Edit Part' : 'Add New Part'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold ml-1">Select Subject</label>
            <select
              className="input-field"
              value={formData.subjectId}
              onChange={(e) => setFormData({...formData, subjectId: e.target.value})}
              required
            >
              <option value="">Select a subject</option>
              {subjects.map(s => (
                <option key={s._id} value={s._id}>{s.name.en} ({s.class?.name || 'Unknown'})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Title (English)</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Part 1"
                value={formData.titleEn}
                onChange={(e) => setFormData({...formData, titleEn: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Title (Assamese)</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. ভাগ ১"
                value={formData.titleAs}
                onChange={(e) => setFormData({...formData, titleAs: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button type="submit" className="btn-primary flex-1">
              {editingPart ? 'Update Part' : 'Create Part'}
            </button>
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PartsPage;
