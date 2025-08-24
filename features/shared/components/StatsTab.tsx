// import React from 'react';
// import { Stats, getLast7DaysData, Data } from '../../data';

// interface StatsTabProps {
//   stats: Stats;
//   data: Data;
// }

// const StatsTab: React.FC<StatsTabProps> = ({ stats, data }) => {
//   const moodData = getLast7DaysData(data);

//   // 아침 생각과 아이디어 통계 계산
//   const calculateThoughtStats = () => {
//     const allDates = Object.keys(data);
//     let totalMorningThoughts = 0;
//     let totalDailyIdeas = 0;
//     let totalGratitude = 0;
    
//     allDates.forEach(date => {
//       totalMorningThoughts += (data[date].morningThoughts || []).length;
//       totalDailyIdeas += (data[date].dailyIdeas || []).length;
//       if (data[date].gratitude && data[date].gratitude.trim()) {
//         totalGratitude++;
//       }
//     });
    
//     return { totalMorningThoughts, totalDailyIdeas, totalGratitude };
//   };

//   const thoughtStats = calculateThoughtStats();

//   // 한줄요약과 내일의 나에게 데이터 수집
//   const collectDailySummaries = () => {
//     const allDates = Object.keys(data).sort().reverse(); // 최신 날짜부터
//     const summaries = allDates
//       .filter(date => data[date].dailySummary && data[date].dailySummary.trim())
//       .slice(0, 10) // 최근 10개만
//       .map(date => ({
//         date,
//         summary: data[date].dailySummary
//       }));
    
//     return summaries;
//   };

//   const collectTasksReviews = () => {
//     const allDates = Object.keys(data).sort().reverse(); // 최신 날짜부터
//     const reviews = allDates
//       .filter(date => data[date].tasksReview && data[date].tasksReview.trim())
//       .slice(0, 10) // 최근 10개만
//       .map(date => ({
//         date,
//         review: data[date].tasksReview
//       }));
    
//     return reviews;
//   };

//   const collectGratitudeEntries = () => {
//     const allDates = Object.keys(data).sort().reverse(); // 최신 날짜부터
//     const gratitudeEntries = allDates
//       .filter(date => data[date].gratitude && data[date].gratitude.trim())
//       .slice(0, 10) // 최근 10개만
//       .map(date => ({
//         date,
//         gratitude: data[date].gratitude
//       }));
    
//     return gratitudeEntries;
//   };

//   const dailySummaries = collectDailySummaries();
//   const tasksReviews = collectTasksReviews();
//   const gratitudeEntries = collectGratitudeEntries();

//   return (
//     <div className="space-y-8 lg:space-y-10">
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
//         <div className="bg-blue-50 p-6 lg:p-8 rounded-2xl text-center">
//           <div className="text-3xl lg:text-4xl font-bold text-blue-600">{stats.totalDays}</div>
//           <div className="text-sm lg:text-base text-blue-800">총 기록일</div>
//         </div>
//         <div className="bg-green-50 p-6 lg:p-8 rounded-2xl text-center">
//           <div className="text-3xl lg:text-4xl font-bold text-green-600">{stats.completedTodos}</div>
//           <div className="text-sm lg:text-base text-green-800">완료한 할일</div>
//         </div>
//         <div className="bg-purple-50 p-6 lg:p-8 rounded-2xl text-center">
//           <div className="text-3xl lg:text-4xl font-bold text-purple-600">{stats.completedItems}</div>
//           <div className="text-sm lg:text-base text-purple-800">완료한 일들</div>
//         </div>
//         <div className="bg-orange-50 p-6 lg:p-8 rounded-2xl text-center">
//           <div className="text-3xl lg:text-4xl font-bold text-orange-600">{stats.averageMood}</div>
//           <div className="text-sm lg:text-base text-orange-800">평균 기분</div>
//         </div>
//       </div>

//       {/* 새로운 통계 섹션 */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
//         <div className="bg-amber-50 p-6 lg:p-8 rounded-2xl text-center">
//           <div className="text-3xl lg:text-4xl font-bold text-amber-600">{thoughtStats.totalMorningThoughts}</div>
//           <div className="text-sm lg:text-base text-amber-800">총 아침 생각</div>
//         </div>
//         <div className="bg-yellow-50 p-6 lg:p-8 rounded-2xl text-center">
//           <div className="text-3xl lg:text-4xl font-bold text-yellow-600">{thoughtStats.totalDailyIdeas}</div>
//           <div className="text-sm lg:text-base text-yellow-800">총 아이디어</div>
//         </div>
//         <div className="bg-pink-50 p-6 lg:p-8 rounded-2xl text-center">
//           <div className="text-3xl lg:text-4xl font-bold text-pink-600">{thoughtStats.totalGratitude}</div>
//           <div className="text-sm lg:text-base text-pink-800">감사일기 기록</div>
//         </div>
//       </div>

