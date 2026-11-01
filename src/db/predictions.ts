import { db } from './index.ts';
import { predictions, batchPredictions, auditLogs, modelMetadata } from './schema.ts';
import { desc, eq } from 'drizzle-orm';

export interface SavePredictionParams {
  userId?: number;
  domain: string;
  inputData: Record<string, any>;
  resultData: Record<string, any>;
  riskScore?: number;
  riskLevel?: string;
  explanation?: string;
  aiDiagnostics?: string;
  isDemoMode?: boolean;
}

export async function savePrediction(params: SavePredictionParams) {
  try {
    const [inserted] = await db
      .insert(predictions)
      .values({
        userId: params.userId,
        domain: params.domain,
        inputData: params.inputData,
        resultData: params.resultData,
        riskScore: params.riskScore,
        riskLevel: params.riskLevel,
        explanation: params.explanation,
        aiDiagnostics: params.aiDiagnostics,
        isDemoMode: params.isDemoMode ?? false,
      })
      .returning();
    return inserted;
  } catch (error) {
    console.error('Failed to save prediction record:', error);
    throw new Error('Failed to record prediction in database', { cause: error });
  }
}

export async function getPredictionHistory(domain?: string, limit = 20) {
  try {
    let query = db.select().from(predictions);
    if (domain) {
      return await db
        .select()
        .from(predictions)
        .where(eq(predictions.domain, domain))
        .orderBy(desc(predictions.createdAt))
        .limit(limit);
    }
    return await db
      .select()
      .from(predictions)
      .orderBy(desc(predictions.createdAt))
      .limit(limit);
  } catch (error) {
    console.error('Failed to retrieve prediction history:', error);
    throw new Error('Failed to retrieve history', { cause: error });
  }
}

export async function saveBatchResult(params: {
  userId?: number;
  domain: string;
  fileName?: string;
  totalRecords: number;
  flaggedCount: number;
  avgRiskScore: number;
  durationMs: number;
  summary: Record<string, any>;
}) {
  try {
    const [inserted] = await db
      .insert(batchPredictions)
      .values({
        userId: params.userId,
        domain: params.domain,
        fileName: params.fileName,
        totalRecords: params.totalRecords,
        flaggedCount: params.flaggedCount,
        avgRiskScore: params.avgRiskScore,
        durationMs: params.durationMs,
        summary: params.summary,
      })
      .returning();
    return inserted;
  } catch (error) {
    console.error('Failed to save batch prediction result:', error);
    throw new Error('Failed to save batch summary', { cause: error });
  }
}

export async function getBatchHistory(limit = 10) {
  try {
    return await db
      .select()
      .from(batchPredictions)
      .orderBy(desc(batchPredictions.createdAt))
      .limit(limit);
  } catch (error) {
    console.error('Failed to retrieve batch history:', error);
    throw new Error('Failed to fetch batch records', { cause: error });
  }
}

export async function recordAuditLog(params: {
  userId?: number;
  userEmail?: string;
  action: string;
  resource: string;
  status?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}) {
  try {
    const [logged] = await db
      .insert(auditLogs)
      .values({
        userId: params.userId,
        userEmail: params.userEmail,
        action: params.action,
        resource: params.resource,
        status: params.status || 'SUCCESS',
        ipAddress: params.ipAddress,
        metadata: params.metadata,
      })
      .returning();
    return logged;
  } catch (error) {
    console.error('Audit logging failed:', error);
    // Silent fail for non-blocking audit logging
    return null;
  }
}

export async function getAuditLogs(limit = 30) {
  try {
    return await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    throw new Error('Failed to retrieve audit log', { cause: error });
  }
}

export async function getModelMetadataFromDb(domain?: string) {
  try {
    if (domain) {
      return await db
        .select()
        .from(modelMetadata)
        .where(eq(modelMetadata.domain, domain));
    }
    return await db.select().from(modelMetadata);
  } catch (error) {
    console.error('Failed to fetch model metadata:', error);
    throw new Error('Database query for models failed', { cause: error });
  }
}
