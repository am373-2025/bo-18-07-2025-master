import React, { useState } from "react";
import { Comment } from '@/types/types';

interface CommentSectionProps {
  topId: string;
  comments: Comment[];
  onComment: (content: string) => void;
  onLike: (commentId: string) => void;
  onReply: (commentId: string, content: string) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ topId, comments, onComment, onLike, onReply }) => {
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onComment(input);
      setInput("");
    }
  };
  const handleReplySubmit = (e: React.FormEvent, commentId: string) => {
    e.preventDefault();
    if (replyInput.trim()) {
      onReply(commentId, replyInput);
      setReplyInput("");
      setReplyTo(null);
    }
  };

  const renderReplies = (replies?: Comment[]) => (
    <ul className="ml-6 mt-1 space-y-1">
      {replies?.map(reply => (
        <li key={reply.id} className="flex items-center gap-2 text-sm">
          <img src={reply.userAvatar} alt={reply.userName} className="w-6 h-6 rounded-full" />
          <span className="font-medium">{reply.userName}</span>
          <span>{reply.content}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="mt-4">
      <h2 className="font-bold mb-2 text-lg">Commentaires</h2>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
        <input
          type="text"
          placeholder="Ajouter un commentaire..."
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 border rounded px-2 py-1"
        />
        <button type="submit" className="btn-golden">Envoyer</button>
      </form>
      <ul className="space-y-3">
        {comments.length === 0 ? (
          <li className="text-gray-400 text-sm">Aucun commentaire pour l'instant.</li>
        ) : (
          comments.map(comment => (
            <li key={comment.id} className="bg-muted rounded p-2">
              <div className="flex items-center gap-2 mb-1">
                <img src={comment.userAvatar} alt={comment.userName} className="w-7 h-7 rounded-full" />
                <span className="font-medium">{comment.userName}</span>
                <span className="text-xs text-gray-400 ml-2">{new Date(comment.createdAt).toLocaleString()}</span>
              </div>
              <div className="ml-9">
                <span>{comment.content}</span>
                <div className="flex gap-3 mt-1">
                  <button onClick={() => onLike(comment.id)} className="text-xs text-pink-500">❤️ {comment.likes}</button>
                  <button onClick={() => setReplyTo(comment.id)} className="text-xs text-blue-500">Répondre</button>
                </div>
                {replyTo === comment.id && (
                  <form onSubmit={e => handleReplySubmit(e, comment.id)} className="flex gap-2 mt-1">
                    <input
                      type="text"
                      placeholder="Votre réponse..."
                      value={replyInput}
                      onChange={e => setReplyInput(e.target.value)}
                      className="flex-1 border rounded px-2 py-1"
                      autoFocus
                    />
                    <button type="submit" className="btn-golden">Envoyer</button>
                  </form>
                )}
                {renderReplies(comment.replies)}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default CommentSection; 