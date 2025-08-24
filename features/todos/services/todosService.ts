import { supabase, isSupabaseAvailable } from '../../shared/services/supabase';
import { Todo } from '../../shared/types/types';

// 투두 추가 (Supabase + 로컬스토리지 백업)
export const addTodo = async (date: string, todo: Omit<Todo, 'id' | 'created_at' | 'updated_at'>): Promise<Todo | null> => {
  if (!isSupabaseAvailable()) {
    console.log('Supabase가 사용 불가능합니다. 로컬스토리지에 저장합니다.');
    const newTodo = addTodoToLocalStorage(date, todo);
    return newTodo;
  }

  try {
    // 해당 날짜의 최대 order_index를 가져와서 +1로 설정
    const { data: existingTodos, error: fetchError } = await supabase!
      .from('todos')
      .select('order_index')
      .eq('date', date)
      .order('order_index', { ascending: false })
      .limit(1);

    let nextOrderIndex = 0;
    if (!fetchError && existingTodos && existingTodos.length > 0) {
      nextOrderIndex = existingTodos[0].order_index + 1;
    }

    const todoToInsert = {
      text: todo.text,
      completed: todo.completed || false,
      priority: todo.priority || 'medium',
      order_index: nextOrderIndex,
      type: todo.type || 'todo',
      link: todo.link || null,
      description: todo.description || null,
      date,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase!.from('todos').insert(todoToInsert).select().single();

    if (error) {
      console.error('투두 추가 중 오류:', error.message);
      const newTodo = addTodoToLocalStorage(date, todo);
      return newTodo;
    }

    // Supabase 성공시 결과 반환 (로컬스토리지 백업은 별도 관리)
    const newTodo = { ...data, order: data.order_index || 0 } as Todo;
    return newTodo;
  } catch (error) {
    console.error('Supabase 투두 추가 중 오류:', error);
    const newTodo = addTodoToLocalStorage(date, todo);
    return newTodo;
  }
};

// 투두 업데이트 (Supabase + 로컬스토리지 백업)
export const updateTodo = async (id: number, updates: Partial<Todo>): Promise<void> => {
  if (!isSupabaseAvailable()) {
    console.log('Supabase가 사용 불가능합니다. 로컬스토리지에 저장합니다.');
    updateTodoInLocalStorage(id, updates);
    return;
  }

  try {
    const supabaseUpdates: Partial<Todo> & { updated_at: string; order_index?: number } = { ...updates, updated_at: new Date().toISOString() };
    if (updates.order !== undefined) {
      supabaseUpdates.order_index = updates.order;
    }

    const { error } = await supabase!.from('todos')
      .update(supabaseUpdates)
      .eq('id', id);

    if (error) {
      console.error('투두 업데이트 중 오류:', error);
      updateTodoInLocalStorage(id, updates);
    }
  } catch (error) {
    console.error('Supabase 투두 업데이트 중 오류:', error);
    updateTodoInLocalStorage(id, updates);
  }
};

// 여러 투두의 순서 업데이트 (Supabase)
export const reorderTodos = async (date: string, todos: Todo[]): Promise<void> => {
  if (!isSupabaseAvailable()) {
    console.log('Supabase가 사용 불가능합니다. 로컬스토리지에만 저장합니다.');
    return;
  }

  try {
    // 먼저 해당 날짜의 모든 투두를 삭제
    const { error: deleteError } = await supabase!.from('todos').delete().eq('date', date);
    if (deleteError) {
      console.error('기존 투두 삭제 중 오류:', deleteError.message);
      return;
    }

    // 새로운 순서로 투두들을 다시 삽입
    if (todos && todos.length > 0) {
      const todosToInsert = todos.map((todo, index) => ({
        id: todo.id, // 기존 ID 유지하려고 했지만 실제로는 새로운 ID가 생성됨
        text: todo.text,
        completed: todo.completed || false,
        priority: todo.priority || 'medium',
        order_index: index,
        type: todo.type || 'todo',
        link: todo.link || null,
        description: todo.description || null,
        date,
        created_at: todo.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error: insertError } = await supabase!.from('todos').insert(todosToInsert);
      if (insertError) {
        console.error('투두 순서 변경 중 오류:', insertError.message);
      } else {
        console.log(`${todosToInsert.length}개의 투두 순서가 업데이트되었습니다.`);
      }
    }
  } catch (error) {
    console.error('Supabase 투두 순서 변경 중 오류:', error);
  }
};

// 투두 삭제 (Supabase + 로컬스토리지 백업)
export const deleteTodo = async (id: number): Promise<void> => {
  if (!isSupabaseAvailable()) {
    console.log('Supabase가 사용 불가능합니다. 로컬스토리지에서 삭제합니다.');
    deleteTodoFromLocalStorage(id);
    return;
  }

  try {
    const { error } = await supabase!.from('todos').delete().eq('id', id);

    if (error) {
      console.error('투두 삭제 중 오류:', error);
      deleteTodoFromLocalStorage(id);
    }
  } catch (error) {
    console.error('Supabase 투두 삭제 중 오류:', error);
    deleteTodoFromLocalStorage(id);
  }
};

// 투두 관련 Supabase 업데이트 (날짜별 전체 데이터 업데이트에서 추출)
export const updateTodosInSupabase = async (date: string, todos: Todo[]): Promise<void> => {
  if (!isSupabaseAvailable()) {
    console.log('Supabase가 사용 불가능합니다.');
    return;
  }

  try {
    // 먼저 해당 날짜의 기존 투두들을 모두 삭제
    const { error: deleteError } = await supabase!.from('todos').delete().eq('date', date);
    if (deleteError) {
      console.error('기존 투두 삭제 중 오류:', deleteError.message);
      return; // 삭제에 실패하면 더 이상 진행하지 않음
    }

    // todos가 있을 때만 새로 추가
    if (todos && todos.length > 0) {
      const todosToInsert = todos.map((todo, index) => ({
        text: todo.text,
        completed: todo.completed || false,
        priority: todo.priority || 'medium',
        order_index: index, // 순서대로 0, 1, 2, ... 할당
        type: todo.type || 'todo',
        link: todo.link || null,
        description: todo.description || null,
        date,
        created_at: todo.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error: insertError } = await supabase!.from('todos').insert(todosToInsert);
      if (insertError) {
        console.error('투두 추가 중 오류:', insertError.message);
      } else {
        console.log(`${todosToInsert.length}개의 투두가 Supabase에 저장되었습니다.`);
      }
    } else {
      console.log('저장할 투두가 없습니다.');
    }
  } catch (error) {
    console.error('Supabase todos 업데이트 중 오류:', error);
  }
};

// 로컬스토리지 관련 함수들 (폴백용)
const addTodoToLocalStorage = (date: string, todo: Omit<Todo, 'id' | 'created_at' | 'updated_at'>): Todo => {
  if (typeof window === 'undefined') {
    const newTodo: Todo = {
      ...todo,
      id: Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return newTodo;
  }
  
  try {
    const savedData = localStorage.getItem('selfDevelopmentData');
    const currentData = savedData ? JSON.parse(savedData) : {};
    
    if (!currentData[date]) {
      currentData[date] = {
        todos: [],
        thoughts: [],
        completedItems: [],
        dailyReport: {
          date,
          summary: '',
          gratitude: '',
          tommorrow_thought: '',
          mood: '보통',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        diary: {
          date,
          summary: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };
    }
    
    const newTodo: Todo = {
      ...todo,
      id: Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    currentData[date].todos.push(newTodo);
    localStorage.setItem('selfDevelopmentData', JSON.stringify(currentData));
    return newTodo;
  } catch (error) {
    console.error('로컬스토리지 투두 추가 중 오류:', error);
    const newTodo: Todo = {
      ...todo,
      id: Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return newTodo;
  }
};

const updateTodoInLocalStorage = (id: number, updates: Partial<Todo>): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const savedData = localStorage.getItem('selfDevelopmentData');
    const currentData = savedData ? JSON.parse(savedData) : {};
    
    Object.keys(currentData).forEach(date => {
      const todoIndex = currentData[date].todos.findIndex((t: Todo) => t.id === id);
      if (todoIndex !== -1) {
        currentData[date].todos[todoIndex] = {
          ...currentData[date].todos[todoIndex],
          ...updates,
          updated_at: new Date().toISOString()
        };
      }
    });
    
    localStorage.setItem('selfDevelopmentData', JSON.stringify(currentData));
  } catch (error) {
    console.error('로컬스토리지 투두 업데이트 중 오류:', error);
  }
};

const deleteTodoFromLocalStorage = (id: number): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const savedData = localStorage.getItem('selfDevelopmentData');
    const currentData = savedData ? JSON.parse(savedData) : {};
    
    Object.keys(currentData).forEach(date => {
      currentData[date].todos = currentData[date].todos.filter((t: Todo) => t.id !== id);
    });
    
    localStorage.setItem('selfDevelopmentData', JSON.stringify(currentData));
  } catch (error) {
    console.error('로컬스토리지 투두 삭제 중 오류:', error);
  }
};