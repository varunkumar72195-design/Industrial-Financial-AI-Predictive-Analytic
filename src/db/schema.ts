import { relations } from 'drizzle-orm';
import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  real,
  boolean,
  jsonb,
} from 'drizzle-orm/pg-core';

// 1. Users Table (Linked to Firebase UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').notNull().default('analyst'), // 'admin' | 'engineer' | 'analyst'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. Individual Predictions Table
export const predictions = pgTable('predictions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  domain: text('domain').notNull(), // 'machine_health' | 'fraud_detection' | 'car_price' | 'income_classification'
  inputData: jsonb('input_data').notNull(),
  resultData: jsonb('result_data').notNull(),
  riskScore: real('risk_score'),
  riskLevel: text('risk_level'), // 'Low' | 'Moderate' | 'Critical' | 'Legitimate' | 'Suspicious' | 'High-Risk Fraud'
  explanation: text('explanation'),
  aiDiagnostics: text('ai_diagnostics'), // Gemini-generated explanation
  isDemoMode: boolean('is_demo_mode').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 3. Batch Predictions Table
export const batchPredictions = pgTable('batch_predictions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  domain: text('domain').notNull(), // 'machine_health' | 'fraud_detection'
  fileName: text('file_name'),
  totalRecords: integer('total_records').notNull(),
  flaggedCount: integer('flagged_count').notNull(),
  avgRiskScore: real('avg_risk_score').notNull(),
  durationMs: integer('duration_ms').notNull(),
  summary: jsonb('summary').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. ML Model Registry & Benchmarks Table
export const modelMetadata = pgTable('model_metadata', {
  id: serial('id').primaryKey(),
  modelId: text('model_id').notNull().unique(),
  name: text('name').notNull(),
  domain: text('domain').notNull(),
  family: text('family').notNull(),
  accuracy: real('accuracy'),
  precision: real('precision'),
  recall: real('recall'),
  f1Score: real('f1_score'),
  rocAuc: real('roc_auc'),
  r2Score: real('r2_score'),
  mae: real('mae'),
  rmse: real('rmse'),
  latencyMs: real('latency_ms').notNull(),
  modelSizeMb: real('model_size_mb').notNull(),
  trainingDataset: text('training_dataset'),
  notes: text('notes'),
  isDeployed: boolean('is_deployed').notNull().default(true),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 5. Audit Logs Table
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  userEmail: text('user_email'),
  action: text('action').notNull(), // 'PREDICT_MACHINE', 'PREDICT_FRAUD', 'BATCH_INGEST', 'GEMINI_EXPLAIN', 'AUTH_LOGIN'
  resource: text('resource').notNull(),
  status: text('status').notNull().default('SUCCESS'), // 'SUCCESS' | 'WARNING' | 'FAILURE'
  ipAddress: text('ip_address'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  predictions: many(predictions),
  batchPredictions: many(batchPredictions),
  auditLogs: many(auditLogs),
}));

export const predictionsRelations = relations(predictions, ({ one }) => ({
  user: one(users, {
    fields: [predictions.userId],
    references: [users.id],
  }),
}));

export const batchPredictionsRelations = relations(batchPredictions, ({ one }) => ({
  user: one(users, {
    fields: [batchPredictions.userId],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));
