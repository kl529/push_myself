import React, { useState } from 'react';
import { CheckCircle, Plus, Trash2, Save, X, GripVertical, ExternalLink, FileText } from 'lucide-react';
import { Todo, DayData } from '../../data/types';
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
}

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
            <label className="block text-sm font-medium text-black mb-2">
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
            <label className="block text-sm font-medium text-black mb-2">
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
            <label className="block text-sm font-medium text-black mb-2">
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
            <label className="block text-sm font-medium text-black mb-2">
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
        className="cursor-grab active:cursor-grabbing p-1 text-black hover:text-black"
      >
        <GripVertical className="h-5 w-5" />
      </div>

      {/* 완료 체크 */}
      <button
        onClick={() => onToggle(todo.id)}
        className={`p-2 rounded-lg ${todo.completed ? 'text-green-600' : 'text-black'}`}
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
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors"
            onClick={() => onOpenModal(todo)}
          >
            <div className="flex-1">
              <span className={`text-lg lg:text-xl ${todo.completed ? 'text-black' : ''}`}>
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
      <div className="flex gap-2">
        {todo.completed ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(todo.id);
            }}
            className="px-3 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            되돌리기
          </button>
        ) : (
          <button
            onClick={() => onDelete(todo.id)}
            className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

const TodoTab: React.FC<TodoTabProps> = ({
  dayData,
  addTodo,
  toggleTodo,
  deleteTodo,
  updateTodo,
  reorderTodos
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
      if (sortedTodos.length >= 3) {
        alert('오늘은 3가지 중요한 일에만 집중해보세요! 먼저 기존 할 일을 완료하거나 삭제해주세요.');
        return;
      }
      addTodo(newTodo, newTodoPriority);
      setNewTodo('');
      setNewTodoPriority('medium');
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
      const oldIndex = sortedTodos.findIndex(todo => todo.id === active.id);
      const newIndex = sortedTodos.findIndex(todo => todo.id === over?.id);
      reorderTodos(oldIndex, newIndex);
    }
  };

  // 미완료 투두만 필터링하여 우선순위 순으로 정렬
  const sortedTodos = [...dayData.todos]
    .filter(todo => !todo.completed)
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.order_index - b.order_index;
    });

  // 완료된 투두들 (우선순위 순으로 정렬)
  const completedTodos = dayData.todos
    .filter(todo => todo.completed)
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.order_index - b.order_index;
    });

  return (
    <div className="space-y-2 lg:space-y-4">
      {/* TO DO 섹션 */}
      <div className="bg-white p-4 lg:p-6 rounded-2xl border">
        <h3 className="text-xl lg:text-2xl font-semibold mb-4 flex items-center">
          <CheckCircle className="h-6 w-6 lg:h-8 lg:w-8 mr-3 text-blue-600" />
          TO DO
        </h3>
        
        {/* 3개 제한 안내 메시지 */}
        <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm lg:text-base text-blue-800 text-center font-medium">
            💪 집중력을 위해 오늘은 <span className="font-bold text-blue-900">3가지 중요한 일</span>에만 집중해보세요!
          </p>
          <p className="text-xs lg:text-sm text-blue-600 text-center mt-1">
            현재 {sortedTodos.length}/3개의 할 일
          </p>
        </div>
        
        {/* 새 투두 추가 폼 */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-3 lg:gap-4">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder={sortedTodos.length >= 3 ? "3개 제한 달성! 먼저 할 일을 완료하세요" : "중요한 할 일을 입력하세요 (최대 3개)"}
              className="flex-1 p-4 lg:p-5 border rounded-xl focus:ring-2 focus:ring-blue-500 text-lg lg:text-xl"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
            />
            <select
              value={newTodoPriority}
              onChange={(e) => setNewTodoPriority(e.target.value as 'high' | 'medium' | 'low')}
              className="px-4 lg:px-6 py-4 lg:py-5 border rounded-xl focus:ring-2 focus:ring-blue-500 text-lg lg:text-xl bg-white"
            >
              <option value="high">높음</option>
              <option value="medium">보통</option>
              <option value="low">낮음</option>
            </select>
            <button
              onClick={handleAddTodo}
              disabled={sortedTodos.length >= 3}
              className={`px-6 lg:px-8 py-4 lg:py-5 rounded-xl flex items-center text-lg lg:text-xl transition-colors ${
                sortedTodos.length >= 3 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              <Plus className="h-5 w-5 lg:h-6 lg:w-6" />
            </button>
          </div>
        </div>
        
        {/* 미완료 투두 목록 */}
        <div className="space-y-3 lg:space-y-4">
          {sortedTodos.length === 0 ? (
            <div className="text-center py-12 lg:py-16 text-black">
              <CheckCircle className="h-16 w-16 lg:h-20 lg:w-20 mx-auto mb-4 text-black" />
              <p className="text-lg lg:text-xl">오늘 집중할 3가지 중요한 일을 추가해보세요!</p>
              <p className="text-sm lg:text-base mt-2 text-blue-600">하나씩 집중해서 완성하면 더 큰 성취감을 느낄 수 있어요 ✨</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedTodos.map(todo => todo.id)}
                strategy={verticalListSortingStrategy}
              >
                {sortedTodos.map((todo: Todo) => (
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

      {/* 완료된 작업 섹션 */}
      {completedTodos.length > 0 && (
        <div className="bg-white p-4 lg:p-6 rounded-2xl border">
          <h3 className="text-xl lg:text-2xl font-semibold mb-6 flex items-center">
            <CheckCircle className="h-6 w-6 lg:h-8 lg:w-8 mr-3 text-green-600" />
            COMPLETED
          </h3>
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => {
              const { active, over } = event;
              if (active.id !== over?.id) {
                const oldIndex = completedTodos.findIndex(todo => todo.id === active.id);
                const newIndex = completedTodos.findIndex(todo => todo.id === over?.id);
                reorderTodos(oldIndex, newIndex);
              }
            }}
          >
            <SortableContext
              items={completedTodos.map(todo => todo.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3 lg:space-y-4">
                {completedTodos.map((todo: Todo) => (
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
                    onOpenModal={handleOpenCompletedModal}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

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
    </div>
  );
};

export default TodoTab; 