import React from "react";

interface ShareTopModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
}

const ShareTopModal: React.FC<ShareTopModalProps> = ({ isOpen, onClose, shareUrl }) => {
  if (!isOpen) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    alert("Lien copié !");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center md:items-center">
      <div className="bg-card w-full max-w-md rounded-t-lg p-4 shadow-lg animate-slide-up">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-lg">Partager mon top</h2>
          <button onClick={onClose} className="text-gray-500 text-xl">✕</button>
        </div>
        <div className="mb-4">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="w-full border rounded px-2 py-1 mb-2"
          />
          <button onClick={handleCopy} className="btn-golden w-full mb-2">Copier le lien</button>
        </div>
        <div className="flex justify-around gap-2">
          <a href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="btn-outline flex-1 text-green-600">WhatsApp</a>
          <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="btn-outline flex-1 text-blue-500">Twitter</a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="btn-outline flex-1 text-blue-700">Facebook</a>
        </div>
      </div>
    </div>
  );
};

export default ShareTopModal; 