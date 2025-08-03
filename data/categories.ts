// 완료된 일 카테고리
export const itemCategories = [
  { id: 'work', name: '업무/공부', color: 'blue', icon: '💼' },
  { id: 'health', name: '건강/운동', color: 'green', icon: '💪' },
  { id: 'hobby', name: '취미/여가', color: 'purple', icon: '🎨' },
  { id: 'social', name: '사교/관계', color: 'pink', icon: '👥' },
  { id: 'household', name: '가사/정리', color: 'orange', icon: '🏠' },
  { id: 'selfcare', name: '자기계발', color: 'indigo', icon: '🌟' },
  { id: 'other', name: '기타', color: 'gray', icon: '📝' }
];

// 카테고리별 색상 매핑
export const categoryColors = {
  work: 'bg-blue-100 text-blue-800 border-blue-200',
  health: 'bg-green-100 text-green-800 border-green-200',
  hobby: 'bg-purple-100 text-purple-800 border-purple-200',
  social: 'bg-pink-100 text-pink-800 border-pink-200',
  household: 'bg-orange-100 text-orange-800 border-orange-200',
  selfcare: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  other: 'bg-gray-100 text-gray-800 border-gray-200'
};

// 카테고리별 아이콘 매핑
export const categoryIcons = {
  work: '💼',
  health: '💪',
  hobby: '🎨',
  social: '👥',
  household: '🏠',
  selfcare: '��',
  other: '📝'
}; 