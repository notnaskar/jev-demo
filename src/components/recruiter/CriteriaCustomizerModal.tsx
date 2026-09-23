'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DimensionMeta, QuestionDefinition } from '@/types/evaluation';
import { DimensionWeights } from '@/types/scoring';
import { DIMENSIONS, QUESTION_DEFINITIONS } from '@/lib/typesafe/definitions';
import {
  Sparkles,
  Sliders,
  Plus,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  CheckCircle2,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface CriteriaCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Record<string, DimensionMeta>;
  questions: QuestionDefinition[];
  weights: DimensionWeights;
  onSaveCriteria: (
    newCategories: Record<string, DimensionMeta>,
    newQuestions: QuestionDefinition[],
    newWeights: DimensionWeights
  ) => void;
}

export function CriteriaCustomizerModal({
  isOpen,
  onClose,
  categories,
  questions,
  weights,
  onSaveCriteria,
}: CriteriaCustomizerModalProps) {
  const [activeTab, setActiveTab] = useState<'questions' | 'categories'>('questions');
  const [localCategories, setLocalCategories] = useState<Record<string, DimensionMeta>>({ ...categories });
  const [localQuestions, setLocalQuestions] = useState<QuestionDefinition[]>([...questions]);
  const [localWeights, setLocalWeights] = useState<DimensionWeights>({ ...weights });

  // Editing state for a single question
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editInstructions, setEditInstructions] = useState('');
  const [editCriteria, setEditCriteria] = useState<string[]>([]);
  const [editNoulTrue, setEditNoulTrue] = useState('');
  const [editNoulFalse, setEditNoulFalse] = useState('');
  const [editWeight, setEditWeight] = useState(0.5);

  // New question form state
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [newQDimension, setNewQDimension] = useState<string>('technical');
  const [newQKind, setNewQKind] = useState<'score' | 'noul'>('score');
  const [newQTitle, setNewQTitle] = useState('');
  const [newQInstructions, setNewQInstructions] = useState('');
  const [newQCriteria, setNewQCriteria] = useState<string[]>([
    'Does not meet requirement or no experience mentioned.',
    'Surface-level or peripheral exposure.',
    'Solid working proficiency and demonstrated project results.',
    'Deep mastery, exceptional architecture, and high impact.',
  ]);
  const [newQNoulTrue, setNewQNoulTrue] = useState('Affirmative proof found in candidate resume.');
  const [newQNoulFalse, setNewQNoulFalse] = useState('No evidence found in candidate resume.');

  // New category form state
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatShort, setNewCatShort] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatWeight, setNewCatWeight] = useState(20);

  // Success flash indicator
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Start editing a question
  const handleStartEdit = (q: QuestionDefinition) => {
    setEditingQuestionId(q.id);
    setEditTitle(q.title);
    setEditInstructions(q.instructions);
    setEditWeight(q.weightInDimension || 0.5);

    if (q.kind === 'score' && Array.isArray(q.criteria)) {
      setEditCriteria([...q.criteria]);
    } else if (q.kind === 'noul' && typeof q.criteria === 'object' && q.criteria !== null) {
      const obj = q.criteria as { true?: string; false?: string };
      setEditNoulTrue(obj.true || '');
      setEditNoulFalse(obj.false || '');
    }
  };

  // Save changes to the edited question
  const handleSaveQuestionEdit = () => {
    if (!editingQuestionId) return;

    setLocalQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== editingQuestionId) return q;

        const updated: QuestionDefinition = {
          ...q,
          title: editTitle.trim() || q.title,
          instructions: editInstructions.trim() || q.instructions,
          weightInDimension: editWeight,
        };

        if (q.kind === 'score') {
          updated.criteria = editCriteria;
        } else {
          updated.criteria = {
            true: editNoulTrue.trim() || 'Criteria met',
            false: editNoulFalse.trim() || 'Criteria not met',
          };
        }

        return updated;
      })
    );

    setEditingQuestionId(null);
  };

  // Toggle question enabled status
  const handleToggleQuestion = (id: string) => {
    setLocalQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, enabled: q.enabled === false ? true : false } : q))
    );
  };

  // Delete question
  const handleDeleteQuestion = (id: string) => {
    setLocalQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  // Create new question
  const handleCreateQuestion = () => {
    if (!newQTitle.trim() || !newQInstructions.trim()) return;

    const newQ: QuestionDefinition = {
      id: `custom_q_${Date.now()}`,
      dimension: newQDimension,
      kind: newQKind,
      title: newQTitle.trim(),
      instructions: newQInstructions.trim(),
      criteria:
        newQKind === 'score'
          ? newQCriteria
          : { true: newQNoulTrue.trim(), false: newQNoulFalse.trim() },
      maxLevels: newQKind === 'score' ? 4 : undefined,
      weightInDimension: 0.4,
      enabled: true,
      isCustom: true,
    };

    setLocalQuestions((prev) => [...prev, newQ]);
    setIsAddingQuestion(false);
    setNewQTitle('');
    setNewQInstructions('');
  };

  // Create new category
  const handleCreateCategory = () => {
    if (!newCatName.trim()) return;
    const catId = `cat_${newCatName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`;

    const newCat: DimensionMeta = {
      id: catId,
      name: newCatName.trim(),
      shortName: newCatShort.trim() || newCatName.trim(),
      description: newCatDesc.trim() || 'Custom recruiter criteria category',
      color: 'from-amber-500 to-rose-500',
      accentColor: '#f43f5e',
      iconName: 'Sparkles',
      defaultWeight: newCatWeight,
      isCustom: true,
    };

    setLocalCategories((prev) => ({ ...prev, [catId]: newCat }));
    setLocalWeights((prev) => ({ ...prev, [catId]: newCatWeight }));

    // Create a starter question for this category
    const starterQ: QuestionDefinition = {
      id: `q_${catId}_primary`,
      dimension: catId,
      kind: 'score',
      title: `${newCat.name} Alignment`,
      instructions: `Evaluate the candidate's demonstrated track record and experience relevant to ${newCat.name}.`,
      criteria: [
        'No evidence or relevant experience demonstrated.',
        'Minor or peripheral mention without deep proof.',
        'Solid competency matching role expectations.',
        'Exceptional track record and distinguished excellence.',
      ],
      maxLevels: 4,
      weightInDimension: 1.0,
      enabled: true,
      isCustom: true,
    };

    setLocalQuestions((prev) => [...prev, starterQ]);
    setIsAddingCategory(false);
    setNewCatName('');
    setNewCatShort('');
    setNewCatDesc('');
  };

  // Reset to default
  const handleResetToDefault = () => {
    setLocalCategories({ ...DIMENSIONS });
    setLocalQuestions([...QUESTION_DEFINITIONS]);
    setLocalWeights({
      technical: 40,
      experience: 30,
      education: 15,
      soft_skills: 15,
    });
  };

  // Apply changes to parent
  const handleApplyAll = () => {
    onSaveCriteria(localCategories, localQuestions, localWeights);
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      onClose();
    }, 600);
  };

  const categoryList = Object.values(localCategories);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[88vh] overflow-hidden flex flex-col p-0 bg-white">
        <DialogHeader className="p-6 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">
                  Recruiter Criteria &amp; Question Manager
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Inspect, customize, and edit the TypeSafe schema questions and categories used to judge candidate resumes.
                </DialogDescription>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleResetToDefault}
              className="text-xs gap-1.5 text-slate-600 border-slate-200 hover:text-slate-900"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to Defaults
            </Button>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as 'questions' | 'categories')}
            className="pt-3"
          >
            <TabsList className="bg-slate-100">
              <TabsTrigger value="questions" className="gap-2 text-xs">
                <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
                <span>Evaluation Questions ({localQuestions.length})</span>
              </TabsTrigger>
              <TabsTrigger value="categories" className="gap-2 text-xs">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>Categories &amp; Weights ({categoryList.length})</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </DialogHeader>

        {/* Tab Body: Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'questions' && (
            <div className="space-y-6">
              {/* Header Action */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Active Questions in Evaluation Schema
                  </h4>
                  <p className="text-xs text-slate-500">
                    All default questions are editable. Click &quot;Edit&quot; on any question to rewrite its prompt or criteria.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsAddingQuestion(true)}
                  className="gap-1.5 text-xs bg-sky-600 hover:bg-sky-700 text-white"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Custom Question
                </Button>
              </div>

              {/* Add Question Card Form */}
              {isAddingQuestion && (
                <Card className="p-4 bg-sky-50/50 border-sky-200 rounded-xl space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-sky-100">
                    <span className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                      Create New Evaluation Question
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsAddingQuestion(false)}
                      className="text-xs h-7 text-slate-500"
                    >
                      Cancel
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Target Category</label>
                      <select
                        value={newQDimension}
                        onChange={(e) => setNewQDimension(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                      >
                        {categoryList.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Question Type</label>
                      <select
                        value={newQKind}
                        onChange={(e) => setNewQKind(e.target.value as 'score' | 'noul')}
                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="score">score (Graduated 0-3 Rubric Scale)</option>
                        <option value="noul">noul (Binary Yes/No with Confidence)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 text-xs block mb-1">Question Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Distributed Event Streaming (Kafka/Flink) Mastery"
                      value={newQTitle}
                      onChange={(e) => setNewQTitle(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 text-xs block mb-1">
                      LLM Instructions / Evaluation Prompt
                    </label>
                    <Textarea
                      placeholder="Instruct TypeSafe on what exact signals, metrics, or experiences to look for in the candidate's resume relative to the JD..."
                      value={newQInstructions}
                      onChange={(e) => setNewQInstructions(e.target.value)}
                      className="text-xs min-h-[60px]"
                    />
                  </div>

                  {newQKind === 'score' ? (
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-700 text-xs block">
                        4-Tier Rubric Criteria (Levels 0 to 3)
                      </label>
                      {newQCriteria.map((c, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <span className="w-14 font-mono font-medium text-slate-500">Tier {idx}:</span>
                          <input
                            type="text"
                            value={c}
                            onChange={(e) => {
                              const updated = [...newQCriteria];
                              updated[idx] = e.target.value;
                              setNewQCriteria(updated);
                            }}
                            className="flex-1 text-xs p-1.5 bg-white border border-slate-300 rounded-md"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="font-semibold text-emerald-800 block mb-1">True Criterion (Match)</label>
                        <input
                          type="text"
                          value={newQNoulTrue}
                          onChange={(e) => setNewQNoulTrue(e.target.value)}
                          className="w-full text-xs p-2 bg-white border border-emerald-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-rose-800 block mb-1">False Criterion (Gap)</label>
                        <input
                          type="text"
                          value={newQNoulFalse}
                          onChange={(e) => setNewQNoulFalse(e.target.value)}
                          className="w-full text-xs p-2 bg-white border border-rose-300 rounded-lg"
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end gap-2">
                    <Button
                      size="sm"
                      onClick={handleCreateQuestion}
                      className="text-xs bg-sky-600 hover:bg-sky-700 text-white"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Add Question to Schema
                    </Button>
                  </div>
                </Card>
              )}

              {/* Group Questions by Category */}
              {categoryList.map((cat) => {
                const catQuestions = localQuestions.filter((q) => q.dimension === cat.id);
                if (catQuestions.length === 0) return null;

                return (
                  <div key={cat.id} className="space-y-3">
                    <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                        {cat.name}
                      </span>
                      <Badge variant="outline" className="text-[10px] py-0 font-mono">
                        {catQuestions.length} Questions
                      </Badge>
                    </div>

                    <div className="space-y-2.5">
                      {catQuestions.map((q) => {
                        const isEditing = editingQuestionId === q.id;

                        if (isEditing) {
                          return (
                            <Card
                              key={q.id}
                              className="p-4 bg-amber-50/50 border-amber-200 rounded-xl space-y-3 shadow-xs"
                            >
                              <div className="flex items-center justify-between pb-2 border-b border-amber-100">
                                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                                  <Edit2 className="w-3.5 h-3.5 text-amber-600" />
                                  Editing Question: {q.id}
                                </span>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingQuestionId(null)}
                                    className="text-xs h-7 text-slate-500"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={handleSaveQuestionEdit}
                                    className="text-xs h-7 bg-amber-600 hover:bg-amber-700 text-white"
                                  >
                                    <Check className="w-3.5 h-3.5 mr-1" />
                                    Save
                                  </Button>
                                </div>
                              </div>

                              <div>
                                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                                  Title
                                </label>
                                <input
                                  type="text"
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                                />
                              </div>

                              <div>
                                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                                  Instructions (Evaluation Prompt)
                                </label>
                                <Textarea
                                  value={editInstructions}
                                  onChange={(e) => setEditInstructions(e.target.value)}
                                  className="text-xs min-h-[55px]"
                                />
                              </div>

                              {q.kind === 'score' ? (
                                <div className="space-y-1.5">
                                  <label className="text-[11px] font-semibold text-slate-700 block">
                                    Rubric Levels
                                  </label>
                                  {editCriteria.map((c, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs">
                                      <span className="w-14 font-mono font-medium text-slate-500">Tier {idx}:</span>
                                      <input
                                        type="text"
                                        value={c}
                                        onChange={(e) => {
                                          const updated = [...editCriteria];
                                          updated[idx] = e.target.value;
                                          setEditCriteria(updated);
                                        }}
                                        className="flex-1 text-xs p-1.5 bg-white border border-slate-300 rounded-md"
                                      />
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <label className="font-semibold text-emerald-800 block mb-1">
                                      True Criterion
                                    </label>
                                    <input
                                      type="text"
                                      value={editNoulTrue}
                                      onChange={(e) => setEditNoulTrue(e.target.value)}
                                      className="w-full text-xs p-2 bg-white border border-emerald-300 rounded-md"
                                    />
                                  </div>
                                  <div>
                                    <label className="font-semibold text-rose-800 block mb-1">
                                      False Criterion
                                    </label>
                                    <input
                                      type="text"
                                      value={editNoulFalse}
                                      onChange={(e) => setEditNoulFalse(e.target.value)}
                                      className="w-full text-xs p-2 bg-white border border-rose-300 rounded-md"
                                    />
                                  </div>
                                </div>
                              )}
                            </Card>
                          );
                        }

                        return (
                          <div
                            key={q.id}
                            className={`p-3 rounded-lg border transition-all ${
                              q.enabled !== false
                                ? 'bg-white border-slate-200 hover:border-slate-300'
                                : 'bg-slate-50 border-dashed border-slate-200 opacity-60'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-semibold text-slate-900">{q.title}</span>
                                  <Badge
                                    variant={q.kind === 'score' ? 'default' : 'secondary'}
                                    className="font-mono text-[10px] py-0 px-1.5"
                                  >
                                    {q.kind}
                                  </Badge>
                                  {q.isCustom && (
                                    <Badge className="bg-purple-100 text-purple-700 text-[10px] py-0">
                                      Custom
                                    </Badge>
                                  )}
                                  {q.enabled === false && (
                                    <Badge variant="outline" className="text-slate-400 text-[10px] py-0">
                                      Disabled
                                    </Badge>
                                  )}
                                </div>

                                <p className="text-[11px] text-slate-500 line-clamp-2">{q.instructions}</p>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStartEdit(q)}
                                  className="h-7 px-2 text-xs text-slate-600 hover:text-slate-900"
                                >
                                  <Edit2 className="w-3 h-3 mr-1" />
                                  Edit
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleQuestion(q.id)}
                                  className={`h-7 px-2 text-xs ${
                                    q.enabled !== false ? 'text-slate-500' : 'text-emerald-600 font-semibold'
                                  }`}
                                >
                                  {q.enabled !== false ? 'Disable' : 'Enable'}
                                </Button>

                                {q.isCustom && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteQuestion(q.id)}
                                    className="h-7 px-2 text-xs text-rose-500 hover:text-rose-700"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Evaluation Categories &amp; Sliders
                  </h4>
                  <p className="text-xs text-slate-500">
                    Manage the macro pillars used to structure evaluation and candidate score weighting.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsAddingCategory(true)}
                  className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Custom Category
                </Button>
              </div>

              {isAddingCategory && (
                <Card className="p-4 bg-indigo-50/50 border-indigo-200 rounded-xl space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
                    <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Add Custom Category
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsAddingCategory(false)}
                      className="text-xs h-7 text-slate-500"
                    >
                      Cancel
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Category Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Startup Velocity & 0-to-1 Shipping"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Short Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Startup Velocity"
                        value={newCatShort}
                        onChange={(e) => setNewCatShort(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 text-xs block mb-1">Description</label>
                    <input
                      type="text"
                      placeholder="Brief summary of what this category evaluates..."
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 text-xs block mb-1">Initial Priority Weight (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newCatWeight}
                      onChange={(e) => setNewCatWeight(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                      className="w-28 text-xs p-2 bg-white border border-slate-300 rounded-lg font-mono"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={handleCreateCategory}
                      className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Create Category
                    </Button>
                  </div>
                </Card>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categoryList.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{cat.name}</span>
                      {cat.isCustom ? (
                        <Badge className="bg-purple-100 text-purple-700 text-[10px] py-0 font-mono">
                          Custom
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-slate-500 text-[10px] py-0 font-mono">
                          Standard
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{cat.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {showSavedToast && (
              <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                Criteria saved successfully!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
              Close
            </Button>
            <Button
              size="sm"
              onClick={handleApplyAll}
              className="text-xs bg-slate-900 hover:bg-slate-800 text-white"
            >
              Apply Schema &amp; Sliders
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
