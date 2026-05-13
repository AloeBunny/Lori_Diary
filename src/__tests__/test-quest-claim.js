// 小蘿日誌 — 認領列表（Screen 1401）單元測試
// 測試純邏輯函式：推薦邏輯

import { suite, test, assert, assertEqual } from './test-runner.js';

// ===== 從 quest-claim.js 複製純函式以避免 DOM 依賴 =====

function getRecommendations(skills, quests, claims) {
  const recs = [];

  for (const sk of skills) {
    const skQuests = quests
      .filter(q => q.sk_index === sk.sk_index)
      .sort((a, b) => a.q_index - b.q_index);
    if (skQuests.length === 0) continue;

    const seqQuests = skQuests.filter(q => q.q_seq > 0).sort((a, b) => a.q_seq - b.q_seq);
    const unseqQuests = skQuests.filter(q => q.q_seq === 0);

    let picked = null;

    if (seqQuests.length > 0) {
      picked = seqQuests.find(q => q.q_total === 0 || q.q_done < q.q_total);
      if (!picked) {
        picked = seqQuests[seqQuests.length - 1];
      }
    }

    if (!picked && unseqQuests.length > 0) {
      picked = unseqQuests[0];
    }

    if (!picked && skQuests.length > 0) {
      picked = skQuests[0];
    }

    if (picked) {
      recs.push({
        sk_index: sk.sk_index,
        q_index: picked.q_index,
        skill: sk,
        quest: picked,
      });
    }
  }

  return recs;
}

// ===== 推薦邏輯 =====

suite('認領列表 — 推薦邏輯');

test('空技能 → 空推薦', () => {
  const result = getRecommendations([], [], []);
  assertEqual(result.length, 0);
});

test('有技能但無 Quest → 空推薦', () => {
  const skills = [{ sk_index: 1, sk_name: 'A' }];
  const result = getRecommendations(skills, [], []);
  assertEqual(result.length, 0);
});

test('無序 Quest → 推薦第一個', () => {
  const skills = [{ sk_index: 1, sk_name: 'A' }];
  const quests = [
    { sk_index: 1, q_index: 1, q_name: 'Q1', q_seq: 0, q_done: 0, q_total: 10 },
    { sk_index: 1, q_index: 2, q_name: 'Q2', q_seq: 0, q_done: 0, q_total: 5 },
  ];
  const result = getRecommendations(skills, quests, []);
  assertEqual(result.length, 1);
  assertEqual(result[0].q_index, 1);
});

test('有序 Quest → 推薦未完成的第一個', () => {
  const skills = [{ sk_index: 1, sk_name: 'A' }];
  const quests = [
    { sk_index: 1, q_index: 1, q_name: 'Q1', q_seq: 1, q_done: 10, q_total: 10 },
    { sk_index: 1, q_index: 2, q_name: 'Q2', q_seq: 2, q_done: 3, q_total: 10 },
    { sk_index: 1, q_index: 3, q_name: 'Q3', q_seq: 3, q_done: 0, q_total: 10 },
  ];
  const result = getRecommendations(skills, quests, []);
  assertEqual(result.length, 1);
  assertEqual(result[0].q_index, 2, '應推薦 q_seq=2 的未完成 Quest');
});

test('有序 Quest 全部完成 → 推薦最後一個', () => {
  const skills = [{ sk_index: 1, sk_name: 'A' }];
  const quests = [
    { sk_index: 1, q_index: 1, q_name: 'Q1', q_seq: 1, q_done: 10, q_total: 10 },
    { sk_index: 1, q_index: 2, q_name: 'Q2', q_seq: 2, q_done: 10, q_total: 10 },
  ];
  const result = getRecommendations(skills, quests, []);
  assertEqual(result.length, 1);
  assertEqual(result[0].q_index, 2, '全完成時推薦最後一個');
});

test('混合有序/無序 → 優先推薦有序', () => {
  const skills = [{ sk_index: 1, sk_name: 'A' }];
  const quests = [
    { sk_index: 1, q_index: 1, q_name: 'U1', q_seq: 0, q_done: 0, q_total: 5 },
    { sk_index: 1, q_index: 2, q_name: 'S1', q_seq: 1, q_done: 0, q_total: 10 },
  ];
  const result = getRecommendations(skills, quests, []);
  assertEqual(result.length, 1);
  assertEqual(result[0].q_index, 2, '應優先推薦有序 Quest');
});

test('多技能各推薦一個', () => {
  const skills = [
    { sk_index: 1, sk_name: 'A' },
    { sk_index: 2, sk_name: 'B' },
  ];
  const quests = [
    { sk_index: 1, q_index: 1, q_name: 'A-Q1', q_seq: 1, q_done: 0, q_total: 10 },
    { sk_index: 2, q_index: 1, q_name: 'B-Q1', q_seq: 0, q_done: 0, q_total: 5 },
  ];
  const result = getRecommendations(skills, quests, []);
  assertEqual(result.length, 2);
  assertEqual(result[0].sk_index, 1);
  assertEqual(result[1].sk_index, 2);
});

test('有序 Quest 按 q_seq 排序推薦', () => {
  const skills = [{ sk_index: 1, sk_name: 'A' }];
  const quests = [
    { sk_index: 1, q_index: 3, q_name: 'Q3', q_seq: 3, q_done: 0, q_total: 10 },
    { sk_index: 1, q_index: 1, q_name: 'Q1', q_seq: 1, q_done: 10, q_total: 10 },
    { sk_index: 1, q_index: 2, q_name: 'Q2', q_seq: 2, q_done: 0, q_total: 10 },
  ];
  const result = getRecommendations(skills, quests, []);
  assertEqual(result[0].q_index, 2, '按 q_seq 排序，推薦第一個未完成的');
});

test('q_total = 0 的有序 Quest 視為未完成', () => {
  const skills = [{ sk_index: 1, sk_name: 'A' }];
  const quests = [
    { sk_index: 1, q_index: 1, q_name: 'Q1', q_seq: 1, q_done: 0, q_total: 0 },
    { sk_index: 1, q_index: 2, q_name: 'Q2', q_seq: 2, q_done: 0, q_total: 10 },
  ];
  const result = getRecommendations(skills, quests, []);
  assertEqual(result[0].q_index, 1, 'q_total=0 視為未完成，推薦它');
});

test('技能有 Quest 但全是其他技能的 → 不推薦', () => {
  const skills = [
    { sk_index: 1, sk_name: 'A' },
    { sk_index: 2, sk_name: 'B' },
  ];
  const quests = [
    { sk_index: 2, q_index: 1, q_name: 'B-Q1', q_seq: 0, q_done: 0, q_total: 5 },
  ];
  const result = getRecommendations(skills, quests, []);
  assertEqual(result.length, 1, '只有 skill 2 有 Quest');
  assertEqual(result[0].sk_index, 2);
});
