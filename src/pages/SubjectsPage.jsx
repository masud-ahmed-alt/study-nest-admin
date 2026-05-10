import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import Modal from '../components/Modal';

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    nameEn: '',
    nameAs: '',
    class: '',
    hasParts: false
  });

  useEffect(() => {
    fetchSubjects();
    fetchClasses();
  }, []);

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

  const fetchSubjects = async () => {
    try {
      const { data } = await axios.get('/api/subjects');
      setSubjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (subject = null) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({
        nameEn: subject.name.en,
        nameAs: subject.name.as || '',
        class: subject.class?._id || subject.class,
        hasParts: subject.hasParts
      });
    } else {
      setEditingSubject(null);
      setFormData({ nameEn: '', nameAs: '', class: classes[0]?._id || '', hasParts: false });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: { en: formData.nameEn, as: formData.nameAs },
      class: formData.class,
      hasParts: formData.hasParts
    };

    try {
      if (editingSubject) {
        await axios.put(`/api/admin/subject/${editingSubject._id}`, payload);
      } else {
        await axios.post('/api/admin/subject', payload);
      }
      fetchSubjects();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await axios.delete(`/api/admin/subject/${id}`);
        fetchSubjects();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Subjects</h1>
          <p className="text-slate-500">Manage your course categories and classes.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          <span>Add Subject</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search subjects..." 
            className="input-field pl-12"
          />
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
          <Filter size={18} className="text-slate-400" />
          <select className="bg-transparent outline-none text-sm font-medium">
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
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Subject Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Class</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Has Parts</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan="4" className="p-10 text-center text-slate-500">Loading subjects...</td></tr>
              ) : subjects.length === 0 ? (
                <tr><td colSpan="4" className="p-10 text-center text-slate-500">No subjects found.</td></tr>
              ) : subjects.map((subject) => (
                <tr key={subject._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="font-bold text-slate-800 dark:text-slate-100">{subject.name.en}</div>
                    <div className="text-xs text-slate-500">{subject.name.as || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg text-sm font-semibold">
                      {subject.class?.name || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    {subject.hasParts ? (
                      <span className="text-green-500 text-sm font-bold">YES</span>
                    ) : (
                      <span className="text-slate-400 text-sm">NO</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(subject)}
                        className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-lg transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(subject._id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors"
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
        title={editingSubject ? 'Edit Subject' : 'Add New Subject'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Name (English)</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Mathematics"
                value={formData.nameEn}
                onChange={(e) => setFormData({...formData, nameEn: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Name (Assamese)</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. গণিত"
                value={formData.nameAs}
                onChange={(e) => setFormData({...formData, nameAs: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Class</label>
              <select
                className="input-field"
                value={formData.class}
                onChange={(e) => setFormData({...formData, class: e.target.value})}
                required
              >
                <option value="">Select Class</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 pt-8">
              <input
                type="checkbox"
                id="hasParts"
                className="w-5 h-5 rounded accent-primary-600"
                checked={formData.hasParts}
                onChange={(e) => setFormData({...formData, hasParts: e.target.checked})}
              />
              <label htmlFor="hasParts" className="text-sm font-semibold cursor-pointer">This subject has parts (e.g. Part 1, Part 2)</label>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button type="submit" className="btn-primary flex-1">
              {editingSubject ? 'Update Subject' : 'Create Subject'}
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

export default SubjectsPage;
