// Fichier : src/pages/ArticleDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft } from 'lucide-react';

export default function ArticleDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState<any>(null);

  useEffect(() => {
    fetch(`http://localhost:8000/api/blogs/`) // Récupère tous et cherche l'ID
      .then(res => res.json())
      .then(data => {
         const found = data.find((a:any) => a.id === id);
         setArticle(found);
      });
  }, [id]);

  if (!article) return <div className="p-20 text-center">Analysing article data...</div>;

  return (
    <div className="min-h-screen bg-white py-32 px-10">
      <article className="max-w-4xl mx-auto prose prose-stone lg:prose-xl">
        <h1 className="font-serif">{article.seo_title || article.topic}</h1>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
      </article>
    </div>
  );
}