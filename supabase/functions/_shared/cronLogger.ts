import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

export type ExecutionStatus = 'success' | 'failure' | 'timeout';

export interface CronExecutionContext {
  functionName: string;
  startedAt: Date;
  recordsProcessed?: number;
  metadata?: Record<string, unknown>;
}

export class CronLogger {
  private context: CronExecutionContext;
  private supabase;

  constructor(functionName: string) {
    this.context = {
      functionName,
      startedAt: new Date(),
      recordsProcessed: 0,
    };

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      throw new Error('Cron logger configuration error');
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  setRecordsProcessed(count: number): void {
    this.context.recordsProcessed = count;
  }

  incrementRecordsProcessed(count: number = 1): void {
    this.context.recordsProcessed = (this.context.recordsProcessed || 0) + count;
  }

  setMetadata(metadata: Record<string, unknown>): void {
    this.context.metadata = metadata;
  }

  async logSuccess(message?: string): Promise<void> {
    await this.log('success', message);
  }

  async logFailure(error: Error | string): Promise<void> {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorDetails = error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : { message: error };

    await this.log('failure', errorMessage, errorDetails);
  }

  async logTimeout(): Promise<void> {
    await this.log('timeout', 'Execution timed out');
  }

  private async log(
    status: ExecutionStatus,
    errorMessage?: string,
    errorDetails?: Record<string, unknown>
  ): Promise<void> {
    try {
      const completedAt = new Date();
      const durationMs = completedAt.getTime() - this.context.startedAt.getTime();

      const { error } = await this.supabase.from('cron_execution_log').insert({
        function_name: this.context.functionName,
        execution_status: status,
        started_at: this.context.startedAt.toISOString(),
        completed_at: completedAt.toISOString(),
        duration_ms: durationMs,
        records_processed: this.context.recordsProcessed || 0,
        error_message: errorMessage,
        error_details: errorDetails,
        metadata: this.context.metadata || {},
      });

      if (error) {
        console.error('Failed to log cron execution:', error);
      }

      if (status === 'failure' || status === 'timeout') {
        console.error(
          `[CRON ${status.toUpperCase()}] ${this.context.functionName}: ${errorMessage}`
        );
      } else {
        console.log(
          `[CRON SUCCESS] ${this.context.functionName}: ${this.context.recordsProcessed} records processed in ${durationMs}ms`
        );
      }
    } catch (err) {
      console.error('Exception in cron logger:', err);
    }
  }
}

export function withCronLogging<T>(
  functionName: string,
  handler: (logger: CronLogger) => Promise<T>
): Promise<T> {
  const logger = new CronLogger(functionName);

  return handler(logger)
    .then(async (result) => {
      await logger.logSuccess();
      return result;
    })
    .catch(async (error) => {
      await logger.logFailure(error);
      throw error;
    });
}

export interface CronExecutionLogEntry {
  execution_id: string;
  job_name: string;
  status: 'success' | 'failed';
  items_processed: number;
  items_failed: number;
  duration_ms: number;
  error_message?: string;
  details?: Record<string, unknown>;
}

export async function logCronExecution(
  supabase: any,
  entry: CronExecutionLogEntry
): Promise<void> {
  try {
    const { error } = await supabase.from('cron_execution_log').insert({
      function_name: entry.job_name,
      execution_status: entry.status,
      started_at: new Date(Date.now() - entry.duration_ms).toISOString(),
      completed_at: new Date().toISOString(),
      duration_ms: entry.duration_ms,
      records_processed: entry.items_processed,
      error_message: entry.error_message,
      metadata: entry.details || {},
    });

    if (error) {
      console.error('[logCronExecution] Failed to log:', error);
    }
  } catch (err) {
    console.error('[logCronExecution] Exception:', err);
  }
}
