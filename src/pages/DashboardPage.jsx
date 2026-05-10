import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { BookOpen, Layers, FileText, UploadCloud, ArrowUpRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="card group overflow-hidden relative"
  >
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 ${color} blur-2xl group-hover:scale-150 transition-transform duration-500`} />
    
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color.replace('bg-', 'bg-opacity-20 text-').replace('-500', '-600 dark:text-')}`}>
        {icon}
      </div>
    </div>
    
    <div className="mt-6 flex items-center gap-2 text-xs text-green-500 font-medium">
      <ArrowUpRight size={14} />
      <span>+12% from last month</span>
    </div>
  </motion.div>
);

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get('/api/admin/stats');
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back, here's what's happening today.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <UploadCloud size={20} />
          <span>New Upload</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Subjects" 
          value={stats?.totalSubjects || 0} 
          icon={<BookOpen size={24} />} 
          color="bg-blue-500"
          delay={0.1}
        />
        <StatCard 
          title="Total Chapters" 
          value={stats?.totalChapters || 0} 
          icon={<FileText size={24} />} 
          color="bg-purple-500"
          delay={0.2}
        />
        <StatCard 
          title="Total PDFs" 
          value={stats?.totalPDFs || 0} 
          icon={<Layers size={24} />} 
          color="bg-orange-500"
          delay={0.3}
        />
        <StatCard 
          title="Recent Uploads" 
          value={stats?.recentChapters?.length || 0} 
          icon={<Clock size={24} />} 
          color="bg-emerald-500"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold">Recent Uploads</h2>
            <button className="text-primary-600 font-medium text-sm hover:underline">View All</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="pb-4 text-sm font-semibold text-slate-500 uppercase tracking-wider">Chapter</th>
                  <th className="pb-4 text-sm font-semibold text-slate-500 uppercase tracking-wider">Subject</th>
                  <th className="pb-4 text-sm font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="pb-4 text-sm font-semibold text-slate-500 uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                {stats?.recentChapters?.map((chapter) => (
                  <tr key={chapter._id} className="group">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-primary-600 font-bold group-hover:bg-primary-600 group-hover:text-white transition-colors">
                          {chapter.chapterNumber}
                        </div>
                        <span className="font-medium">{chapter.title.en}</span>
                      </div>
                    </td>
                    <td className="py-4 text-slate-500 dark:text-slate-400">{chapter.subjectId?.name?.en}</td>
                    <td className="py-4 text-slate-500 dark:text-slate-400 text-sm">
                      {new Date(chapter.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 text-right">
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold rounded-full uppercase tracking-tighter">
                        Uploaded
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card h-fit">
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          <div className="space-y-4">
            <button className="w-full btn-secondary flex items-center gap-4 text-left px-5 py-4 group">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                <BookOpen size={20} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Add New Subject</p>
                <p className="text-xs text-slate-500">Create a new course category</p>
              </div>
            </button>
            <button className="w-full btn-secondary flex items-center gap-4 text-left px-5 py-4 group">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg group-hover:scale-110 transition-transform">
                <FileText size={20} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Create Chapter</p>
                <p className="text-xs text-slate-500">Define a new chapter for subjects</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
