import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, Plus, Trash2, Save, X, GripVertical, ExternalLink, FileText, Star, Settings } from 'lucide-react';
import { Todo, DayData } from '../../shared/types/types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TodoTabProps {
  dayData: DayData;
  addTodo: (text: string, priority?: 'high' | 'medium' | 'low') => void;
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
  updateTodo: (id: number, updates: Partial<Todo>) => void;
  reorderTodos: (oldIndex: number, newIndex: number) => void;
  updateCurrentDayData: (updates: Partial<DayData>) => void;
  showWarning: (message: string) => void;
  saveAffirmation: (affirmation: string) => void;
}

// 자기암시 설정 모달 컴포넌트
const AffirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (affirmation: string) => void;
  currentAffirmation: string;
}> = ({ isOpen, onClose, onSave, currentAffirmation }) => {
  const [affirmation, setAffirmation] = useState(currentAffirmation);

  React.useEffect(() => {
    setAffirmation(currentAffirmation);
  }, [currentAffirmation]);

  const handleSave = () => {
    if (affirmation.trim()) {
      onSave(affirmation.trim());
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 lg:p-8 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl lg:text-2xl font-semibold flex items-center">
            <Star className="h-6 w-6 mr-3 text-purple-600" />
            자기암시 설정
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              나만의 자기암시
            </label>
            <textarea
              value={affirmation}
              onChange={(e) => setAffirmation(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="자신에게 힘이 되는 말을 적어보세요. 예: 나는 할 수 있다, 나는 충분히 좋다..."
              className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-purple-500 text-lg resize-none h-32"
              maxLength={200}
            />
            <div className="text-sm text-gray-500 mt-2 text-right">
              {affirmation.length}/200
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-xl">
            <h4 className="font-medium text-purple-800 mb-2">💡 자기암시 작성 팁</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• 긍정적이고 현재형으로 작성하세요</li>
              <li>• "나는 ~할 수 있다", "나는 ~이다" 형태로</li>
              <li>• 짧고 기억하기 쉬운 문장으로</li>
              <li>• 매일 읽어도 좋은 내용으로</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 flex items-center justify-center font-medium"
          >
            <Save className="h-5 w-5 mr-2" />
            저장
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 font-medium"
          >
            취소
          </button>
        </div>
        
        <div className="text-xs text-gray-500 mt-4 text-center">
          Ctrl+Enter (또는 Cmd+Enter)로 빠르게 저장할 수 있습니다
        </div>
      </div>
    </div>
  );
};

// 모달 컴포넌트
const TodoModal: React.FC<{
  todo: Todo | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Todo>) => void;
}> = ({ todo, isOpen, onClose, onSave }) => {
  const [text, setText] = useState(todo?.text || '');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>(todo?.priority || 'medium');
  const [link, setLink] = useState(todo?.link || '');
  const [description, setDescription] = useState(todo?.description || '');

  // ESC 키로 모달 닫기
  React.useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  // todo가 변경될 때마다 상태 업데이트
  React.useEffect(() => {
    if (todo) {
      setText(todo.text);
      setPriority(todo.priority);
      setLink(todo.link || '');
      setDescription(todo.description || '');
    }
  }, [todo]);

  const handleSave = () => {
    if (todo && text.trim()) {
      onSave({ text: text.trim(), priority, link, description });
      onClose();
    }
  };

  if (!isOpen || !todo) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 lg:p-8 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl lg:text-2xl font-semibold mb-4 flex items-center">
          <FileText className="h-6 w-6 mr-3 text-blue-600" />
          투두 상세 정보
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              할 일
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="할 일을 입력하세요"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              우선순위
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="high">높음</option>
              <option value="medium">보통</option>
              <option value="low">낮음</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              링크 (선택사항)
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://example.com"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명 (선택사항)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="할 일에 대한 추가 설명이나 메모를 입력하세요"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 h-32 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center"
          >
            <Save className="h-5 w-5 mr-2" />
            저장
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

// 드래그 가능한 투두 아이템 컴포넌트
const SortableTodoItem: React.FC<{
  todo: Todo;
  editingTodo: number | null;
  editText: string;
  editPriority: 'high' | 'medium' | 'low';
  priorityColors: Record<string, string>;
  priorityLabels: Record<string, string>;
  onToggle: (id: number) => void;
  onSaveEdit: (id: number) => void;
  onCancelEdit: () => void;
  onDelete: (id: number) => void;
  onEditTextChange: (text: string) => void;
  onEditPriorityChange: (priority: 'high' | 'medium' | 'low') => void;
  onOpenModal: (todo: Todo) => void;
}> = ({ 
  todo, 
  editingTodo, 
  editText, 
  editPriority, 
  priorityColors, 
  priorityLabels,
  onToggle, 
  onSaveEdit, 
  onCancelEdit, 
  onDelete,
  onEditTextChange,
  onEditPriorityChange,
  onOpenModal
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 lg:gap-4 p-4 lg:p-6 rounded-xl border ${priorityColors[todo.priority]} ${todo.completed ? 'opacity-60' : ''}`}
    >
      {/* 드래그 핸들 */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600"
      >
        <GripVertical className="h-5 w-5" />
      </div>

      {/* 완료 체크 */}
      <button
        onClick={() => onToggle(todo.id)}
        className={`p-2 rounded-lg ${todo.completed ? 'text-green-600' : 'text-gray-400'}`}
      >
        <CheckCircle className="h-6 w-6 lg:h-8 lg:w-8" />
      </button>

      {/* 투두 내용 */}
      <div className="flex-1">
        {editingTodo === todo.id ? (
          <div className="space-y-3">
            <input
              type="text"
              value={editText}
              onChange={(e) => onEditTextChange(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
              onKeyPress={(e) => e.key === 'Enter' && onSaveEdit(todo.id)}
            />
            <div className="flex gap-2">
              <select
                value={editPriority}
                onChange={(e) => onEditPriorityChange(e.target.value as 'high' | 'medium' | 'low')}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
              >
                <option value="high">높음</option>
                <option value="medium">보통</option>
                <option value="low">낮음</option>
              </select>
              <button
                onClick={() => onSaveEdit(todo.id)}
                className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center"
              >
                <Save className="h-4 w-4 mr-1" />
                저장
              </button>
              <button
                onClick={onCancelEdit}
                className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center"
              >
                <X className="h-4 w-4 mr-1" />
                취소
              </button>
            </div>
          </div>
        ) : (
          <div 
            className="flex items-center gap-3 cursor-pointer p-2 rounded-lg"
            onClick={() => onOpenModal(todo)}
          >
            <div className="flex-1">
              <span className={`text-lg lg:text-xl ${todo.completed ? 'text-gray-600' : ''}`}>
                {todo.text}
              </span>
              {(todo.link || todo.description) && (
                <div className="flex items-center gap-2 mt-1">
                  {todo.link && (
                    <ExternalLink className="h-4 w-4 text-blue-500" />
                  )}
                  {todo.description && (
                    <FileText className="h-4 w-4 text-green-500" />
                  )}
                </div>
              )}
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${priorityColors[todo.priority]}`}>
              {priorityLabels[todo.priority]}
            </span>
          </div>
        )}
      </div>

      {/* 액션 버튼 */}
      {!todo.completed && (
        <div className="flex gap-2">
          <button
            onClick={() => onDelete(todo.id)}
            className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

const TodoTab: React.FC<TodoTabProps> = ({
  dayData,
  addTodo,
  toggleTodo,
  deleteTodo,
  updateTodo,
  reorderTodos,
  updateCurrentDayData,
  showWarning,
  saveAffirmation
}) => {
  const [newTodo, setNewTodo] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [editingTodo, setEditingTodo] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [editPriority, setEditPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [modalTodo, setModalTodo] = useState<Todo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completedModalTodo, setCompletedModalTodo] = useState<Todo | null>(null);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
  const [isAffirmationModalOpen, setIsAffirmationModalOpen] = useState(false);
  const [currentAffirmation, setCurrentAffirmation] = useState('');
  
  const newTodoInputRef = useRef<HTMLInputElement>(null);

  // 클라이언트 사이드에서만 localStorage 접근
  useEffect(() => {
    const savedAffirmation = localStorage.getItem('userAffirmation') || '';
    setCurrentAffirmation(savedAffirmation);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const priorityColors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  };

  const priorityLabels = {
    high: '높음',
    medium: '보통',
    low: '낮음'
  };

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      // 하루 3개 제한 체크 (기존 로직 유지하되 경고 메시지 변경)
      const incompleteTodos = dayData.todos.filter(todo => !todo.completed);
      if (incompleteTodos.length >= 3) {
        showWarning('매일 1% 성장을 위해 3개의 핵심 업무에만 집중하세요!');
        return;
      }
      
      addTodo(newTodo, newTodoPriority);
      setNewTodo('');
      setNewTodoPriority('medium');
      
      // 포커스 유지를 위해 더 긴 지연 후 다시 포커스 설정
      setTimeout(() => {
        if (newTodoInputRef.current) {
          newTodoInputRef.current.focus();
          newTodoInputRef.current.setSelectionRange(0, 0);
        }
      }, 200);
    }
  };

  const handleSaveEdit = (id: number) => {
    if (editText.trim()) {
      updateTodo(id, { text: editText, priority: editPriority });
      setEditingTodo(null);
      setEditText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingTodo(null);
    setEditText('');
  };

  const handleOpenModal = (todo: Todo) => {
    setModalTodo(todo);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalTodo(null);
  };

  const handleSaveModal = (updates: Partial<Todo>) => {
    if (modalTodo) {
      updateTodo(modalTodo.id, updates);
    }
  };

  const handleOpenCompletedModal = (todo: Todo) => {
    setCompletedModalTodo(todo);
    setIsCompletedModalOpen(true);
  };

  const handleCloseCompletedModal = () => {
    setIsCompletedModalOpen(false);
    setCompletedModalTodo(null);
  };

  const handleSaveCompletedModal = (updates: Partial<Todo>) => {
    if (completedModalTodo) {
      updateTodo(completedModalTodo.id, updates);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = allTodos.findIndex(todo => todo.id === active.id);
      const newIndex = allTodos.findIndex(todo => todo.id === over?.id);
      reorderTodos(oldIndex, newIndex);
    }
  };

  // 모든 투두들을 우선순위와 완료 상태에 따라 정렬 (미완료가 먼저)
  const allTodos = [...dayData.todos]
    .sort((a, b) => {
      // 미완료 항목이 먼저 오도록
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      
      // 같은 완료 상태내에서는 우선순위 순으로
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.order_index - b.order_index;
    });

  return (
    <div className="space-y-3 lg:space-y-4 p-2 sm:p-0">
      {/* 자기암시 섹션 - 모바일 최적화 */}
      <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl lg:rounded-2xl border">
        <div className="flex items-center justify-between mb-3 lg:mb-4">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold flex items-center">
            <Star className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 mr-2 sm:mr-3 text-purple-600" />
            자기암시
          </h3>
          <button
            onClick={() => setIsAffirmationModalOpen(true)}
            className="p-2 lg:p-3 bg-purple-100 hover:bg-purple-200 rounded-lg lg:rounded-xl transition-colors touch-manipulation"
            title="자기암시 설정"
          >
            <Settings className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-600" />
          </button>
        </div>

        {currentAffirmation ? (
          <div className="bg-purple-50 p-3 sm:p-4 lg:p-6 rounded-lg lg:rounded-xl border border-purple-200">
            <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-purple-800 italic leading-relaxed whitespace-pre-wrap">
              {currentAffirmation}
            </p>
          </div>
        ) : (
          <div className="text-center py-4 sm:py-6 lg:py-8 text-gray-500">
            <Star className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 mx-auto mb-3 text-gray-300" />
            <p className="text-sm sm:text-base lg:text-lg mb-3">아직 자기암시가 설정되지 않았습니다</p>
            <button
              onClick={() => setIsAffirmationModalOpen(true)}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg lg:rounded-xl hover:bg-purple-600 font-medium text-sm lg:text-base touch-manipulation"
            >
              자기암시 설정하기
            </button>
          </div>
        )}
      </div>

      {/* TO DO 섹션 - 모바일 최적화 */}
      <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl lg:rounded-2xl border">
        <div className="mb-4 lg:mb-6">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold flex items-center">
            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 mr-2 sm:mr-3 text-blue-600" />
            <span>꼭 해야할 일</span>
          </h3>
        </div>
        
        {/* 새 투두 추가 폼 - 모바일 최적화 */}
        <div className="mb-4 lg:mb-6 space-y-3 lg:space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4">
            <input
              ref={newTodoInputRef}
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="오늘의 핵심 업무를 입력하세요"
              className="flex-1 p-3 sm:p-4 lg:p-5 border rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 text-sm sm:text-base lg:text-lg xl:text-xl"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
            />
            <div className="flex gap-2 sm:gap-3">
              <select
                value={newTodoPriority}
                onChange={(e) => setNewTodoPriority(e.target.value as 'high' | 'medium' | 'low')}
                className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 border rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 text-sm sm:text-base lg:text-lg xl:text-xl bg-white min-w-0 flex-1 sm:flex-none"
              >
                <option value="high">높음</option>
                <option value="medium">보통</option>
                <option value="low">낮음</option>
              </select>
              <button
                onClick={handleAddTodo}
                className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 bg-blue-500 text-white rounded-lg lg:rounded-xl hover:bg-blue-600 active:bg-blue-700 flex items-center justify-center text-sm sm:text-base lg:text-lg xl:text-xl touch-manipulation"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                <span className="hidden sm:inline ml-1 lg:ml-2">추가</span>
              </button>
            </div>
          </div>
        </div>

        {/* 투두 목록 (완료/미완료 통합) - 모바일 최적화 */}
        <div className="space-y-2 sm:space-y-3 lg:space-y-4">
          {allTodos.length === 0 ? (
            <div className="text-center py-8 sm:py-12 lg:py-16 text-gray-500">
              <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 mx-auto mb-3 lg:mb-4 text-gray-300" />
              <p className="text-sm sm:text-base lg:text-lg xl:text-xl px-4">아직 핵심 업무가 없습니다. 오늘의 3가지 목표를 설정해보세요!</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={allTodos.map(todo => todo.id)}
                strategy={verticalListSortingStrategy}
              >
                {allTodos.map((todo: Todo) => (
                  <SortableTodoItem
                    key={todo.id}
                    todo={todo}
                    editingTodo={editingTodo}
                    editText={editText}
                    editPriority={editPriority}
                    priorityColors={priorityColors}
                    priorityLabels={priorityLabels}
                    onToggle={toggleTodo}
                    onSaveEdit={handleSaveEdit}
                    onCancelEdit={handleCancelEdit}
                    onDelete={deleteTodo}
                    onEditTextChange={setEditText}
                    onEditPriorityChange={setEditPriority}
                    onOpenModal={handleOpenModal}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      {/* 모달 */}
      <TodoModal
        todo={modalTodo}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveModal}
      />

      {/* 완료된 작업 모달 */}
      <TodoModal
        todo={completedModalTodo}
        isOpen={isCompletedModalOpen}
        onClose={handleCloseCompletedModal}
        onSave={handleSaveCompletedModal}
      />

      {/* 자기암시 설정 모달 */}
      <AffirmationModal
        isOpen={isAffirmationModalOpen}
        onClose={() => setIsAffirmationModalOpen(false)}
        onSave={(affirmation) => {
          saveAffirmation(affirmation);
          setCurrentAffirmation(affirmation);
        }}
        currentAffirmation={currentAffirmation}
      />
    </div>
  );
};

export default TodoTab; 