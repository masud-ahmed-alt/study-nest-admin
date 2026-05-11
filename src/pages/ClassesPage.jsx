import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';

const ClassesPage = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const { data } = await axios.get('/api/classes');
      setClasses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (classItem = null) => {
    if (classItem) {
      setEditingClass(classItem);
      setFormData({ name: classItem.name });
    } else {
      setEditingClass(null);
      setFormData({ name: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClass) {
        await axios.put(`/api/admin/class/${editingClass._id}`, formData);
      } else {
        await axios.post('/api/admin/class', formData);
      }
      fetchClasses();
      setIsModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure? This will affect subjects and chapters using this class name.')) {
      try {
        await axios.delete(`/api/admin/class/${id}`);
        fetchClasses();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Class Management</h1>
          <p className="text-slate-500">Add or manage classes (e.g. Class 10, Class 12, etc.)</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Plus size={20} />
          <span>Add New Class</span>
        </button>
      </div>

      <div className="max-w-full md:max-w-md card overflow-hidden !p-0">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Class Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr><td colSpan="2" className="p-10 text-center">Loading...</td></tr>
            ) : classes.length === 0 ? (
              <tr><td colSpan="2" className="p-10 text-center text-slate-500">No classes defined.</td></tr>
            ) : classes.map((c) => (
              <tr key={c._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <td className="px-6 py-5 font-bold">{c.name}</td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(c)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(c._id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingClass ? 'Edit Class' : 'Add New Class'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold ml-1">Class Name</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Class 12"
              value={formData.name}
              onChange={(e) => setFormData({ name: e.target.value })}
              required
            />
          </div>
          <div className="pt-4 flex gap-4">
            <button type="submit" className="btn-primary flex-1">
              {editingClass ? 'Update Class' : 'Create Class'}
            </button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClassesPage;
