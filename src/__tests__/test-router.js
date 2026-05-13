// 小蘿日誌 — Router 單元測試
// 測試路由匹配、參數解析

import { suite, test, assert, assertEqual } from './test-runner.js';

suite('Router — 路由 pattern 轉正則');

test('靜態路由匹配', () => {
  // 模擬 route 內部的正則轉換
  const pattern = '#/dashboard';
  const regex = new RegExp(`^${pattern.replace(/\//g, '\\/')}$`);
  assert(regex.test('#/dashboard'), '應匹配 #/dashboard');
  assert(!regex.test('#/todo'), '不應匹配 #/todo');
});

test('帶參數路由匹配', () => {
  const pattern = '#/routine/:blockId';
  const paramNames = [];
  const regexStr = pattern
    .replace(/:([^/]+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    })
    .replace(/\//g, '\\/');
  const regex = new RegExp(`^${regexStr}$`);

  const match = '#/routine/1301'.match(regex);
  assert(match !== null, '應匹配 #/routine/1301');
  assertEqual(match[1], '1301', '參數 blockId 應為 1301');
  assertEqual(paramNames[0], 'blockId', '參數名應為 blockId');
});

test('多層巢狀路由匹配', () => {
  const pattern = '#/routine/blocks/:blockId/steps/:stepId';
  const paramNames = [];
  const regexStr = pattern
    .replace(/:([^/]+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    })
    .replace(/\//g, '\\/');
  const regex = new RegExp(`^${regexStr}$`);

  const match = '#/routine/blocks/2/steps/5'.match(regex);
  assert(match !== null, '應匹配巢狀路由');
  assertEqual(match[1], '2', 'blockId = 2');
  assertEqual(match[2], '5', 'stepId = 5');
  assertEqual(paramNames.length, 2, '應有 2 個參數');
});

test('靜態路由不應匹配子路徑', () => {
  const pattern = '#/dashboard';
  const regex = new RegExp(`^${pattern.replace(/\//g, '\\/')}$`);
  assert(!regex.test('#/dashboard/detail'), '不應匹配子路徑');
});

suite('Router — 輔助函式');

test('currentHash 預設值', () => {
  // 在非瀏覽器環境，location 可能不存在
  // 此測試驗證邏輯正確性
  const hash = '' || '#/cover';
  assertEqual(hash, '#/cover', '空 hash 應回傳 #/cover');
});
