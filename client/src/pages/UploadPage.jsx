import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadModal from '../components/Upload/UploadModal';

export default function UploadPage() {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <UploadModal 
        isOpen={true} 
        onClose={() => navigate('/dashboard')} 
        onSuccess={(doc) => navigate(`/document/${doc.id}`)} 
      />
    </div>
  );
}