//       {/* 한줄요약 모아보기 */}
//       <div className="bg-white p-8 lg:p-10 rounded-2xl shadow-lg border">
//         <h3 className="text-xl lg:text-2xl font-semibold mb-6">최근 한줄요약 모아보기</h3>
//         <div className="space-y-4">
//           {dailySummaries.length > 0 ? (
//             dailySummaries.map((item, index) => (
//               <div key={index} className="p-4 bg-gray-50 rounded-xl">
//                 <div className="text-sm text-gray-600 mb-2">{item.date}</div>
//                 <div className="text-lg font-medium">{item.summary}</div>
//               </div>
//             ))
//           ) : (
//             <div className="text-center py-8 text-gray-500">
//               아직 한줄요약이 없습니다.
//             </div>
//           )}
//         </div>
//       </div>

//       {/* 감사일기 모아보기 */}
//       <div className="bg-white p-8 lg:p-10 rounded-2xl shadow-lg border">
//         <h3 className="text-xl lg:text-2xl font-semibold mb-6">최근 감사일기 모아보기</h3>
//         <div className="space-y-4">
//           {gratitudeEntries.length > 0 ? (
//             gratitudeEntries.map((item, index) => (
//               <div key={index} className="p-4 bg-pink-50 rounded-xl">
//                 <div className="text-sm text-gray-600 mb-2">{item.date}</div>
//                 <div className="text-lg font-medium">{item.gratitude}</div>
//               </div>
//             ))
//           ) : (
//             <div className="text-center py-8 text-gray-500">
//               아직 감사일기가 없습니다.
//             </div>
//           )}
//         </div>
//       </div>

//       {/* 내일의 나에게 모아보기 */}
//       <div className="bg-white p-8 lg:p-10 rounded-2xl shadow-lg border">
//         <h3 className="text-xl lg:text-2xl font-semibold mb-6">최근 내일의 나에게 모아보기</h3>
//         <div className="space-y-4">
//           {tasksReviews.length > 0 ? (
//             tasksReviews.map((item, index) => (
//               <div key={index} className="p-4 bg-purple-50 rounded-xl">
//                 <div className="text-sm text-gray-600 mb-2">{item.date}</div>
//                 <div className="text-lg font-medium">{item.review}</div>
//               </div>
//             ))
//           ) : (
//             <div className="text-center py-8 text-gray-500">
//               아직 내일의 나에게 메시지가 없습니다.
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="bg-white p-8 lg:p-10 rounded-2xl shadow-lg border">
//         <h3 className="text-xl lg:text-2xl font-semibold mb-6">최근 7일 기분 변화</h3>
//         <div className="space-y-3 lg:space-y-4">
//           {moodData.map((day, index) => (
//             <div key={index} className="flex items-center gap-4">
//               <div className="w-16 lg:w-20 text-sm lg:text-base">{day.date}</div>
//               <div className="flex-1 bg-gray-200 rounded-full h-4 lg:h-6 relative">
//                 <div 
//                   className="bg-gradient-to-r from-red-400 to-green-400 h-4 lg:h-6 rounded-full"
//                   style={{ width: `${(day.mood / 5) * 100}%` }}
//                 ></div>
//               </div>
//               <div className="w-12 lg:w-16 text-sm lg:text-base text-right">{day.mood}/5</div>
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="bg-white p-8 lg:p-10 rounded-2xl shadow-lg border">
//         <h3 className="text-xl lg:text-2xl font-semibold mb-6">할일 완료율</h3>
//         <div className="space-y-3 lg:space-y-4">
//           {moodData.map((day, index) => (
//             <div key={index} className="flex items-center gap-4">
//               <div className="w-16 lg:w-20 text-sm lg:text-base">{day.date}</div>
//               <div className="flex-1 bg-gray-200 rounded-full h-4 lg:h-6 relative">
//                 <div 
//                   className="bg-blue-500 h-4 lg:h-6 rounded-full"
//                   style={{ width: day.todos > 0 ? `${(day.completed / day.todos) * 100}%` : '0%' }}
//                 ></div>
//               </div>
//               <div className="w-20 lg:w-24 text-sm lg:text-base text-right">{day.completed}/{day.todos}</div>
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="bg-white p-8 lg:p-10 rounded-2xl shadow-lg border">
//         <h3 className="text-xl lg:text-2xl font-semibold mb-6">완료한 일들 통계</h3>
//         <div className="space-y-3 lg:space-y-4">
//           {moodData.map((day, index) => (
//             <div key={index} className="flex items-center gap-4">
//               <div className="w-16 lg:w-20 text-sm lg:text-base">{day.date}</div>
//               <div className="flex-1 bg-gray-200 rounded-full h-4 lg:h-6 relative">
//                 <div 
//                   className="bg-purple-500 h-4 lg:h-6 rounded-full"
//                   style={{ width: day.completedItems > 0 ? `${Math.min((day.completedItems / 10) * 100, 100)}%` : '0%' }}
//                 ></div>
//               </div>
//               <div className="w-20 lg:w-24 text-sm lg:text-base text-right">{day.completedItems}개</div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StatsTab; 