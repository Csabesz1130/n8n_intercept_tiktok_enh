require('dotenv').config();
const express = require('express');
const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');
const axios = require('axios');

const app = express();
app.use(express.json());

// Redis connection with error handling
let connection;
let postQueue;
let worker;

try {
  connection = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
  });

  connection.on('error', (err) => {
    console.error('Redis connection error:', err.message);
  });

  connection.on('connect', () => {
    console.log('Redis connected successfully');
  });

  // BullMQ queue for scheduled posts
  postQueue = new Queue('scheduled-posts', { connection });
} catch (error) {
  console.error('Failed to initialize Redis:', error.message);
  // Create a mock queue object to prevent crashes
  postQueue = {
    getJobs: async () => [],
    add: async () => ({ id: 'mock' }),
    getJob: async () => null,
  };
}

// Worker to process scheduled posts (only if Redis is connected)
if (connection) {
  try {
    worker = new Worker(
      'scheduled-posts',
      async (job) => {
        const { webhookUrl, payload, channels } = job.data;
        
        console.log(`Processing scheduled post: ${job.id} at ${new Date().toISOString()}`);
        
        try {
          // Call n8n webhook with enhanced payload including channels
          const response = await axios.post(webhookUrl, {
            ...payload,
            channels,
            scheduled: true,
            scheduledTime: job.data.scheduledTime,
          });
          
          console.log(`Post published successfully: ${job.id}`);
          
          return {
            success: true,
            response: response.data,
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          console.error(`Error publishing post ${job.id}:`, error.message);
          throw error;
        }
      },
      { connection }
    );
    
    worker.on('completed', (job) => {
      console.log(`Job ${job.id} completed`);
    });
    
    worker.on('failed', (job, err) => {
      console.error(`Job ${job.id} failed:`, err.message);
    });
  } catch (error) {
    console.error('Failed to create worker:', error.message);
  }
}

// API endpoint to schedule a post
app.post('/api/schedule', async (req, res) => {
  try {
    if (!postQueue || !connection || connection.status !== 'ready') {
      return res.status(503).json({
        error: 'Scheduler unavailable',
        message: 'Redis is not connected. Please start Redis and restart the scheduler.',
        hint: 'Run: redis-server (or docker run -d -p 6379:6379 redis)',
      });
    }

    const {
      webhookUrl,
      payload,
      channels,
      scheduledTime, // ISO 8601 format
    } = req.body;

    if (!webhookUrl || !payload || !scheduledTime) {
      return res.status(400).json({
        error: 'Missing required fields: webhookUrl, payload, scheduledTime',
      });
    }

    const scheduledDate = new Date(scheduledTime);
    const now = new Date();

    if (scheduledDate <= now) {
      return res.status(400).json({
        error: 'Scheduled time must be in the future',
      });
    }

    // Add job to queue
    const job = await postQueue.add(
      'publish-post',
      {
        webhookUrl,
        payload,
        channels: channels || [],
        scheduledTime,
      },
      {
        delay: scheduledDate.getTime() - now.getTime(),
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      }
    );

    res.json({
      success: true,
      jobId: job.id,
      scheduledTime: scheduledTime,
      estimatedExecution: scheduledDate.toISOString(),
    });
  } catch (error) {
    console.error('Error scheduling post:', error);
    res.status(500).json({
      error: 'Failed to schedule post',
      message: error.message,
    });
  }
});

// API endpoint to list scheduled posts
app.get('/api/scheduled', async (req, res) => {
  try {
    if (!postQueue || !connection || connection.status !== 'ready') {
      return res.json({
        success: true,
        count: 0,
        posts: [],
        warning: 'Redis not connected - scheduler features unavailable',
      });
    }

    const jobs = await postQueue.getJobs(['delayed', 'waiting']);
    
    const scheduledPosts = await Promise.all(
      jobs.map(async (job) => ({
        id: job.id,
        scheduledTime: job.data.scheduledTime,
        channels: job.data.channels,
        status: await job.getState().catch(() => 'unknown'),
        progress: job.progress,
      }))
    );

    res.json({
      success: true,
      count: scheduledPosts.length,
      posts: scheduledPosts,
    });
  } catch (error) {
    console.error('Error fetching scheduled posts:', error);
    res.json({
      success: true,
      count: 0,
      posts: [],
      error: error.message,
    });
  }
});

// API endpoint to cancel a scheduled post
app.delete('/api/schedule/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await postQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({
        error: 'Job not found',
      });
    }

    await job.remove();

    res.json({
      success: true,
      message: 'Scheduled post cancelled',
    });
  } catch (error) {
    console.error('Error cancelling post:', error);
    res.status(500).json({
      error: 'Failed to cancel post',
      message: error.message,
    });
  }
});

// API endpoint to get reminders (for dashboard)
app.get('/api/reminders', async (req, res) => {
  try {
    if (!postQueue || !connection || connection.status !== 'ready') {
      return res.json({
        success: true,
        reminders: [],
      });
    }

    // In production, this would fetch from Supabase
    // For now, return empty array or fetch from queue
    const jobs = await postQueue.getJobs(['delayed', 'waiting']).catch(() => []);
    
    const reminders = jobs
      .filter(job => job && job.data && job.data.reminder)
      .map((job) => ({
        reminder_id: job.id,
        scheduled_time: job.data.scheduledTime || job.data.reminder?.time,
        channel: job.data.channel || job.data.channels?.[0] || 'twitter',
        score: job.data.score || job.data.reminder?.score || 0,
        reason: job.data.reason || job.data.reminder?.reason || '',
        status: 'scheduled',
      }));

    res.json({
      success: true,
      reminders: reminders,
    });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.json({
      success: true,
      reminders: [], // Return empty array on error
    });
  }
});

// API endpoint for trends (for dashboard)
app.get('/api/trends', async (req, res) => {
  try {
    const category = req.query.category || '';
    const limit = parseInt(req.query.limit || '50', 10);
    
    // In production, this would call the get-trends webhook or Supabase directly
    // For now, return empty array
    res.json({
      success: true,
      trends: [],
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.json({
      success: true,
      trends: [],
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  const redisStatus = connection && connection.status === 'ready' ? 'connected' : 'disconnected';
  
  res.json({
    status: redisStatus === 'connected' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    queue: {
      name: 'scheduled-posts',
      connection: redisStatus,
    },
    warning: redisStatus === 'disconnected' ? 'Redis not connected - scheduling features unavailable' : undefined,
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Scheduler service running on port ${PORT}`);
  if (connection) {
    console.log(`Redis connection: ${connection.status}`);
    if (connection.status !== 'ready') {
      console.warn('⚠️  WARNING: Redis is not connected!');
      console.warn('   Scheduler features will be limited.');
      console.warn('   To fix: Start Redis (redis-server or docker run -d -p 6379:6379 redis)');
    }
  } else {
    console.warn('⚠️  WARNING: Redis connection failed to initialize!');
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down scheduler...');
  if (worker) await worker.close().catch(() => {});
  if (postQueue) await postQueue.close().catch(() => {});
  if (connection) await connection.quit().catch(() => {});
  process.exit(0);
});

