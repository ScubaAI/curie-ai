'use client';

import { useState } from 'react';
import { StickyNote, Pin, Trash2, Save, Plus, X } from 'lucide-react';

interface Note {
  id: string;
  content: string;
  category: string | null;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface DoctorNotesProps {
  patientId: string;
  initialNotes: Note[];
}

export default function DoctorNotes({ patientId, initialNotes }: DoctorNotesProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [newNote, setNewNote] = useState('');
  const [category, setCategory] = useState('general');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const categories = [
    { value: 'general', label: 'General', color: 'bg-slate-500' },
    { value: 'consulta', label: 'Consulta', color: 'bg-blue-500' },
    { value: 'seguimiento', label: 'Seguimiento', color: 'bg-emerald-500' },
    { value: 'urgente', label: 'Urgente', color: 'bg-rose-500' },
  ];

  const handleSave = async () => {
    if (!newNote.trim()) return;
    
    setSaving(true);
    try {
      const res = await fetch(`/api/patient/${patientId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote, category }),
      });
      
      if (res.ok) {
        const savedNote = await res.json();
        setNotes(prev => [savedNote, ...prev]);
        setNewNote('');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setSaving(false);
    }
  };

  const togglePin = async (noteId: string) => {
    try {
      const res = await fetch(`/api/patient/${patientId}/notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: true }),
      });
      
      if (res.ok) {
        setNotes(prev => prev.map(n => 
          n.id === noteId ? { ...n, isPinned: !n.isPinned } : n
        ));
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!confirm('¿Eliminar esta nota?')) return;
    
    try {
      const res = await fetch(`/api/patient/${patientId}/notes/${noteId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setNotes(prev => prev.filter(n => n.id !== noteId));
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-GT', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-6">
      {/* Header con botón nueva nota */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">
            {notes.length} nota{notes.length !== 1 ? 's' : ''}
          </span>
          {notes.some(n => n.isPinned) && (
            <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
              {notes.filter(n => n.isPinned).length} fijada(s)
            </span>
          )}
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm font-medium transition-all"
        >
          {isEditing ? <X size={16} /> : <Plus size={16} />}
          {isEditing ? 'Cancelar' : 'Nueva Nota'}
        </button>
      </div>

      {/* Formulario nueva nota */}
      {isEditing && (
        <div className="mb-6 p-4 bg-slate-950/50 border border-slate-700/30 rounded-xl space-y-4">
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  category === cat.value 
                    ? `${cat.color} text-white` 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Escribe tu nota clínica aquí..."
            className="w-full h-32 bg-slate-900/50 border border-slate-700/30 rounded-lg p-3 text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:border-emerald-500/50"
          />
          
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-slate-400 hover:text-white text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !newNote.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-black font-medium text-sm transition-all"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Guardar Nota
            </button>
          </div>
        </div>
      )}

      {/* Lista de notas */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {notes.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <StickyNote size={48} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">No hay notas registradas</p>
            <p className="text-xs mt-1">Haz clic en "Nueva Nota" para agregar una</p>
          </div>
        ) : (
          notes.map(note => (
            <div
              key={note.id}
              className={`group relative p-4 rounded-xl border transition-all ${
                note.isPinned 
                  ? 'bg-amber-500/5 border-amber-500/20' 
                  : 'bg-slate-950/30 border-slate-700/20 hover:border-slate-600/30'
              }`}
            >
              {/* Pin indicator */}
              {note.isPinned && (
                <div className="absolute -top-2 -right-2">
                  <div className="bg-amber-500 rounded-full p-1">
                    <Pin size={12} className="text-black fill-black" />
                  </div>
                </div>
              )}
              
              {/* Header de nota */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    categories.find(c => c.value === note.category)?.color || 'bg-slate-500'
                  } text-white`}>
                    {categories.find(c => c.value === note.category)?.label || 'General'}
                  </span>
                  <span className="text-xs text-slate-500">
                    {formatDate(note.createdAt)}
                  </span>
                </div>
                
                {/* Acciones */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => togglePin(note.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      note.isPinned 
                        ? 'text-amber-400 hover:bg-amber-500/10' 
                        : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
                    }`}
                    title={note.isPinned ? 'Desfijar' : 'Fijar'}
                  >
                    <Pin size={14} />
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              {/* Contenido */}
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {note.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
