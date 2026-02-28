# Requirements Document - Local Ledger

## Introduction

本地账本软件是一款运行在 Windows 系统上的个人财务管理工具。该软件基于 Electron + Vue.js 技术栈开发，采用 JSON 文件存储数据，提供账目记录、分类管理、统计查询等功能，帮助用户便捷地管理日常收支。

## Glossary

- **账本 (Ledger)**: 用户财务记录的集合，包含所有收支记录
- **账目记录 (Entry)**: 单笔收入或支出的记录，包含金额、日期、分类、备注等信息
- **分类 (Category)**: 账目的类别标签，如"餐饮"、"交通"、"工资"等
- **账户 (Account)**: 资金存储介质，如"现金"、"银行卡"、"支付宝"等

## Technical Decisions

| 决策项 | 选择 | 说明 |
|--------|------|------|
| 技术栈 | Electron + Vue.js | 跨平台桌面应用，界面美观，开发效率高 |
| 数据存储 | JSON 文件 | 简单易用，便于人工查看和编辑 |
| 目标用户 | 个人用户 | 管理个人收支，功能简洁实用 |

## Requirements

### REQ-001: 账目记录管理

**User Story:** AS 用户, I want 记录每日的收支情况, so that 能够追踪个人财务状况

#### Acceptance Criteria

1. WHEN 用户点击"新增账目"按钮, 系统 SHALL 显示账目录入表单
2. WHEN 用户填写完账目信息并提交, 系统 SHALL 将账目记录保存到本地 JSON 文件
3. WHEN 用户选择编辑已有账目, 系统 SHALL 显示预填充的编辑表单
4. WHEN 用户修改账目信息并保存, 系统 SHALL 更新本地 JSON 文件中的对应记录
5. WHEN 用户删除账目记录, 系统 SHALL 从本地 JSON 文件中移除该记录

### REQ-002: 分类管理

**User Story:** AS 用户, I want 自定义收支分类, so that 能够按照个人习惯组织账目

#### Acceptance Criteria

1. WHEN 用户访问分类管理页面, 系统 SHALL 显示所有现有分类列表
2. WHEN 用户添加新分类, 系统 SHALL 将分类保存到本地 JSON 文件
3. WHEN 用户修改分类名称, 系统 SHALL 更新所有使用该分类的账目记录
4. WHEN 用户删除分类, 系统 SHALL 提示用户选择替换分类或取消操作

### REQ-003: 账户管理

**User Story:** AS 用户, I want 管理多个资金账户, so that 能够区分不同来源的资金

#### Acceptance Criteria

1. WHEN 用户访问账户管理页面, 系统 SHALL 显示所有账户及其余额
2. WHEN 用户添加新账户, 系统 SHALL 将账户信息保存到本地 JSON 文件
3. WHEN 用户编辑账户信息, 系统 SHALL 更新本地 JSON 文件中的账户记录
4. WHEN 用户删除账户, 系统 SHALL 提示该账户下的账目记录处理方式

### REQ-004: 数据统计与查询

**User Story:** AS 用户, I want 查看财务统计数据, so that 了解收支情况和消费趋势

#### Acceptance Criteria

1. WHEN 用户访问统计页面, 系统 SHALL 显示本月/本周的收支汇总
2. WHEN 用户选择时间范围, 系统 SHALL 显示该时间段内的收支明细和统计
3. WHEN 用户选择特定分类, 系统 SHALL 筛选并显示该分类下的所有账目
4. WHILE 显示统计数据, 系统 SHALL 提供饼图/柱状图等可视化图表

### REQ-005: 数据持久化

**User Story:** AS 用户, I want 数据安全地存储在本地, so that 确保财务数据不丢失且隐私得到保护

#### Acceptance Criteria

1. WHEN 系统保存数据, 系统 SHALL 将数据写入本地 JSON 文件
2. WHEN 用户退出软件, 系统 SHALL 自动保存所有未保存的数据
3. WHEN 系统启动, 系统 SHALL 自动加载上次保存的 JSON 数据
4. IF 本地 JSON 文件损坏, 系统 SHALL 尝试从备份恢复或提示用户

### REQ-006: 数据导入导出

**User Story:** AS 用户, I want 导入导出账本数据, so that 能够备份或迁移数据

#### Acceptance Criteria

1. WHEN 用户选择导出功能, 系统 SHALL 将账本数据导出为 JSON 格式文件
2. WHEN 用户选择导入功能, 系统 SHALL 读取并解析导入的 JSON 文件
3. IF 导入的 JSON 数据格式不正确, 系统 SHALL 显示错误提示并拒绝导入

---

*Document generated: 2026-02-28*
*Status: Confirmed*
