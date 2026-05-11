import React from 'react';
import Modal from './Modal';
import { Download, ExternalLink } from 'lucide-react';

const PDFViewer = ({ isOpen, onClose, pdfUrl, title }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || 'PDF Preview'}
      maxWidth="max-w-5xl"
    >
      <div className="flex flex-col h-[75vh] md:h-[70vh]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <p className="text-xs md:text-sm text-slate-500 truncate max-w-full sm:max-w-[60%]">
            Previewing: <span className="font-medium text-slate-900 dark:text-slate-100">{title}</span>
          </p>
          <div className="flex items-center gap-2">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary !py-1.5 !px-3 !text-xs flex items-center gap-1.5 flex-1 sm:flex-none justify-center"
            >
              <ExternalLink size={14} />
              <span>Full View</span>
            </a>
            <a
              href={pdfUrl}
              download
              target="_blank"
              rel="noreferrer"
              className="btn-primary !py-1.5 !px-3 !text-xs flex items-center gap-1.5 flex-1 sm:flex-none justify-center"
            >
              <Download size={14} />
              <span>Download</span>
            </a>
          </div>
        </div>

        
        <div className="flex-1 w-full bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
          <iframe
            src={`${pdfUrl}#toolbar=0`}
            className="w-full h-full border-none"
            title="PDF Preview"
          />
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
            Powered by Native Browser PDF Viewer
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default PDFViewer;
